"use client";

import { Eye, EyeOff } from "lucide-react";
import * as React from "react";
import {
  useFormContext
  
  
} from "react-hook-form";
import type {FieldPath, FieldValues} from "react-hook-form";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./form";

export type SecureInputProps<TFieldValues extends FieldValues> = {
  name: FieldPath<TFieldValues>;
  label?: React.ReactNode;
  description?: React.ReactNode;
  required?: boolean;
} & Omit<
  React.ComponentProps<typeof Input>,
  "name" | "type" | "value" | "defaultValue" | "onChange"
>;

/**
 * SecureInput.
 *
 * A password field with a show/hide toggle. The toggle is a real button with an
 * accessible name and stays out of the tab order only when the field is
 * disabled; the input never uses `type="text"` unless the user asks to reveal.
 */
export function SecureInput<TFieldValues extends FieldValues>({
  name,
  label,
  description,
  required,
  ...inputProps
}: SecureInputProps<TFieldValues>) {
  const { control } = useFormContext<TFieldValues>();
  const [visible, setVisible] = React.useState(false);

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
          <div className="relative">
            <FormControl>
              <Input
                {...inputProps}
                {...field}
                value={field.value ?? ""}
                required={required}
                type={visible ? "text" : "password"}
                className={cn("pr-11", inputProps.className)}
              />
            </FormControl>
            <button
              type="button"
              disabled={inputProps.disabled}
              onClick={() => setVisible((current) => !current)}
              aria-label={visible ? "Hide password" : "Show password"}
              className="absolute top-1/2 right-0 flex size-11 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50"
            >
              {visible ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
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
