"use client";

import { useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getExam } from "@/lib/api/exams";
import { getVersionsByExam, createVersion } from "@/lib/api/versions";
import {
  createCorrection,
  applyCorrection,
  applyCorrectionFromCsv,
  getGradeReport,
  getCorrectionsByExam,
} from "@/lib/api/corrections";
import { getAnswerKeysByVersion, createAnswerKeys, getAnswerKeyCsvUrl } from "@/lib/api/keys";
import { downloadApiFile } from "@/lib/api/client";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/primitives/button";
import { Input } from "@/components/primitives/input";
import { Label } from "@/components/primitives/label";
import { Badge } from "@/components/primitives/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/primitives/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/primitives/tabs";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/primitives/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/primitives/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/primitives/table";
import { EmptyState } from "@/components/shared/EmptyState";
import { Skeleton } from "@/components/primitives/skeleton";
import { ArrowLeft, Plus, FileDown, Key, Check } from "lucide-react";
import type { Correction, ExamVersion } from "@/lib/types";

const FORMAT_LABELS: Record<string, string> = {
  letters: "Letras (A, B, C...)",
  powers_of_two: "Potências de 2",
};

function formatDate(value: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("pt-BR");
}

interface GabaritoDialogProps {
  version: ExamVersion;
  open: boolean;
  onClose: () => void;
}

function GabaritoDialog({ version, open, onClose }: GabaritoDialogProps) {
  const queryClient = useQueryClient();
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const { data: keys, isPending: keysPending } = useQuery({
    queryKey: ["answer-keys", version.id],
    queryFn: () => getAnswerKeysByVersion(version.id),
    enabled: open,
  });

  const createKeysMutation = useMutation({
    mutationFn: createAnswerKeys,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["answer-keys", version.id] });
      toast.success("Gabarito salvo");
      onClose();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const questions = [...version.examVersionQuestions].sort((a, b) => a.position - b.position);
  const hasKeys = keys && keys.length > 0;

  const existingKeysMap: Record<string, string> = {};
  if (keys) {
    for (const k of keys) {
      existingKeysMap[k.examVersionQuestionId] = k.correctAnswer;
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    createKeysMutation.mutate({
      examVersionId: version.id,
      keys: questions.map((q) => ({
        examVersionQuestionId: q.id,
        correctAnswer: answers[q.id] ?? "",
      })),
    });
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Gabarito — Versão {version.versionNumber}</DialogTitle>
        </DialogHeader>

        {keysPending ? (
          <div className="space-y-2 py-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : hasKeys ? (
          <div className="space-y-3 py-2">
            <p className="text-sm text-muted-foreground">Gabarito já definido:</p>
            {questions.map((q) => (
              <div key={q.id} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Questão {q.position}</span>
                <Badge variant="secondary">{existingKeysMap[q.id] ?? "—"}</Badge>
              </div>
            ))}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Defina a resposta correta para cada questão desta versão.
            </p>
            {questions.map((q) => (
              <div key={q.id} className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground w-24 shrink-0">
                  Questão {q.position}
                </span>
                {q.examVersionAlternatives.length > 0 ? (
                  <Select
                    value={answers[q.id] ?? ""}
                    onValueChange={(v) => setAnswers((prev) => ({ ...prev, [q.id]: v }))}
                  >
                    <SelectTrigger className="flex-1 w-full">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {[...q.examVersionAlternatives]
                        .sort((a, b) => a.position - b.position)
                        .map((alt) => (
                          <SelectItem key={alt.id} value={alt.label}>
                            {alt.label}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    required
                    placeholder="Ex: A"
                    value={answers[q.id] ?? ""}
                    onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
                    className="flex-1"
                  />
                )}
              </div>
            ))}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createKeysMutation.isPending}>
                {createKeysMutation.isPending ? "Salvando..." : "Salvar Gabarito"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function ExamDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const csvInputRef = useRef<HTMLInputElement>(null);

  const [createVersionOpen, setCreateVersionOpen] = useState(false);
  const [newVersionNumber, setNewVersionNumber] = useState("");
  const [gabaritoVersion, setGabaritoVersion] = useState<ExamVersion | null>(null);
  const [createCorrectionOpen, setCreateCorrectionOpen] = useState(false);
  const [correctionMode, setCorrectionMode] = useState<"strict" | "lenient">("strict");
  const [csvCorrectionId, setCsvCorrectionId] = useState<string | null>(null);
  const [selectedCorrectionId, setSelectedCorrectionId] = useState<string | null>(null);

  const { data: exam, isPending: examPending } = useQuery({
    queryKey: ["exam", id],
    queryFn: () => getExam(id),
  });

  const { data: versionsRes, isPending: versionsPending } = useQuery({
    queryKey: ["versions", id],
    queryFn: () => getVersionsByExam(id),
  });

  const { data: correctionsRes, isPending: correctionsPending } = useQuery({
    queryKey: ["corrections", id],
    queryFn: () => getCorrectionsByExam(id),
  });

  const { data: gradeReport, isPending: gradesPending } = useQuery({
    queryKey: ["grade-report", selectedCorrectionId],
    queryFn: () => getGradeReport(selectedCorrectionId!),
    enabled: !!selectedCorrectionId,
  });

  const createVersionMutation = useMutation({
    mutationFn: createVersion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["versions", id] });
      toast.success("Versão criada");
      setCreateVersionOpen(false);
      setNewVersionNumber("");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const createCorrectionMutation = useMutation({
    mutationFn: createCorrection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["corrections", id] });
      toast.success("Correção criada");
      setCreateCorrectionOpen(false);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const applyCorrectionMutation = useMutation({
    mutationFn: applyCorrection,
    onSuccess: (result) => {
      toast.success(`Correção aplicada — ${result.gradesCount} notas geradas`);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const applyCsvMutation = useMutation({
    mutationFn: ({ correctionId, file }: { correctionId: string; file: File }) =>
      applyCorrectionFromCsv(correctionId, file),
    onSuccess: (result) => {
      toast.success(`CSV aplicado — ${result.gradesCount} notas geradas`);
      setCsvCorrectionId(null);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const versions = versionsRes?.data ?? [];
  const corrections: Correction[] = correctionsRes ?? [];

  if (examPending) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={exam?.title ?? "Prova"}
        description={[exam?.subject, exam?.examDate ? formatDate(exam.examDate) : null]
          .filter(Boolean)
          .join(" — ")}
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push(`/exams/${id}/edit`)}>
              Editar
            </Button>
            <Button variant="outline" onClick={() => router.push("/dashboard")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </div>
        }
      />

      {exam && (
        <div className="flex gap-2 mb-6">
          <Badge variant="outline">{FORMAT_LABELS[exam.answerFormat] ?? exam.answerFormat}</Badge>
        </div>
      )}

      <Tabs defaultValue="versions">
        <TabsList className="mb-6">
          <TabsTrigger value="versions">Versões</TabsTrigger>
          <TabsTrigger value="corrections">Correções</TabsTrigger>
          <TabsTrigger value="grades">Notas</TabsTrigger>
        </TabsList>

        <TabsContent value="versions">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Versões da Prova</CardTitle>
              <Button size="sm" onClick={() => setCreateVersionOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Versão
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {versionsPending ? (
                <div className="p-6 space-y-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : versions.length === 0 ? (
                <EmptyState
                  message="Nenhuma versão criada"
                  description="Crie versões para embaralhar as alternativas da prova"
                  action={
                    <Button onClick={() => setCreateVersionOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Nova Versão
                    </Button>
                  }
                />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Versão</TableHead>
                      <TableHead>Criada em</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {versions.map((v) => (
                      <TableRow key={v.id}>
                        <TableCell className="font-medium">Versão {v.versionNumber}</TableCell>
                        <TableCell>{formatDate(v.createdAt)}</TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                downloadApiFile(
                                  `/exam-versions/${v.id}/pdf`,
                                  `prova-versao-${v.versionNumber}.pdf`
                                ).catch(() => toast.error("Erro ao baixar PDF"))
                              }
                            >
                              <FileDown className="h-4 w-4 mr-1" />
                              PDF
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setGabaritoVersion(v)}
                            >
                              <Key className="h-4 w-4 mr-1" />
                              Gabarito
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="corrections">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Correções</CardTitle>
              <Button size="sm" onClick={() => setCreateCorrectionOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Correção
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {corrections.length === 0 ? (
                <EmptyState
                  message="Nenhuma correção criada"
                  description="Crie uma correção para calcular as notas dos alunos"
                  action={
                    <Button onClick={() => setCreateCorrectionOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Nova Correção
                    </Button>
                  }
                />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Modo</TableHead>
                      <TableHead>Criada em</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {corrections.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell>
                          <Badge variant={c.correctionMode === "strict" ? "default" : "secondary"}>
                            {c.correctionMode === "strict" ? "Estrita" : "Leniente"}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(c.createdAt)}</TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={applyCorrectionMutation.isPending}
                              onClick={() => applyCorrectionMutation.mutate(c.id)}
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Aplicar
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setCsvCorrectionId(c.id);
                                csvInputRef.current?.click();
                              }}
                            >
                              <FileDown className="h-4 w-4 mr-1" />
                              Via CSV
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
          <input
            ref={csvInputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file && csvCorrectionId) {
                applyCsvMutation.mutate({ correctionId: csvCorrectionId, file });
                e.target.value = "";
              }
            }}
          />
        </TabsContent>

        <TabsContent value="grades">
          <Card>
            <CardHeader>
              <CardTitle>Notas</CardTitle>
            </CardHeader>
            <CardContent>
              {corrections.length === 0 ? (
                <EmptyState
                  message="Nenhuma correção disponível"
                  description="Crie e aplique uma correção para ver as notas"
                />
              ) : (
                <div className="space-y-6">
                  <div className="flex flex-col gap-1.5 max-w-xs">
                    <Label>Correção</Label>
                    <Select
                      value={selectedCorrectionId ?? ""}
                      onValueChange={setSelectedCorrectionId}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione uma correção" />
                      </SelectTrigger>
                      <SelectContent>
                        {corrections.map((c, i) => (
                          <SelectItem key={c.id} value={c.id}>
                            Correção {i + 1} —{" "}
                            {c.correctionMode === "strict" ? "Estrita" : "Leniente"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedCorrectionId &&
                    (gradesPending ? (
                      <Skeleton className="h-32 w-full" />
                    ) : !gradeReport || gradeReport.length === 0 ? (
                      <EmptyState
                        message="Nenhuma nota gerada ainda"
                        description="Aplique a correção na aba Correções para gerar as notas"
                      />
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Aluno</TableHead>
                            <TableHead>CPF</TableHead>
                            <TableHead>Versão</TableHead>
                            <TableHead>Nota</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {gradeReport.map((g) => (
                            <TableRow key={g.gradeId}>
                              <TableCell>{g.student.name}</TableCell>
                              <TableCell className="text-muted-foreground">
                                {g.student.cpf}
                              </TableCell>
                              <TableCell>Versão {g.examVersion.versionNumber}</TableCell>
                              <TableCell className="font-medium">{g.score}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={createVersionOpen} onOpenChange={setCreateVersionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Versão</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              createVersionMutation.mutate({
                examId: id,
                versionNumber: parseInt(newVersionNumber, 10),
              });
            }}
            className="space-y-4"
          >
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="versionNumber">Número da versão</Label>
              <Input
                id="versionNumber"
                type="number"
                min="1"
                required
                value={newVersionNumber}
                onChange={(e) => setNewVersionNumber(e.target.value)}
                placeholder="Ex: 1"
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateVersionOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={createVersionMutation.isPending}>
                {createVersionMutation.isPending ? "Criando..." : "Criar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={createCorrectionOpen} onOpenChange={setCreateCorrectionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Correção</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <Label>Modo de correção</Label>
              <Select
                value={correctionMode}
                onValueChange={(v) => setCorrectionMode(v as "strict" | "lenient")}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="strict">Estrita — resposta exata</SelectItem>
                  <SelectItem value="lenient">Leniente — aceita variações</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateCorrectionOpen(false)}>
                Cancelar
              </Button>
              <Button
                disabled={createCorrectionMutation.isPending}
                onClick={() =>
                  createCorrectionMutation.mutate({ examId: id, correctionMode })
                }
              >
                {createCorrectionMutation.isPending ? "Criando..." : "Criar"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {gabaritoVersion && (
        <GabaritoDialog
          version={gabaritoVersion}
          open={!!gabaritoVersion}
          onClose={() => setGabaritoVersion(null)}
        />
      )}
    </div>
  );
}
