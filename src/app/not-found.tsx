import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center px-4">
      <p className="text-sm font-bold uppercase tracking-[0.2em] text-primary/70">404</p>
      <h1 className="mt-3 text-3xl font-heading font-bold text-foreground">Page not found</h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        The page you are looking for does not exist.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex h-10 items-center rounded-md border border-input bg-background px-4 text-sm font-medium hover:bg-muted transition-colors"
      >
        Go home
      </Link>
    </div>
  );
}
