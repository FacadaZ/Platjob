import React from "react";
import { DropdownItem as HeroUIDropdownItem } from "@heroui/react";

interface DropdownItemCompatProps extends React.ComponentProps<typeof HeroUIDropdownItem> {
  startContent?: React.ReactNode;
  endContent?: React.ReactNode;
  onPress?: () => void;
  color?: any;
  isReadOnly?: boolean;
}

export const DropdownItemCompat = (props: DropdownItemCompatProps) => {
  const { children, startContent, endContent, onPress, color, ...rest } = props as any;
  return (
    <HeroUIDropdownItem {...rest} onAction={onPress}>
      <div className="flex items-center gap-2 w-full">
        {startContent && <span className="flex-shrink-0">{startContent}</span>}
        <span className="flex-1">{children}</span>
        {endContent && <span className="flex-shrink-0">{endContent}</span>}
      </div>
    </HeroUIDropdownItem>
  );
};
