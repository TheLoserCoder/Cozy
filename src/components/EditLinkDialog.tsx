import * as React from "react";
import { TextField, Flex, Text, Box } from "@radix-ui/themes";
import { ThemedDialog } from "./ThemedDialog";
import { ColorPicker } from "./ColorPicker";
import { DeleteIconButton, CancelButton, PrimaryButton } from "./ActionButtons";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { editLink, deleteLink, setLinkColor } from "../store/listsSlice";
import { getFaviconUrl } from "../utils/favicon";
import { useTranslation } from "../locales";

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
  const { lists, radixTheme } = useAppSelector((state) => state.theme);
  const [title, setTitle] = React.useState(initialTitle);
  const [url, setUrl] = React.useState(initialUrl);
  const [customColor, setCustomColor] = React.useState(initialColor || "");
  const { t } = useTranslation();

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

      // Применяем изменения ссылки
      dispatch(editLink({
        listId,
        linkId,
        updates: {
          title: finalTitle,
          url: url.trim(),
          iconUrl: getFaviconUrl(url.trim())
        }
      }));

      // Применяем изменения цвета
      dispatch(setLinkColor({ listId, linkId, color: customColor || undefined }));

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
    if (confirm(t('errors.deleteLinkConfirm'))) {
      dispatch(deleteLink({ listId, linkId }));
      onOpenChange(false);
    }
  };

  const handleColorChange = (color: string) => {
    setCustomColor(color);
  };

  const handleColorReset = () => {
    setCustomColor("");
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
      ariaLabel={t('lists.editLink')}
      ariaDescribedBy="edit-link-desc"
      title={<Text as="div" size="5" weight="bold" mb="2">{t('lists.editLink')}</Text>}
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
          border: lists.hideBackground ? 'none' : undefined,
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
                color="gray"
                required
                type="url"
                autoFocus
              />
            </label>

            <label>
              <Text as="div" size="2" mb="1" weight="medium">{t('lists.linkName')}</Text>
              <TextField.Root
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder={t('lists.linkName')}
                color="gray"
                required
              />
            </label>
            
            <ColorPicker
              label={t('lists.linkColor')}
              value={customColor || lists.linkColor || `color-mix(in srgb, ${radixTheme} 70%, var(--gray-12) 30%)`}
              onChange={handleColorChange}
              onReset={handleColorReset}
              showReset={!!customColor}
              disableAlpha={false}
            />
            
            <Flex gap="3" justify="between" mt="2">
              <DeleteIconButton onClick={handleDelete} aria-label={t('tooltips.deleteItem')} />

              <Flex gap="3" ml="auto">
                <CancelButton onClick={handleClose}>
                  {t('common.cancel')}
                </CancelButton>
                <PrimaryButton type="submit">
                  {t('common.save')}
                </PrimaryButton>
              </Flex>
            </Flex>
          </Flex>
        </form>
      </Box>
    </ThemedDialog>
  );
};
