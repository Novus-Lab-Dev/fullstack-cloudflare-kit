"use client";

import * as React from "react";
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

export type SlugInputProps<TFieldValues extends FieldValues> = {
  name: FieldPath<TFieldValues>;
  /** Field whose value seeds the slug (e.g. a title). */
  inheritFrom: FieldPath<TFieldValues>;
  label?: React.ReactNode;
  description?: React.ReactNode;
  required?: boolean;
} & Omit<
  React.ComponentProps<typeof Input>,
  "name" | "value" | "defaultValue" | "onChange"
>;

function slugify(value: string) {
  return value
    .toUpperCase()
    .trim()
    .replace(/[^A-Z0-9\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * SlugInput.
 *
 * A text field that derives its value from another field until the user edits
 * it. While the slug is empty or still matches the last auto-generated value,
 * edits to `inheritFrom` flow through; once the user types their own, it stops
 * being overwritten.
 */
export function SlugInput<TFieldValues extends FieldValues>({
  name,
  inheritFrom,
  label,
  description,
  required,
  ...inputProps
}: SlugInputProps<TFieldValues>) {
  const { control, watch, setValue, getValues } =
    useFormContext<TFieldValues>();
  const sourceValue = watch(inheritFrom);
  const lastGenerated = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (!sourceValue) return;

    const slug = slugify(String(sourceValue));
    const current = getValues(name);

    if (!current || current === lastGenerated.current) {
      lastGenerated.current = slug;
      setValue(name, slug as never, {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  }, [sourceValue, name, setValue, getValues]);

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
