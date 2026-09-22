import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { and, desc, eq } from "drizzle-orm";
import { getCurrentUser } from "@/auth";
import { db } from "@/db";
import { dataImportRows, dataImports } from "@/db/schema";
import { IMPORT_DATASETS, parseWorkbook, type ImportDataset } from "@/admin/importer";

export const dynamic = "force-dynamic";

const MAX_FILE_BYTES = 10 * 1024 * 1024;
const ALLOWED_EXTENSIONS = new Set([".xlsx", ".xls"]);

function isDatasetType(value: string): value is ImportDataset {
  return (IMPORT_DATASETS as readonly string[]).includes(value);
}

function extensionOf(name: string) {
  const lower = name.toLowerCase();
  return lower.slice(lower.lastIndexOf("."));
}

async function requireAdmin() {
  const user = await getCurrentUser();
  return user && user.role === "admin" ? user : null;
}

export async function GET() {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Administrator access is required." }, { status: 403 });

  try {
    const imports = await db
      .select({
        id: dataImports.id,
        datasetLabel: dataImports.datasetLabel,
        datasetType: dataImports.datasetType,
        fileName: dataImports.fileName,
        recordCount: dataImports.recordCount,
        warningCount: dataImports.warningCount,
        errorCount: dataImports.errorCount,
        status: dataImports.status,
        importedBy: dataImports.importedBy,
        notes: dataImports.notes,
        createdAt: dataImports.createdAt,
        reviewedAt: dataImports.reviewedAt,
      })
      .from(dataImports)
      .orderBy(desc(dataImports.createdAt))
      .limit(20);
    return NextResponse.json({ imports });
  } catch (error) {
    console.error("[careerbridge] admin imports GET failed", error);
    return NextResponse.json({ error: "Import history is unavailable right now." }, { status: 503 });
  }
}

export async function POST(request: Request) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Administrator access is required." }, { status: 403 });

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Please upload an Excel workbook." }, { status: 400 });
  }

  const datasetTypeValue = String(form.get("datasetType") ?? "");
  const file = form.get("file");
  if (!isDatasetType(datasetTypeValue)) return NextResponse.json({ error: "Choose a supported dataset type." }, { status: 400 });
  if (!(file instanceof File)) return NextResponse.json({ error: "Choose an Excel workbook to upload." }, { status: 400 });
  if (!file.size) return NextResponse.json({ error: "The selected workbook is empty." }, { status: 400 });
  if (file.size > MAX_FILE_BYTES) return NextResponse.json({ error: "The workbook must be 10 MB or smaller." }, { status: 400 });
  if (!ALLOWED_EXTENSIONS.has(extensionOf(file.name))) return NextResponse.json({ error: "Only .xlsx and .xls files are supported." }, { status: 400 });

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const preview = parseWorkbook(buffer, datasetTypeValue);
    const sourceHash = createHash("sha256").update(buffer).digest("hex");

    const existing = await db
      .select({ id: dataImports.id })
      .from(dataImports)
      .where(and(eq(dataImports.sourceHash, sourceHash), eq(dataImports.datasetType, datasetTypeValue)))
      .limit(1);
    if (existing[0]) return NextResponse.json({ error: "This exact workbook has already been uploaded for this dataset type.", importId: existing[0].id }, { status: 409 });

    const created = await db
      .insert(dataImports)
      .values({
        datasetLabel: `admin-upload-${datasetTypeValue}`,
        datasetType: datasetTypeValue,
        fileName: file.name,
        fileContentBase64: buffer.toString("base64"),
        sourceHash,
        recordCount: preview.recordCount,
        warningCount: preview.warningCount,
        errorCount: preview.errorCount,
        status: preview.errorCount ? "needs_review" : "needs_review",
        importedBy: user.email,
        notes: "Rows are staged for review. Canonical catalogue tables were not changed.",
      })
      .returning({ id: dataImports.id });
    const importId = created[0]?.id;
    if (!importId) throw new Error("Import batch was not created");

    if (preview.rows.length) {
      await db.insert(dataImportRows).values(
        preview.rows.map((row) => ({
          importId,
          sheetName: row.sheetName,
          rowNumber: row.rowNumber,
          rawData: row.rawData,
          normalizedData: row.normalizedData,
          status: row.status,
          warnings: row.warnings,
          errors: row.errors,
        })),
      );
    }

    return NextResponse.json({
      importId,
      datasetType: preview.datasetType,
      fileName: file.name,
      sheetName: preview.sheetName,
      recordCount: preview.recordCount,
      warningCount: preview.warningCount,
      errorCount: preview.errorCount,
      workbookWarnings: preview.workbookWarnings,
      sampleRows: preview.rows.slice(0, 10).map((row) => ({
        rowNumber: row.rowNumber,
        status: row.status,
        warnings: row.warnings,
        errors: row.errors,
        normalizedData: row.normalizedData,
      })),
      message: "Workbook staged successfully. No canonical catalogue records were changed.",
    });
  } catch (error) {
    console.error("[careerbridge] admin import failed", error);
    const message = error instanceof Error ? error.message : "We couldn't stage that workbook. Check the database and workbook format, then try again.";
    const isValidationError = message.startsWith("The workbook does not match the selected");
    return NextResponse.json({ error: isValidationError ? message : "We couldn't stage that workbook. Check the database and workbook format, then try again." }, { status: isValidationError ? 400 : 503 });
  }
}
