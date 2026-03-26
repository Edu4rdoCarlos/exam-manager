"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { createUser } from "@/lib/api/users";

const registerSchema = z
  .object({
    name: z.string().min(1, "Nome obrigatório"),
    email: z.string().email("E-mail inválido"),
    password: z.string().min(8, "Mínimo de 8 caracteres"),
    confirm: z.string().min(1, "Confirmação obrigatória"),
  })
  .refine((data) => data.password === data.confirm, {
    message: "As senhas não coincidem",
    path: ["confirm"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export function useRegister() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", confirm: "" },
  });

  async function onSubmit(values: RegisterFormValues) {
    setLoading(true);
    try {
      await createUser({ name: values.name, email: values.email, password: values.password });
      toast.success("Conta criada! Faça login para continuar.");
      router.push("/login");
    } catch (err) {
      const message = err instanceof Error ? err.message : "";
      if (message.toLowerCase().includes("email") || message.includes("409")) {
        form.setError("email", { message: "E-mail já cadastrado" });
      } else {
        toast.error("Erro ao criar conta");
      }
    } finally {
      setLoading(false);
    }
  }

  return { form, loading, onSubmit: form.handleSubmit(onSubmit) };
}
