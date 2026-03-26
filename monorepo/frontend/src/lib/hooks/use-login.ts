"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useAuth } from "@/components/providers/AuthProvider";
import { login } from "@/lib/api/auth";

const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(1, "Senha obrigatória"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function useLogin() {
  const router = useRouter();
  const { login: authLogin } = useAuth();
  const [loading, setLoading] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginFormValues) {
    setLoading(true);
    try {
      const token = await login(values.email, values.password);
      authLogin(token);
      router.replace("/dashboard");
    } catch {
      toast.error("E-mail ou senha inválidos");
    } finally {
      setLoading(false);
    }
  }

  return { form, loading, onSubmit: form.handleSubmit(onSubmit) };
}
