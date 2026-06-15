"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { formatDate, formatTime } from "@/lib/format";
import { getSecurity, changePassword } from "@/modules/account/api";
import {
  changePasswordSchema,
  type ChangePasswordInput,
} from "@/modules/account/schemas";
import type { UIState } from "@/contracts/ui-state";
import type { SecurityVM } from "@/modules/account/types";

function SecuritySkeleton() {
  return (
    <div className="space-y-6 max-w-2xl">
      <Skeleton className="h-48 rounded-xl" />
      <Skeleton className="h-32 rounded-xl" />
    </div>
  );
}

export default function SegurancaPage() {
  const [state] = useState<UIState<SecurityVM>>(() => ({
    status: "ready",
    data: getSecurity(),
  }));

  if (state.status === "loading") return <SecuritySkeleton />;

  if (state.status === "error") {
    return (
      <div className="max-w-2xl bg-card rounded-xl border border-line p-8 text-center">
        <p className="text-sm text-secondary mb-4">{state.error.message}</p>
        <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
          Tentar novamente
        </Button>
      </div>
    );
  }

  if (state.status === "empty") {
    return (
      <div className="max-w-2xl bg-card rounded-xl border border-line p-8 text-center">
        <p className="text-sm text-secondary">{state.message}</p>
      </div>
    );
  }

  return <SecurityReady security={state.data} />;
}

function SecurityReady({ security }: { security: SecurityVM }) {
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  function onSubmit(values: ChangePasswordInput) {
    setSubmitting(true);

    setTimeout(() => {
      const result = changePassword(values.currentPassword, values.newPassword);
      setSubmitting(false);

      if (!result.success) {
        form.setError("currentPassword", { message: result.error });
        return;
      }

      toast.success("Senha alterada com sucesso.", {
        description: "Outras sessões foram invalidadas. Um e-mail de confirmação foi enviado.",
      });
      form.reset();
    }, 600);
  }

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Alterar senha */}
      <section className="bg-card rounded-xl border border-line p-5">
        <h3 className="font-semibold font-display mb-4">Alterar senha</h3>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Senha atual</FormLabel>
                  <FormControl>
                    <Input type="password" autoComplete="current-password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nova senha</FormLabel>
                    <FormControl>
                      <Input type="password" autoComplete="new-password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmar nova senha</FormLabel>
                    <FormControl>
                      <Input type="password" autoComplete="new-password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="bg-cream-200/50 rounded-lg p-3 text-xs text-secondary space-y-1">
              <p>Ao alterar a senha:</p>
              <ul className="list-disc list-inside space-y-0.5">
                <li>Todas as outras sessões serão invalidadas</li>
                <li>Um e-mail de confirmação será enviado</li>
                <li>Você continuará logado nesta sessão</li>
              </ul>
            </div>

            <Button type="submit" disabled={submitting}>
              {submitting ? "Alterando…" : "Alterar senha"}
            </Button>
          </form>
        </Form>
      </section>

      {/* Informações de sessão */}
      <section className="bg-card rounded-xl border border-line p-5">
        <h3 className="font-semibold font-display mb-4">Sessão atual</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-secondary mb-0.5">Último login</p>
            <p className="text-sm">
              {formatDate(security.lastLoginAt)} às {formatTime(security.lastLoginAt)}
            </p>
          </div>
          <div>
            <p className="text-xs text-secondary mb-0.5">Dispositivo</p>
            <p className="text-sm">{security.lastLoginDevice}</p>
          </div>
          <div>
            <p className="text-xs text-secondary mb-0.5">IP</p>
            <p className="text-sm font-mono text-xs">{security.lastLoginIp}</p>
          </div>
          <div>
            <p className="text-xs text-secondary mb-0.5">Senha alterada em</p>
            <p className="text-sm">
              {security.passwordChangedAt
                ? formatDate(security.passwordChangedAt)
                : "Nunca alterada"}
            </p>
          </div>
        </div>
      </section>

      {/* 2FA — futuro */}
      <section className="bg-card rounded-xl border border-line p-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold font-display">Autenticação em duas etapas</h3>
            <p className="text-sm text-secondary mt-1">
              Adicione uma camada extra de segurança à sua conta.
            </p>
          </div>
          <Badge variant="outline" className="text-xs text-muted shrink-0">
            Em breve
          </Badge>
        </div>
      </section>
    </div>
  );
}
