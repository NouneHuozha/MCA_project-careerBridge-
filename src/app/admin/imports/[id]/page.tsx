import { eq } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { AdminImportReview } from "@/components/admin-import-review";
import { getCurrentUser } from "@/auth";
import { db } from "@/db";
import { dataImportRows, dataImports } from "@/db/schema";

export const dynamic = "force-dynamic";
export const metadata = { title: "Review data import" };

export default async function AdminImportPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") redirect("/sign-in?next=/admin");
  const importId = Number((await params).id);
  if (!Number.isSafeInteger(importId) || importId <= 0) notFound();

  let batch;
  let rows;
  try {
    const batches = await db.select().from(dataImports).where(eq(dataImports.id, importId)).limit(1);
    batch = batches[0];
    if (!batch) notFound();
    rows = await db.select().from(dataImportRows).where(eq(dataImportRows.importId, importId));
  } catch (error) {
    console.error("[careerbridge] admin import page unavailable", error);
    notFound();
  }

  return <AdminImportReview batch={batch} rows={rows} />;
}
