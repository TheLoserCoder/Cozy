import * as React from "react";
import { Theme, ThemeProps } from "@radix-ui/themes";
import "@radix-ui/themes/styles.css";

export const AppThemeProvider: React.FC<React.PropsWithChildren<Partial<ThemeProps>>> = ({ children, ...props }) => (
  <Theme
    accentColor="mint"
    grayColor="sage"
    panelBackground="solid"
    scaling="100%"
    radius="full"
    appearance="light"
    {...props}
  >
    {children}
  </Theme>
);
