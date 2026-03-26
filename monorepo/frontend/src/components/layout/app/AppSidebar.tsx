"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Users,
  GraduationCap,
  BookOpen,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/lib/contexts/sidebar-context";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/exams/new", label: "Nova Prova", icon: BookOpen },
  { href: "/questions", label: "Banco de Questões", icon: FileText },
  { href: "/students/new", label: "Cadastrar Aluno", icon: Users },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { isCollapsed, toggleSidebar } = useSidebar();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen border-r border-border/50 bg-linear-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex h-16 items-center justify-center border-b border-border/50 px-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/30">
            <GraduationCap className="h-6 w-6 text-primary-foreground" />
          </div>
          {!isCollapsed && (
            <div>
              <h1 className="text-base font-bold text-primary leading-none">Exam Manager</h1>
              <p className="text-[10px] text-muted-foreground mt-0.5">Sistema de Provas</p>
            </div>
          )}
        </div>
      </div>

      <button
        onClick={toggleSidebar}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-50 flex h-10 w-5 items-center justify-center rounded-l-lg bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-all duration-300"
        aria-label={isCollapsed ? "Expandir sidebar" : "Colapsar sidebar"}
      >
        {isCollapsed ? (
          <ChevronRight className="h-3 w-3" />
        ) : (
          <ChevronLeft className="h-3 w-3" />
        )}
      </button>

      <nav className={cn("space-y-1 mt-2", isCollapsed ? "p-2" : "p-3")}>
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              title={isCollapsed ? label : undefined}
              className={cn(
                "group relative flex items-center rounded-xl text-sm font-medium transition-all",
                isCollapsed ? "justify-center p-3" : "gap-3 px-3 py-2.5",
                isActive
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                  : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!isCollapsed && <span>{label}</span>}
              {isActive && (
                <div className="absolute inset-0 -z-10 rounded-xl bg-primary opacity-20 blur-xl" />
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
