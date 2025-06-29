import * as React from "react";
import { TextField, Flex, Text, Box } from "@radix-ui/themes";
import { ThemedDialog } from "./ThemedDialog";
import { CancelButton, PrimaryButton } from "./ActionButtons";
import { useAppDispatch } from "../store/hooks";
import { addFastLink } from "../store/fastLinksSlice";
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

  React.useEffect(() => {
    // Если поле url было пустым и стало валидным URL, подставить домен в title
    if (!prevUrlRef.current && url) {
      try {
        const parsed = new URL(url);
        // Получаем домен без www и до первой точки после домена
        let host = parsed.hostname.replace(/^www\./, "");
        const parts = host.split(".");
        if (parts.length > 1) {
          host = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
        } else {
          host = host.charAt(0).toUpperCase() + host.slice(1);
        }
        setTitle(host);
      } catch {}
    }
    prevUrlRef.current = url;
  }, [url]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && url.trim()) {
      const newFastLink = {
        id: nanoid(),
        title: title.trim(),
        url: url.trim(),
        iconUrl: getFaviconUrl(url.trim()),
      };
      
      dispatch(addFastLink(newFastLink));
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
              <Text as="div" size="2" mb="1" weight="medium">{t('fastLinks.fastLinkName')}</Text>
              <TextField.Root
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder={t('fastLinks.fastLinkName')}
                color="gray"
                required
                autoFocus
              />
            </label>
            <label>
              <Text as="div" size="2" mb="1" weight="medium">{t('fastLinks.fastLinkUrl')}</Text>
              <TextField.Root
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder="https://example.com"
                color="gray"
                required
                type="url"
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
