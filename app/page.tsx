import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center">
      <div className="flex flex-col gap-6 items-center text-center">
        <h1 className="text-2xl font-semibold">Financial Dashboard</h1>
        <p className="text-muted-foreground">
          Inicia sesión con Magic Link para acceder al dashboard.
        </p>
        <Link
          href="/auth/login"
          className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
        >
          Iniciar sesión
        </Link>
      </div>
    </main>
  );
}
