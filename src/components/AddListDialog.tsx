import * as React from "react";
import { Button, TextField, Flex, Text, Box } from "@radix-ui/themes";
import { ThemedDialog } from "./ThemedDialog";
import { useAppSelector } from "../store/hooks";

interface AddListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (title: string) => void;
}

export const AddListDialog: React.FC<AddListDialogProps> = ({ open, onOpenChange, onSubmit }) => {
  const [title, setTitle] = React.useState("");
  const { lists } = useAppSelector((state) => state.theme);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onSubmit(title.trim());
      setTitle("");
      onOpenChange(false);
    }
  };

  const handleClose = () => {
    setTitle("");
    onOpenChange(false);
  };

  return (
    <ThemedDialog
      open={open}
      onOpenChange={onOpenChange}
      ariaLabel="Создать список"
      ariaDescribedBy="add-list-desc"
      title={<Text as="div" size="5" weight="bold" mb="2">Создать список</Text>}
      contentClassName="add-list-dialog-content"
    >
      <Box
        id="add-list-dialog"
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
        <form onSubmit={handleSubmit} aria-describedby="add-list-desc">
          <Flex direction="column" gap="4">
            <label>
              <Text as="div" size="2" mb="1" weight="medium">Название списка</Text>
              <TextField.Root
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Название списка"
                required
                autoFocus
              />
            </label>
            <Flex gap="3" justify="end" mt="2">
              <Button variant="soft" color="gray" type="button" onClick={handleClose}>
                Отмена
              </Button>
              <Button
                type="submit"
                variant="solid"
                color="indigo"
                disabled={!title.trim()}
              >
                Создать
              </Button>
            </Flex>
          </Flex>
        </form>
      </Box>
    </ThemedDialog>
  );
};
