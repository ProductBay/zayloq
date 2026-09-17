"use client";

import { Menu, Sparkles } from "lucide-react";
import { ZayloqLogo } from "@/components/zayloq/ui/zayloq-logo";

export function Navbar() {
  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="mx-auto max-w-7xl px-5 pt-5">
        <div className="z-glass flex h-16 items-center justify-between rounded-2xl px-4 md:px-6">

          <a href="#top">
            <ZayloqLogo />
          </a>

          <nav className="hidden items-center gap-8 text-sm text-white/60 lg:flex">
            <a href="#build" className="transition hover:text-white">
              What You Can Build
            </a>

            <a href="#intelligence" className="transition hover:text-white">
              Intelligence
            </a>

            <a href="#caribbean" className="transition hover:text-white">
              Caribbean
            </a>

            <a href="#access" className="transition hover:text-white">
              Early Access
            </a>
          </nav>

          <div className="hidden items-center gap-3 sm:flex">
            <button className="px-3 py-2 text-sm text-white/50 transition hover:text-white">
              Sign In
            </button>

            <a
              href="#access"
              className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-black text-[#06101f]"
            >
              <Sparkles size={15} />
              Join Waitlist
            </a>
          </div>

          <button className="rounded-xl border border-white/10 p-2 sm:hidden">
            <Menu size={20} />
          </button>

        </div>
      </div>
    </header>
  );
}
