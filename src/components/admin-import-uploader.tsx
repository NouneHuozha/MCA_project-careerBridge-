"use client";

import { FormEvent, useState } from "react";
import { Button, Callout, Card } from "@/components/ui";

const DATASETS = [
  { value: "institutions", label: "Institutions" },
  { value: "exams", label: "Entrance examinations" },
  { value: "scholarships", label: "Scholarships" },
] as const;

type ImportResult = {
  importId: number;
  fileName: string;
  sheetName: string;
  recordCount: number;
  warningCount: number;
  errorCount: number;
  workbookWarnings: string[];
  message: string;
};

export function AdminImportUploader() {
  const [datasetType, setDatasetType] = useState<(typeof DATASETS)[number]["value"]>("institutions");
  const [file, setFile] = useState<File | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) {
      setError("Choose an Excel workbook first.");
      return;
    }
    setPending(true);
    setError(null);
    setResult(null);
    const body = new FormData();
    body.set("datasetType", datasetType);
    body.set("file", file);
    try {
      const response = await fetch("/api/admin/imports", { method: "POST", body });
      const data = (await response.json()) as ImportResult & { error?: string };
      if (!response.ok) {
        setError(data.error ?? "The workbook could not be staged.");
        return;
      }
      setResult(data);
    } catch {
      setError("The connection was interrupted. The workbook was not staged.");
    } finally {
      setPending(false);
    }
  }

  return (
    <Card className="mt-8 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-ink-900">Stage a workbook for review</h2>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-ink-500">
            Upload an Excel file, inspect its row-level warnings, and keep it staged. This step does not alter the
            student-facing catalogue.
          </p>
        </div>
        <span className="rounded-lg border border-forest-200 bg-forest-50 px-3 py-1.5 text-xs font-semibold text-forest-800">
          Review first · import later
        </span>
      </div>

      <form onSubmit={submit} className="mt-5 grid gap-4 md:grid-cols-[12rem_minmax(0,1fr)_auto] md:items-end">
        <label className="grid gap-1.5 text-sm font-medium text-ink-700">
          Dataset type
          <select
            value={datasetType}
            onChange={(event) => setDatasetType(event.target.value as typeof datasetType)}
            className="min-h-11 rounded-xl border border-ink-200 bg-white px-3 text-sm"
          >
            {DATASETS.map((dataset) => <option key={dataset.value} value={dataset.value}>{dataset.label}</option>)}
          </select>
        </label>
        <label className="grid gap-1.5 text-sm font-medium text-ink-700">
          Excel workbook
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            className="min-h-11 rounded-xl border border-ink-200 bg-white px-3 py-2 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-forest-50 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-forest-800"
          />
        </label>
        <Button type="submit" disabled={pending}>{pending ? "Staging…" : "Upload & preview"}</Button>
      </form>

      {error && <div className="mt-4"><Callout tone="amber"><p role="alert">{error}</p></Callout></div>}
      {result && <div className="mt-5"><Callout tone="forest" title="Workbook staged successfully"><p>{result.message}</p><p className="text-xs">Batch #{result.importId} · {result.fileName} · sheet: {result.sheetName}</p></Callout>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-ink-100 bg-ink-50 p-3"><p className="text-lg font-semibold text-ink-900">{result.recordCount}</p><p className="text-xs text-ink-500">Rows staged</p></div>
          <div className="rounded-xl border border-butter-ink/15 bg-butter/30 p-3"><p className="text-lg font-semibold text-ink-900">{result.warningCount}</p><p className="text-xs text-ink-500">Warnings</p></div>
          <div className="rounded-xl border border-peach-ink/15 bg-peach/30 p-3"><p className="text-lg font-semibold text-ink-900">{result.errorCount}</p><p className="text-xs text-ink-500">Errors</p></div>
        </div>
        {result.workbookWarnings.length > 0 && <ul className="mt-4 list-disc space-y-1 pl-5 text-xs text-ink-600">{result.workbookWarnings.map((warning) => <li key={warning}>{warning}</li>)}</ul>}
      </div>}
    </Card>
  );
}
