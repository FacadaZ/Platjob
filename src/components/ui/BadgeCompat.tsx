import React from "react";
import { Badge as HeroUIBadge } from "@heroui/react";

interface BadgeCompatProps extends React.ComponentProps<typeof HeroUIBadge> {
  content?: React.ReactNode;
  children?: React.ReactNode;
}

export const BadgeCompat = ({ children, content, ...props }: BadgeCompatProps) => {
  // If we have children, we wrap them in Anchor
  if (children) {
    return (
      <HeroUIBadge.Anchor>
        {children}
        <HeroUIBadge {...props}>
          {typeof content === "string" || typeof content === "number" ? (
            <HeroUIBadge.Label>{content}</HeroUIBadge.Label>
          ) : (
            content
          )}
        </HeroUIBadge>
      </HeroUIBadge.Anchor>
    );
  }

  return (
    <HeroUIBadge {...props}>
      {typeof content === "string" || typeof content === "number" ? (
        <HeroUIBadge.Label>{content}</HeroUIBadge.Label>
      ) : (
        content
      )}
    </HeroUIBadge>
  );
};
