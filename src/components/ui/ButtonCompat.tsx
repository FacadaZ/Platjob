import React from "react";
import { Button as HeroUIButton, Spinner } from "@heroui/react";
import clsx from "clsx";

interface ButtonCompatProps extends Omit<React.ComponentProps<typeof HeroUIButton>, "variant"> {
  isLoading?: boolean;
  startContent?: React.ReactNode;
  endContent?: React.ReactNode;
  variant?: "solid" | "bordered" | "light" | "flat" | "faded" | "shadow" | "ghost" | "primary" | "secondary" | "tertiary" | "outline" | "danger" | "danger-soft";
  color?: any;
}

export const ButtonCompat = (props: ButtonCompatProps) => {
  const { children, isLoading, isDisabled, startContent, endContent, variant, color, ...rest } = props as any;
  
  let v3Variant: any = variant;

  // Map v2 color + variant to v3 variant
  if (color === "danger") {
    v3Variant = variant === "flat" || variant === "light" ? "danger-soft" : "danger";
  } else if (color === "primary") {
    v3Variant = variant === "bordered" ? "outline" : "primary";
  } else if (color === "secondary") {
    v3Variant = "secondary";
  } else {
    // Default fallback mapping
    if (variant === "bordered") v3Variant = "outline";
    if (variant === "light") v3Variant = "ghost";
    if (variant === "flat") v3Variant = "tertiary";
    if (!v3Variant && !color) v3Variant = "primary";
  }

  return (
    <HeroUIButton
      {...rest}
      variant={v3Variant}
      isDisabled={isDisabled || isLoading}
      className={clsx(props.className, "flex items-center justify-center gap-2")}
    >
      {isLoading && <Spinner size="sm" color="current" />}
      {!isLoading && startContent}
      {children}
      {!isLoading && endContent}
    </HeroUIButton>
  );
};
