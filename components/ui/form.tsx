"use client"

import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { Slot } from "@radix-ui/react-slot"
import {
  Controller,
  ControllerProps,
  FieldValues,
  FormProvider,
  useFormContext,
  Path,
} from "react-hook-form"

import { cn } from "@/lib/utils"

// Form: thin wrapper around React Hook Form's FormProvider.
// You pass {...form} from useForm into this component.
const Form = FormProvider

type FormFieldContextValue = {
  name: string
}

const FormFieldContext = React.createContext<FormFieldContextValue>(
  {} as FormFieldContextValue
)

// FormField: connects a specific field name to RHF via Controller and
// exposes that name through context so other helpers can access its state.
function FormField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends Path<TFieldValues> = Path<TFieldValues>,
>({
  name,
  ...props
}: ControllerProps<TFieldValues, TName> & { name: TName }) {
  return (
    <FormFieldContext.Provider value={{ name }}>
      <Controller name={name} {...(props as Omit<ControllerProps<TFieldValues, TName>, "name">)} />
    </FormFieldContext.Provider>
  )
}

// Hook to access field state (error, touched, etc.) for the current FormField.
const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext)
  const { getFieldState, formState } = useFormContext()

  const fieldState = getFieldState(fieldContext.name, formState)

  return {
    name: fieldContext.name,
    ...fieldState,
  }
}

// FormItem: wrapper around a field block. Adds spacing and data-invalid
// attribute when the field has an error.
const FormItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { error } = useFormField()

  return (
    <div
      ref={ref}
      className={cn("space-y-1", className)}
      data-invalid={!!error || undefined}
      {...props}
    />
  )
})
FormItem.displayName = "FormItem"

// FormLabel: label text for a field, turns red when there is an error.
const FormLabel = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, ...props }, ref) => {
  const { error } = useFormField()

  return (
    <LabelPrimitive.Root
      ref={ref}
      className={cn(
        "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        error && "text-destructive",
        className
      )}
      {...props}
    />
  )
})
FormLabel.displayName = "FormLabel"

// FormControl: wrapper for the actual input/textarea component.
const FormControl = React.forwardRef<
  React.ElementRef<typeof Slot>,
  React.ComponentPropsWithoutRef<typeof Slot>
>(({ ...props }, ref) => {
  return (
    <Slot
      ref={ref}
      {...props}
    />
  )
})
FormControl.displayName = "FormControl"

// FormMessage: displays validation error message under the field,
// using RHF's fieldState.error.message.
const FormMessage = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => {
  const { error } = useFormField()
  const body = error ? String(error.message) : children

  if (!body) return null

  return (
    <p
      ref={ref}
      className={cn("text-xs font-medium text-destructive", className)}
      {...props}
    >
      {body}
    </p>
  )
})
FormMessage.displayName = "FormMessage"

export {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
}