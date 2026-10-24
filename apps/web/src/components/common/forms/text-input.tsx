"use client";

import type * as React from "react";
import {
  useFormContext
  
  
} from "react-hook-form";
import type {FieldPath, FieldValues} from "react-hook-form";

import { Input } from "@/components/ui/input";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./form";

export type TextInputProps<TFieldValues extends FieldValues> = {
  name: FieldPath<TFieldValues>;
  label?: React.ReactNode;
  description?: React.ReactNode;
  required?: boolean;
} & Omit<
  React.ComponentProps<typeof Input>,
  "name" | "value" | "defaultValue" | "onChange"
>;

/**
 * TextInput.
 *
 * A text field bound to a react-hook-form field path. Label, control, hint and
 * error message are wired together automatically; use it for any single-line
 * `<input>` (text, email, number, url, …).
 */
export function TextInput<TFieldValues extends FieldValues>({
  name,
  label,
  description,
  required,
  ...inputProps
}: TextInputProps<TFieldValues>) {
  const { control } = useFormContext<TFieldValues>();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          {label ? (
            <FormLabel>
              {label}
              {required ? <span aria-hidden="true"> *</span> : null}
            </FormLabel>
          ) : null}
          <FormControl>
            <Input
              {...inputProps}
              {...field}
              value={field.value ?? ""}
              required={required}
            />
          </FormControl>
          {description ? (
            <FormDescription>{description}</FormDescription>
          ) : null}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
