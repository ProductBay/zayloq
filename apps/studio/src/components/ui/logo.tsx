import Image from "next/image";
import Link from "next/link";

export function Logo({ compact = false }: { compact?: boolean }) {
  return <Link href="/dashboard" className="brand-link" aria-label="Zayloq Studio home"><Image src="/brand/zayloq-logo.png" alt="Zayloq" width={compact ? 118 : 152} height={44} priority /><span className="brand-badge">Studio</span></Link>;
}
