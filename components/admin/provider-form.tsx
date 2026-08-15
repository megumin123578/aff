import { saveProviderAction } from "@/app/admin/actions";
import type { CatalogProvider } from "@/lib/catalog-types";
import type { AffiliateLink } from "@/lib/content";

const fieldClass = "mt-2 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 text-sm text-white outline-none focus:border-[var(--color-brand-border)]";
const labelClass = "block text-xs font-semibold uppercase tracking-wider text-slate-300";

export function ProviderForm({ provider, affiliateLinks }: { provider?: CatalogProvider; affiliateLinks: AffiliateLink[] }) {
  const locations = provider?.locations.map((location) => `${location.code} | ${location.name} | ${location.country} | ${location.region}`).join("\n");
  return (
    <form action={saveProviderAction} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className={labelClass}>Slug<input required readOnly={Boolean(provider)} name="slug" defaultValue={provider?.slug} placeholder="hetzner" className={`${fieldClass} read-only:opacity-60`} /></label>
        <label className={labelClass}>Name<input required name="name" defaultValue={provider?.name} className={fieldClass} /></label>
        <label className={`${labelClass} sm:col-span-2`}>Description<textarea required name="description" defaultValue={provider?.description} rows={3} className={fieldClass} /></label>
        <label className={labelClass}>Website URL<input required type="url" name="websiteUrl" defaultValue={provider?.websiteUrl} className={fieldClass} /></label>
        <label className={labelClass}>Affiliate registry<select name="affiliateLinkId" defaultValue={provider?.affiliateLinkId} className={fieldClass}><option value="">No affiliate link</option>{affiliateLinks.map((link) => <option key={link.id} value={link.id}>{link.provider} — {link.id}</option>)}</select></label>
        <label className={labelClass}>Headquarters<input name="headquarters" defaultValue={provider?.headquarters} className={fieldClass} /></label>
        <label className={labelClass}>Founded year<input type="number" name="foundedYear" min="1990" max="2100" defaultValue={provider?.foundedYear || ""} className={fieldClass} /></label>
        <label className={`${labelClass} sm:col-span-2`}>Locations <span className="normal-case text-slate-500">(one per line: code | name | country | region)</span><textarea required name="locations" defaultValue={locations} rows={5} className={fieldClass} /></label>
        {[['features', 'Features'], ['pros', 'Pros'], ['cons', 'Cons'], ['bestUseCases', 'Best use cases'], ['alternatives', 'Alternative provider slugs']].map(([name, label]) => (
          <label key={name} className={labelClass}>{label}<textarea name={name} defaultValue={(provider?.[name as keyof CatalogProvider] as string[] | undefined)?.join("\n")} rows={4} className={fieldClass} /></label>
        ))}
        <label className="flex items-center gap-3 self-end rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 text-sm text-slate-300"><input type="checkbox" name="active" defaultChecked={provider?.active ?? true} className="accent-[var(--color-brand)]" /> Active</label>
      </div>
      <button className="rounded-xl border border-[var(--color-brand-border)] bg-[var(--color-brand)] px-5 py-3 text-sm font-bold text-white">Save provider</button>
    </form>
  );
}
