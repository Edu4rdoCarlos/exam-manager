"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
import { Plus, Pencil, Trash2, Eye, BookOpen, FileText } from "lucide-react";
import type { UserMeExam } from "@/lib/types";

const FORMAT_LABELS: Record<string, string> = {
  letters: "Letras (A, B, C...)",
  powers_of_two: "Potências de 2",
};

function formatDate(value: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("pt-BR");
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
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  if (isPending) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const exams: UserMeExam[] = me?.exams ?? [];

  return (
    <div>
      <PageHeader
        title={`Olá, ${me?.name ?? "Professor"}`}
        description="Gerencie suas provas e questões"
      />

      <div className="grid grid-cols-2 gap-4 mb-6 max-w-sm">
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-sm font-medium text-muted-foreground">Provas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold">{exams.length}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-sm font-medium text-muted-foreground">Questões</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <Link href="/questions" className="text-2xl font-bold text-primary hover:underline">
                Ver banco
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
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
                  <TableHead>Data</TableHead>
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
                    <TableCell>{formatDate(exam.examDate)}</TableCell>
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
