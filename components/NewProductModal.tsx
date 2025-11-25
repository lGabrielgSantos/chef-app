"use client";

import { useEffect, useMemo, useState, type ComponentProps } from "react";
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
import { Spinner } from "@/components/ui/spinner";
import type { Product, ProductPayload } from "@/lib/dto/product";
import { cn } from "@/lib/utils";

type Translator = (key: string, options?: { defaultMessage?: string }) => string;

const buildProductSchema = (t: Translator) =>
  z.object({
    name: z.string().trim().min(1, t("fields.name.required")),
    price: z.coerce
      .number({
        required_error: t("fields.price.required"),
        invalid_type_error: t("fields.price.required"),
      })
      .min(0, t("fields.price.min")),
    description: z
      .string()
      .trim()
      .max(500, t("fields.description.max"))
      .optional()
      .or(z.literal("")),
  });

type NewProductFormValues = z.infer<ReturnType<typeof buildProductSchema>>;

interface NewProductModalProps {
  onSubmit: (payload: ProductPayload, id?: string) => Promise<unknown>;
  triggerLabel?: string;
  product?: Product;
  triggerButtonProps?: ComponentProps<typeof Button>;
}

export function NewProductModal({
  onSubmit,
  triggerLabel,
  product,
  triggerButtonProps,
}: NewProductModalProps) {
  const t = useTranslations("productsForm");
  const productSchema = useMemo(() => buildProductSchema(t), [t]);
  const isEditMode = Boolean(product);

  const [open, setOpen] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const initialValues = useMemo<NewProductFormValues>(
    () => ({
      name: product?.name ?? "",
      price: product?.price ?? 0,
      description: product?.description ?? "",
    }),
    [product]
  );

  const form = useForm<NewProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: initialValues,
  });

  useEffect(() => {
    form.reset(initialValues);
  }, [form, initialValues]);

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      form.reset(initialValues);
      setSubmitError(null);
    }
  };

  const handleSubmit = async (values: NewProductFormValues) => {
    setSubmitError(null);
    const payload: ProductPayload = {
      name: values.name,
      price: values.price,
      description: values.description?.trim() || "",
    };

    try {
      await onSubmit(payload, product?.id);
      form.reset(initialValues);
      setOpen(false);
    } catch (_error) {
      setSubmitError(
        isEditMode ? t("feedback.updateError") : t("feedback.submitError")
      );
    }
  };

  const modalTriggerLabel =
    triggerLabel ?? t(isEditMode ? "actions.edit" : "trigger");

  const triggerClassName = cn(
    "w-full sm:w-auto",
    triggerButtonProps?.className
  );
  const dialogTitle = isEditMode ? t("editTitle") : t("title");
  const dialogDescription = isEditMode
    ? t("editDescription")
    : t("description");

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className={triggerClassName} {...triggerButtonProps}>
          {modalTriggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>{dialogDescription}</DialogDescription>
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
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("fields.price.label")}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min={0}
                      placeholder={t("fields.price.placeholder")}
                      {...field}
                      onChange={(event) =>
                        field.onChange(event.target.valueAsNumber)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("fields.description.label")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("fields.description.placeholder")}
                      {...field}
                    />
                  </FormControl>
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
                {t(isEditMode ? "actions.save" : "actions.create")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default NewProductModal;
