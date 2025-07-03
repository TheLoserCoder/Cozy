import * as React from "react";
import { TextField, Flex, Text, Box } from "@radix-ui/themes";
import { ThemedDialog } from "./ThemedDialog";
import { ColorPicker } from "./ColorPicker";
import { IconPicker } from "./IconPicker";
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
  initialIconId?: string;
  initialIconType?: 'standard' | 'custom';
  initialIconColor?: string;
}

export const EditLinkDialog: React.FC<EditLinkDialogProps> = ({
  open,
  onOpenChange,
  listId,
  linkId,
  initialTitle,
  initialUrl,
  initialColor,
  initialIconId,
  initialIconType,
  initialIconColor
}) => {
  const dispatch = useAppDispatch();
  const { lists, radixTheme } = useAppSelector((state) => state.theme);
  const [title, setTitle] = React.useState(initialTitle);
  const [url, setUrl] = React.useState(initialUrl);
  const [customColor, setCustomColor] = React.useState(initialColor || "");
  const [iconId, setIconId] = React.useState<string | null>(null);
  const [iconType, setIconType] = React.useState<'standard' | 'custom' | null>(null);
  const [iconColor, setIconColor] = React.useState<string>("");
  const { t } = useTranslation();

  React.useEffect(() => {
    setTitle(initialTitle);
    setUrl(initialUrl);
    setCustomColor(initialColor || "");
    setIconId(initialIconId || null);
    setIconType(initialIconType || null);
    setIconColor(initialIconColor || "");
  }, [initialTitle, initialUrl, initialColor, initialIconId, initialIconType, initialIconColor, open]);

  // Загружаем данные ссылки для получения iconId и iconType
  React.useEffect(() => {
    if (open && listId && linkId) {
      const allLists = JSON.parse(localStorage.getItem('lists') || '[]');
      const list = allLists.find((l: any) => l.id === listId);
      const link = list?.links.find((l: any) => l.id === linkId);
      if (link) {
        setIconId(link.iconId || null);
        setIconType(link.iconType || null);
        setIconColor(link.iconColor || "");
      }
    }
  }, [open, listId, linkId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && url.trim()) {
      // Автоматически извлекаем заголовок из URL, если заголовок пустой
      let finalTitle = title.trim();
      if (!finalTitle && url.trim()) {
        try {
          finalTitle = url.trim()
            .replace(/^.*?:\/\/([^\/?#]+).*$/, '$1')
            .replace(/\.[^\.]+$/, '')
            .replace(/\./g, ' ');
        } catch {
          finalTitle = url.trim();
        }
      }

      // Применяем изменения ссылки
      dispatch(editLink({
        listId,
        linkId,
        updates: {
          title: finalTitle,
          url: url.trim(),
          iconUrl: iconId ? undefined : getFaviconUrl(url.trim()),
          iconId: iconId || undefined,
          iconType: iconType || undefined,
          iconColor: iconColor || undefined
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
    setIconId(null);
    setIconType(null);
    setIconColor("");
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

  const handleIconIdChange = (iconId: string | null, iconType: 'standard' | 'custom' | null) => {
    setIconId(iconId);
    setIconType(iconType);
  };

  const handleIconReset = () => {
    setIconId(null);
    setIconType(null);
  };

  const handleIconColorChange = (color: string) => {
    setIconColor(color);
  };

  const handleIconColorReset = () => {
    setIconColor("");
  };

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
              <Text as="div" size="2" mb="1" weight="medium">{t('common.url')}</Text>
              <TextField.Root
                value={url}
                onChange={handleUrlChange}
                placeholder={t('common.urlPlaceholder')}
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
            
            <IconPicker
              label={t('settings.icon')}
              iconId={iconId || undefined}
              iconType={iconType || undefined}
              onIconChange={handleIconIdChange}
              onReset={handleIconReset}
              showReset={!!iconId}
            />
            
            {(iconId) && (
              <ColorPicker
                label={t('settings.iconColor')}
                value={iconColor || customColor || lists.linkColor || `color-mix(in srgb, ${radixTheme} 70%, var(--gray-12) 30%)`}
                onChange={handleIconColorChange}
                onReset={handleIconColorReset}
                showReset={!!iconColor}
                disableAlpha={false}
              />
            )}
            
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
