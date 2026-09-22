import { NextResponse } from "next/server";
import { and, desc, eq, inArray } from "drizzle-orm";
import { getCurrentUser } from "@/auth";
import { db } from "@/db";
import { auditEvents, dataImportRows, dataImports } from "@/db/schema";
import { approveImport } from "@/admin/approval";

export const dynamic = "force-dynamic";

async function requireAdmin() {
  const user = await getCurrentUser();
  return user && user.role === "admin" ? user : null;
}

function parseId(value: string) {
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Administrator access is required." }, { status: 403 });
  const importId = parseId((await context.params).id);
  if (!importId) return NextResponse.json({ error: "Invalid import id." }, { status: 400 });

  try {
    const batches = await db.select().from(dataImports).where(eq(dataImports.id, importId)).limit(1);
    const batch = batches[0];
    if (!batch) return NextResponse.json({ error: "Import batch not found." }, { status: 404 });
    const rows = await db.select().from(dataImportRows).where(eq(dataImportRows.importId, importId)).orderBy(desc(dataImportRows.rowNumber));
    return NextResponse.json({ batch, rows });
  } catch (error) {
    console.error("[careerbridge] admin import detail GET failed", error);
    return NextResponse.json({ error: "Import review data is unavailable right now." }, { status: 503 });
  }
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Administrator access is required." }, { status: 403 });
  const importId = parseId((await context.params).id);
  if (!importId) return NextResponse.json({ error: "Invalid import id." }, { status: 400 });

  try {
    const body = (await request.json()) as { action?: string };
    if (body.action !== "approve") return NextResponse.json({ error: "Unsupported import action." }, { status: 400 });
    const result = await approveImport(importId, user.email);
    return NextResponse.json({ ...result, message: "Approved rows were imported into the canonical catalogue." });
  } catch (error) {
    const message = error instanceof Error ? error.message : "The import could not be approved.";
    console.error("[careerbridge] admin import approval failed", error);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Administrator access is required." }, { status: 403 });
  const importId = parseId((await context.params).id);
  if (!importId) return NextResponse.json({ error: "Invalid import id." }, { status: 400 });

  try {
    const body = (await request.json()) as { rowId?: number; rowIds?: number[]; status?: string; normalizedData?: Record<string, unknown> };
    if (body.rowIds?.length) {
      if (!body.status || !["needs_review", "accepted", "rejected"].includes(body.status)) {
        return NextResponse.json({ error: "Choose needs_review, accepted, or rejected." }, { status: 400 });
      }
      const rowIds = [...new Set(body.rowIds.map(Number))].filter((id) => Number.isSafeInteger(id) && id > 0);
      if (!rowIds.length) return NextResponse.json({ error: "No valid staged rows were selected." }, { status: 400 });
      const matchingRows = await db
        .select({ id: dataImportRows.id })
        .from(dataImportRows)
        .where(and(eq(dataImportRows.importId, importId), inArray(dataImportRows.id, rowIds)));
      if (matchingRows.length !== rowIds.length) return NextResponse.json({ error: "One or more selected rows do not belong to this import." }, { status: 400 });
      await db.update(dataImportRows).set({ status: body.status }).where(and(eq(dataImportRows.importId, importId), inArray(dataImportRows.id, rowIds)));
      await db.insert(auditEvents).values({
        actor: user.email,
        action: "import.rows_bulk_updated",
        entityType: "data_import",
        entityRef: String(importId),
        metadata: { rowIds, status: body.status },
      });
      return NextResponse.json({ rowIds, status: body.status, message: `${rowIds.length} staged rows updated.` });
    }
    const rowId = Number(body.rowId);
    if (!Number.isSafeInteger(rowId) || rowId <= 0) return NextResponse.json({ error: "Invalid row id." }, { status: 400 });
    if (!body.status || !["needs_review", "accepted", "rejected"].includes(body.status)) {
      return NextResponse.json({ error: "Choose needs_review, accepted, or rejected." }, { status: 400 });
    }

    const existing = await db
      .select({ id: dataImportRows.id })
      .from(dataImportRows)
      .where(and(eq(dataImportRows.id, rowId), eq(dataImportRows.importId, importId)))
      .limit(1);
    if (!existing[0]) return NextResponse.json({ error: "Staged row not found." }, { status: 404 });

    await db
      .update(dataImportRows)
      .set({ status: body.status, normalizedData: body.normalizedData })
      .where(and(eq(dataImportRows.id, rowId), eq(dataImportRows.importId, importId)));
    await db.insert(auditEvents).values({
      actor: user.email,
      action: "import.row_updated",
      entityType: "data_import_row",
      entityRef: String(rowId),
      metadata: { importId, status: body.status },
    });
    return NextResponse.json({ rowId, status: body.status, message: "Staged row updated." });
  } catch (error) {
    console.error("[careerbridge] admin import row update failed", error);
    return NextResponse.json({ error: "The staged row could not be updated." }, { status: 400 });
  }
}
