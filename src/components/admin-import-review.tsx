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
  const [busyId, setBusyId] = useState<number | "bulk" | "batch" | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [batchStatus, setBatchStatus] = useState(batch.status);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const pageSize = 20;

  const counts = useMemo(() => rows.reduce((acc, row) => {
    acc[row.status] = (acc[row.status] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>), [rows]);

  const filteredRows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return rows.filter((row) => {
      const matchesStatus = statusFilter === "all" || row.status === statusFilter;
      if (!matchesStatus) return false;
      if (!normalizedQuery) return true;
      return `${row.rowNumber} ${JSON.stringify(row.rawData)} ${JSON.stringify(row.normalizedData)}`.toLowerCase().includes(normalizedQuery);
    });
  }, [query, rows, statusFilter]);

  const pageCount = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const pageRows = filteredRows.slice((page - 1) * pageSize, page * pageSize);
  const pageRowIds = pageRows.map((row) => row.id);
  const selectedOnPage = pageRowIds.filter((id) => selected.has(id));
  const selectedRows = rows.filter((row) => selected.has(row.id));
  const validRowIds = rows.filter((row) => !row.errors?.length && row.status !== "imported").map((row) => row.id);
  const errorRowIds = rows.filter((row) => Boolean(row.errors?.length) && row.status !== "imported").map((row) => row.id);
  const hasPendingRows = rows.some((row) => row.status === "needs_review" || row.status === "rejected");
  const batchFullyImported = batchStatus === "imported" && !hasPendingRows;
  const displayBatchStatus = hasPendingRows ? "needs_review" : batchStatus;

  function toggleSelected(rowId: number) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(rowId)) next.delete(rowId);
      else next.add(rowId);
      return next;
    });
  }

  function togglePageSelection() {
    setSelected((current) => {
      const next = new Set(current);
      const shouldSelect = selectedOnPage.length !== pageRowIds.length;
      pageRowIds.forEach((id) => shouldSelect ? next.add(id) : next.delete(id));
      return next;
    });
  }

  async function updateMany(rowIds: number[], status: "accepted" | "rejected") {
    if (!rowIds.length) return;
    setBusyId("bulk");
    setMessage(null);
    setError(null);
    try {
      const response = await fetch(`/api/admin/imports/${batch.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ rowIds, status }),
      });
      const result = await response.json() as { error?: string; message?: string };
      if (!response.ok) throw new Error(result.error ?? "The selected rows could not be updated.");
      setRows((current) => current.map((row) => rowIds.includes(row.id) ? { ...row, status } : row));
      setSelected(new Set());
      setMessage(result.message ?? `${rowIds.length} rows updated.`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The selected rows could not be updated.");
    } finally {
      setBusyId(null);
    }
  }

  async function updateRow(row: Row, status: "accepted" | "rejected") {
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
      setSelected((current) => { const next = new Set(current); next.delete(row.id); return next; });
      setMessage(`Row ${row.rowNumber} marked ${status}.`);
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
      const result = await response.json() as { error?: string; message?: string; status?: string };
      if (!response.ok) throw new Error(result.error ?? "The batch could not be approved.");
      setBatchStatus(result.status ?? "imported");
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
          <div className="flex flex-wrap items-center gap-2"><Badge tone={displayBatchStatus === "imported" ? "green" : "amber"}>{displayBatchStatus}</Badge><span className="text-xs text-ink-500">Uploaded {formatDate(batch.createdAt)} by {batch.importedBy ?? "unknown admin"}</span></div>
          <Button type="button" onClick={approveBatch} disabled={busyId !== null || batchFullyImported || (counts.accepted ?? 0) === 0}>{busyId === "batch" ? "Importing…" : "Approve accepted rows"}</Button>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-ink-500">Approval runs in one database transaction. Rows still marked needs review or rejected are not imported.</p>
      </Card>

      <Card className="mt-4 p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="grid flex-1 gap-3 sm:grid-cols-[minmax(0,1fr)_12rem]">
            <label className="grid gap-1.5 text-xs font-semibold text-ink-700">Search rows<input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Name, code, district, row number…" className="min-h-10 rounded-xl border border-ink-200 bg-white px-3 text-sm font-normal text-ink-700" /></label>
            <label className="grid gap-1.5 text-xs font-semibold text-ink-700">Filter status<select value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value); setPage(1); }} className="min-h-10 rounded-xl border border-ink-200 bg-white px-3 text-sm font-normal text-ink-700"><option value="all">All statuses</option><option value="needs_review">Needs review</option><option value="accepted">Accepted</option><option value="rejected">Rejected</option><option value="imported">Imported</option></select></label>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="secondary" size="sm" disabled={busyId !== null || batchFullyImported || !validRowIds.length} onClick={() => updateMany(validRowIds, "accepted")}>Accept all valid ({validRowIds.length})</Button>
            <Button type="button" variant="ghost" size="sm" disabled={busyId !== null || batchFullyImported || !errorRowIds.length} onClick={() => updateMany(errorRowIds, "rejected")}>Reject errors ({errorRowIds.length})</Button>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-ink-100 pt-4">
          <label className="flex items-center gap-2 text-xs text-ink-600"><input type="checkbox" checked={pageRowIds.length > 0 && selectedOnPage.length === pageRowIds.length} onChange={togglePageSelection} />Select visible rows</label>
          <div className="flex flex-wrap items-center gap-2"><span className="text-xs text-ink-500">{filteredRows.length} matching · {selected.size} selected</span><Button type="button" variant="secondary" size="sm" disabled={busyId !== null || batchFullyImported || !selectedRows.length} onClick={() => updateMany([...selected], "accepted")}>Accept selected</Button><Button type="button" variant="ghost" size="sm" disabled={busyId !== null || batchFullyImported || !selectedRows.length} onClick={() => updateMany([...selected], "rejected")}>Reject selected</Button></div>
        </div>
      </Card>

      {message && <div className="mt-4"><Callout tone="forest"><p role="status">{message}</p></Callout></div>}
      {error && <div className="mt-4"><Callout tone="amber"><p role="alert">{error}</p></Callout></div>}

      <div className="mt-6 space-y-4">
        {pageRows.map((row) => (
          <Card key={row.id} className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-start gap-3"><input type="checkbox" checked={selected.has(row.id)} onChange={() => toggleSelected(row.id)} aria-label={`Select row ${row.rowNumber}`} className="mt-1.5" /><div><p className="text-sm font-semibold text-ink-900">Row {row.rowNumber} <span className="font-normal text-ink-500">· {row.sheetName ?? "worksheet"}</span></p><div className="mt-2"><Badge tone={row.status === "accepted" ? "green" : row.status === "rejected" ? "red" : "amber"}>{row.status.replace("_", " ")}</Badge></div></div></div>
              <div className="flex flex-wrap gap-2"><Button type="button" variant="secondary" size="sm" disabled={busyId !== null || row.status === "imported"} onClick={() => updateRow(row, "accepted")}>Accept</Button><Button type="button" variant="ghost" size="sm" disabled={busyId !== null || row.status === "imported"} onClick={() => updateRow(row, "rejected")}>Reject</Button></div>
            </div>
            {(row.warnings?.length || row.errors?.length) ? <div className="mt-4 grid gap-2 sm:grid-cols-2">{row.warnings?.map((item) => <p key={item} className="rounded-lg bg-butter/40 px-3 py-2 text-xs text-butter-ink">Warning: {item}</p>)}{row.errors?.map((item) => <p key={item} className="rounded-lg bg-peach/40 px-3 py-2 text-xs text-peach-ink">Error: {item}</p>)}</div> : null}
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <details className="rounded-xl border border-ink-100 bg-ink-50 p-3"><summary className="cursor-pointer text-xs font-semibold text-ink-700">Original workbook values</summary><pre className="mt-3 max-h-72 overflow-auto whitespace-pre-wrap break-words text-[11px] leading-relaxed text-ink-600">{jsonFor(row.rawData)}</pre></details>
              <label className="grid gap-2 text-xs font-semibold text-ink-700">Normalized values — edit before accepting<textarea value={drafts[row.id] ?? "{}"} onChange={(event) => setDrafts((current) => ({ ...current, [row.id]: event.target.value }))} disabled={busyId !== null || row.status === "imported"} className="min-h-72 w-full rounded-xl border border-ink-200 bg-white p-3 font-mono text-[11px] font-normal leading-relaxed text-ink-700" /></label>
            </div>
          </Card>
        ))}
        {!pageRows.length && <Card className="p-8 text-center text-sm text-ink-500">No rows match the current search and status filter.</Card>}
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3"><p className="text-xs text-ink-500">Page {page} of {pageCount} · showing {pageRows.length} rows</p><div className="flex gap-2"><Button type="button" variant="ghost" size="sm" disabled={page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>Previous</Button><Button type="button" variant="ghost" size="sm" disabled={page >= pageCount} onClick={() => setPage((current) => Math.min(pageCount, current + 1))}>Next</Button></div></div>
    </div>
  );
}
