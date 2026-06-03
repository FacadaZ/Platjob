import React from "react";
import { Tabs as HeroUITabs } from "@heroui/react";
import clsx from "clsx";

interface TabsCompatProps extends Omit<React.ComponentProps<typeof HeroUITabs>, "variant"> {
  variant?: "solid" | "bordered" | "light" | "underlined";
  color?: any;
  classNames?: any;
}

export const TabsCompat = ({ children, variant, color, classNames, ...props }: TabsCompatProps) => {
  // Map v2 variants to v3
  let v3Variant: any = variant;
  if (variant === "underlined") v3Variant = "primary";

  const tabItems: React.ReactElement[] = [];
  const tabPanels: React.ReactElement[] = [];

  React.Children.forEach(children, (child) => {
    if (React.isValidElement(child)) {
      const childProps = child.props as any;
      const { title, children: panelContent, ...tabProps } = childProps;
      const key = child.key || tabProps.id;
      
      tabItems.push(
        <HeroUITabs.Tab 
          key={key} 
          id={key} 
          className={classNames?.tab}
          {...tabProps}
        >
          {title}
        </HeroUITabs.Tab>
      );
      
      tabPanels.push(
        <HeroUITabs.Panel 
          key={key} 
          id={key}
          className={classNames?.panel}
        >
          {panelContent}
        </HeroUITabs.Panel>
      );
    }
  });

  return (
    <HeroUITabs 
      {...props} 
      variant={v3Variant} 
      className={clsx("w-full", classNames?.base)}
    >
      <HeroUITabs.List className={clsx(
        "flex gap-4 border-b border-gray-100 mb-6",
        classNames?.tabList
      )}>
        {tabItems}
      </HeroUITabs.List>
      <div className="mt-4">
        {tabPanels}
      </div>
    </HeroUITabs>
  );
};

export const TabCompat = ({ children }: any) => {
  // This component is just a placeholder to hold props for TabsCompat
  return <>{children}</>;
};
