import { saveAffiliateLinkAction } from "@/app/admin/actions";
import type { AffiliateLink } from "@/lib/content";

const fieldClass = "mt-2 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 text-sm text-white outline-none focus:border-[var(--color-brand-border)]";
const labelClass = "block text-xs font-semibold uppercase tracking-wider text-slate-300";

export function AffiliateForm({ link }: { link?: AffiliateLink }) {
  return (
    <form action={saveAffiliateLinkAction} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className={labelClass}>Stable ID<input required readOnly={Boolean(link)} name="id" defaultValue={link?.id} placeholder="hetzner-cloud" className={`${fieldClass} read-only:opacity-60`} /></label>
        <label className={labelClass}>Provider<input required name="provider" defaultValue={link?.provider} className={fieldClass} /></label>
        <label className={`${labelClass} sm:col-span-2`}>Button label<input required name="label" defaultValue={link?.label} className={fieldClass} /></label>
        <label className={`${labelClass} sm:col-span-2`}>Official destination URL<input required type="url" name="destinationUrl" defaultValue={link?.destinationUrl} className={fieldClass} /></label>
        <label className={`${labelClass} sm:col-span-2`}>Affiliate URL <span className="normal-case text-slate-500">(optional; falls back to official URL)</span><input type="url" name="affiliateUrl" defaultValue={link?.affiliateUrl} className={fieldClass} /></label>
        <label className={labelClass}>Last verified<input type="date" name="lastVerified" defaultValue={link?.lastVerified} className={fieldClass} /></label>
        <label className="flex items-center gap-3 self-end rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 text-sm text-slate-300"><input type="checkbox" name="enabled" defaultChecked={link?.enabled ?? true} className="accent-[var(--color-brand)]" /> Enabled</label>
        <label className={`${labelClass} sm:col-span-2`}>Internal notes<textarea name="notes" defaultValue={link?.notes} rows={3} className={fieldClass} /></label>
      </div>
      <button className="rounded-xl border border-[var(--color-brand-border)] bg-[var(--color-brand)] px-5 py-3 text-sm font-bold text-white hover:bg-[var(--color-brand-hover)]">Save affiliate link</button>
    </form>
  );
}
