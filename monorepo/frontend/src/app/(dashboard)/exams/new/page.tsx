"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/components/providers/AuthProvider";
import { createExam } from "@/lib/api/exams";
import { getQuestions } from "@/lib/api/questions";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/primitives/button";
import { Input } from "@/components/primitives/input";
import { Label } from "@/components/primitives/label";
import { Card, CardContent } from "@/components/primitives/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/primitives/select";
import { Skeleton } from "@/components/primitives/skeleton";
import { ArrowLeft } from "lucide-react";

export default function NewExamPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [examDate, setExamDate] = useState("");
  const [answerFormat, setAnswerFormat] = useState<"letters" | "powers_of_two">("letters");
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);

  const { data: questionsData, isPending: questionsPending } = useQuery({
    queryKey: ["questions"],
    queryFn: () => getQuestions(1, 100),
  });

  const createMutation = useMutation({
    mutationFn: createExam,
    onSuccess: (exam) => {
      toast.success("Prova criada com sucesso");
      router.push(`/exams/${exam.id}`);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  function toggleQuestion(id: string) {
    setSelectedQuestionIds((prev) =>
      prev.includes(id) ? prev.filter((q) => q !== id) : [...prev, id]
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    createMutation.mutate({
      title,
      subject,
      teacherId: user.sub,
      examDate: examDate || undefined,
      answerFormat,
      questionIds: selectedQuestionIds.map((questionId, i) => ({
        questionId,
        position: i + 1,
      })),
    });
  }

  const questions = questionsData?.data ?? [];

  return (
    <div>
      <PageHeader
        title="Nova Prova"
        description="Crie uma nova prova para seus alunos"
        action={
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        }
      />

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="subject">Disciplina</Label>
              <Input
                id="subject"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="examDate">Data da prova (opcional)</Label>
              <Input
                id="examDate"
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Formato de resposta</Label>
              <Select
                value={answerFormat}
                onValueChange={(v) => setAnswerFormat(v as "letters" | "powers_of_two")}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="letters">Letras (A, B, C...)</SelectItem>
                  <SelectItem value="powers_of_two">Potências de 2</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <Label className="text-base font-medium">Questões</Label>
            <p className="text-sm text-muted-foreground mt-1 mb-4">
              Selecione as questões que farão parte desta prova
            </p>
            {questionsPending ? (
              <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : questions.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhuma questão disponível. Crie questões no banco de questões primeiro.
              </p>
            ) : (
              <div className="space-y-2">
                {questions.map((q, i) => {
                  const checked = selectedQuestionIds.includes(q.id);
                  return (
                    <label
                      key={q.id}
                      className="flex items-start gap-3 p-3 rounded-md border cursor-pointer hover:bg-muted/50 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleQuestion(q.id)}
                        className="mt-0.5 h-4 w-4 shrink-0"
                      />
                      <span className="text-sm">
                        <span className="text-muted-foreground mr-2">{i + 1}.</span>
                        {q.statement}
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button
            type="submit"
            disabled={createMutation.isPending || selectedQuestionIds.length === 0}
          >
            {createMutation.isPending ? "Criando..." : "Criar Prova"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
}
