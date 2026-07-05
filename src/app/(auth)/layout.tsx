import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Logo } from "@/components/illustrations/Logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-cream-100">
      <Container className="flex max-w-md flex-col gap-6 py-16">
        <Link href="/" className="flex justify-center text-charcoal-900">
          <Logo />
        </Link>
        <div className="rounded-2xl border border-beige-200 bg-cream-50 p-8 shadow-sm">
          {children}
        </div>
      </Container>
    </div>
  );
}
