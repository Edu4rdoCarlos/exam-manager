"use client";

import { Lock, Mail } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/primitives/button";
import { Input } from "@/components/primitives/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/primitives/card";
import { useLogin } from "@/lib/hooks/use-login";

export function LoginForm() {
  const { form, loading, onSubmit } = useLogin();
  const {
    register,
    formState: { errors },
  } = form;

  return (
    <Card className="border-border/50 bg-white/80 backdrop-blur-sm shadow-xl dark:bg-slate-900/80">
      <CardHeader className="space-y-2">
        <CardTitle className="text-2xl">Bem-vindo de volta</CardTitle>
        <CardDescription>
          Entre com suas credenciais para acessar o sistema
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-foreground">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                className="pl-9 h-11 bg-background/50"
                {...register("email")}
              />
            </div>
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-foreground">
              Senha
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className="pl-9 h-11 bg-background/50"
                {...register("password")}
              />
            </div>
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password.message}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full h-11 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/30 transition-all cursor-pointer"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Autenticando...
              </span>
            ) : (
              "Entrar no Sistema"
            )}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          Não tem conta?{" "}
          <Link href="/register" className="font-medium text-blue-600 hover:underline dark:text-blue-400">
            Criar conta
          </Link>
        </p>

        <div className="mt-4 rounded-lg bg-blue-50/50 dark:bg-blue-950/30 p-4 border border-blue-200/50 dark:border-blue-800/50">
          <p className="text-xs text-blue-900 dark:text-blue-100">
            <strong>Acesso seguro:</strong> Suas credenciais são protegidas e todas
            as operações são registradas no sistema.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
