import * as React from "react";
import { TextField, Flex, Text, Box } from "@radix-ui/themes";
import { ThemedDialog } from "./ThemedDialog";
import { ColorPicker } from "./ColorPicker";
import { DeleteButton, CancelButton, PrimaryButton } from "./ActionButtons";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setListColor } from "../store/listsSlice";

interface EditListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialTitle: string;
  listId: string;
  initialColor?: string;
  onSubmit: (title: string) => void;
  onDelete?: () => void;
}

export const EditListDialog: React.FC<EditListDialogProps> = ({
  open,
  onOpenChange,
  initialTitle,
  listId,
  initialColor,
  onSubmit,
  onDelete
}) => {
  const dispatch = useAppDispatch();
  const { lists } = useAppSelector((state) => state.theme);
  const [title, setTitle] = React.useState(initialTitle);
  const [customColor, setCustomColor] = React.useState(initialColor || "");

  React.useEffect(() => {
    setTitle(initialTitle);
    setCustomColor(initialColor || "");
  }, [initialTitle, initialColor, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onSubmit(title.trim());
      onOpenChange(false);
    }
  };

  const handleClose = () => {
    setTitle(initialTitle);
    setCustomColor(initialColor || "");
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
    dispatch(setListColor({ id: listId, color }));
  };

  const handleColorReset = () => {
    setCustomColor("");
    dispatch(setListColor({ id: listId, color: undefined }));
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
              value={customColor}
              onChange={handleColorChange}
              onReset={handleColorReset}
              showReset={true}
              disableAlpha={false}
            />
            <Flex gap="3" justify="between" mt="2">
              {onDelete && (
                <DeleteButton onClick={handleDelete}>
                  Удалить
                </DeleteButton>
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
