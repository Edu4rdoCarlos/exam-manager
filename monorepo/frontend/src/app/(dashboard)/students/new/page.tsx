"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { createStudent } from "@/lib/api/students";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/primitives/button";
import { Input } from "@/components/primitives/input";
import { Label } from "@/components/primitives/label";
import { Card, CardContent } from "@/components/primitives/card";
import { ArrowLeft } from "lucide-react";

export default function NewStudentPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [cpf, setCpf] = useState("");

  const createMutation = useMutation({
    mutationFn: createStudent,
    onSuccess: () => {
      toast.success("Aluno cadastrado com sucesso");
      router.push("/dashboard");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    createMutation.mutate({ name, cpf });
  }

  return (
    <div>
      <PageHeader
        title="Cadastrar Aluno"
        description="Adicione um novo aluno ao sistema"
        action={
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        }
      />

      <form onSubmit={handleSubmit} className="max-w-md">
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">Nome completo</Label>
              <Input
                id="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="cpf">CPF</Label>
              <Input
                id="cpf"
                required
                placeholder="000.000.000-00"
                value={cpf}
                onChange={(e) => setCpf(e.target.value)}
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Cadastrando..." : "Cadastrar"}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
