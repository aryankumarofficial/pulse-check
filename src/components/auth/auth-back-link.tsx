import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface AuthBackLinkProps {
  href: string;
  children?: React.ReactNode;
  className?: string;
}

export function AuthBackLink({
  href,
  children = "Back to sign in",
  className,
}: AuthBackLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring -ml-1 px-1 py-0.5",
        className
      )}
    >
      <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
      {children}
    </Link>
  );
}
