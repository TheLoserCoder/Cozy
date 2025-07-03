import * as React from "react";
import { TextField, Flex, Text, Box } from "@radix-ui/themes";
import { ThemedDialog } from "./ThemedDialog";
import { ColorPicker } from "./ColorPicker";
import { IconPicker } from "./IconPicker";
import { DeleteIconButton, CancelButton, PrimaryButton } from "./ActionButtons";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { editFastLink, deleteFastLink, resetFastLinkIcon } from "../store/fastLinksSlice";
import { FastLink as FastLinkType } from "../entities/list/list.types";
import { createFastLinkColorFromAccent, isValidHexColor } from "../utils/colorUtils";
import { useTranslation } from "../locales";
import { nanoid } from "nanoid";

interface EditFastLinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fastLink: FastLinkType;
}

export const EditFastLinkDialog: React.FC<EditFastLinkDialogProps> = ({
  open,
  onOpenChange,
  fastLink
}) => {
  const dispatch = useAppDispatch();
  const { fastLinks: fastLinksSettings, radixTheme } = useAppSelector((state) => state.theme);
  const { t } = useTranslation();
  
  const [title, setTitle] = React.useState(fastLink.title);
  const [url, setUrl] = React.useState(fastLink.url);
  const [customTextColor, setCustomTextColor] = React.useState(fastLink.customTextColor || "");
  const [customBackdropColor, setCustomBackdropColor] = React.useState(fastLink.customBackdropColor || "");
  const [customIconBackgroundColor, setCustomIconBackgroundColor] = React.useState(fastLink.customIconBackgroundColor || "");
  const [iconId, setIconId] = React.useState(fastLink.iconId || "");
  const [iconType, setIconType] = React.useState<'standard' | 'custom' | 'pack' | 'favicon'>(fastLink.iconType || 'favicon');
  const [iconColor, setIconColor] = React.useState(fastLink.iconColor || "");

  // Обновляем состояние при изменении fastLink
  React.useEffect(() => {
    setTitle(fastLink.title);
    setUrl(fastLink.url);
    setCustomTextColor(fastLink.customTextColor || "");
    setCustomBackdropColor(fastLink.customBackdropColor || "");
    setCustomIconBackgroundColor(fastLink.customIconBackgroundColor || "");
    setIconId(fastLink.iconId || "");
    setIconType(fastLink.iconType || 'favicon');
    setIconColor(fastLink.iconColor || "");
  }, [fastLink]);

  const handleSubmit = (e: React.FormEvent) => {
    console.log("submit")
    e.preventDefault();
    if (title.trim() && url.trim()) {
      // Если URL изменился и нет пользовательской иконки, скачиваем новый favicon
      if (url.trim() !== fastLink.url && (!iconId || iconType === 'favicon')) {
        const newIconId = nanoid();
        const port = chrome?.runtime?.connect({ name: 'icon-manager' });
        if (port) {
          port.postMessage({
            type: 'DOWNLOAD_FAVICON',
            url: url.trim(),
            iconId: newIconId
          });
          
          port.onMessage.addListener((response) => {
            if (response.success) {
              dispatch(editFastLink({
                id: fastLink.id,
                title: title.trim(),
                url: url.trim(),
                customTextColor: customTextColor || undefined,
                customBackdropColor: customBackdropColor || undefined,
                customIconBackgroundColor: customIconBackgroundColor || undefined,
                iconId: newIconId,
                iconType: 'custom',
                iconColor: iconColor || undefined
              }));
            } else {
              dispatch(editFastLink({
                id: fastLink.id,
                title: title.trim(),
                url: url.trim(),
                customTextColor: customTextColor || undefined,
                customBackdropColor: customBackdropColor || undefined,
                customIconBackgroundColor: customIconBackgroundColor || undefined,
                iconId: iconId || undefined,
                iconType: iconType,
                iconColor: iconColor || undefined
              }));
            }
            port.disconnect();
          });
        }
      } else {
        dispatch(editFastLink({
          id: fastLink.id,
          title: title.trim(),
          url: url.trim(),
          customTextColor: customTextColor || undefined,
          customBackdropColor: customBackdropColor || undefined,
          customIconBackgroundColor: customIconBackgroundColor || undefined,
          iconId: iconId || undefined,
          iconType: iconType,
          iconColor: iconColor || undefined
        }));
      }
      onOpenChange(false);
    }
  };

  const handleDelete = () => {
    dispatch(deleteFastLink(fastLink.id));
    onOpenChange(false);
  };

  const handleResetTextColor = () => {
    setCustomTextColor("");
  };

  const handleResetBackdropColor = () => {
    setCustomBackdropColor("");
  };

  const handleResetIconBackgroundColor = () => {
    setCustomIconBackgroundColor("");
  };

  const handleIconChange = (newIconId: string | null, newIconType: 'standard' | 'custom' | null) => {
    if (newIconId && newIconType) {
      setIconId(newIconId);
      setIconType(newIconType);
    } else {
      setIconId("");
      setIconType('favicon');
    }
  };

  const handleResetIcon = () => {
    setIconId("");
    setIconType('favicon');
  };

  const handleClose = () => {
    setTitle(fastLink.title);
    setUrl(fastLink.url);
    setCustomTextColor(fastLink.customTextColor || "");
    setCustomBackdropColor(fastLink.customBackdropColor || "");
    setCustomIconBackgroundColor(fastLink.customIconBackgroundColor || "");
    setIconId(fastLink.iconId || "");
    setIconType(fastLink.iconType || 'favicon');
    setIconColor(fastLink.iconColor || "");
    onOpenChange(false);
  };

  return (
    <ThemedDialog
      open={open}
      onOpenChange={onOpenChange}
      ariaLabel={t('fastLinks.editFastLink')}
      ariaDescribedBy="edit-fast-link-desc"
      title={<Text as="div" size="5" weight="bold" mb="2">{t('fastLinks.editFastLink')}</Text>}
      contentClassName="edit-fast-link-dialog-content"
    >
      <Box
        id="edit-fast-link-dialog"
        position="fixed"
        left="50%"
        top="50%"
        p="4"
        style={{
          borderRadius: 24,
          transform: "translate(-50%, -50%)",
          background: "#fff",
          boxShadow: "0 10px 40px 0 rgba(0,0,0,0.25)",
          minWidth: 400,
          maxWidth: 500,
          zIndex: 1010,
        }}
      >
        <form onSubmit={handleSubmit} aria-describedby="edit-fast-link-desc">
          <Flex direction="column" gap="4">
            <label>
              <Text as="div" size="2" mb="1" weight="medium">{t('lists.title')}</Text>
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
              <Text as="div" size="2" mb="1" weight="medium">{t('common.url')}</Text>
              <TextField.Root
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder={t('common.urlPlaceholder')}
                color="gray"
                required
                type="url"
              />
            </label>

            {/* Настройки цветов */}
            <Box>
              <Text as="div" size="3" weight="medium" mb="3">{t('settings.colors')}</Text>
              
              <Flex direction="column" gap="3">
                <ColorPicker
                  label={t('settings.textColor')}
                  value={customTextColor || fastLinksSettings.globalTextColor || (isValidHexColor(radixTheme) ? createFastLinkColorFromAccent(radixTheme) : '#FFFFFF')}
                  onChange={setCustomTextColor}
                  onReset={handleResetTextColor}
                  showReset={!!customTextColor}
                  disableAlpha={false}
                />

                <ColorPicker
                  label={t('settings.backdropColor')}
                  value={customBackdropColor || fastLinksSettings.globalBackdropColor || radixTheme}
                  onChange={setCustomBackdropColor}
                  onReset={handleResetBackdropColor}
                  showReset={!!customBackdropColor}
                  disableAlpha={false}
                />

                <ColorPicker
                  label={t('settings.iconBackgroundColor')}
                  value={customIconBackgroundColor || fastLinksSettings.globalIconBackgroundColor || '#FFFFFF'}
                  onChange={setCustomIconBackgroundColor}
                  onReset={handleResetIconBackgroundColor}
                  showReset={!!customIconBackgroundColor}
                  disableAlpha={false}
                />
              </Flex>
            </Box>

            <IconPicker
              label={t('settings.icon')}
              iconId={iconId || undefined}
              iconType={iconType === 'favicon' ? undefined : iconType as 'standard' | 'custom'}
              onIconChange={handleIconChange}
              onReset={handleResetIcon}
              showReset={!!(iconId && iconType !== 'favicon')}
            />
            
            {iconId && (
              <ColorPicker
                label={t('settings.iconColor')}
                value={iconColor || fastLinksSettings.globalIconColor || radixTheme}
                onChange={setIconColor}
                onReset={() => setIconColor('')}
                showReset={!!iconColor}
                disableAlpha={false}
              />
            )}

            <Flex gap="3" justify="between" mt="2">
              <DeleteIconButton
                onClick={handleDelete}
                aria-label={t('fastLinks.deleteFastLink')}
              />

              <Flex gap="3">
                <CancelButton onClick={handleClose}>
                  {t('common.cancel')}
                </CancelButton>
                <PrimaryButton
                  type="submit"
                  disabled={!title.trim() || !url.trim()}
                >
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