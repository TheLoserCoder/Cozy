import * as React from "react";
import { Button, IconButton } from "@radix-ui/themes";
import { TrashIcon } from "@radix-ui/react-icons";

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

// Иконка удаления (красная мусорка)
interface DeleteIconButtonProps {
  onClick: () => void;
  variant?: "solid" | "soft";
  size?: "1" | "2" | "3" | "4";
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  "aria-label"?: string;
}

export const DeleteIconButton: React.FC<DeleteIconButtonProps> = ({
  onClick,
  variant = "soft",
  size,
  disabled = false,
  type = "button",
  "aria-label": ariaLabel = "Удалить"
}) => {
  return (
    <IconButton
      variant={variant}
      onClick={onClick}
      disabled={disabled}
      type={type}
      size={size}
      aria-label={ariaLabel}
      style={{
        backgroundColor: variant === "solid" ? "#E5484D" : "rgba(229, 72, 77, 0.1)",
        color: variant === "solid" ? "white" : "#E5484D",
        borderColor: "#E5484D"
      }}
    >
      <TrashIcon />
    </IconButton>
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
      color="indigo"
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
      color="indigo"
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
      color="indigo"
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
      color="indigo"
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
  color?: "red" | "green" | "blue" | "yellow" | "purple" | "gray" | "orange" | "indigo" | "cyan" | "pink" | "lime" | "amber" | "teal" | "sky" | "violet" | "ruby" | "brown" | "crimson" | "gold";
  size?: "1" | "2" | "3" | "4";
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  "aria-label"?: string;
}

export const ActionIconButton: React.FC<ActionIconButtonProps> = ({
  onClick,
  children,
  variant = "soft",
  color,
  size,
  disabled = false,
  type = "button",
  "aria-label": ariaLabel
}) => {
  return (
    <IconButton
      variant={variant}
      color={color}
      onClick={onClick}
      disabled={disabled}
      size={size}
      type={type}
      aria-label={ariaLabel}
    >
      {children}
    </IconButton>
  );
};
