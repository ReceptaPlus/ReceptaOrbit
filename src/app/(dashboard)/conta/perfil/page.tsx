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
import { ROLE_LABEL, ROUTES } from "@/lib/constants";
import { getUserProfile, updateProfile } from "@/modules/account/api";
import { profileSchema, type ProfileInput } from "@/modules/account/schemas";
import type { UIState } from "@/contracts/ui-state";
import type { UserProfileVM } from "@/modules/account/types";

function Avatar({ initials }: { initials: string }) {
  return (
    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-brand-500 to-brand-400 text-white flex items-center justify-center text-display font-bold font-display shrink-0 shadow-md">
      {initials}
    </div>
  );
}

function MembershipCard({
  pharmacyName,
  role,
  isCurrent,
}: {
  pharmacyName: string;
  role: string;
  isCurrent: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 p-3 rounded-lg border border-line bg-card">
      <div className="min-w-0">
        <p className="text-sm font-medium truncate">{pharmacyName}</p>
        <p className="text-xs text-secondary">{ROLE_LABEL[role as keyof typeof ROLE_LABEL] ?? role}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {isCurrent && (
          <Badge variant="outline" className="text-success-text bg-success-bg border-0 text-xs">
            Atual
          </Badge>
        )}
        {!isCurrent && (
          <Button variant="ghost" size="sm" className="text-xs h-7" asChild>
            <a href={ROUTES.dashboard}>Acessar</a>
          </Button>
        )}
      </div>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-5">
        <Skeleton className="w-20 h-20 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="w-48 h-6" />
          <Skeleton className="w-36 h-4" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Skeleton className="h-16" />
        <Skeleton className="h-16" />
        <Skeleton className="h-16" />
        <Skeleton className="h-16" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-16" />
        <Skeleton className="h-16" />
      </div>
    </div>
  );
}

function ProfileError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="max-w-2xl bg-card rounded-xl border border-line p-8 text-center">
      <p className="text-sm text-secondary mb-4">{message}</p>
      <Button onClick={onRetry} variant="outline" size="sm">
        Tentar novamente
      </Button>
    </div>
  );
}

export default function PerfilPage() {
  const [state, setState] = useState<UIState<UserProfileVM>>(() => ({
    status: "ready",
    data: getUserProfile(),
  }));

  if (state.status === "loading") return <ProfileSkeleton />;

  if (state.status === "error") {
    return (
      <ProfileError
        message={state.error.message}
        onRetry={() => setState({ status: "ready", data: getUserProfile() })}
      />
    );
  }

  if (state.status === "empty") {
    return (
      <div className="max-w-2xl bg-card rounded-xl border border-line p-8 text-center">
        <p className="text-sm text-secondary">{state.message}</p>
      </div>
    );
  }

  const profile = state.data;

  return <ProfileReady profile={profile} />;
}

function ProfileReady({ profile }: { profile: UserProfileVM }) {
  const form = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: profile.name },
  });

  const isDirty = form.formState.isDirty;

  function onSubmit(values: ProfileInput) {
    const result = updateProfile(values.name);
    if (result.success) {
      toast.success("Perfil atualizado.");
      form.reset({ name: values.name });
    }
  }

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Header com Avatar */}
      <div className="flex items-center gap-5">
        <Avatar initials={profile.initials} />
        <div className="min-w-0">
          <h2 className="text-lg font-semibold font-display truncate">{profile.name}</h2>
          <p className="text-sm text-secondary truncate">{profile.email}</p>
          {profile.isStaff && (
            <Badge className="mt-1 bg-brand-50 text-brand-600 border-0 text-xs">
              Staff Recepta
            </Badge>
          )}
        </div>
      </div>

      {/* Form editável */}
      <section className="bg-card rounded-xl border border-line p-5">
        <h3 className="font-semibold font-display mb-4">Dados pessoais</h3>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome completo</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormItem>
                <FormLabel>E-mail</FormLabel>
                <Input value={profile.email} disabled className="bg-subtle" />
                <p className="text-xs text-muted">Alteração via suporte no MVP.</p>
              </FormItem>
              <FormItem>
                <FormLabel>Usuário</FormLabel>
                <Input value={profile.username} disabled className="bg-subtle" />
              </FormItem>
              <FormItem>
                <FormLabel>Status</FormLabel>
                <div className="flex items-center h-10">
                  <Badge
                    variant="outline"
                    className={
                      profile.status === "ACTIVE"
                        ? "bg-success-bg text-success-text border-0"
                        : "bg-danger-bg text-danger-text border-0"
                    }
                  >
                    {profile.status === "ACTIVE" ? "Ativo" : "Suspenso"}
                  </Badge>
                </div>
              </FormItem>
            </div>

            {/* Metadados read-only */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-line">
              <div>
                <p className="text-xs text-secondary mb-0.5">Último acesso</p>
                <p className="text-sm">
                  {formatDate(profile.lastLoginAt)} às {formatTime(profile.lastLoginAt)}
                </p>
              </div>
              <div>
                <p className="text-xs text-secondary mb-0.5">Criado em</p>
                <p className="text-sm">{formatDate(profile.createdAt)}</p>
              </div>
            </div>

            {/* Ações */}
            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={!isDirty}>
                Salvar alterações
              </Button>
              {isDirty && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => form.reset()}
                >
                  Cancelar
                </Button>
              )}
            </div>
          </form>
        </Form>
      </section>

      {/* Farmácias vinculadas */}
      <section className="bg-card rounded-xl border border-line p-5">
        <h3 className="font-semibold font-display mb-4">
          Farmácias vinculadas
          <span className="text-secondary font-normal text-sm ml-2">
            ({profile.memberships.length})
          </span>
        </h3>
        {profile.memberships.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-sm text-secondary">
              Nenhuma farmácia vinculada.
            </p>
            <p className="text-xs text-muted mt-1">
              Contate um administrador para receber um convite.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {profile.memberships.map((m) => (
              <MembershipCard
                key={m.pharmacyId}
                pharmacyName={m.pharmacyName}
                role={m.role}
                isCurrent={m.isCurrent}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
