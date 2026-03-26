"use client";

import { LoginForm, LoginInfoPanel, LoginLogo } from "@/components/layout/login";

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen overflow-hidden">
      <div className="absolute inset-0 bg-linear-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-30 dark:opacity-20" />

      <LoginInfoPanel />

      <div className="relative flex w-full items-center justify-center p-6 lg:w-1/2">
        <div className="w-full max-w-md">
          <LoginLogo />
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
