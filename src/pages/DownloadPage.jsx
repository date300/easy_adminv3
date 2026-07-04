import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Download,
  Play,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Zap,
} from "lucide-react";

const highlights = [
  {
    title: "Lightning Fast",
    description: "Instant access and a smooth experience from the very first tap.",
    icon: <Zap size={18} />,
  },
  {
    title: "Secure by Design",
    description: "Protected login, encrypted data flow, and trusted performance.",
    icon: <ShieldCheck size={18} />,
  },
  {
    title: "Premium UI",
    description: "A polished interface designed for modern digital experiences.",
    icon: <Sparkles size={18} />,
  },
];

const storeButtons = [
  {
    label: "Download on App Store",
    href: "https://www.apple.com/app-store/",
    icon: <Play size={18} className="rotate-90" />,
  },
  {
    label: "Get it on Google Play",
    href: "https://play.google.com/store",
    icon: <Download size={18} />,
  },
];

export default function DownloadPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 text-white">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute left-[-10%] top-10 h-64 w-64 rounded-full bg-sky-500/20 blur-3xl animate-float" />
        <div className="absolute bottom-[-8%] right-[-5%] h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl animate-float" />
        <div className="absolute right-[20%] top-[20%] h-24 w-24 rounded-full border border-white/10 animate-glow" />
      </div>

      <main className="relative mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <section>
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-500/10 px-4 py-2 text-sm font-medium text-sky-200">
              <Sparkles size={16} />
              New premium app experience
            </div>

            <h1 className="mt-6 text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
              Download our app and enjoy a smarter, faster way to manage everything.
            </h1>

            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
              This dedicated download page is designed to feel premium, polished, and modern.
              It brings your app closer to users with a smooth landing experience and powerful
              call-to-action buttons.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              {storeButtons.map((button) => (
                <a
                  key={button.label}
                  href={button.href}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3.5 text-sm font-semibold text-slate-900 transition duration-300 hover:-translate-y-1 hover:bg-sky-50"
                >
                  {button.icon}
                  {button.label}
                </a>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              {highlights.map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur"
                >
                  <div className="flex items-center gap-2 text-sm font-semibold text-white">
                    {item.icon}
                    {item.title}
                  </div>
                  <p className="mt-1 text-sm text-slate-300">{item.description}</p>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-sm font-semibold text-sky-300 transition hover:text-white"
              >
                Open Admin Panel
                <ArrowRight size={16} />
              </Link>
            </div>
          </section>

          <section className="rounded-[32px] border border-white/10 bg-white/10 p-4 shadow-2xl shadow-slate-950/30 backdrop-blur-xl">
            <div className="rounded-[28px] bg-gradient-to-br from-slate-900 via-slate-800 to-sky-900 p-6 sm:p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Easy Service</p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">App Preview</h2>
                </div>
                <div className="rounded-2xl bg-sky-500/20 p-3 text-sky-300">
                  <Smartphone size={22} />
                </div>
              </div>

              <div className="mt-6 rounded-[28px] border border-slate-700 bg-slate-950/80 p-5 shadow-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Today</p>
                    <p className="mt-2 text-xl font-semibold text-white">Everything in one place</p>
                  </div>
                  <div className="rounded-2xl bg-emerald-500/15 p-3 text-emerald-400">
                    <ShieldCheck size={20} />
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Performance</p>
                    <p className="mt-1 text-sm text-slate-200">Fast sync · instant alerts · zero lag</p>
                  </div>
                  <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Security</p>
                    <p className="mt-1 text-sm text-slate-200">Secure login · protected data · trusted access</p>
                  </div>
                  <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Experience</p>
                    <p className="mt-1 text-sm text-slate-200">Premium design · intuitive navigation · modern UI</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                  <p className="text-2xl font-bold text-white">4.9/5</p>
                  <p className="mt-1 text-sm text-slate-300">User satisfaction</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                  <p className="text-2xl font-bold text-white">24/7</p>
                  <p className="mt-1 text-sm text-slate-300">Always available</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
