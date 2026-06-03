import React from "react";
import { Chip as HeroUIChip } from "@heroui/react";

type V2Variant = "solid" | "bordered" | "light" | "flat" | "faded" | "shadow" | "dot";
type V3Variant = "primary" | "secondary" | "tertiary" | "soft" | "outline" | "ghost";

interface ChipCompatProps extends Omit<React.ComponentProps<typeof HeroUIChip>, "variant" | "color"> {
  variant?: V2Variant | V3Variant;
  color?: any;
  onClose?: () => void;
  startContent?: React.ReactNode;
}

export const ChipCompat = ({ children, variant, color, onClose, startContent, ...props }: ChipCompatProps) => {
  // Map v2 variants to v3
  let v3Variant: any = variant;
  if (variant === "flat") v3Variant = "soft";
  if (variant === "bordered") v3Variant = "outline";
  if (variant === "light") v3Variant = "ghost";

  // Map v2 colors to v3 if necessary (this is tricky as v3 seems to have different color names in some components)
  let v3Color: any = color;
  if (color === "default") v3Color = "default";
  
  return (
    <HeroUIChip
      {...props}
      variant={v3Variant}
      color={v3Color}
    >
      {startContent && <span className="mr-1">{startContent}</span>}
      {typeof children === "string" ? (
        <HeroUIChip.Label>{children}</HeroUIChip.Label>
      ) : (
        children
      )}
      {onClose && (
        <button 
          onClick={onClose} 
          className="ml-1 hover:opacity-70 transition-opacity"
          aria-label="Close"
        >
          ×
        </button>
      )}
    </HeroUIChip>
  );
};
