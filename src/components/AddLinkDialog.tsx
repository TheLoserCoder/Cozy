import * as React from "react";
import { TextField, Flex, Text, Box } from "@radix-ui/themes";
import { ThemedDialog } from "./ThemedDialog";
import { CancelButton, PrimaryButton } from "./ActionButtons";
import { generateLinkId } from "../store/linkId";
import { setGlobalIcon } from "../utils/globalIconCache";
import { useTranslation } from "../locales";

interface AddLinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { title: string; url: string }) => void;
}

export const AddLinkDialog: React.FC<AddLinkDialogProps> = ({ open, onOpenChange, onSubmit }) => {
  const [title, setTitle] = React.useState("");
  const [url, setUrl] = React.useState("");

  const prevUrlRef = React.useRef("");
  const { t } = useTranslation();

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
      const iconId = generateLinkId();
      const port = chrome?.runtime?.connect({ name: 'icon-manager' });
      if (port) {
        port.postMessage({
          type: 'SAVE_ICON',
          payload: { iconId, url: url.trim() },
        });
        port.onMessage.addListener((response) => {
          if (response.success && response.icon) {
            setGlobalIcon(response.iconId, { type: response.icon.type, data: response.icon.data });
            onSubmit({ title: title.trim(), url: url.trim(), iconId: response.iconId, iconType: 'favicon' });
          } else {
            onSubmit({ title: title.trim(), url: url.trim() });
          }
          port.disconnect();
        });
      } else {
        onSubmit({ title: title.trim(), url: url.trim() });
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
      ariaLabel={t('lists.addLink')}
      ariaDescribedBy="add-link-desc"
      title={<Text as="div" size="5" weight="bold" mb="2">{t('lists.addLink')}</Text>}
      contentClassName="add-link-dialog-content"
    >
      <Box
        id="add-link-dialog"
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
        <form onSubmit={handleSubmit} aria-describedby="add-link-desc">
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
              <Text as="div" size="2" mb="1" weight="medium">{t('lists.title')}</Text>
              <TextField.Root
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder={t('lists.linkName')}
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
