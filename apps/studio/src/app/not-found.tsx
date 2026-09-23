import Link from "next/link";
import { FullPageState } from "@/components/ui/states";
export default function NotFound() { return <><FullPageState kind="not-found" title="Page not found" description="That Studio destination does not exist." /><Link className="floating-home" href="/dashboard">Return to dashboard</Link></>; }
