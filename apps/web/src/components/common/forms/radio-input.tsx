"use client";

import * as React from "react";
import {
  useFormContext
  
  
} from "react-hook-form";
import type {FieldPath, FieldValues} from "react-hook-form";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./form";

export type RadioOption = {
  value: string;
  label: React.ReactNode;
  description?: React.ReactNode;
  disabled?: boolean;
};

export type RadioInputProps<TFieldValues extends FieldValues> = {
  name: FieldPath<TFieldValues>;
  options: readonly RadioOption[];
  label?: React.ReactNode;
  description?: React.ReactNode;
  required?: boolean;
  disabled?: boolean;
  className?: string;
};

/**
 * RadioInput.
 *
 * A single-choice radio group bound to a react-hook-form field path. Each
 * option carries its own label (and optional hint), and the group is announced
 * by the field's label.
 */
export function RadioInput<TFieldValues extends FieldValues>({
  name,
  options,
  label,
  description,
  required,
  disabled,
  className,
}: RadioInputProps<TFieldValues>) {
  const { control } = useFormContext<TFieldValues>();
  const groupId = React.useId();

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
            <RadioGroup
              value={(field.value) ?? ""}
              onValueChange={field.onChange}
              onBlur={field.onBlur}
              disabled={disabled}
              aria-label={typeof label === "string" ? label : undefined}
              className={className}
            >
              {options.map((option) => {
                const id = `${groupId}-${option.value}`;
                return (
                  <div
                    key={option.value}
                    className="flex items-start gap-3"
                  >
                    <RadioGroupItem
                      id={id}
                      value={option.value}
                      disabled={option.disabled}
                      ref={(element) => {
                        if (option === options[0]) field.ref(element);
                      }}
                    />
                    <div className="grid gap-1 leading-tight">
                      <FormLabel
                        htmlFor={id}
                        className="min-h-0 items-start font-normal"
                      >
                        {option.label}
                      </FormLabel>
                      {option.description ? (
                        <p className="text-sm text-muted-foreground">
                          {option.description}
                        </p>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </RadioGroup>
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
