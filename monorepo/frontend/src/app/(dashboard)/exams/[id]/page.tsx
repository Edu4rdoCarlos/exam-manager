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
import { getStudents } from "@/lib/api/students";
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
import { Pagination } from "@/components/shared/Pagination";
import { Skeleton } from "@/components/primitives/skeleton";
import { ArrowLeft, Plus, FileDown, Check, Upload } from "lucide-react";
import type { Correction, Student } from "@/lib/types";

const FORMAT_LABELS: Record<string, string> = {
  letters: "Letras (A, B, C...)",
  powers_of_two: "Potências de 2",
};

const CORRECTION_MODE_LABELS: Record<string, string> = {
  strict: "Estrita",
  lenient: "Leniente",
};

function formatDate(value: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("pt-BR");
}


export default function ExamDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const csvInputRef = useRef<HTMLInputElement>(null);

  const [createVersionOpen, setCreateVersionOpen] = useState(false);
  const [versionCount, setVersionCount] = useState("1");
  const [createCorrectionOpen, setCreateCorrectionOpen] = useState(false);
  const [correctionMode, setCorrectionMode] = useState<"strict" | "lenient">("strict");
  const [selectedCorrectionId, setSelectedCorrectionId] = useState<string | null>(null);
  const [studentsPage, setStudentsPage] = useState(1);

  const { data: exam, isPending: examPending } = useQuery({
    queryKey: ["exam", id],
    queryFn: () => getExam(id),
  });

  const { data: versionsRes, isPending: versionsPending } = useQuery({
    queryKey: ["versions", id],
    queryFn: () => getVersionsByExam(id),
  });

  const { data: correctionsRes } = useQuery({
    queryKey: ["corrections", id],
    queryFn: () => getCorrectionsByExam(id),
  });

  const { data: studentsRes } = useQuery({
    queryKey: ["students", studentsPage],
    queryFn: () => getStudents(studentsPage),
  });

  const { data: gradeReport, isPending: gradesPending } = useQuery({
    queryKey: ["grade-report", selectedCorrectionId],
    queryFn: () => getGradeReport(selectedCorrectionId!),
    enabled: !!selectedCorrectionId,
  });

  const createVersionMutation = useMutation({
    mutationFn: createVersion,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["versions", id] }),
    onError: (err: Error) => toast.error(err.message),
  });

  const createCorrectionMutation = useMutation({
    mutationFn: createCorrection,
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ["corrections", id] });
      toast.success("Correção criada");
      setCreateCorrectionOpen(false);
      setSelectedCorrectionId(created.id);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const applyCorrectionMutation = useMutation({
    mutationFn: applyCorrection,
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["grade-report", selectedCorrectionId] });
      toast.success(`Correção aplicada — ${result.gradesCount} notas geradas`);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const applyCsvMutation = useMutation({
    mutationFn: ({ correctionId, file }: { correctionId: string; file: File }) =>
      applyCorrectionFromCsv(correctionId, file),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["grade-report"] });
      toast.success(`CSV enviado — ${result.gradesCount} nota(s) gerada(s)`);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const versions = versionsRes?.data ?? [];
  const corrections: Correction[] = correctionsRes ?? [];
  const studentList: Student[] = studentsRes?.data ?? [];
  const studentsMeta = studentsRes?.metadata;

  async function handleCreateVersions(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    const count = parseInt(versionCount, 10);
    if (isNaN(count) || count < 1) return;
    const startNumber = versions.length + 1;
    try {
      for (let i = 0; i < count; i++) {
        await createVersionMutation.mutateAsync({ examId: id, versionNumber: startNumber + i });
      }
      toast.success(`${count} versão${count > 1 ? "s" : ""} gerada${count > 1 ? "s" : ""}`);
      setCreateVersionOpen(false);
      setVersionCount("1");
    } catch {
      // errors already handled per mutation
    }
  }

  function handleStudentCsvUpload(_studentId: string) {
    csvInputRef.current?.click();
  }

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
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => router.push("/dashboard")} className="mb-2 -ml-2">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Voltar
      </Button>
      <PageHeader
        title={exam?.title ?? "Prova"}
        description={[exam?.subject, exam?.examDate ? formatDate(exam.examDate) : null]
          .filter(Boolean)
          .join(" — ")}
        action={
          <Button variant="outline" onClick={() => router.push(`/exams/${id}/edit`)}>
            Editar
          </Button>
        }
      />

      {exam && (
        <Badge variant="outline">{FORMAT_LABELS[exam.answerFormat] ?? exam.answerFormat}</Badge>
      )}

      <Tabs defaultValue="versions">
        <TabsList className="mb-4">
          <TabsTrigger value="versions">Versões ({versions.length})</TabsTrigger>
          <TabsTrigger value="corrections">Correções ({corrections.length})</TabsTrigger>
          <TabsTrigger value="grades">Notas</TabsTrigger>
        </TabsList>

        {/* VERSÕES */}
        <TabsContent value="versions">
          <Card className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-border/50 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Versões da Prova</CardTitle>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Cada versão embaralha a ordem das questões e alternativas
                </p>
              </div>
              <Button size="sm" onClick={() => setCreateVersionOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Gerar Versões
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
                  message="Nenhuma versão gerada"
                  description="Gere versões para embaralhar questões e alternativas em cada prova individual"
                  action={
                    <Button onClick={() => setCreateVersionOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Gerar Versões
                    </Button>
                  }
                />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Versão</TableHead>
                      <TableHead>Questões</TableHead>
                      <TableHead>Criada em</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {versions.map((v) => (
                      <TableRow key={v.id}>
                        <TableCell className="font-medium">Versão {v.versionNumber}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {v.examVersionQuestions.length} questões
                        </TableCell>
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
                              onClick={() =>
                                downloadApiFile(
                                  `/answer-keys/exam-version/${v.id}/csv`,
                                  `gabarito-versao-${v.versionNumber}.csv`
                                ).catch(() => toast.error("Defina o gabarito antes de baixar"))
                              }
                            >
                              <FileDown className="h-4 w-4 mr-1" />
                              Gabarito CSV
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

        {/* CORREÇÕES */}
        <TabsContent value="corrections">
          <div className="space-y-4">
            <Card className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-border/50 shadow-md">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Correções</CardTitle>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Selecione uma correção para subir as respostas dos alunos
                  </p>
                </div>
                <Button size="sm" onClick={() => setCreateCorrectionOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Correção
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                {corrections.length === 0 ? (
                  <EmptyState
                    message="Nenhuma correção criada"
                    description="Crie uma correção para poder subir as respostas dos alunos"
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
                        <TableRow
                          key={c.id}
                          className={selectedCorrectionId === c.id ? "bg-muted/50" : "cursor-pointer"}
                          onClick={() => setSelectedCorrectionId(c.id)}
                        >
                          <TableCell>
                            <Badge variant={c.correctionMode === "strict" ? "default" : "secondary"}>
                              {CORRECTION_MODE_LABELS[c.correctionMode] ?? c.correctionMode}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatDate(c.createdAt)}</TableCell>
                          <TableCell>
                            <div className="flex items-center justify-end gap-2">
                              {selectedCorrectionId === c.id && (
                                <Badge variant="outline" className="text-xs">Selecionada</Badge>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={applyCorrectionMutation.isPending}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  applyCorrectionMutation.mutate(c.id);
                                }}
                              >
                                <Check className="h-4 w-4 mr-1" />
                                Aplicar
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

            {corrections.length > 0 && (
              <Card className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-border/50 shadow-md">
                <CardHeader>
                  <CardTitle>Respostas dos Alunos</CardTitle>
                  {!selectedCorrectionId && (
                    <p className="text-sm text-muted-foreground">
                      Selecione uma correção acima para subir as respostas
                    </p>
                  )}
                </CardHeader>
                <CardContent className="p-0">
                  {studentList.length === 0 ? (
                    <EmptyState
                      message="Nenhum aluno cadastrado"
                      description="Cadastre alunos antes de subir respostas"
                    />
                  ) : (
                    <>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Aluno</TableHead>
                            <TableHead>CPF</TableHead>
                            <TableHead className="text-right">Respostas</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {studentList.map((s) => (
                            <TableRow key={s.id}>
                              <TableCell className="font-medium">{s.name}</TableCell>
                              <TableCell className="text-muted-foreground">{s.cpf}</TableCell>
                              <TableCell>
                                <div className="flex items-center justify-end">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    disabled={!selectedCorrectionId}
                                    onClick={() => handleStudentCsvUpload(s.id)}
                                  >
                                    <Upload className="h-4 w-4 mr-1" />
                                    Upload CSV
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      {studentsMeta && (
                        <Pagination
                          page={studentsMeta.page}
                          totalPages={studentsMeta.totalPages}
                          total={studentsMeta.total}
                          limit={studentsMeta.limit}
                          onPageChange={setStudentsPage}
                        />
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          <input
            ref={csvInputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file && selectedCorrectionId) {
                applyCsvMutation.mutate({ correctionId: selectedCorrectionId, file });
                e.target.value = "";
              }
            }}
          />
        </TabsContent>

        {/* NOTAS */}
        <TabsContent value="grades">
          <Card className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-border/50 shadow-md">
            <CardHeader>
              <CardTitle>Notas dos Alunos</CardTitle>
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
                    <Label>Selecionar correção</Label>
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
                            Correção {i + 1} — {CORRECTION_MODE_LABELS[c.correctionMode]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedCorrectionId &&
                    (gradesPending ? (
                      <Skeleton className="h-32 w-full" />
                    ) : studentList.length === 0 ? (
                      <EmptyState
                        message="Nenhum aluno cadastrado"
                        description="Cadastre alunos para visualizar notas"
                      />
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Aluno</TableHead>
                            <TableHead>CPF</TableHead>
                            <TableHead>Versão</TableHead>
                            <TableHead className="text-right">Nota</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {studentList.map((s) => {
                            const grade = gradeReport?.find((g) => g.student.id === s.id);
                            return (
                              <TableRow key={s.id}>
                                <TableCell className="font-medium">{s.name}</TableCell>
                                <TableCell className="text-muted-foreground">{s.cpf}</TableCell>
                                <TableCell>
                                  {grade ? `Versão ${grade.examVersion.versionNumber}` : "—"}
                                </TableCell>
                                <TableCell className="text-right font-bold">
                                  {grade ? grade.score : (
                                    <span className="text-muted-foreground font-normal text-sm">
                                      sem nota
                                    </span>
                                  )}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog: gerar N versões */}
      <Dialog open={createVersionOpen} onOpenChange={setCreateVersionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gerar Versões da Prova</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateVersions} className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="versionCount">Quantas versões deseja gerar?</Label>
              <Input
                id="versionCount"
                type="number"
                min="1"
                max="50"
                required
                value={versionCount}
                onChange={(e) => setVersionCount(e.target.value)}
                placeholder="Ex: 5"
              />
              {versions.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  Já existem {versions.length} versão(ões). As novas serão numeradas a partir da {versions.length + 1}.
                </p>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateVersionOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createVersionMutation.isPending}>
                {createVersionMutation.isPending ? "Gerando..." : "Gerar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog: nova correção */}
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
                  <SelectItem value="strict">
                    Estrita — alternativa errada zera a questão
                  </SelectItem>
                  <SelectItem value="lenient">
                    Leniente — nota proporcional ao percentual de acertos
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateCorrectionOpen(false)}>
                Cancelar
              </Button>
              <Button
                disabled={createCorrectionMutation.isPending}
                onClick={() => createCorrectionMutation.mutate({ examId: id, correctionMode })}
              >
                {createCorrectionMutation.isPending ? "Criando..." : "Criar"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}
