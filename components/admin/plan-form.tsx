import { saveVpsPlanAction } from "@/app/admin/actions";
import type { CatalogPlan, CatalogProvider } from "@/lib/catalog-types";

const fieldClass = "mt-2 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 text-sm text-white outline-none focus:border-[var(--color-brand-border)]";
const labelClass = "block text-xs font-semibold uppercase tracking-wider text-slate-300";

export function PlanForm({ plan, providers }: { plan?: CatalogPlan; providers: CatalogProvider[] }) {
  return (
    <form action={saveVpsPlanAction} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <label className={labelClass}>Slug<input required readOnly={Boolean(plan)} name="slug" defaultValue={plan?.slug} className={`${fieldClass} read-only:opacity-60`} /></label>
        <label className={labelClass}>Provider<select required name="providerSlug" defaultValue={plan?.providerSlug} className={fieldClass}><option value="">Choose provider</option>{providers.map((provider) => <option key={provider.slug} value={provider.slug}>{provider.name}</option>)}</select></label>
        <label className={labelClass}>Plan name<input required name="name" defaultValue={plan?.name} className={fieldClass} /></label>
        <label className={labelClass}>vCPU<input required type="number" min="1" name="cpu" defaultValue={plan?.cpu} className={fieldClass} /></label>
        <label className={labelClass}>RAM (GB)<input required type="number" min="0.25" step="0.25" name="ram" defaultValue={plan?.ram} className={fieldClass} /></label>
        <label className={labelClass}>Storage (GB)<input required type="number" min="1" name="storage" defaultValue={plan?.storage} className={fieldClass} /></label>
        <label className={labelClass}>Storage type<select name="storageType" defaultValue={plan?.storageType || "SSD"} className={fieldClass}><option>SSD</option><option>NVMe</option></select></label>
        <label className={labelClass}>Architecture<select name="architecture" defaultValue={plan?.architecture || "x86_64"} className={fieldClass}><option value="x86_64">x86_64</option><option value="arm64">arm64</option></select></label>
        <label className={labelClass}>Transfer (TB)<input type="number" min="0" step="0.01" name="transferTb" defaultValue={plan?.transferTb ?? ""} className={fieldClass} /></label>
        <label className={labelClass}>Network (Mbps)<input type="number" min="1" name="networkSpeedMbps" defaultValue={plan?.networkSpeedMbps ?? ""} className={fieldClass} /></label>
        <label className={labelClass}>Egress / GB<input type="number" min="0" step="0.0001" name="egressCostPerGb" defaultValue={plan?.egressCostPerGb ?? ""} className={fieldClass} /></label>
        <label className={labelClass}>Monthly price<input required type="number" min="0" step="0.01" name="priceMonthly" defaultValue={plan?.priceMonthly} className={fieldClass} /></label>
        <label className={labelClass}>Currency<input required name="currency" maxLength={3} defaultValue={plan?.currency || "USD"} className={fieldClass} /></label>
        <label className={labelClass}>Setup fee<input required type="number" min="0" step="0.01" name="setupFee" defaultValue={plan?.setupFee ?? 0} className={fieldClass} /></label>
        <label className={labelClass}>SLA %<input type="number" min="0" max="100" step="0.01" name="slaPercent" defaultValue={plan?.slaPercent ?? ""} className={fieldClass} /></label>
        <label className={labelClass}>Last updated<input required type="date" name="lastUpdated" defaultValue={plan?.lastUpdated || new Date().toISOString().slice(0, 10)} className={fieldClass} /></label>
        <label className={`${labelClass} lg:col-span-2`}>Official pricing source<input required type="url" name="sourceUrl" defaultValue={plan?.sourceUrl} className={fieldClass} /></label>
        <label className={`${labelClass} lg:col-span-3`}>Promotion<input name="promotion" defaultValue={plan?.promotion} className={fieldClass} /></label>
        <label className={`${labelClass} lg:col-span-3`}>Notes<textarea name="note" defaultValue={plan?.note} rows={3} className={fieldClass} /></label>
        <div className="grid gap-3 sm:grid-cols-3 lg:col-span-3">
          {[['ipv4', 'IPv4', plan?.ipv4 ?? true], ['ipv6', 'IPv6', plan?.ipv6 ?? true], ['backupAvailable', 'Backup', plan?.backupAvailable], ['snapshotAvailable', 'Snapshots', plan?.snapshotAvailable], ['available', 'Available', plan?.available ?? true]].map(([name, label, checked]) => (
            <label key={String(name)} className="flex items-center gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 text-sm text-slate-300"><input type="checkbox" name={String(name)} defaultChecked={Boolean(checked)} className="accent-[var(--color-brand)]" /> {String(label)}</label>
          ))}
        </div>
      </div>
      <button className="rounded-xl border border-[var(--color-brand-border)] bg-[var(--color-brand)] px-5 py-3 text-sm font-bold text-white">Save VPS plan</button>
    </form>
  );
}
