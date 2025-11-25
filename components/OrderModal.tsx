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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select"
import type { Order, OrderPayload } from "@/lib/dto/order"
import { useCustomers } from "@/lib/hooks/useCustomers"
import { useProducts } from "@/lib/hooks/useProducts"
import { cn } from "@/lib/utils"

type Translator = (key: string, options?: { defaultMessage?: string }) => string

const buildOrderSchema = (t: Translator) =>
  z.object({
    customerId: z.coerce
      .number({
        required_error: t("fields.customer.required"),
        invalid_type_error: t("fields.customer.required"),
      })
      .min(1, t("fields.customer.required")),
    items: z
      .array(
        z.object({
          id: z.string().optional(),
          productId: z.coerce
            .number({
              required_error: t("fields.product.required"),
              invalid_type_error: t("fields.product.required"),
            })
            .min(1, t("fields.product.required")),
          quantity: z.coerce
            .number({
              invalid_type_error: t("fields.quantity.required"),
              required_error: t("fields.quantity.required"),
            })
            .min(1, t("fields.quantity.min")),
        }),
      )
      .min(1, t("fields.items.required")),
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

  const { customers, loading: customersLoading } = useCustomers()
  const { products, loading: productsLoading } = useProducts()

  const [open, setOpen] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [itemError, setItemError] = useState<string | null>(null)
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null)
  const [selectedQuantity, setSelectedQuantity] = useState<number>(1)

  const initialValues = useMemo<OrderFormValues>(
    () => ({
      customerId: order?.customerId ?? 0,
      items:
        order?.orderItems?.map((item) => ({
          id: item.id,
          productId: item.productId ?? 0,
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

  const productMap = useMemo(
    () =>
      new Map(
        products.map((product) => [Number(product.id), product]),
      ),
    [products],
  )

  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    [],
  )

  const watchedItems = form.watch("items") ?? []

  const itemsError =
    (form.formState.errors.items as { message?: string } | undefined)?.message ??
    (form.formState.errors.items as { root?: { message?: string } } | undefined)
      ?.root?.message

  const orderTotal = useMemo(
    () =>
      watchedItems.reduce((total, item) => {
        const product = productMap.get(item.productId ?? "")
        const price = product?.price ?? 0
        return total + (item.quantity ?? 0) * price
      }, 0),
    [productMap, watchedItems],
  )

  useEffect(() => {
    form.reset(initialValues)
    setSelectedProductId("")
    setSelectedQuantity(1)
    setItemError(null)
  }, [form, initialValues])

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen)
    if (!nextOpen) {
      form.reset(initialValues)
      setSubmitError(null)
      setItemError(null)
      setSelectedProductId(null)
      setSelectedQuantity(1)
    }
  }

  const handleAddItem = () => {
    setItemError(null)

    if (!selectedProductId || selectedProductId < 1) {
      setItemError(t("fields.product.required"))
      return
    }

    if (!selectedQuantity || selectedQuantity < 1) {
      setItemError(t("fields.quantity.min"))
      return
    }

    const currentItems = form.getValues("items") ?? []
    const existingIndex = currentItems.findIndex(
      (item) => item.productId === selectedProductId,
    )

    if (existingIndex >= 0) {
      const currentQuantity =
        form.getValues(`items.${existingIndex}.quantity`) ?? 0
      form.setValue(
        `items.${existingIndex}.quantity`,
        currentQuantity + selectedQuantity,
      )
    } else {
      append({ productId: selectedProductId, quantity: selectedQuantity })
    }

    setSelectedProductId(null)
    setSelectedQuantity(1)
  }

  const handleSubmit = async (values: OrderFormValues) => {
    setSubmitError(null)

    const payload: OrderPayload = {
      customerId: Number(values.customerId) || null,
      orderDate: order?.orderDate ?? null,
      total: orderTotal,
      items: values.items.map((item) => ({
        id: item.id,
        productId: item.productId ? Number(item.productId) : null,
        quantity: item.quantity,
      })),
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
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <section className="space-y-3 rounded-lg border p-4">
              <p className="text-sm font-medium text-foreground">
                {t("sections.customer")}
              </p>
              <FormField
                control={form.control}
                name="customerId"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>{t("fields.customer.label")}</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value ? String(field.value) : ""}
                        onValueChange={(value) => field.onChange(Number(value))}
                        disabled={customersLoading}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder={t("fields.customer.placeholder")} />
                        </SelectTrigger>
                        <SelectContent align="start">
                          {customers.map((customer) => (
                            <SelectItem key={customer.id} value={String(customer.id)}>
                              {customer.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </section>

            <section className="space-y-3 rounded-lg border p-4">
              <p className="text-sm font-medium text-foreground">
                {t("sections.product")}
              </p>

              <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto] sm:items-end">
                <div className="space-y-2">
                  <FormLabel>{t("fields.product.label")}</FormLabel>
                  <Select
                    value={selectedProductId ? String(selectedProductId) : ""}
                    onValueChange={(value) => {
                      setSelectedProductId(Number(value))
                      setItemError(null)
                    }}
                    disabled={productsLoading}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={t("fields.product.placeholder")} />
                    </SelectTrigger>
                    <SelectContent align="start">
                      {products.map((product) => (
                        <SelectItem key={product.id} value={String(product.id)}>
                          <div className="flex flex-col text-left">
                            <span className="font-medium text-foreground">
                              {product.name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {currencyFormatter.format(product.price)}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <FormLabel>{t("fields.quantity.label")}</FormLabel>
                  <Input
                    type="number"
                    min={1}
                    value={Number.isNaN(selectedQuantity) ? "" : selectedQuantity}
                    onChange={(event) =>
                      setSelectedQuantity(event.target.valueAsNumber || 1)
                    }
                  />
                </div>

                <Button
                  type="button"
                  className="w-full sm:w-auto"
                  onClick={handleAddItem}
                  disabled={productsLoading || customersLoading}
                >
                  {productsLoading && <Spinner className="mr-2" aria-hidden />}
                  {t("actions.addItem")}
                </Button>
              </div>

              {itemError && (
                <p className="text-sm text-destructive" role="alert">
                  {itemError}
                </p>
              )}

              <div className="space-y-2">
                <FormLabel>{t("fields.items.label")}</FormLabel>
                {itemsError && (
                  <p className="text-sm text-destructive" role="alert">
                    {itemsError}
                  </p>
                )}

                {fields.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    {t("fields.items.empty")}
                  </p>
                ) : (
                  <div className="overflow-hidden rounded-md border">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="px-3 py-2 text-left font-medium text-foreground">
                            {t("fields.items.table.product")}
                          </th>
                          <th className="px-3 py-2 text-left font-medium text-foreground">
                            {t("fields.items.table.qty")}
                          </th>
                          <th className="px-3 py-2 text-right font-medium text-foreground">
                            {t("fields.items.table.price")}
                          </th>
                          <th className="px-3 py-2 text-right font-medium text-foreground">
                            {t("fields.items.table.total")}
                          </th>
                          <th className="px-3 py-2 text-right font-medium text-foreground" />
                        </tr>
                      </thead>
                      <tbody>
                      {fields.map((field, index) => {
                          const product = productMap.get(field.productId ?? 0)
                          const unitPrice = product?.price ?? 0
                          const quantityValue =
                            form.watch(`items.${index}.quantity`) ??
                            field.quantity ??
                            0

                          return (
                            <tr key={field.id} className="border-b last:border-0">
                              <td className="px-3 py-2 font-medium text-foreground">
                                {product?.name ??
                                  t("fields.items.table.unknownProduct", {
                                    defaultMessage: "Product",
                                  })}
                              </td>
                              <td className="px-3 py-2">
                                <FormField
                                  control={form.control}
                                  name={`items.${index}.quantity`}
                                  render={({ field }) => (
                                    <FormItem className="mb-0">
                                      <FormControl>
                                        <Input
                                          type="number"
                                          min={1}
                                          {...field}
                                          onChange={(event) =>
                                            field.onChange(
                                              event.target.valueAsNumber || 1,
                                            )
                                          }
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </td>
                              <td className="px-3 py-2 text-right text-muted-foreground">
                                {currencyFormatter.format(unitPrice)}
                              </td>
                              <td className="px-3 py-2 text-right font-medium">
                                {currencyFormatter.format(
                                  unitPrice * (quantityValue ?? 0),
                                )}
                              </td>
                              <td className="px-3 py-2 text-right">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => remove(index)}
                                >
                                  {t("fields.items.remove")}
                                </Button>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </section>

            {submitError && (
              <p className="text-sm text-destructive" role="alert">
                {submitError}
              </p>
            )}

            <DialogFooter className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex w-full items-center justify-between rounded-md bg-muted/60 px-4 py-3 text-sm font-semibold">
                <span>{t("summary.total")}</span>
                <span>{currencyFormatter.format(orderTotal)}</span>
              </div>
              <div className="flex w-full justify-end gap-2 sm:w-auto">
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
                  {t(isEditMode ? "actions.save" : "actions.saveOrder")}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default OrderModal
