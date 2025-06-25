import * as React from "react";
import { Button, TextField, Flex, Text, Box } from "@radix-ui/themes";
import { ThemedDialog } from "./ThemedDialog";

interface EditListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialTitle: string;
  onSubmit: (title: string) => void;
}

export const EditListDialog: React.FC<EditListDialogProps> = ({ open, onOpenChange, initialTitle, onSubmit }) => {
  const [title, setTitle] = React.useState(initialTitle);

  React.useEffect(() => {
    setTitle(initialTitle);
  }, [initialTitle, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onSubmit(title.trim());
      onOpenChange(false);
    }
  };

  const handleClose = () => {
    setTitle(initialTitle);
    onOpenChange(false);
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
            <Flex gap="3" justify="end" mt="2">
              <Button variant="soft" color="gray" type="button" onClick={handleClose}>
                Отмена
              </Button>
              <Button type="submit" variant="solid" color="mint">
                Сохранить
              </Button>
            </Flex>
          </Flex>
        </form>
      </Box>
    </ThemedDialog>
  );
};
