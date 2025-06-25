import * as React from "react";
import { Drawer } from "./Drawer";
import { Box, Heading, Text, IconButton } from "@radix-ui/themes";
import { Cross2Icon } from "@radix-ui/react-icons";
import { AppThemeProvider } from "./ThemeProvider";

export const SettingsDrawer: React.FC<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
}> = ({ open, onOpenChange }) => {
  return (
    <AppThemeProvider>
      <Drawer open={open} onOpenChange={onOpenChange} side="right" width={400}>
        <Box p="4" style={{ flex: 1 }}>
          <Box style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }} mb="4">
            <Heading size="5">Настройки</Heading>
            <IconButton variant="ghost" color="gray" size="2" aria-label="Закрыть" onClick={() => onOpenChange(false)}>
              <Cross2Icon />
            </IconButton>
          </Box>
          <Text size="3" color="gray">Здесь будут настройки расширения (тема, внешний вид, опции и т.д.)</Text>
        </Box>
      </Drawer>
    </AppThemeProvider>
  );
};
