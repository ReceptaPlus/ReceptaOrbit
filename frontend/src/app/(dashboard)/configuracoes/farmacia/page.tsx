"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { getPharmacy } from "@/modules/settings/api";
import { pharmacySchema, type PharmacyInput } from "@/modules/settings/schemas";

export default function FarmaciaPage() {
  const form = useForm<PharmacyInput>({
    resolver: zodResolver(pharmacySchema),
    defaultValues: getPharmacy(),
  });

  function onSubmit(values: PharmacyInput) {
    toast.success(`Dados de "${values.tradeName}" salvos.`);
  }

  return (
    <section className="bg-card rounded-xl border border-line p-5 max-w-2xl">
      <h2 className="font-semibold font-display mb-4">Dados da farmácia</h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="tradeName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome fantasia</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="legalName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Razão social</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="cnpj"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CNPJ</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="timezone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fuso horário</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="sm:col-span-2">
            <Button type="submit">Salvar alterações</Button>
          </div>
        </form>
      </Form>
    </section>
  );
}
