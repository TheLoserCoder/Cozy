import * as React from "react";
import { Box } from "@radix-ui/themes";
import { ColorPicker } from "./ColorPicker";

interface RadixThemePickerProps {
  value: string;
  onChange: (color: string) => void;
  label?: string;
}

export const RadixThemePicker: React.FC<RadixThemePickerProps> = ({
  value,
  onChange,
  label
}) => {
  return (
    <Box>
      <ColorPicker
        label={label}
        value={value}
        onChange={onChange}
        disableAlpha={false}
      />
    </Box>
  );
};