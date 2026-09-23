"use client";
import { FullPageState } from "@/components/ui/states";
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) { return <><FullPageState kind="error" title="Something went wrong" description="Studio hit an unexpected problem. No private error details were displayed." /><button className="floating-home" onClick={reset}>Try again</button></>; }
