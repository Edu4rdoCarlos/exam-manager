"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
} from "@/lib/api/questions";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/primitives/button";
import { Input } from "@/components/primitives/input";
import { Label } from "@/components/primitives/label";
import { Textarea } from "@/components/primitives/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/primitives/dialog";
import { ConfirmDeleteDialog } from "@/components/shared/ConfirmDeleteDialog";
import { EmptyState } from "@/components/shared/EmptyState";
import { Skeleton } from "@/components/primitives/skeleton";
import { Card, CardContent } from "@/components/primitives/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/primitives/table";
import { Plus, Pencil, Trash2 } from "lucide-react";
import type { Question } from "@/lib/types";

type AlternativeInput = { description: string; isCorrect: boolean };

function freshAlternatives(): AlternativeInput[] {
  return [
    { description: "", isCorrect: true },
    { description: "", isCorrect: false },
  ];
}

export default function QuestionsPage() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [statement, setStatement] = useState("");
  const [alternatives, setAlternatives] = useState<AlternativeInput[]>(freshAlternatives());

  const { data, isPending } = useQuery({
    queryKey: ["questions"],
    queryFn: () => getQuestions(1, 100),
  });

  const createMutation = useMutation({
    mutationFn: createQuestion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["questions"] });
      toast.success("Questão criada");
      closeDialog();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { statement?: string; alternatives?: AlternativeInput[] } }) =>
      updateQuestion(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["questions"] });
      toast.success("Questão atualizada");
      closeDialog();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteQuestion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["questions"] });
      toast.success("Questão excluída");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  function openCreate() {
    setEditingQuestion(null);
    setStatement("");
    setAlternatives(freshAlternatives());
    setDialogOpen(true);
  }

  function openEdit(q: Question) {
    setEditingQuestion(q);
    setStatement(q.statement);
    setAlternatives(q.alternatives.map((a) => ({ description: a.description, isCorrect: a.isCorrect })));
    setDialogOpen(true);
  }

  function closeDialog() {
    setDialogOpen(false);
    setEditingQuestion(null);
    setStatement("");
    setAlternatives(freshAlternatives());
  }

  function setCorrect(index: number) {
    setAlternatives((prev) => prev.map((a, i) => ({ ...a, isCorrect: i === index })));
  }

  function setDescription(index: number, value: string) {
    setAlternatives((prev) => prev.map((a, i) => (i === index ? { ...a, description: value } : a)));
  }

  function addAlternative() {
    setAlternatives((prev) => [...prev, { description: "", isCorrect: false }]);
  }

  function removeAlternative(index: number) {
    if (alternatives.length <= 2) return;
    const updated = alternatives.filter((_, i) => i !== index);
    if (!updated.some((a) => a.isCorrect)) updated[0].isCorrect = true;
    setAlternatives(updated);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!alternatives.some((a) => a.isCorrect)) {
      toast.error("Marque uma alternativa como correta");
      return;
    }
    const payload = { statement, alternatives };
    if (editingQuestion) {
      updateMutation.mutate({ id: editingQuestion.id, payload });
    } else {
      createMutation.mutate(payload);
    }
  }

  const questions = data?.data ?? [];
  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div>
      <PageHeader
        title="Banco de Questões"
        description="Gerencie as questões disponíveis para suas provas"
        action={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Questão
          </Button>
        }
      />

      <Card>
        <CardContent className="p-0">
          {isPending ? (
            <div className="p-6 space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : questions.length === 0 ? (
            <EmptyState
              message="Nenhuma questão cadastrada"
              description="Crie sua primeira questão para usar nas provas"
              action={
                <Button onClick={openCreate}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Questão
                </Button>
              }
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">#</TableHead>
                  <TableHead>Enunciado</TableHead>
                  <TableHead className="w-28">Alternativas</TableHead>
                  <TableHead className="text-right w-24">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {questions.map((q, i) => (
                  <TableRow key={q.id}>
                    <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                    <TableCell>
                      <span className="line-clamp-2">{q.statement}</span>
                    </TableCell>
                    <TableCell>{q.alternatives.length}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(q)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <ConfirmDeleteDialog
                          resourceName="questão"
                          trigger={
                            <Button variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          }
                          onConfirm={() => deleteMutation.mutate(q.id)}
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

      <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) closeDialog(); }}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingQuestion ? "Editar Questão" : "Nova Questão"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="statement">Enunciado</Label>
              <Textarea
                id="statement"
                required
                rows={3}
                value={statement}
                onChange={(e) => setStatement(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <Label>Alternativas</Label>
                <Button type="button" variant="outline" size="sm" onClick={addAlternative}>
                  <Plus className="h-3 w-3 mr-1" />
                  Adicionar
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Selecione o radio ao lado da alternativa correta
              </p>
              {alternatives.map((alt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="correct"
                    checked={alt.isCorrect}
                    onChange={() => setCorrect(i)}
                    className="h-4 w-4 shrink-0"
                    title="Marcar como correta"
                  />
                  <Input
                    placeholder={`Alternativa ${String.fromCharCode(65 + i)}`}
                    required
                    value={alt.description}
                    onChange={(e) => setDescription(i, e.target.value)}
                    className="flex-1"
                  />
                  {alternatives.length > 2 && (
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeAlternative(i)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeDialog}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Salvando..." : "Salvar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
