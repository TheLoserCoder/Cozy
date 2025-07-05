import * as React from "react";
import { TextField, Flex, Text, Box } from "@radix-ui/themes";
import { ThemedDialog } from "./ThemedDialog";
import { CancelButton, PrimaryButton } from "./ActionButtons";
import { useAppDispatch } from "../store/hooks";
import { addFastLink, updateFastLinkIcon } from "../store/fastLinksSlice";
import { getFaviconUrl } from "../utils/favicon";
import { generateLinkId } from "../store/linkId";
import { setGlobalIcon } from "../utils/globalIconCache";
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
      const fastLinkId = generateLinkId();
      const iconId = generateLinkId();

      const port = chrome?.runtime?.connect({ name: 'icon-manager' });
      if (port) {
        port.postMessage({
          type: 'SAVE_ICON',
          payload: { iconId, url: url.trim() },
        });

        port.onMessage.addListener((response) => {
          if (response.success) {
            // Обновляем глобальный кэш
            const port2 = chrome.runtime.connect({ name: 'icon-manager' });
            port2.postMessage({ type: 'GET_ICON', iconId: response.iconId });
            port2.onMessage.addListener((iconResponse) => {
              if (iconResponse.success && iconResponse.icon) {
                setGlobalIcon(response.iconId, { type: iconResponse.icon.type, data: iconResponse.icon.data });
              }
              port2.disconnect();
            });
            
            const newFastLink = {
              id: fastLinkId,
              title: title.trim(),
              url: url.trim(),
              iconId: response.iconId,
              iconType: 'favicon' as const,
            };
            dispatch(addFastLink(newFastLink));
          } else {
            const newFastLink = {
              id: fastLinkId,
              title: title.trim(),
              url: url.trim(),
              iconUrl: getFaviconUrl(url.trim()),
              iconType: 'favicon' as const,
            };
            dispatch(addFastLink(newFastLink));
          }
          port.disconnect();
        });
      } else {
        const newFastLink = {
          id: fastLinkId,
          title: title.trim(),
          url: url.trim(),
          iconUrl: getFaviconUrl(url.trim()),
          iconType: 'favicon' as const,
        };
        dispatch(addFastLink(newFastLink));
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
