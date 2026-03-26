"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getMe } from "@/lib/api/users";
import { deleteExam } from "@/lib/api/exams";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/primitives/button";
import { Badge } from "@/components/primitives/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/primitives/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/primitives/card";
import { ConfirmDeleteDialog } from "@/components/shared/ConfirmDeleteDialog";
import { EmptyState } from "@/components/shared/EmptyState";
import { Skeleton } from "@/components/primitives/skeleton";
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  BookOpen,
  GraduationCap,
  CalendarCheck,
  CalendarClock,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { UserMeExam } from "@/lib/types";

const FORMAT_LABELS: Record<string, string> = {
  letters: "Letras (A, B, C...)",
  powers_of_two: "Potências de 2",
};

function formatDate(value: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("pt-BR");
}

function isFuture(dateStr: string | null): boolean {
  if (!dateStr) return false;
  return new Date(dateStr) >= new Date(new Date().toDateString());
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  sub?: string;
  colorClass: string;
}

function StatCard({ label, value, icon: Icon, sub, colorClass }: StatCardProps) {
  return (
    <Card className="group bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-border/50 shadow-md hover:shadow-lg transition-all duration-200 hover:bg-primary/5 overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1 min-w-0">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold text-foreground truncate">{value}</p>
            {sub && <p className="text-xs text-muted-foreground truncate">{sub}</p>}
          </div>
          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${colorClass} group-hover:scale-110 transition-transform duration-200`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-64 w-full rounded-xl" />
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: me, isPending } = useQuery({
    queryKey: ["me"],
    queryFn: getMe,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteExam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["me"] });
      toast.success("Prova excluída");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  if (isPending) return <DashboardSkeleton />;

  const exams: UserMeExam[] = me?.exams ?? [];

  const uniqueSubjects = new Set(exams.map((e) => e.subject)).size;
  const upcoming = exams
    .filter((e) => isFuture(e.examDate))
    .sort((a, b) => new Date(a.examDate!).getTime() - new Date(b.examDate!).getTime());
  const nextExam = upcoming[0] ?? null;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Olá, ${me?.name ?? "Professor"}`}
        description="Visão geral das suas provas e atividades"
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total de Provas"
          value={exams.length}
          icon={BookOpen}
          sub={exams.length === 1 ? "1 prova criada" : `${exams.length} provas criadas`}
          colorClass="bg-primary/10 text-primary"
        />
        <StatCard
          label="Disciplinas"
          value={uniqueSubjects}
          icon={GraduationCap}
          sub={uniqueSubjects === 1 ? "1 disciplina" : `${uniqueSubjects} disciplinas únicas`}
          colorClass="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
        />
        <StatCard
          label="Agendadas"
          value={upcoming.length}
          icon={CalendarCheck}
          sub={upcoming.length === 0 ? "Nenhuma data futura" : `${upcoming.length} com data futura`}
          colorClass="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
        />
        <StatCard
          label="Próxima Prova"
          value={nextExam ? formatDate(nextExam.examDate) : "—"}
          icon={CalendarClock}
          sub={nextExam ? nextExam.title : "Nenhuma agendada"}
          colorClass="bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
        />
      </div>

      <Card className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-border/50 shadow-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Minhas Provas</CardTitle>
          <Button size="sm" onClick={() => router.push("/exams/new")}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Prova
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {exams.length === 0 ? (
            <EmptyState
              message="Nenhuma prova criada ainda"
              description="Crie sua primeira prova para começar"
              action={
                <Button onClick={() => router.push("/exams/new")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Prova
                </Button>
              }
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Disciplina</TableHead>
                  <TableHead>Data da Prova</TableHead>
                  <TableHead>Formato</TableHead>
                  <TableHead>Criada em</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {exams.map((exam) => (
                  <TableRow key={exam.id}>
                    <TableCell className="font-medium">{exam.title}</TableCell>
                    <TableCell>{exam.subject}</TableCell>
                    <TableCell>
                      {exam.examDate ? (
                        <span className={isFuture(exam.examDate) ? "text-emerald-600 font-medium" : ""}>
                          {formatDate(exam.examDate)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {FORMAT_LABELS[exam.answerFormat] ?? exam.answerFormat}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(exam.createdAt)}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => router.push(`/exams/${exam.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => router.push(`/exams/${exam.id}/edit`)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <ConfirmDeleteDialog
                          resourceName="prova"
                          trigger={
                            <Button variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          }
                          onConfirm={() => deleteMutation.mutate(exam.id)}
                          isPending={deleteMutation.isPending}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
