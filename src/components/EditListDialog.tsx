import * as React from "react";
import { TextField, Flex, Text, Box } from "@radix-ui/themes";
import { ThemedDialog } from "./ThemedDialog";
import { ColorPicker } from "./ColorPicker";
import { IconPicker } from "./IconPicker";
import { DeleteIconButton, CancelButton, PrimaryButton } from "./ActionButtons";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setListColor, setListSeparatorColor, setListLinkColor, setListIcon, setListIconColor } from "../store/listsSlice";

interface EditListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialTitle: string;
  listId: string;
  initialColor?: string;
  initialSeparatorColor?: string;
  initialLinkColor?: string;
  initialIcon?: string;
  initialIconColor?: string;
  onSubmit: (title: string) => void;
  onDelete?: () => void;
}

export const EditListDialog: React.FC<EditListDialogProps> = ({
  open,
  onOpenChange,
  initialTitle,
  listId,
  initialColor,
  initialSeparatorColor,
  initialLinkColor,
  initialIcon,
  initialIconColor,
  onSubmit,
  onDelete
}) => {
  const dispatch = useAppDispatch();
  const { lists, radixTheme } = useAppSelector((state) => state.theme);
  const [title, setTitle] = React.useState(initialTitle);
  const [customColor, setCustomColor] = React.useState(initialColor || "");
  const [customSeparatorColor, setCustomSeparatorColor] = React.useState(initialSeparatorColor || "");
  const [customLinkColor, setCustomLinkColor] = React.useState(initialLinkColor || "");
  const [icon, setIcon] = React.useState(initialIcon || "");
  const [iconColor, setIconColor] = React.useState(initialIconColor || "");

  React.useEffect(() => {
    setTitle(initialTitle);
    setCustomColor(initialColor || "");
    setCustomSeparatorColor(initialSeparatorColor || "");
    setCustomLinkColor(initialLinkColor || "");
    setIcon(initialIcon || "");
    setIconColor(initialIconColor || "");
  }, [initialTitle, initialColor, initialSeparatorColor, initialLinkColor, initialIcon, initialIconColor, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      // Применяем все изменения при сохранении
      dispatch(setListColor({ id: listId, color: customColor || undefined }));
      dispatch(setListSeparatorColor({ id: listId, color: customSeparatorColor || undefined }));
      dispatch(setListLinkColor({ id: listId, color: customLinkColor || undefined }));
      dispatch(setListIcon({ id: listId, icon: icon || undefined }));
      dispatch(setListIconColor({ id: listId, color: iconColor || undefined }));

      onSubmit(title.trim());
      onOpenChange(false);
    }
  };

  const handleClose = () => {
    setTitle(initialTitle);
    setCustomColor(initialColor || "");
    setCustomSeparatorColor(initialSeparatorColor || "");
    setCustomLinkColor(initialLinkColor || "");
    setIcon(initialIcon || "");
    setIconColor(initialIconColor || "");
    onOpenChange(false);
  };

  const handleDelete = () => {
    if (onDelete && confirm('Вы уверены, что хотите удалить этот список? Это действие нельзя отменить.')) {
      onDelete();
      onOpenChange(false);
    }
  };

  const handleColorChange = (color: string) => {
    setCustomColor(color);
  };

  const handleColorReset = () => {
    setCustomColor("");
  };

  const handleSeparatorColorChange = (color: string) => {
    setCustomSeparatorColor(color);
  };

  const handleSeparatorColorReset = () => {
    setCustomSeparatorColor("");
  };

  const handleLinkColorChange = (color: string) => {
    setCustomLinkColor(color);
  };

  const handleLinkColorReset = () => {
    setCustomLinkColor("");
  };

  const handleIconChange = (iconName: string | undefined) => {
    setIcon(iconName || "");
  };

  const handleIconReset = () => {
    setIcon("");
  };

  const handleIconColorChange = (color: string) => {
    setIconColor(color);
  };

  const handleIconColorReset = () => {
    setIconColor("");
  };

  return (
    <ThemedDialog
      open={open}
      onOpenChange={onOpenChange}
      ariaLabel="Переименовать список"
      ariaDescribedBy="edit-list-desc"
      title={<Text as="div" size="5" weight="bold" mb="2">Переименовать список</Text>}
      contentClassName="edit-list-dialog-content"
    >
      <Box
        id="edit-list-dialog"
        position="fixed"
        left="50%"
        top="50%"
        p="4"
        style={{
          borderRadius: 24,
          transform: "translate(-50%, -50%)",
          background: "#fff",
          boxShadow: "0 10px 40px 0 rgba(0,0,0,0.25)",
          minWidth: 320,
          maxWidth: 400,
          zIndex: 1010,
          border: lists.hideBackground ? 'none' : undefined,
        }}
      >
        <form onSubmit={handleSubmit} aria-describedby="edit-list-desc">
          <Flex direction="column" gap="4">
            <label>
              <Text as="div" size="2" mb="1" weight="medium">Новое название</Text>
              <TextField.Root
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Новое название списка"
                required
                autoFocus
              />
            </label>

            <ColorPicker
              label="Цвет заголовка"
              value={customColor || lists.titleColor || radixTheme}
              onChange={handleColorChange}
              onReset={handleColorReset}
              showReset={true}
              disableAlpha={false}
            />

            <ColorPicker
              label="Цвет разделителя"
              value={customSeparatorColor || lists.separatorColor || radixTheme}
              onChange={handleSeparatorColorChange}
              onReset={handleSeparatorColorReset}
              showReset={true}
              disableAlpha={false}
            />

            <ColorPicker
              label="Цвет ссылок"
              value={customLinkColor || lists.linkColor || `color-mix(in srgb, ${radixTheme} 70%, var(--gray-12) 30%)`}
              onChange={handleLinkColorChange}
              onReset={handleLinkColorReset}
              showReset={true}
              disableAlpha={false}
            />

            <IconPicker
              label="Иконка списка"
              value={icon || undefined}
              onChange={handleIconChange}
              onReset={handleIconReset}
              showReset={true}
            />

            {icon && (
              <ColorPicker
                label="Цвет иконки"
                value={iconColor || customColor || lists.titleColor || radixTheme}
                onChange={handleIconColorChange}
                onReset={handleIconColorReset}
                showReset={true}
                disableAlpha={false}
              />
            )}

            <Flex gap="3" justify="between" mt="2">
              {onDelete && (
                <DeleteIconButton onClick={handleDelete} aria-label="Удалить список" />
              )}
              <Flex gap="3" ml="auto">
                <CancelButton onClick={handleClose}>
                  Отмена
                </CancelButton>
                <PrimaryButton type="submit">
                  Сохранить
                </PrimaryButton>
              </Flex>
            </Flex>
          </Flex>
        </form>
      </Box>
    </ThemedDialog>
  );
};
