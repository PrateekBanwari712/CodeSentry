"use client";

import React, { useState, useEffect } from "react";
import {ShieldAlert,
  Lock,
  Loader2,
  CheckCircle2,
  Sun,
  Moon,
} from "lucide-react";

import github from "@/public/github.svg";
import Image from "next/image";
import { signIn } from "@/lib/auth-client";
import Logo from "@/module/logo/components/Logo";

export const LoginPage_UI = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDark, setIsDark] = useState<boolean>(false);

  // Sync initial theme state with the DOM
  useEffect(() => {
    const root = document.documentElement;
    if (root.classList.contains("dark")) {
      setIsDark(true);
    }
  }, []);

  const toggleTheme = () => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.remove("dark");
      setIsDark(false);
    } else {
      root.classList.add("dark");
      setIsDark(true);
    }
  };

  const handleGitHubLogin = async () => {
    setIsLoading(true);
    try {
      await signIn.social({
        provider: "github",
      });
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex flex-col justify-between relative overflow-hidden selection:bg-primary/20 selection:text-primary">
      {/* Subtle Background Glows & Grid Pattern */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-40 w-120 h-120 bg-chart-2/10 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-size-[32px_32px]opacity-20" />
      </div>

      {/* Header / Navbar */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <Logo/>

        <div className="flex items-center gap-4 text-xs sm:text-sm text-muted-foreground">
          <a href="#docs" className="hover:text-foreground transition">
            Docs
          </a>
          <span>•</span>
          <a
            href="#status"
            className="hover:text-foreground transition flex items-center gap-1.5"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Operational
          </a>
          <span>•</span>
          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="p-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-muted transition border border-border"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-primary" />
            ) : (
              <Moon className="w-4 h-4 text-foreground" />
            )}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Sign-In Card */}
          <div className="lg:col-span-6 w-full max-w-md mx-auto">
            <div className="bg-card text-card-foreground border border-border rounded-xl p-8 sm:p-10 shadow-lg relative overflow-hidden">
              {/* Top Accent Line */}
              <div className="absolute top-0 left-0 right-0 h-0.75 bg-linear-to-r from-transparent via-primary to-transparent" />

              <div className="mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                  Sign in
                </h1>
                <p className="text-sm text-muted-foreground mt-2">
                  Connect your GitHub repositories to run instant AI security
                  audits and automated code reviews.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={handleGitHubLogin}
                  disabled={isLoading}
                  className="w-full relative group overflow-hidden bg-primary hover:opacity-95 text-primary-foreground font-medium py-3.5 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-3 shadow-sm active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin text-primary-foreground" />
                      <span>Connecting to GitHub...</span>
                    </>
                  ) : (
                    <>
                      <Image
                        src={github}
                        className='w-5 h-5 fill-current" viewBox="0 0 24 24'
                        alt="github"
                      />
                      <span>Continue with GitHub</span>
                    </>
                  )}
                </button>
              </div>

              {/* Data & Scope Disclosure */}
              <div className="mt-6 bg-accent text-accent-foreground rounded-lg p-4 border border-border text-xs space-y-2">
                <div className="flex items-center gap-2 font-medium">
                  <Lock className="w-3.5 h-3.5 text-primary" />
                  <span>Security & Isolation Guarantee</span>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Access is read-only for metadata and webhooks. Code snippets
                  are analyzed in ephemeral runtime environments and{" "}
                  <strong className="text-accent-foreground font-semibold">
                    never used for model training
                  </strong>
                  .
                </p>
              </div>

              {/* Terms Footer */}
              <p className="text-[11px] text-center text-muted-foreground mt-6 leading-normal">
                By continuing, you agree to CodeSentry&apos;s{" "}
                <a
                  href="#terms"
                  className="text-primary hover:underline underline-offset-2"
                >
                  Terms of Service
                </a>{" "}
                and{" "}
                <a
                  href="#privacy"
                  className="text-primary hover:underline underline-offset-2"
                >
                  Privacy Policy
                </a>
                .
              </p>
            </div>
          </div>

          {/* Right Column: Code Review Demonstration */}
          <div className="lg:col-span-6 hidden lg:block">
            <div className="bg-card text-card-foreground border border-border rounded-xl shadow-xl overflow-hidden">
              {/* Window Header */}
              <div className="px-4 py-3 bg-secondary/70 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-destructive/60" />
                  <div className="w-3 h-3 rounded-full bg-chart-1/60" />
                  <div className="w-3 h-3 rounded-full bg-primary/60" />
                  <span className="ml-2 text-xs font-mono text-muted-foreground">
                    PR #482 • security-patch.ts
                  </span>
                </div>
                <span className="text-[11px] font-mono text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  Audit Passed
                </span>
              </div>

              {/* Code Snippet Box */}
              <div className="p-5 font-mono text-xs leading-relaxed overflow-x-auto space-y-2 bg-muted/40">
                <div className="text-muted-foreground">
                  // Validating incoming authentication token
                </div>
                <div className="text-foreground">
                  <span className="text-chart-2">async function</span>{" "}
                  <span className="text-primary">validateSession</span>(req:
                  Request) &#123;
                </div>
                <div className="text-destructive bg-destructive/10 -mx-5 px-5 py-1 border-l-2 border-destructive">
                  - &nbsp;const token = req.headers[&apos;authorization&apos;];{" "}
                  <span className="text-muted-foreground">
                    // CWE-208 Timing Attack
                  </span>
                </div>
                <div className="text-primary bg-primary/10 -mx-5 px-5 py-1 border-l-2 border-primary">
                  + &nbsp;const token = crypto.timingSafeEqual(rawBuffer,
                  keyBuffer);
                </div>
                <div className="text-foreground">&#125;</div>

                {/* Inline AI Review Card */}
                <div className="mt-4 bg-card border border-primary/30 rounded-lg p-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-primary/15 text-primary flex items-center justify-center shrink-0 mt-0.5">
                      <ShieldAlert className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-card-foreground font-sans text-sm">
                          CodeSentry AI
                        </span>
                        <span className="text-[10px] text-primary font-mono bg-primary/10 px-1.5 py-0.5 rounded font-medium">
                          RESOLVED
                        </span>
                      </div>
                      <p className="font-sans text-xs text-muted-foreground mt-1">
                        Mitigated constant-time comparison vulnerability.
                        Automated regression test passed.
                      </p>
                      <div className="mt-2 flex items-center gap-3 text-[10px] text-muted-foreground font-sans">
                        <span>Latency: 320ms</span>
                        <span>•</span>
                        <span>Confidence: 99.4%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Compliance Badges Bar */}
              <div className="px-5 py-3.5 bg-secondary/50 border-t border-border flex items-center justify-between text-xs font-sans text-muted-foreground">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                    <span>SOC2 Type II</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                    <span>Zero Data Retention</span>
                  </div>
                </div>
                <span className="font-mono text-muted-foreground">v2.4.0</span>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="mt-6 grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-lg bg-card border border-border shadow-2xs">
                <div className="text-lg font-bold text-card-foreground">
                  10M+
                </div>
                <div className="text-[11px] text-muted-foreground mt-0.5">
                  PRs Audited
                </div>
              </div>
              <div className="p-3 rounded-lg bg-card border border-border shadow-2xs">
                <div className="text-lg font-bold text-primary">&lt; 1.2s</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">
                  Avg Response
                </div>
              </div>
              <div className="p-3 rounded-lg bg-card border border-border shadow-2xs">
                <div className="text-lg font-bold text-card-foreground">0%</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">
                  Training Exposure
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 text-center text-xs text-muted-foreground">
        &copy; 1956 CodeSentry, Inc. All rights reserved.
        Built for security-first engineering teams.
      </footer>
    </div>
  );
};

export default LoginPage_UI;
