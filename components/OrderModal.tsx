"use client"

import { useEffect, useMemo, useState, type ComponentProps } from "react"
import { useTranslations } from "next-intl"
import { useFieldArray, useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "./ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form"
import { Input } from "./ui/input"
import { Spinner } from "./ui/spinner"
import type { Order, OrderPayload } from "@/lib/dto/order"
import { cn } from "@/lib/utils"

type Translator = (key: string, options?: { defaultMessage?: string }) => string

const buildOrderSchema = (t: Translator) =>
  z.object({
    customerId: z.string().trim().min(1, t("fields.customerId.required")),
    orderDate: z.string().trim().optional(),
    total: z.coerce
      .number({
        required_error: t("fields.total.required"),
        invalid_type_error: t("fields.total.required"),
      })
      .min(0, t("fields.total.min")),
    items: z
      .array(
        z.object({
          id: z.string().optional(),
          productId: z.string().trim().optional().or(z.literal("")),
          quantity: z.coerce
            .number({
              invalid_type_error: t("fields.items.quantity.required"),
            })
            .min(1, t("fields.items.quantity.min")),
        }),
      )
      .optional(),
  })

type OrderFormValues = z.infer<ReturnType<typeof buildOrderSchema>>

interface OrderModalProps {
  onSubmit: (payload: OrderPayload, id?: string) => Promise<unknown>
  triggerLabel?: string
  order?: Order
  triggerButtonProps?: ComponentProps<typeof Button>
}

export function OrderModal({
  onSubmit,
  triggerLabel,
  order,
  triggerButtonProps,
}: OrderModalProps) {
  const t = useTranslations("ordersForm")
  const orderSchema = useMemo(() => buildOrderSchema(t), [t])
  const isEditMode = Boolean(order)

  const [open, setOpen] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const initialValues = useMemo<OrderFormValues>(
    () => ({
      customerId: order?.customerId ?? "",
      orderDate: order?.orderDate?.split("T")?.[0] ?? "",
      total: order?.total ?? 0,
      items:
        order?.orderItems?.map((item) => ({
          id: item.id,
          productId: item.productId ?? "",
          quantity: item.quantity ?? 1,
        })) ?? [],
    }),
    [order],
  )

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: initialValues,
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  })

  useEffect(() => {
    form.reset(initialValues)
  }, [form, initialValues])

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen)
    if (!nextOpen) {
      form.reset(initialValues)
      setSubmitError(null)
    }
  }

  const handleSubmit = async (values: OrderFormValues) => {
    setSubmitError(null)

    const normalizedItems =
      values.items
        ?.map((item) => ({
          id: item.id,
          productId: item.productId?.trim() || null,
          quantity: item.quantity ?? 0,
        }))
        .filter((item) => item.productId || item.quantity > 0) ?? []

    const payload: OrderPayload = {
      customerId: values.customerId.trim(),
      orderDate: values.orderDate ? new Date(values.orderDate).toISOString() : null,
      total: values.total ?? 0,
      items: normalizedItems,
    }

    try {
      await onSubmit(payload, order?.id)
      form.reset(initialValues)
      setOpen(false)
    } catch (_error) {
      setSubmitError(
        isEditMode ? t("feedback.updateError") : t("feedback.submitError"),
      )
    }
  }

  const modalTriggerLabel =
    triggerLabel ?? t(isEditMode ? "actions.edit" : "trigger")

  const triggerClassName = cn(
    "w-full sm:w-auto",
    triggerButtonProps?.className,
  )
  const dialogTitle = isEditMode ? t("editTitle") : t("title")
  const dialogDescription = isEditMode
    ? t("editDescription")
    : t("description")

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
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="customerId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("fields.customerId.label")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("fields.customerId.placeholder")}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="orderDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("fields.orderDate.label")}</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      placeholder={t("fields.orderDate.placeholder")}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="total"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("fields.total.label")}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min={0}
                      placeholder={t("fields.total.placeholder")}
                      {...field}
                      onChange={(event) => field.onChange(event.target.valueAsNumber)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-3 rounded-lg border p-3">
              <div className="flex items-center justify-between">
                <FormLabel className="text-sm font-medium">
                  {t("fields.items.label")}
                </FormLabel>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => append({ productId: "", quantity: 1 })}
                >
                  {t("fields.items.add")}
                </Button>
              </div>

              {fields.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  {t("fields.items.empty")}
                </p>
              )}

              <div className="space-y-3">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="grid grid-cols-1 gap-2 rounded-md border p-3 sm:grid-cols-[1fr_auto_auto]"
                  >
                    <FormField
                      control={form.control}
                      name={`items.${index}.productId`}
                      render={({ field }) => (
                        <FormItem className="space-y-1">
                          <FormLabel className="text-xs text-muted-foreground">
                            {t("fields.items.product")}
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder={t("fields.items.productPlaceholder")}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`items.${index}.quantity`}
                      render={({ field }) => (
                        <FormItem className="space-y-1">
                          <FormLabel className="text-xs text-muted-foreground">
                            {t("fields.items.quantity.label")}
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={1}
                              {...field}
                              onChange={(event) => field.onChange(event.target.valueAsNumber)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex items-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => remove(index)}
                        className="w-full sm:w-auto"
                      >
                        {t("fields.items.remove")}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

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
                {form.formState.isSubmitting && <Spinner className="mr-2" aria-hidden />}
                {t(isEditMode ? "actions.save" : "actions.create")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default OrderModal
