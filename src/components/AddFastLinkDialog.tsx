import * as React from "react";
import { TextField, Flex, Text, Box } from "@radix-ui/themes";
import { ThemedDialog } from "./ThemedDialog";
import { CancelButton, PrimaryButton } from "./ActionButtons";
import { useAppDispatch } from "../store/hooks";
import { addFastLink, updateFastLinkIcon } from "../store/fastLinksSlice";
import { getFaviconUrl } from "../utils/favicon";
import { nanoid } from "nanoid";
import { useTranslation } from "../locales";

interface AddFastLinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddFastLinkDialog: React.FC<AddFastLinkDialogProps> = ({
  open,
  onOpenChange
}) => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const [title, setTitle] = React.useState("");
  const [url, setUrl] = React.useState("");

  const prevUrlRef = React.useRef("");

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    setUrl(newUrl);
    
    // Автоподстановка заголовка только если поле пустое
    if (!title.trim() && newUrl.trim()) {
      try {
        const extractedTitle = newUrl
          .replace(/^.*?:\/\/([^\/?#]+).*$/, '$1') // hostname
          .replace(/\.[^\.]+$/, '')                // убираем последнюю .xxx
          .replace(/\./g, ' ');                     // заменяем точки на пробелы
        
        if (extractedTitle && extractedTitle !== newUrl) {
          setTitle(extractedTitle);
        }
      } catch {}
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && url.trim()) {
      const fastLinkId = nanoid();
      const iconId = nanoid();
      
      // Создаем быструю ссылку с fallback favicon
      const newFastLink = {
        id: fastLinkId,
        title: title.trim(),
        url: url.trim(),
        iconUrl: getFaviconUrl(url.trim()),
        iconId: undefined, // Начинаем без иконки
        iconType: 'custom' as const
      };
      
      dispatch(addFastLink(newFastLink));
      
      // Асинхронно скачиваем favicon через worker
      const port = chrome?.runtime?.connect({ name: 'icon-manager' });
      if (port) {
        port.postMessage({
          type: 'DOWNLOAD_FAVICON',
          url: url.trim(),
          iconId: iconId
        });
        
        port.onMessage.addListener((response) => {
          if (response.success) {
            // Обновляем иконку после успешного скачивания
            dispatch(updateFastLinkIcon({ id: fastLinkId, iconId: iconId }));
            console.log('Favicon downloaded successfully for:', title.trim());
          } else {
            console.warn('Failed to download favicon for:', title.trim());
          }
          port.disconnect();
        });
      }
      
      setTitle("");
      setUrl("");
      onOpenChange(false);
    }
  };

  const handleClose = () => {
    setTitle("");
    setUrl("");
    onOpenChange(false);
  };

  return (
    <ThemedDialog
      open={open}
      onOpenChange={onOpenChange}
      ariaLabel={t('fastLinks.newFastLink')}
      ariaDescribedBy="add-fast-link-desc"
      title={<Text as="div" size="5" weight="bold" mb="2">{t('fastLinks.newFastLink')}</Text>}
      contentClassName="add-fast-link-dialog-content"
    >
      <Box
        id="add-fast-link-dialog"
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
        <form onSubmit={handleSubmit} aria-describedby="add-fast-link-desc">
          <Flex direction="column" gap="4">
            <label>
              <Text as="div" size="2" mb="1" weight="medium">{t('fastLinks.fastLinkUrl')}</Text>
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
              <Text as="div" size="2" mb="1" weight="medium">{t('fastLinks.fastLinkName')}</Text>
              <TextField.Root
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder={t('fastLinks.fastLinkName')}
                color="gray"
                required
              />
            </label>
            <Flex gap="3" justify="end" mt="2">
              <CancelButton onClick={handleClose}>
                {t('common.cancel')}
              </CancelButton>
              <PrimaryButton
                type="submit"
                disabled={!title.trim() || !url.trim()}
              >
                {t('common.add')}
              </PrimaryButton>
            </Flex>
          </Flex>
        </form>
      </Box>
    </ThemedDialog>
  );
};
