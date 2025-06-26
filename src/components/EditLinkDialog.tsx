import * as React from "react";
import { TextField, Flex, Text, Box } from "@radix-ui/themes";
import { ThemedDialog } from "./ThemedDialog";
import { ColorPicker } from "./ColorPicker";
import { DeleteButton, CancelButton, PrimaryButton } from "./ActionButtons";
import { useAppDispatch } from "../store/hooks";
import { editLink, deleteLink, setLinkColor } from "../store/listsSlice";
import { getFaviconUrl } from "../utils/favicon";

interface EditLinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listId: string;
  linkId: string;
  initialTitle: string;
  initialUrl: string;
  initialColor?: string;
}

export const EditLinkDialog: React.FC<EditLinkDialogProps> = ({
  open,
  onOpenChange,
  listId,
  linkId,
  initialTitle,
  initialUrl,
  initialColor
}) => {
  const dispatch = useAppDispatch();
  const [title, setTitle] = React.useState(initialTitle);
  const [url, setUrl] = React.useState(initialUrl);
  const [customColor, setCustomColor] = React.useState(initialColor || "");

  React.useEffect(() => {
    setTitle(initialTitle);
    setUrl(initialUrl);
    setCustomColor(initialColor || "");
  }, [initialTitle, initialUrl, initialColor, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && url.trim()) {
      // Автоматически извлекаем домен для заголовка, если заголовок пустой
      const finalTitle = title.trim() || extractDomainFromUrl(url.trim());
      
      dispatch(editLink({
        listId,
        linkId,
        updates: {
          title: finalTitle,
          url: url.trim(),
          iconUrl: getFaviconUrl(url.trim())
        }
      }));
      onOpenChange(false);
    }
  };

  const handleClose = () => {
    setTitle(initialTitle);
    setUrl(initialUrl);
    setCustomColor(initialColor || "");
    onOpenChange(false);
  };

  const handleDelete = () => {
    if (confirm('Вы уверены, что хотите удалить эту ссылку?')) {
      dispatch(deleteLink({ listId, linkId }));
      onOpenChange(false);
    }
  };

  const handleColorChange = (color: string) => {
    setCustomColor(color);
    dispatch(setLinkColor({ listId, linkId, color }));
  };

  const handleColorReset = () => {
    setCustomColor("");
    dispatch(setLinkColor({ listId, linkId, color: undefined }));
  };

  const extractDomainFromUrl = (url: string): string => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.replace('www.', '');
    } catch {
      return url;
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    setUrl(newUrl);
    
    // Если заголовок пустой, автоматически заполняем его доменом
    if (!title.trim() && newUrl.trim()) {
      setTitle(extractDomainFromUrl(newUrl.trim()));
    }
  };

  return (
    <ThemedDialog
      open={open}
      onOpenChange={onOpenChange}
      ariaLabel="Редактировать ссылку"
      ariaDescribedBy="edit-link-desc"
      title={<Text as="div" size="5" weight="bold" mb="2">Редактировать ссылку</Text>}
      contentClassName="edit-link-dialog-content"
    >
      <Box
        id="edit-link-dialog"
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
        <form onSubmit={handleSubmit} aria-describedby="edit-link-desc">
          <Flex direction="column" gap="4">
            <label>
              <Text as="div" size="2" mb="1" weight="medium">URL</Text>
              <TextField.Root
                value={url}
                onChange={handleUrlChange}
                placeholder="https://example.com"
                required
                type="url"
                autoFocus
              />
            </label>
            
            <label>
              <Text as="div" size="2" mb="1" weight="medium">Название</Text>
              <TextField.Root
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Название ссылки"
                required
              />
            </label>
            
            <ColorPicker
              label="Цвет ссылки"
              value={customColor}
              onChange={handleColorChange}
              onReset={handleColorReset}
              showReset={true}
              disableAlpha={false}
            />
            
            <Flex gap="3" justify="between" mt="2">
              <DeleteButton onClick={handleDelete}>
                Удалить
              </DeleteButton>

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
