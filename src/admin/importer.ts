import * as XLSX from "xlsx";

export const IMPORT_DATASETS = ["institutions", "exams", "scholarships"] as const;
export type ImportDataset = (typeof IMPORT_DATASETS)[number];

type CellValue = string | number | boolean | null;
export type ImportRow = {
  sheetName: string;
  rowNumber: number;
  rawData: Record<string, unknown>;
  normalizedData: Record<string, unknown>;
  warnings: string[];
  errors: string[];
  status: "needs_review" | "accepted" | "rejected";
};

export type ImportPreview = {
  datasetType: ImportDataset;
  sheetName: string;
  headers: string[];
  rows: ImportRow[];
  recordCount: number;
  warningCount: number;
  errorCount: number;
  workbookWarnings: string[];
};

const REQUIRED_HEADERS: Record<ImportDataset, string[]> = {
  institutions: ["institution code", "name", "type", "district", "entry stage", "source url"],
  exams: ["exam_slug", "name", "level_stage", "official_website", "source_url"],
  scholarships: ["scholarship_slug", "name", "eligibility", "official_url", "source_url"],
};

function headerKey(value: unknown) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
}

function displayHeader(value: unknown) {
  return String(value ?? "").trim();
}

function stringValue(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).trim();
}

function normalizeDistrict(value: string, warnings: string[]) {
  const key = value.toLowerCase().replace(/[üū]/g, "u").replace(/\s+/g, " ").trim();
  const canonical: Record<string, string> = {
    chumoukedima: "Chümoukedima",
    tseminyu: "Tseminyü",
  };
  const normalized = canonical[key] ?? value;
  if (normalized !== value) warnings.push(`District normalized from “${value}” to “${normalized}”.`);
  return normalized;
}

function normalizeStage(value: string, warnings: string[]) {
  const map: Record<string, string> = {
    class_10: "after_class10",
    class10: "after_class10",
    class_12: "after_class12",
    class12: "after_class12",
  };
  const normalized = map[value.toLowerCase()] ?? value;
  if (normalized !== value) warnings.push(`Entry stage normalized from “${value}” to “${normalized}”.`);
  return normalized;
}

function normalizeRow(datasetType: ImportDataset, raw: Record<string, unknown>, rowNumber: number, sheetName: string): ImportRow {
  const warnings: string[] = [];
  const errors: string[] = [];
  const normalized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(raw)) normalized[headerKey(key)] = stringValue(value) || null;

  if (datasetType === "institutions") {
    const district = stringValue(normalized.district);
    if (district) normalized.district = normalizeDistrict(district, warnings);
    if (!stringValue(normalized.official_website)) warnings.push("Official website is unavailable and needs follow-up if one exists.");
    if (!stringValue(normalized.hostel_available)) warnings.push("Hostel availability is unavailable; it must not be treated as “no”.");
    if (!stringValue(normalized.courses_offered)) warnings.push("Courses offered are unavailable for this institution.");
  }

  if (datasetType === "exams") {
    const stage = stringValue(normalized.level_stage);
    if (stage) normalized.level_stage = normalizeStage(stage, warnings);
    if (stringValue(normalized.status).toLowerCase() === "discontinued") errors.push("Discontinued records cannot enter the active catalogue.");
  }

  if (datasetType === "scholarships") {
    if (stringValue(normalized.verification_status).toLowerCase() === "multi_source") {
      warnings.push("Multi-source evidence is present; preserve the source links and show the verification date.");
    }
    if (!stringValue(normalized.official_url)) errors.push("An official application or information URL is required.");
  }

  for (const header of REQUIRED_HEADERS[datasetType]) {
    const key = headerKey(header);
    if (!stringValue(normalized[key])) errors.push(`Required field “${header}” is empty.`);
  }

  return {
    sheetName,
    rowNumber,
    rawData: raw,
    normalizedData: normalized,
    warnings,
    errors,
    status: errors.length ? "rejected" : warnings.length ? "needs_review" : "accepted",
  };
}

function selectSheet(workbook: XLSX.WorkBook, datasetType: ImportDataset, workbookWarnings: string[]) {
  const expected = { institutions: "Master Census", exams: "All Exams", scholarships: "Master" }[datasetType];
  const selected = workbook.Sheets[expected];
  if (selected) return { name: expected, sheet: selected };
  const fallback = workbook.SheetNames[0];
  workbookWarnings.push(`Expected sheet “${expected}” was not found; previewing “${fallback ?? "(none)"}”.`);
  return { name: fallback ?? "", sheet: fallback ? workbook.Sheets[fallback] : undefined };
}

export function parseWorkbook(buffer: Buffer, datasetType: ImportDataset): ImportPreview {
  const workbook = XLSX.read(buffer, { type: "buffer", cellDates: true, dense: true });
  const workbookWarnings: string[] = [];
  const selected = selectSheet(workbook, datasetType, workbookWarnings);
  if (!selected.sheet) throw new Error("The workbook does not contain a readable worksheet.");

  const matrix = XLSX.utils.sheet_to_json<CellValue[]>(selected.sheet, { header: 1, defval: null, raw: true });
  const headerRow = matrix.findIndex((row) => row.some((cell) => stringValue(cell)));
  if (headerRow < 0) throw new Error("The selected worksheet is empty.");

  const headers = (matrix[headerRow] ?? []).map(displayHeader);
  const headerKeys = headers.map(headerKey);
  const missingHeaders = REQUIRED_HEADERS[datasetType].filter((header) => !headerKeys.includes(headerKey(header)));
  if (missingHeaders.length) throw new Error(`The workbook does not match the selected “${datasetType}” dataset type. Missing required columns: ${missingHeaders.join(", ")}. Choose the correct dataset type and upload again.`);

  const rows = matrix
    .slice(headerRow + 1)
    .map((cells, index) => {
      const raw = Object.fromEntries(headers.map((header, cellIndex) => [header, cells[cellIndex] ?? null]));
      return normalizeRow(datasetType, raw, headerRow + index + 2, selected.name);
    })
    .filter((row) => Object.values(row.rawData).some((value) => stringValue(value)));

  return {
    datasetType,
    sheetName: selected.name,
    headers,
    rows,
    recordCount: rows.length,
    warningCount: rows.reduce((count, row) => count + row.warnings.length, 0) + workbookWarnings.length,
    errorCount: rows.reduce((count, row) => count + row.errors.length, 0),
    workbookWarnings,
  };
}
