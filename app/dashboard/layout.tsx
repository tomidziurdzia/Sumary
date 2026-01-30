import Link from "next/link";
import { LogoutButton } from "@/components/logout-button";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <nav className="w-full border-b h-14 flex items-center px-4">
        <div className="w-full max-w-5xl mx-auto flex justify-between items-center text-sm">
          <Link href="/dashboard" className="font-semibold hover:underline">
            Financial Dashboard
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-muted-foreground hover:text-foreground">
              Inicio
            </Link>
            <LogoutButton />
          </div>
        </div>
      </nav>
      <div className="flex-1 max-w-5xl w-full mx-auto p-6">{children}</div>
    </div>
  );
}
