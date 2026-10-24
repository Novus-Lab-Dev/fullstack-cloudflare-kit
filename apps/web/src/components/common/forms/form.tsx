"use client";

import * as React from "react";
import {
  Controller,
  FormProvider,
  useFormContext,
  useFormState
  
  
  
  
} from "react-hook-form";
import type {ControllerProps, FieldPath, FieldValues, UseFormReturn} from "react-hook-form";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

/**
 * Form.
 *
 * `FormProvider` + `Controller` from react-hook-form, so forms share a single
 * resolver and one `formState` subscription rather than a `useForm` per field
 * that re-renders every input on every keystroke.
 */
export function Form<TFieldValues extends FieldValues = FieldValues>({
  children,
  ...methods
}: { children?: React.ReactNode } & UseFormReturn<TFieldValues>) {
  return <FormProvider {...methods}>{children}</FormProvider>;
}

const FormFieldContext = React.createContext<string | null>(null);
const FormItemContext = React.createContext<{ id: string } | null>(null);

/**
 * FormField.
 *
 * Wires a control to react-hook-form by field path and generates the id every
 * other Form sub-component uses to point `htmlFor` / `aria-describedby` at the
 * right element, so a field's label, control, hint and error message stay
 * associated for screen readers without the caller passing ids around.
 */
export function FormField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(props: ControllerProps<TFieldValues, TName>) {
  const id = React.useId();

  return (
    <FormFieldContext.Provider value={props.name}>
      <FormItemContext.Provider value={{ id }}>
        <Controller {...props} />
      </FormItemContext.Provider>
    </FormFieldContext.Provider>
  );
}

/**
 * useFormField.
 *
 * Throws rather than returning null when used outside `FormField`: this is
 * always a wiring mistake, and failing at render names the form that is missing
 * the wrapper instead of silently producing an unlabelled input.
 */
export function useFormField() {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);
  const { getFieldState } = useFormContext();
  const formState = useFormState({ name: fieldContext ?? undefined });

  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>");
  }
  if (!itemContext) {
    throw new Error("useFormField should be used within <FormItem>");
  }

  const { id } = itemContext;
  const fieldState = getFieldState(fieldContext, formState);

  return {
    id,
    name: fieldContext,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  };
}

export function FormItem({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="form-item"
      className={cn("grid gap-2", className)}
      {...props}
    />
  );
}

export function FormLabel({
  className,
  ...props
}: React.ComponentProps<typeof Label>) {
  const { formItemId, error } = useFormField();

  return (
    <Label
      data-slot="form-label"
      data-error={!!error}
      className={cn("data-[error=true]:text-destructive", className)}
      htmlFor={formItemId}
      {...props}
    />
  );
}

/**
 * FormControl.
 *
 * Clones the single input it wraps and injects the id and ARIA wiring produced
 * by `useFormField`, so callers never hand-manage ids and every control is
 * announced with its label, hint and error.
 */
export function FormControl({
  children,
  ...props
}: { children: React.ReactElement } & React.HTMLAttributes<HTMLElement>) {
  const { formItemId, formDescriptionId, formMessageId, error } =
    useFormField();

  return React.cloneElement(
    children as React.ReactElement<Record<string, unknown>>,
    {
      id: formItemId,
      "aria-describedby": error
        ? `${formDescriptionId} ${formMessageId}`
        : formDescriptionId,
      "aria-invalid": !!error,
      ...props,
    },
  );
}

export function FormDescription({
  className,
  ...props
}: React.ComponentProps<"p">) {
  const { formDescriptionId } = useFormField();

  return (
    <p
      data-slot="form-description"
      id={formDescriptionId}
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

/**
 * FormMessage.
 *
 * Renders nothing until there is something to say, and falls back to a
 * `children` string so a server-side validation error can be shown through the
 * same live region as client-side rule failures.
 */
export function FormMessage({
  className,
  children,
  ...props
}: React.ComponentProps<"p">) {
  const { formMessageId, error } = useFormField();
  const body = error ? String(error.message ?? "") : children;

  if (!body) {
    return null;
  }

  return (
    <p
      data-slot="form-message"
      role="alert"
      id={formMessageId}
      className={cn("text-sm font-medium text-destructive", className)}
      {...props}
    >
      {body}
    </p>
  );
}
