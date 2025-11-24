"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import type { CustomerPayload } from "@/lib/dto/customer";

type Translator = (key: string, options?: { defaultMessage?: string }) => string;

const buildCustomerSchema = (t: Translator) =>
  z.object({
    name: z.string().trim().min(1, t("fields.name.required")),
    phone: z.string().trim().min(1, t("fields.phone.required")),
    email: z.string().trim().email(t("fields.email.invalid")),
    city: z.string().trim().min(1, t("fields.city.required")),
    status: z.boolean(),
  });

type NewCustomerFormValues = z.infer<ReturnType<typeof buildCustomerSchema>>;

interface NewCustomerModalProps {
  onCreate: (payload: CustomerPayload) => Promise<unknown>;
  triggerLabel?: string;
}

export function NewCustomerModal({
  onCreate,
  triggerLabel,
}: NewCustomerModalProps) {
  const t = useTranslations("customersForm");
  const customerSchema = useMemo(() => buildCustomerSchema(t), [t]);

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
      setSubmitError(t("feedback.submitError"));
    }
  };

  const modalTriggerLabel = triggerLabel ?? t("trigger");

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="w-full sm:w-auto">{modalTriggerLabel}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
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
                  <FormLabel>{t("fields.name.label")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("fields.name.placeholder")}
                      {...field}
                    />
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
                  <FormLabel>{t("fields.phone.label")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("fields.phone.placeholder")}
                      {...field}
                    />
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
                  <FormLabel>{t("fields.email.label")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("fields.email.placeholder")}
                      type="email"
                      {...field}
                    />
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
                  <FormLabel>{t("fields.city.label")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("fields.city.placeholder")}
                      {...field}
                    />
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
                  <FormLabel>{t("fields.status.label")}</FormLabel>
                  <Select
                    value={field.value ? "true" : "false"}
                    onValueChange={(value) => field.onChange(value === "true")}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue
                          placeholder={t("fields.status.placeholder")}
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="true">
                        {t("fields.status.active")}
                      </SelectItem>
                      <SelectItem value="false">
                        {t("fields.status.inactive")}
                      </SelectItem>
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
                  {t("actions.cancel")}
                </Button>
              </DialogClose>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && (
                  <Spinner className="mr-2" aria-hidden />
                )}
                {t("actions.create")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default NewCustomerModal;
