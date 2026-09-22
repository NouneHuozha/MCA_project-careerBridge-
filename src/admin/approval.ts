import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { auditEvents, dataImportRows, dataImports, entranceExams, institutions, scholarships } from "@/db/schema";

type RowData = Record<string, unknown>;

function textValue(data: RowData, key: string, fallback = "") {
  const value = data[key];
  return value === null || value === undefined ? fallback : String(value).trim();
}

function listValue(data: RowData, key: string) {
  return textValue(data, key)
    .split(";")
    .map((value) => value.trim())
    .filter(Boolean);
}

function stageValue(data: RowData, key: string) {
  const value = textValue(data, key);
  return value ? [value] : [];
}

function nullable(value: string) {
  return value || null;
}

export async function approveImport(importId: number, actor: string) {
  return db.transaction(async (transaction) => {
    const batches = await transaction.select().from(dataImports).where(eq(dataImports.id, importId)).limit(1);
    const batch = batches[0];
    if (!batch) throw new Error("Import batch not found.");
    const pendingRows = await transaction
      .select({ id: dataImportRows.id })
      .from(dataImportRows)
      .where(and(eq(dataImportRows.importId, importId), inArray(dataImportRows.status, ["needs_review", "rejected"])));
    if (batch.status === "imported" && !pendingRows.length) throw new Error("This import batch has already been fully imported.");
    if (batch.status === "rejected") throw new Error("A rejected import batch cannot be approved.");

    const rows = await transaction
      .select()
      .from(dataImportRows)
      .where(and(eq(dataImportRows.importId, importId), eq(dataImportRows.status, "accepted")));
    if (!rows.length) throw new Error("Approve at least one valid row before importing this batch.");

    if (batch.datasetType === "institutions") {
      for (const row of rows) {
        const data = row.normalizedData ?? row.rawData;
        const code = textValue(data, "institution_code");
        if (!code) throw new Error(`Institution row ${row.rowNumber} has no institution code.`);
        await transaction
          .insert(institutions)
          .values({
            code,
            name: textValue(data, "name", "Unnamed institution"),
            type: textValue(data, "type", "institution"),
            ownership: textValue(data, "ownership", "unknown"),
            country: "India",
            state: "Nagaland",
            district: textValue(data, "district", "Unknown"),
            city: nullable(textValue(data, "city_town")),
            officialWebsite: nullable(textValue(data, "official_website")),
            admissionPortal: nullable(textValue(data, "admission_portal")),
            hostelAvailable: textValue(data, "hostel_available", "unknown").toLowerCase() === "yes" ? "yes" : "unknown",
            studyLevels: stageValue(data, "entry_stage"),
            datasetLabel: `admin-import-${importId}`,
            verificationStatus: textValue(data, "verification_status", "needs_verification"),
            sourceUrl: nullable(textValue(data, "source_url")),
            lastVerifiedAt: nullable(textValue(data, "last_verified_at")) ? new Date(textValue(data, "last_verified_at")) : null,
          })
          .onConflictDoUpdate({
            target: institutions.code,
            set: {
              name: textValue(data, "name", "Unnamed institution"),
              type: textValue(data, "type", "institution"),
              ownership: textValue(data, "ownership", "unknown"),
              district: textValue(data, "district", "Unknown"),
              city: nullable(textValue(data, "city_town")),
              officialWebsite: nullable(textValue(data, "official_website")),
              admissionPortal: nullable(textValue(data, "admission_portal")),
              hostelAvailable: textValue(data, "hostel_available", "unknown").toLowerCase() === "yes" ? "yes" : "unknown",
              studyLevels: stageValue(data, "entry_stage"),
              datasetLabel: `admin-import-${importId}`,
              verificationStatus: textValue(data, "verification_status", "needs_verification"),
              sourceUrl: nullable(textValue(data, "source_url")),
              lastVerifiedAt: nullable(textValue(data, "last_verified_at")) ? new Date(textValue(data, "last_verified_at")) : null,
              updatedAt: new Date(),
            },
          });
      }
    } else if (batch.datasetType === "exams") {
      for (const row of rows) {
        const data = row.normalizedData ?? row.rawData;
        const slug = textValue(data, "exam_slug");
        if (!slug) throw new Error(`Exam row ${row.rowNumber} has no exam slug.`);
        await transaction
          .insert(entranceExams)
          .values({
            slug,
            name: textValue(data, "name", "Unnamed examination"),
            shortName: nullable(textValue(data, "short_name")),
            conductingBody: nullable(textValue(data, "conducting_body")),
            appliesTo: listValue(data, "applies_to"),
            eligibility: nullable(textValue(data, "eligibility")),
            applicationPeriod: nullable(textValue(data, "frequency")),
            officialWebsite: nullable(textValue(data, "official_website")),
            preparation: listValue(data, "preparation"),
            levelStage: nullable(textValue(data, "level_stage")),
            sourceUrl: nullable(textValue(data, "source_url")),
            verificationStatus: textValue(data, "verification_status", "needs_verification"),
            lastVerifiedAt: nullable(textValue(data, "last_verified_at")) ? new Date(textValue(data, "last_verified_at")) : null,
          })
          .onConflictDoUpdate({
            target: entranceExams.slug,
            set: {
              name: textValue(data, "name", "Unnamed examination"),
              shortName: nullable(textValue(data, "short_name")),
              conductingBody: nullable(textValue(data, "conducting_body")),
              appliesTo: listValue(data, "applies_to"),
              eligibility: nullable(textValue(data, "eligibility")),
              applicationPeriod: nullable(textValue(data, "frequency")),
              officialWebsite: nullable(textValue(data, "official_website")),
              preparation: listValue(data, "preparation"),
              levelStage: nullable(textValue(data, "level_stage")),
              sourceUrl: nullable(textValue(data, "source_url")),
              verificationStatus: textValue(data, "verification_status", "needs_verification"),
              lastVerifiedAt: nullable(textValue(data, "last_verified_at")) ? new Date(textValue(data, "last_verified_at")) : null,
            },
          });
      }
    } else if (batch.datasetType === "scholarships") {
      for (const row of rows) {
        const data = row.normalizedData ?? row.rawData;
        const slug = textValue(data, "scholarship_slug");
        if (!slug) throw new Error(`Scholarship row ${row.rowNumber} has no scholarship slug.`);
        await transaction
          .insert(scholarships)
          .values({
            slug,
            name: textValue(data, "name", "Unnamed scholarship"),
            provider: nullable(textValue(data, "provider")),
            category: nullable(textValue(data, "category")),
            eligibility: nullable(textValue(data, "eligibility")),
            amountNote: nullable(textValue(data, "amount_note")),
            deadlineNote: nullable(textValue(data, "deadline_note")),
            documents: listValue(data, "documents"),
            officialUrl: nullable(textValue(data, "official_url")),
            appliesToStage: listValue(data, "applies_to_stage"),
            sourceUrl: nullable(textValue(data, "source_url")),
            verificationStatus: textValue(data, "verification_status", "needs_verification"),
            lastVerifiedAt: nullable(textValue(data, "last_verified_at")) ? new Date(textValue(data, "last_verified_at")) : null,
          })
          .onConflictDoUpdate({
            target: scholarships.slug,
            set: {
              name: textValue(data, "name", "Unnamed scholarship"),
              provider: nullable(textValue(data, "provider")),
              category: nullable(textValue(data, "category")),
              eligibility: nullable(textValue(data, "eligibility")),
              amountNote: nullable(textValue(data, "amount_note")),
              deadlineNote: nullable(textValue(data, "deadline_note")),
              documents: listValue(data, "documents"),
              officialUrl: nullable(textValue(data, "official_url")),
              appliesToStage: listValue(data, "applies_to_stage"),
              sourceUrl: nullable(textValue(data, "source_url")),
              verificationStatus: textValue(data, "verification_status", "needs_verification"),
              lastVerifiedAt: nullable(textValue(data, "last_verified_at")) ? new Date(textValue(data, "last_verified_at")) : null,
            },
          });
      }
    } else {
      throw new Error(`Unsupported dataset type: ${batch.datasetType}`);
    }

    const remainingRows = await transaction
      .select({ id: dataImportRows.id })
      .from(dataImportRows)
      .where(and(eq(dataImportRows.importId, importId), inArray(dataImportRows.status, ["needs_review", "rejected"])));
    const nextStatus = remainingRows.length ? "needs_review" : "imported";

    await transaction
      .update(dataImportRows)
      .set({ status: "imported" })
      .where(and(eq(dataImportRows.importId, importId), eq(dataImportRows.status, "accepted")));
    await transaction
      .update(dataImports)
      .set({ status: nextStatus, reviewedAt: new Date(), notes: remainingRows.length ? `Imported ${rows.length} accepted rows; ${remainingRows.length} rows remain for review.` : `Imported ${rows.length} accepted rows.`, importedBy: actor })
      .where(eq(dataImports.id, importId));
    await transaction.insert(auditEvents).values({
      actor,
      action: "import.approved",
      entityType: "data_import",
      entityRef: String(importId),
      metadata: { datasetType: batch.datasetType, acceptedRows: rows.length },
    });

    return { importedRows: rows.length, remainingRows: remainingRows.length, status: nextStatus, datasetType: batch.datasetType };
  });
}
