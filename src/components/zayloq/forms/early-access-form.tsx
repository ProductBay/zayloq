"use client";

import {
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { FormEvent, useState } from "react";

export function EarlyAccessForm() {
  const [submitted, setSubmitted] = useState(false);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="flex min-h-[440px] flex-col items-center justify-center text-center">

        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#7CFF6B]/10 text-[#7CFF6B]">
          <CheckCircle2 size={30} />
        </div>

        <h3 className="mt-6 text-3xl font-black">
          You&apos;re on the list.
        </h3>

        <p className="mt-3 max-w-sm text-sm leading-6 text-white/45">
          Welcome to Zayloq Early Access. Database submission will be activated
          during the next infrastructure stage.
        </p>

      </div>
    );
  }

  return (
    <form onSubmit={submit} className="grid gap-4">

      <div className="grid gap-4 sm:grid-cols-2">

        <input
          required
          name="name"
          placeholder="Your name"
          className="rounded-xl border border-white/[.08] bg-white/[.035] px-4 py-4 text-sm text-white outline-none placeholder:text-white/20 focus:border-[#00D4C6]/40"
        />

        <input
          required
          name="email"
          type="email"
          placeholder="Email address"
          className="rounded-xl border border-white/[.08] bg-white/[.035] px-4 py-4 text-sm text-white outline-none placeholder:text-white/20 focus:border-[#00D4C6]/40"
        />

      </div>

      <div className="grid gap-4 sm:grid-cols-2">

        <select
          required
          name="country"
          defaultValue=""
          className="rounded-xl border border-white/[.08] bg-[#0a1930] px-4 py-4 text-sm text-white/60 outline-none focus:border-[#00D4C6]/40"
        >
          <option value="" disabled>
            Country
          </option>

          <option>Jamaica</option>
          <option>Trinidad & Tobago</option>
          <option>Barbados</option>
          <option>Guyana</option>
          <option>Bahamas</option>
          <option>Saint Lucia</option>
          <option>Grenada</option>
          <option>United States</option>
          <option>Canada</option>
          <option>United Kingdom</option>
          <option>Other</option>
        </select>

        <select
          required
          name="role"
          defaultValue=""
          className="rounded-xl border border-white/[.08] bg-[#0a1930] px-4 py-4 text-sm text-white/60 outline-none focus:border-[#00D4C6]/40"
        >
          <option value="" disabled>
            I am a...
          </option>

          <option>Business Owner</option>
          <option>Entrepreneur</option>
          <option>Developer</option>
          <option>Designer</option>
          <option>Agency</option>
          <option>Student</option>
          <option>Other</option>
        </select>

      </div>

      <textarea
        name="idea"
        rows={5}
        placeholder="What would you like to build with Zayloq?"
        className="resize-none rounded-xl border border-white/[.08] bg-white/[.035] px-4 py-4 text-sm text-white outline-none placeholder:text-white/20 focus:border-[#00D4C6]/40"
      />

      <button
        type="submit"
        className="z-gradient flex items-center justify-center gap-2 rounded-xl px-5 py-4 text-sm font-black text-[#06101f] transition hover:brightness-110"
      >
        JOIN ZAYLOQ EARLY ACCESS
        <ArrowRight size={17} />
      </button>

      <div className="flex items-center justify-center gap-2 text-[10px] text-white/20">
        <Sparkles size={11} />
        Pioneer access • Product updates • Private beta invitations
      </div>

    </form>
  );
}
