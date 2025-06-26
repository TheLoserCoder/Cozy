import * as React from "react";
import { Button, IconButton } from "@radix-ui/themes";

// Кнопка удаления (красная)
interface DeleteButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  variant?: "solid" | "soft";
  size?: "1" | "2" | "3" | "4";
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}

export const DeleteButton: React.FC<DeleteButtonProps> = ({
  onClick,
  children,
  variant = "soft",
  size,
  disabled = false,
  type = "button"
}) => {
  return (
    <Button
      variant={variant}
      onClick={onClick}
      disabled={disabled}
      type={type}
      size={size}
      style={{
        backgroundColor: variant === "solid" ? "#E5484D" : "rgba(229, 72, 77, 0.1)",
        color: variant === "solid" ? "white" : "#E5484D",
        borderColor: "#E5484D"
      }}
    >
      {children}
    </Button>
  );
};

// Кнопка отмены (мягкая, акцентный цвет)
interface CancelButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  size?: "1" | "2" | "3" | "4";
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}

export const CancelButton: React.FC<CancelButtonProps> = ({
  onClick,
  children,
  size,
  disabled = false,
  type = "button"
}) => {
  return (
    <Button
      variant="soft"
      onClick={onClick}
      disabled={disabled}
      type={type}
      size={size}
    >
      {children}
    </Button>
  );
};

// Кнопка редактирования (мягкая, акцентный цвет)
interface EditButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  size?: "1" | "2" | "3" | "4";
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}

export const EditButton: React.FC<EditButtonProps> = ({
  onClick,
  children,
  size,
  disabled = false,
  type = "button"
}) => {
  return (
    <Button
      variant="soft"
      onClick={onClick}
      disabled={disabled}
      type={type}
      size={size}
    >
      {children}
    </Button>
  );
};

// Основная кнопка действия (solid, акцентный цвет)
interface PrimaryButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
  size?: "1" | "2" | "3" | "4";
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  onClick,
  children,
  size,
  disabled = false,
  type = "button"
}) => {
  return (
    <Button
      variant="solid"
      onClick={onClick}
      disabled={disabled}
      type={type}
      size={size}
    >
      {children}
    </Button>
  );
};

// Вторичная кнопка (soft, акцентный цвет)
interface SecondaryButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
  size?: "1" | "2" | "3" | "4";
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}

export const SecondaryButton: React.FC<SecondaryButtonProps> = ({
  onClick,
  children,
  size,
  disabled = false,
  type = "button"
}) => {
  return (
    <Button
      variant="soft"
      onClick={onClick}
      disabled={disabled}
      type={type}
      size={size}
    >
      {children}
    </Button>
  );
};

// IconButton без цвета (использует акцентный)
interface ActionIconButtonProps {
  onClick: (e?: React.MouseEvent) => void;
  children: React.ReactNode;
  variant?: "solid" | "soft" | "outline" | "ghost";
  size?: "1" | "2" | "3" | "4";
  disabled?: boolean;
  "aria-label"?: string;
}

export const ActionIconButton: React.FC<ActionIconButtonProps> = ({
  onClick,
  children,
  variant = "soft",
  size,
  disabled = false,
  "aria-label": ariaLabel
}) => {
  return (
    <IconButton
      variant={variant}
      onClick={onClick}
      disabled={disabled}
      size={size}
      aria-label={ariaLabel}
    >
      {children}
    </IconButton>
  );
};
