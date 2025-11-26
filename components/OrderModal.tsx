"use client"

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
} from "react"
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
import { Textarea } from "./ui/textarea"
import type { Order, OrderPayload } from "@/lib/dto/order"
import { useCustomers } from "@/lib/hooks/useCustomers"
import { useProducts } from "@/lib/hooks/useProducts"
import { cn } from "@/lib/utils"

type Translator = (key: string, options?: { defaultMessage?: string }) => string

const buildOrderSchema = (t: Translator) =>
  z.object({
    customerId: z
      .number({

        error: t("fields.customer.required")
      })
      .min(1, t("fields.customer.required")),
    notes: z.string().optional(),
    items: z
      .array(
        z.object({
          id: z.string().optional(),
          productId: z
            .number({
              error: t("fields.product.required"),
            })
            .min(1, t("fields.product.required")),
          quantity: z
            .number({
              error: t("fields.quantity.required")
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

  const {
    customers,
    loading: customersLoading,
    loadCustomers,
  } = useCustomers({ autoFetch: false })
  const {
    products,
    loading: productsLoading,
    loadProducts,
  } = useProducts({ autoFetch: false })
  const productSelectRef = useRef<HTMLButtonElement | null>(null)

  const [open, setOpen] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [itemError, setItemError] = useState<string | null>(null)
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null)
  const [selectedQuantity, setSelectedQuantity] = useState<number>(1)

  const initialValues = useMemo<OrderFormValues>(
    () => ({
      customerId: order?.customerId ?? 0,
      notes: order?.notes ?? "",
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
        const product = productMap.get(item.productId ?? 0)
        const price = product?.price ?? 0
        return total + (item.quantity ?? 0) * price
      }, 0),
    [productMap, watchedItems],
  )

  useEffect(() => {
    form.reset(initialValues)
    setSelectedProductId(null)
    setSelectedQuantity(1)
    setItemError(null)
  }, [form, initialValues])

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen)
    if (nextOpen) {
      void loadCustomers()
      void loadProducts()
    }
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
  const orderIdLabel = order?.id ? `#${order.id}` : null
  const orderStatus =
    (order as { status?: string | null } | undefined)?.status ?? null

  const handleTriggerProductSelect = () => {
    if (productSelectRef.current) {
      productSelectRef.current.click()
      productSelectRef.current.focus()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className={triggerClassName} {...triggerButtonProps}>
          {modalTriggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] max-w-[95vw] sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>{dialogDescription}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-[0.22fr_1fr]">
              <section className="space-y-4 rounded-lg border bg-muted/50 p-4">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-foreground">
                    {t("sections.customer")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t("fields.customer.placeholder")}
                  </p>
                </div>

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

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel>
                        {t("fields.notes.label", {
                          defaultMessage: "Order notes",
                        })}
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={t("fields.notes.placeholder", {
                            defaultMessage: "Add any notes for this order",
                          })}
                          className="min-h-[120px] resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-2 text-sm">
                  {orderIdLabel && (
                    <div className="flex items-center justify-between rounded-md bg-background px-3 py-2">
                      <span className="text-muted-foreground">
                        {t("fields.items.table.id", { defaultMessage: "Order" })}
                      </span>
                      <span className="font-semibold text-foreground">
                        {orderIdLabel}
                      </span>
                    </div>
                  )}
                  {orderStatus && (
                    <div className="flex items-center justify-between rounded-md bg-background px-3 py-2">
                      <span className="text-muted-foreground">
                        {t("status.label", { defaultMessage: "Status" })}
                      </span>
                      <span className="font-semibold text-foreground">
                        {orderStatus}
                      </span>
                    </div>
                  )}
                </div>
              </section>

              <section className="space-y-4 rounded-lg border p-4">
                <div className="flex flex-col gap-3">
                  <Button
                    type="button"
                    variant="secondary"
                    className="h-11 w-full justify-center text-base font-semibold"
                    onClick={handleTriggerProductSelect}
                    disabled={productsLoading || customersLoading}
                  >
                    + {t("actions.addItem")}
                  </Button>

                  <div className="grid gap-3 sm:grid-cols-[2fr_auto_auto_auto] sm:items-end">
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
                        <SelectTrigger
                          ref={productSelectRef}
                          className="w-full"
                        >
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

                <div className="rounded-lg border bg-muted/50 p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {t("summary.subtotal", { defaultMessage: "Subtotal" })}
                    </span>
                    <span className="font-semibold text-foreground">
                      {currencyFormatter.format(orderTotal)}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {t("summary.total")}
                    </span>
                    <span className="text-lg font-bold text-foreground">
                      {currencyFormatter.format(orderTotal)}
                    </span>
                  </div>
                </div>
              </section>
            </div>

            {submitError && (
              <p className="text-sm text-destructive" role="alert">
                {submitError}
              </p>
            )}

            <DialogFooter className="flex flex-col gap-3 sm:flex-row sm:justify-end">
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
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default OrderModal
