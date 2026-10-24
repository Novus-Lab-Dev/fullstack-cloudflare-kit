"use client";

import type * as React from "react";
import {
  useFormContext
  
  
} from "react-hook-form";
import type {FieldPath, FieldValues} from "react-hook-form";

import { Textarea } from "@/components/ui/textarea";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./form";

export type TextareaInputProps<TFieldValues extends FieldValues> = {
  name: FieldPath<TFieldValues>;
  label?: React.ReactNode;
  description?: React.ReactNode;
  required?: boolean;
} & Omit<
  React.ComponentProps<typeof Textarea>,
  "name" | "value" | "defaultValue" | "onChange"
>;

/**
 * TextareaInput.
 *
 * A multi-line text field bound to a react-hook-form field path, styled like
 * TextInput so long and short answers read as the same family.
 */
export function TextareaInput<TFieldValues extends FieldValues>({
  name,
  label,
  description,
  required,
  ...textareaProps
}: TextareaInputProps<TFieldValues>) {
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
            <Textarea
              {...textareaProps}
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
