import React from "react";
import { 
  SelectRoot, 
  SelectTrigger, 
  SelectValue, 
  SelectIndicator, 
  SelectPopover, 
  ListBox, 
  ListBoxItem,
  Label,
  FieldError,
  TextField
} from "@heroui/react";
import clsx from "clsx";

interface SelectCompatProps extends Omit<React.ComponentProps<typeof SelectRoot>, "variant" | "onSelectionChange"> {
  variant?: "bordered" | "flat" | "faded" | "underlined" | "primary" | "secondary";
  onSelectionChange?: (key: any) => void;
  onChange?: (e: any) => void;
  label?: string;
  placeholder?: string;
  errorMessage?: string;
  isInvalid?: boolean;
  classNames?: any;
  startContent?: React.ReactNode;
}

export const SelectCompat = ({ 
  label, 
  placeholder, 
  children, 
  errorMessage, 
  isInvalid, 
  className,
  classNames,
  variant,
  onChange,
  onSelectionChange,
  ...props 
}: SelectCompatProps) => {
  let v3Variant: any = variant;
  if (variant === "bordered") v3Variant = "primary";
  if (variant === "flat") v3Variant = "secondary";
  if (variant === "faded") v3Variant = "secondary";
  if (variant === "underlined") v3Variant = "primary";

  let mappedChildren: any = children;
  if (typeof children !== "function") {
    mappedChildren = React.Children.map(children, (child) => {
      if (React.isValidElement(child)) {
        const childKey = child.key;
        if (childKey != null && !(child.props as any).id) {
          let id = childKey.toString();
          if (id.startsWith(".$")) {
            id = id.substring(2);
          }
          return React.cloneElement(child, {
            id,
          } as any);
        }
      }
      return child;
    });
  }

  return (
    <TextField isInvalid={isInvalid} className={clsx("flex flex-col gap-1", className)}>
      {label && (
        <Label className={clsx("text-sm font-medium text-text-primary", classNames?.label)}>
          {label}
        </Label>
      )}
      <SelectRoot 
        {...props}
        placeholder={placeholder}
        variant={v3Variant}
        onSelectionChange={(key) => {
          onSelectionChange?.(key);
          if (onChange) {
            onChange({ target: { name: (props as any).name, value: key } });
          }
        }}
      >
        <SelectTrigger className={clsx(
          "w-full min-h-11 px-3 flex items-center gap-3 rounded-xl border border-gray-200 hover:border-brand-blue outline-none transition-all bg-white",
          classNames?.trigger
        )}>
          {(props as any).startContent && (
            <div className="flex-shrink-0">
              {(props as any).startContent}
            </div>
          )}
          <SelectValue className={clsx("text-sm flex-1 text-left", classNames?.value)} />
          <SelectIndicator className="text-text-muted" />
        </SelectTrigger>
        <SelectPopover className="bg-white shadow-brand-lg rounded-xl border border-gray-100 min-w-[var(--trigger-width)]">
          <ListBox className="p-1 outline-none">
            {mappedChildren}
          </ListBox>
        </SelectPopover>
      </SelectRoot>
      {errorMessage && <FieldError className="text-xs text-red-500">{errorMessage}</FieldError>}
    </TextField>
  );
};

export { ListBoxItem as SelectItem };
