import Link from "next/link";
import { Badge, Card, LinkButton } from "@/components/ui";

export default function NotFound() {
  return (
    <main className="min-h-[70vh] bg-[var(--color-bg-deep)] px-5 py-16 lg:px-8">
      <Card className="mx-auto max-w-2xl p-[clamp(24px,5vw,48px)] text-center">
        <Badge variant="default">404 Not Found</Badge>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          Page not found
        </h1>
        <p className="mt-4 text-slate-400">
          The page or resource you are looking for does not exist, may have been moved, or is no longer available.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <LinkButton href="/" variant="azure">
            Go to Home
          </LinkButton>
          <LinkButton href="/articles" variant="default">
            Read Blog & Reviews
          </LinkButton>
        </div>

        <div className="mt-10 border-t border-[var(--color-border)] pt-6 text-xs text-slate-500">
          Looking for specific gear or advice? Try searching from the header or{" "}
          <Link href="/contact" className="text-slate-400 underline hover:text-white">
            contact us
          </Link>.
        </div>
      </Card>
    </main>
  );
}
