import React from "react";
import { Avatar as HeroUIAvatar } from "@heroui/react";
import clsx from "clsx";

interface AvatarCompatProps extends Omit<React.ComponentProps<typeof HeroUIAvatar>, "size"> {
  src?: string;
  name?: string;
  showFallback?: boolean;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
}

export const AvatarCompat = ({ src, name, showFallback, size, className, ...props }: AvatarCompatProps) => {
  let v3Size: any = size;
  
  // Determine pixel size
  let pxSize = 40;
  if (size === "xs") pxSize = 28;
  else if (size === "sm") pxSize = 36;
  else if (size === "md") pxSize = 48;
  else if (size === "lg") pxSize = 64;

  return (
    <div 
      className={clsx("relative rounded-full overflow-hidden flex-shrink-0", className)}
      style={{ 
        width: pxSize, 
        height: pxSize, 
        minWidth: pxSize, 
        minHeight: pxSize,
        maxWidth: pxSize,
        maxHeight: pxSize
      }}
    >
      <HeroUIAvatar
        {...props}
        size={v3Size}
        className="w-full h-full border-none"
        style={{ width: "100%", height: "100%" }}
      >
        {src && (
          <HeroUIAvatar.Image
            src={src}
            alt={name}
            className="w-full h-full object-cover rounded-full aspect-square !block"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        )}
        <HeroUIAvatar.Fallback 
          className="flex items-center justify-center w-full h-full bg-gray-100 text-[10px] font-bold rounded-full"
          style={{ width: "100%", height: "100%" }}
        >
          {name ? name[0].toUpperCase() : null}
        </HeroUIAvatar.Fallback>
      </HeroUIAvatar>
    </div>
  );
};
