"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Badge, Button, Callout, Card, SectionHeading, formatDate } from "@/components/ui";

type Batch = {
  id: number;
  datasetLabel: string;
  datasetType: string;
  fileName: string | null;
  recordCount: number;
  warningCount: number;
  errorCount: number;
  status: string;
  importedBy: string | null;
  notes: string | null;
  createdAt: Date;
  reviewedAt: Date | null;
};

type Row = {
  id: number;
  sheetName: string | null;
  rowNumber: number;
  rawData: Record<string, unknown>;
  normalizedData: Record<string, unknown> | null;
  status: string;
  warnings: string[] | null;
  errors: string[] | null;
};

function jsonFor(value: Record<string, unknown> | null) {
  return JSON.stringify(value ?? {}, null, 2);
}

export function AdminImportReview({ batch, rows: initialRows }: { batch: Batch; rows: Row[] }) {
  const [rows, setRows] = useState(initialRows);
  const [drafts, setDrafts] = useState<Record<number, string>>(() => Object.fromEntries(initialRows.map((row) => [row.id, jsonFor(row.normalizedData)])));
  const [busyId, setBusyId] = useState<number | "batch" | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [batchStatus, setBatchStatus] = useState(batch.status);

  const counts = useMemo(() => rows.reduce((acc, row) => {
    acc[row.status] = (acc[row.status] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>), [rows]);

  async function updateRow(row: Row, status: string) {
    setBusyId(row.id);
    setMessage(null);
    setError(null);
    let normalizedData: Record<string, unknown> | undefined;
    try {
      normalizedData = JSON.parse(drafts[row.id] ?? "{}");
      if (!normalizedData || Array.isArray(normalizedData) || typeof normalizedData !== "object") throw new Error("Normalized data must be a JSON object.");
      const response = await fetch(`/api/admin/imports/${batch.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ rowId: row.id, status, normalizedData }),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "The row could not be updated.");
      setRows((current) => current.map((item) => item.id === row.id ? { ...item, status, normalizedData: normalizedData ?? null } : item));
      setMessage(`Row ${row.rowNumber} marked ${status.replace("_", " ")}.`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The row could not be updated.");
    } finally {
      setBusyId(null);
    }
  }

  async function approveBatch() {
    setBusyId("batch");
    setMessage(null);
    setError(null);
    try {
      const response = await fetch(`/api/admin/imports/${batch.id}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "approve" }) });
      const result = await response.json() as { error?: string; message?: string };
      if (!response.ok) throw new Error(result.error ?? "The batch could not be approved.");
      setBatchStatus("imported");
      setMessage(result.message ?? "Approved rows were imported.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The batch could not be approved.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="cb-container py-12">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <SectionHeading eyebrow="Administration / import review" title={batch.fileName ?? `Import batch #${batch.id}`} description="Review normalized values and row-level warnings before approved records reach the canonical catalogue." />
        <Link href="/admin" className="cb-button border border-ink-200 bg-white px-4 py-2.5 text-sm text-forest-700 hover:bg-mint">Back to admin</Link>
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {[
          ["Dataset", batch.datasetType],
          ["Rows", batch.recordCount],
          ["Needs review", counts.needs_review ?? 0],
          ["Accepted", counts.accepted ?? 0],
          ["Rejected", counts.rejected ?? 0],
        ].map(([label, value]) => <Card key={String(label)} className="p-4"><p className="text-lg font-semibold text-ink-900">{value}</p><p className="text-xs text-ink-500">{label}</p></Card>)}
      </div>

      <Card className="mt-6 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2"><Badge tone={batchStatus === "imported" ? "green" : "amber"}>{batchStatus}</Badge><span className="text-xs text-ink-500">Uploaded {formatDate(batch.createdAt)} by {batch.importedBy ?? "unknown admin"}</span></div>
          <Button type="button" onClick={approveBatch} disabled={busyId !== null || batchStatus === "imported" || (counts.accepted ?? 0) === 0}>{busyId === "batch" ? "Importing…" : "Approve accepted rows"}</Button>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-ink-500">Approval runs in one database transaction. Rows still marked needs review or rejected are not imported.</p>
      </Card>

      {message && <div className="mt-4"><Callout tone="forest"><p role="status">{message}</p></Callout></div>}
      {error && <div className="mt-4"><Callout tone="amber"><p role="alert">{error}</p></Callout></div>}

      <div className="mt-6 space-y-4">
        {rows.map((row) => (
          <Card key={row.id} className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div><p className="text-sm font-semibold text-ink-900">Row {row.rowNumber} <span className="font-normal text-ink-500">· {row.sheetName ?? "worksheet"}</span></p><div className="mt-2"><Badge tone={row.status === "accepted" ? "green" : row.status === "rejected" ? "red" : "amber"}>{row.status.replace("_", " ")}</Badge></div></div>
              <div className="flex flex-wrap gap-2"><Button type="button" variant="secondary" size="sm" disabled={busyId !== null || batchStatus === "imported"} onClick={() => updateRow(row, "accepted")}>Accept</Button><Button type="button" variant="ghost" size="sm" disabled={busyId !== null || batchStatus === "imported"} onClick={() => updateRow(row, "rejected")}>Reject</Button></div>
            </div>
            {(row.warnings?.length || row.errors?.length) ? <div className="mt-4 grid gap-2 sm:grid-cols-2">{row.warnings?.map((item) => <p key={item} className="rounded-lg bg-butter/40 px-3 py-2 text-xs text-butter-ink">Warning: {item}</p>)}{row.errors?.map((item) => <p key={item} className="rounded-lg bg-peach/40 px-3 py-2 text-xs text-peach-ink">Error: {item}</p>)}</div> : null}
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <details className="rounded-xl border border-ink-100 bg-ink-50 p-3"><summary className="cursor-pointer text-xs font-semibold text-ink-700">Original workbook values</summary><pre className="mt-3 max-h-72 overflow-auto whitespace-pre-wrap break-words text-[11px] leading-relaxed text-ink-600">{jsonFor(row.rawData)}</pre></details>
              <label className="grid gap-2 text-xs font-semibold text-ink-700">Normalized values — edit before accepting<textarea value={drafts[row.id] ?? "{}"} onChange={(event) => setDrafts((current) => ({ ...current, [row.id]: event.target.value }))} disabled={busyId !== null || batchStatus === "imported"} className="min-h-72 w-full rounded-xl border border-ink-200 bg-white p-3 font-mono text-[11px] font-normal leading-relaxed text-ink-700" /></label>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
