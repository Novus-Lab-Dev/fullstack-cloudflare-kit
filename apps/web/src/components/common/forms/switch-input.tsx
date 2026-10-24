"use client";

import type * as React from "react";
import {
  useFormContext
  
  
} from "react-hook-form";
import type {FieldPath, FieldValues} from "react-hook-form";

import { Switch } from "@/components/ui/switch";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./form";

export type SwitchInputProps<TFieldValues extends FieldValues> = {
  name: FieldPath<TFieldValues>;
  label?: React.ReactNode;
  description?: React.ReactNode;
  required?: boolean;
  disabled?: boolean;
};

/**
 * SwitchInput.
 *
 * An on/off control bound to a boolean field path — the switch-sized sibling
 * of InputCheckbox. Use it for a single setting that flips without submitting;
 * use InputCheckbox when the checked state is part of a batch or a explicit
 * affirmative.
 */
export function SwitchInput<TFieldValues extends FieldValues>({
  name,
  label,
  description,
  required,
  disabled,
}: SwitchInputProps<TFieldValues>) {
  const { control } = useFormContext<TFieldValues>();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <div className="flex min-h-11 items-center gap-3">
            <FormControl>
              <Switch
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
