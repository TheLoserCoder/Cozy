import * as React from "react";
import { TextField, Flex, Text, Box } from "@radix-ui/themes";
import { ThemedDialog } from "./ThemedDialog";
import { ColorPicker } from "./ColorPicker";
import { DeleteIconButton, CancelButton, PrimaryButton } from "./ActionButtons";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { editFastLink, deleteFastLink } from "../store/fastLinksSlice";
import { FastLink as FastLinkType } from "../entities/list/list.types";
import { createFastLinkColorFromAccent, isValidHexColor } from "../utils/colorUtils";
import { useTranslation } from "../locales";

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

  // Обновляем состояние при изменении fastLink
  React.useEffect(() => {
    setTitle(fastLink.title);
    setUrl(fastLink.url);
    setCustomTextColor(fastLink.customTextColor || "");
    setCustomBackdropColor(fastLink.customBackdropColor || "");
    setCustomIconBackgroundColor(fastLink.customIconBackgroundColor || "");
  }, [fastLink]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && url.trim()) {
      dispatch(editFastLink({
        id: fastLink.id,
        title: title.trim(),
        url: url.trim(),
        customTextColor: customTextColor || undefined,
        customBackdropColor: customBackdropColor || undefined,
        customIconBackgroundColor: customIconBackgroundColor || undefined,
      }));
      onOpenChange(false);
    }
  };

  const handleDelete = () => {
    dispatch(deleteFastLink(fastLink.id));
    onOpenChange(false);
  };

  const handleResetTextColor = () => {
    // Сбрасываем индивидуальный цвет, чтобы использовался глобальный или дефолтный
    setCustomTextColor("");
    dispatch(editFastLink({
      id: fastLink.id,
      customTextColor: "",
    }));
  };

  const handleResetBackdropColor = () => {
    // Сбрасываем индивидуальный цвет задника, чтобы использовался глобальный или акцентный
    setCustomBackdropColor("");
    dispatch(editFastLink({
      id: fastLink.id,
      customBackdropColor: "",
    }));
  };

  const handleResetIconBackgroundColor = () => {
    // Сбрасываем индивидуальный цвет фона иконки, чтобы использовался глобальный или белый
    setCustomIconBackgroundColor("");
    dispatch(editFastLink({
      id: fastLink.id,
      customIconBackgroundColor: "",
    }));
  };

  const handleClose = () => {
    // Сбрасываем состояние к исходным значениям
    setTitle(fastLink.title);
    setUrl(fastLink.url);
    setCustomTextColor(fastLink.customTextColor || "");
    setCustomBackdropColor(fastLink.customBackdropColor || "");
    setCustomIconBackgroundColor(fastLink.customIconBackgroundColor || "");
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
              <Text as="div" size="2" mb="1" weight="medium">URL</Text>
              <TextField.Root
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder="https://example.com"
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
