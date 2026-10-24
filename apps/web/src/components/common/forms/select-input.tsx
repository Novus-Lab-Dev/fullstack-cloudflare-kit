"use client";

import type * as React from "react";
import {
  useFormContext
  
  
} from "react-hook-form";
import type {FieldPath, FieldValues} from "react-hook-form";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./form";

export type SelectOption = {
  value: string;
  label: React.ReactNode;
  disabled?: boolean;
};

export type SelectInputProps<TFieldValues extends FieldValues> = {
  name: FieldPath<TFieldValues>;
  options: readonly SelectOption[];
  label?: React.ReactNode;
  description?: React.ReactNode;
  required?: boolean;
  /** Shown as a placeholder on the trigger while nothing is chosen yet. */
  placeholder?: string;
  disabled?: boolean;
  className?: string;
};

/**
 * SelectInput.
 *
 * A single-choice dropdown bound to a react-hook-form field path. Placeholder
 * is rendered on the trigger so the field reads as unfilled until a choice is
 * made.
 */
export function SelectInput<TFieldValues extends FieldValues>({
  name,
  options,
  label,
  description,
  required,
  placeholder = "Select an option",
  disabled,
  className,
}: SelectInputProps<TFieldValues>) {
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
          <Select
            name={field.name}
            value={(field.value) ?? ""}
            onValueChange={field.onChange}
            disabled={disabled}
          >
            <FormControl>
              <SelectTrigger className={className} ref={field.ref}>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {options.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {description ? (
            <FormDescription>{description}</FormDescription>
          ) : null}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
