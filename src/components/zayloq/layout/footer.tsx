"use client";

import {
  ExternalLink,
  Mail,
  MapPin,
  MessageCircle,
} from "lucide-react";
import { useState } from "react";

import { ZayloqLogo } from "@/components/zayloq/ui/zayloq-logo";

export function Footer() {
  const [showAddress, setShowAddress] = useState(false);

  return (
    <footer className="relative overflow-hidden border-t border-white/[.07]">

      <div className="z-grid absolute inset-0 opacity-20" />

      <div className="pointer-events-none absolute -bottom-40 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-[#00D4C6]/10 blur-[110px]" />

      <div className="relative mx-auto max-w-7xl px-5 py-16 md:py-20">

        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-[1.35fr_.8fr_.8fr_1fr]">

          {/* BRAND */}
          <div>
            <ZayloqLogo />

            <p className="mt-6 max-w-sm text-sm leading-6 text-white/40">
              AI-powered business and software creation by A&apos;Dash
              Technologies.
            </p>

            <div className="mt-6 text-sm font-black">
              Describe it. Build it.{" "}
              <span className="text-[#00D4C6]">
                Launch it.
              </span>
            </div>

            <div className="mt-7 text-[10px] font-black uppercase tracking-[0.24em] text-white/20">
              Built for the Caribbean.
              <br />
              Engineered for the world.
            </div>
          </div>

          {/* PRODUCT */}
          <div>
            <FooterHeading>Product</FooterHeading>

            <div className="mt-5 space-y-3">
              <FooterLink href="#simulator">
                AI Builder
              </FooterLink>

              <FooterLink href="#intelligence">
                Intelligence
              </FooterLink>

              <FooterLink href="#access">
                Early Access
              </FooterLink>

              <FooterLink href="/for-business">
                For Business
              </FooterLink>
            </div>
          </div>

          {/* COMPANY */}
          <div>
            <FooterHeading>Company</FooterHeading>

            <div className="mt-5 space-y-3">
              <FooterLink href="/vision">
                Vision
              </FooterLink>

              <FooterLink href="/privacy">
                Privacy
              </FooterLink>

              <FooterLink href="/terms">
                Terms
              </FooterLink>
            </div>

            <div className="relative mt-6 inline-block">

              <button
                type="button"
                onClick={() =>
                  setShowAddress((current) => !current)
                }
                onMouseEnter={() => setShowAddress(true)}
                onMouseLeave={() => setShowAddress(false)}
                onFocus={() => setShowAddress(true)}
                onBlur={() => setShowAddress(false)}
                className="group flex items-center gap-2 text-sm font-bold text-white/45 transition hover:text-[#00D4C6]"
                aria-expanded={showAddress}
              >
                <MapPin
                  size={14}
                  className="text-[#00D4C6]"
                />

                Smart-Hill

                <ExternalLink
                  size={11}
                  className="opacity-35 transition group-hover:opacity-80"
                />
              </button>

              {showAddress && (
                <div className="absolute bottom-full left-0 z-30 mb-3 w-[245px] rounded-2xl border border-white/[.09] bg-[#071629]/95 p-4 shadow-[0_20px_55px_rgba(0,0,0,.45)] backdrop-blur-xl">

                  <div className="mb-2 flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-[#00D4C6]">
                    <MapPin size={11} />
                    A&apos;Dash Technologies
                  </div>

                  <p className="text-xs leading-5 text-white/55">
                    A&apos;Dash Tech
                    <br />
                    Mayfield Blvd,
                    <br />
                    Southfield, St Elizabeth
                  </p>

                  <div className="absolute -bottom-1.5 left-6 h-3 w-3 rotate-45 border-b border-r border-white/[.09] bg-[#071629]" />

                </div>
              )}

            </div>
          </div>

          {/* CONTACT */}
          <div>
            <FooterHeading>Contact</FooterHeading>

            <div className="mt-5 space-y-3">

              <a
                href="https://wa.me/18765947320"
                target="_blank"
                rel="noreferrer"
                className="group flex items-center gap-3 rounded-xl border border-white/[.06] bg-white/[.025] px-4 py-3 transition hover:border-[#00D4C6]/20 hover:bg-[#00D4C6]/[.05]"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#7CFF6B]/10 text-[#7CFF6B]">
                  <MessageCircle size={15} />
                </div>

                <div>
                  <div className="text-[9px] font-black uppercase tracking-[0.16em] text-white/20">
                    WhatsApp
                  </div>

                  <div className="mt-0.5 text-xs font-bold text-white/55 transition group-hover:text-white/80">
                    876-594-7320
                  </div>
                </div>
              </a>

              <a
                href="mailto:support@zayloq.ai"
                className="group flex items-center gap-3 rounded-xl border border-white/[.06] bg-white/[.025] px-4 py-3 transition hover:border-[#007BFF]/20 hover:bg-[#007BFF]/[.05]"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#007BFF]/10 text-[#159BFF]">
                  <Mail size={15} />
                </div>

                <div className="min-w-0">
                  <div className="text-[9px] font-black uppercase tracking-[0.16em] text-white/20">
                    Email
                  </div>

                  <div className="mt-0.5 break-all text-xs font-bold text-white/55 transition group-hover:text-white/80">
                    support@zayloq.ai
                  </div>
                </div>
              </a>

            </div>
          </div>

        </div>

        {/* LOWER FOOTER */}
        <div className="mt-14 flex flex-col gap-5 border-t border-white/[.07] pt-6 text-[10px] text-white/25 md:flex-row md:items-center md:justify-between">

          <div>
            © 2026 A&apos;Dash Technologies Group. All rights reserved.
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">

            <a
              href="/privacy"
              className="transition hover:text-white/55"
            >
              Privacy
            </a>

            <a
              href="/terms"
              className="transition hover:text-white/55"
            >
              Terms
            </a>

            <span>
              Zayloq by A&apos;Dash Technologies
            </span>

          </div>

        </div>

      </div>

    </footer>
  );
}

function FooterHeading({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="text-[10px] font-black uppercase tracking-[0.25em] text-white/30">
      {children}
    </div>
  );
}

function FooterLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      className="block text-sm text-white/40 transition hover:text-white/75"
    >
      {children}
    </a>
  );
}
