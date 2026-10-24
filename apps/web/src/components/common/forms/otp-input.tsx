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

export type OtpInputProps<TFieldValues extends FieldValues> = {
  name: FieldPath<TFieldValues>;
  label?: React.ReactNode;
  description?: React.ReactNode;
  required?: boolean;
  length?: number;
  disabled?: boolean;
  className?: string;
};

/**
 * OtpInput.
 *
 * A split one-time-code entry: one box per digit, auto-advance on input,
 * backspace steps back, paste fills the whole code, and mobile gets the numeric
 * keypad.
 */
export function OtpInput<TFieldValues extends FieldValues>({
  name,
  label,
  description,
  required,
  length = 6,
  disabled,
  className,
}: OtpInputProps<TFieldValues>) {
  const { control } = useFormContext<TFieldValues>();
  const inputRefs = React.useRef<Array<HTMLInputElement | null>>([]);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const value = typeof field.value === "string" ? field.value : "";

        function updateAt(index: number, digit: string) {
          const next = value.padEnd(length, " ").split("");
          next[index] = digit;
          field.onChange(next.join("").replace(/\s+$/, ""));
        }

        return (
          <FormItem>
            {label ? (
              <FormLabel>
                {label}
                {required ? <span aria-hidden="true"> *</span> : null}
              </FormLabel>
            ) : null}
            <FormControl>
              <div
                className={className ?? "flex flex-wrap gap-2"}
                role="group"
                aria-label={
                  typeof label === "string" ? label : "Verification code"
                }
              >
                {Array.from({ length }, (_, index) => (
                  <Input
                    key={index}
                    ref={(element) => {
                      inputRefs.current[index] = element;
                      if (index === 0) field.ref(element);
                    }}
                    value={value[index] ?? ""}
                    type="text"
                    inputMode="numeric"
                    autoComplete={index === 0 ? "one-time-code" : "off"}
                    maxLength={1}
                    disabled={disabled}
                    onBlur={field.onBlur}
                    aria-label={`Digit ${index + 1} of ${length}`}
                    className="size-11 rounded-lg p-0 text-center text-xl font-bold"
                    onChange={(event) => {
                      const digit = event.target.value
                        .replace(/\D/g, "")
                        .slice(-1);
                      updateAt(index, digit);
                      if (digit && index < length - 1)
                        inputRefs.current[index + 1]?.focus();
                    }}
                    onKeyDown={(event) => {
                      if (
                        event.key === "Backspace" &&
                        !value[index] &&
                        index > 0
                      ) {
                        inputRefs.current[index - 1]?.focus();
                      }
                    }}
                    onPaste={(event) => {
                      event.preventDefault();
                      const pasted = event.clipboardData
                        .getData("text")
                        .replace(/\D/g, "")
                        .slice(0, length);
                      if (!pasted) return;
                      field.onChange(pasted);
                      inputRefs.current[
                        Math.min(pasted.length, length) - 1
                      ]?.focus();
                    }}
                  />
                ))}
              </div>
            </FormControl>
            {description ? (
              <FormDescription>{description}</FormDescription>
            ) : null}
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
