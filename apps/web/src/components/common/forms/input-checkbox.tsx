"use client";

import type * as React from "react";
import {
  useFormContext
  
  
} from "react-hook-form";
import type {FieldPath, FieldValues} from "react-hook-form";

import { Checkbox } from "@/components/ui/checkbox";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./form";

export type InputCheckboxProps<TFieldValues extends FieldValues> = {
  name: FieldPath<TFieldValues>;
  label?: React.ReactNode;
  description?: React.ReactNode;
  required?: boolean;
  disabled?: boolean;
};

/**
 * InputCheckbox.
 *
 * A boolean field bound to a react-hook-form field path. The label sits beside
 * the box and toggles it, and the description/error render full-width below.
 */
export function InputCheckbox<TFieldValues extends FieldValues>({
  name,
  label,
  description,
  required,
  disabled,
}: InputCheckboxProps<TFieldValues>) {
  const { control } = useFormContext<TFieldValues>();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <div className="flex min-h-11 items-center gap-3">
            <FormControl>
              <Checkbox
                checked={field.value === true}
                onCheckedChange={(checked) => field.onChange(checked === true)}
                onBlur={field.onBlur}
                disabled={disabled}
                ref={field.ref}
              />
            </FormControl>
            {label ? (
              <FormLabel className="min-h-11 flex-1 items-center leading-5 font-normal">
                {label}
                {required ? <span aria-hidden="true"> *</span> : null}
              </FormLabel>
            ) : null}
          </div>
          {description ? (
            <FormDescription>{description}</FormDescription>
          ) : null}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
