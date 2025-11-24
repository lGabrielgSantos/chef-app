"use client";

import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import type { CustomerPayload } from "@/lib/api/customers";

const customerSchema = z.object({
  name: z.string().trim().min(1, "Nome é obrigatório"),
  phone: z.string().trim().min(1, "Telefone é obrigatório"),
  email: z.string().trim().email("E-mail inválido"),
  city: z.string().trim().min(1, "Cidade é obrigatória"),
  status: z.boolean(),
});

type NewCustomerFormValues = z.infer<typeof customerSchema>;

interface NewCustomerModalProps {
  onCreate: (payload: CustomerPayload) => Promise<unknown>;
  triggerLabel?: string;
}

export function NewCustomerModal({
  onCreate,
  triggerLabel = "Novo Customer",
}: NewCustomerModalProps) {
  const [open, setOpen] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<NewCustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      city: "",
      status: true,
    },
  });

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      form.reset();
      setSubmitError(null);
    }
  };

  const handleSubmit = async (values: NewCustomerFormValues) => {
    setSubmitError(null);
    const payload: CustomerPayload = {
      name: values.name,
      phone: values.phone,
      email: values.email,
      city: values.city,
      status: values.status ? "active" : "inactive",
    };

    try {
      await onCreate(payload);
      form.reset();
      setOpen(false);
    } catch (_error) {
      setSubmitError("Não foi possível criar o customer. Tente novamente.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="w-full sm:w-auto">{triggerLabel}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo Customer</DialogTitle>
          <DialogDescription>
            Preencha os dados para registrar um novo customer.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome completo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone</FormLabel>
                  <FormControl>
                    <Input placeholder="(11) 99999-9999" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-mail</FormLabel>
                  <FormControl>
                    <Input placeholder="contato@exemplo.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cidade</FormLabel>
                  <FormControl>
                    <Input placeholder="São Paulo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    value={field.value ? "true" : "false"}
                    onValueChange={(value) => field.onChange(value === "true")}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="true">Ativo</SelectItem>
                      <SelectItem value="false">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {submitError && (
              <p className="text-sm text-destructive" role="alert">
                {submitError}
              </p>
            )}

            <DialogFooter className="gap-2">
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="outline"
                  disabled={form.formState.isSubmitting}
                >
                  Cancelar
                </Button>
              </DialogClose>
              <Button type="submit" disabled={form.formState.isSubmitting} >
                {form.formState.isSubmitting && (
                  <Spinner className="mr-2" aria-hidden />
                )}
                Criar
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default NewCustomerModal;
