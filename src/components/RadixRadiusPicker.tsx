import * as React from "react";
import { Select } from "@radix-ui/themes";
import { useTranslation } from "../locales";

interface RadixRadiusPickerProps {
  value: string;
  onChange: (radius: string) => void;
}

export const RadixRadiusPicker: React.FC<RadixRadiusPickerProps> = ({ value, onChange }) => {
  const { t } = useTranslation();

  const RADIUS_OPTIONS = [
    { value: 'none', label: t('radius.none') },
    { value: 'small', label: t('radius.small') },
    { value: 'medium', label: t('radius.medium') },
    { value: 'large', label: t('radius.large') },
    { value: 'full', label: t('radius.full') }
  ];

  return (
    <Select.Root value={value} onValueChange={onChange}>
      <Select.Trigger style={{ width: '100%' }} />
      <Select.Content style={{ zIndex: 10000 }}>
        {RADIUS_OPTIONS.map((option) => (
          <Select.Item key={option.value} value={option.value}>
            {option.label}
          </Select.Item>
        ))}
      </Select.Content>
    </Select.Root>
  );
};

export default RadixRadiusPicker;
