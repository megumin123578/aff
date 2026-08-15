import { Card } from "@/components/ui";

export function TrustPage({ title, eyebrow, intro, sections }: { title: string; eyebrow: string; intro: string; sections: Array<{ title: string; body: string }> }) {
  return <main className="min-h-[70vh] bg-[var(--color-bg-deep)] px-5 py-16 lg:px-8"><Card className="mx-auto max-w-3xl p-[clamp(24px,5vw,48px)]">
    <p className="text-xs font-bold uppercase tracking-widest text-[var(--color-brand-light)]">{eyebrow}</p>
    <h1 className="mt-4 text-4xl font-extrabold text-white">{title}</h1><p className="mt-5 text-lg leading-8 text-slate-300">{intro}</p>
    <div className="mt-10 space-y-8">{sections.map((section) => <section key={section.title}><h2 className="text-xl font-bold text-white">{section.title}</h2><p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-300">{section.body}</p></section>)}</div>
  </Card></main>;
}
