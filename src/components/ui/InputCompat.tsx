import React from "react";
import { TextField, Label, FieldError } from "@heroui/react";
import clsx from "clsx";

interface InputCompatProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  errorMessage?: string;
  isInvalid?: boolean;
  startContent?: React.ReactNode;
  endContent?: React.ReactNode;
  classNames?: any;
  variant?: "bordered" | "flat" | "underlined" | "faded";
  size?: "sm" | "md" | "lg";
  onValueChange?: (value: string) => void;
  isClearable?: boolean;
  onClear?: () => void;
}

export const InputCompat = React.forwardRef<HTMLInputElement, InputCompatProps>(
  ({ label, errorMessage, isInvalid, startContent, endContent, classNames, className, onValueChange, isClearable, onClear, variant, size, ...props }, ref) => {
    let v3Variant: any = variant;
    if (variant === "bordered") v3Variant = "primary";
    if (variant === "flat") v3Variant = "secondary";
    if (variant === "faded") v3Variant = "secondary";
    if (variant === "underlined") v3Variant = "primary";

    return (
      <TextField isInvalid={isInvalid} variant={v3Variant} className="flex flex-col gap-1 w-full">
        {label && (
          <Label className={clsx("text-sm font-medium text-text-primary", classNames?.label)}>
            {label}
          </Label>
        )}
        <div className={clsx(
          "relative flex items-center w-full min-h-10 rounded-lg border transition-all",
          isInvalid ? "border-red-500" : "border-gray-200 hover:border-brand-blue focus-within:border-brand-blue",
          classNames?.inputWrapper
        )}>
          {startContent && (
            <div className="pl-3 flex items-center pointer-events-none">
              {startContent}
            </div>
          )}
          <input
            ref={ref}
            className={clsx(
              "flex-1 bg-transparent px-3 py-2 outline-none text-sm",
              classNames?.input,
              className
            )}
            onChange={(e) => {
              props.onChange?.(e);
              onValueChange?.(e.target.value);
            }}
            {...props}
          />
          {isClearable && props.value && (
            <button
              type="button"
              onClick={onClear}
              className="px-2 text-text-secondary hover:text-text-primary transition-colors"
            >
              ×
            </button>
          )}
          {endContent && (
            <div className="pr-3 flex items-center">
              {endContent}
            </div>
          )}
        </div>
        {errorMessage && (
          <FieldError className="text-xs text-red-500">
            {errorMessage}
          </FieldError>
        )}
      </TextField>
    );
  }
);

InputCompat.displayName = "InputCompat";
