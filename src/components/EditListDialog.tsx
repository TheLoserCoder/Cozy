import * as React from "react";
import { TextField, Flex, Text, Box } from "@radix-ui/themes";
import { ThemedDialog } from "./ThemedDialog";
import { ColorPicker } from "./ColorPicker";
import { IconPicker } from "./IconPicker";
import { DeleteIconButton, CancelButton, PrimaryButton } from "./ActionButtons";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setListColor, setListSeparatorColor, setListLinkColor, setListBorderColor, setListIcon, setListIconColor } from "../store/listsSlice";
import { useTranslation } from "../locales";

interface EditListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialTitle: string;
  listId: string;
  initialColor?: string;
  initialSeparatorColor?: string;
  initialLinkColor?: string;
  initialBorderColor?: string;
  initialIcon?: string;
  initialIconColor?: string;
  onSubmit: (title: string) => void;
  onDelete?: () => void;
}

export const EditListDialog: React.FC<EditListDialogProps> = ({
  open,
  onOpenChange,
  initialTitle,
  listId,
  initialColor,
  initialSeparatorColor,
  initialLinkColor,
  initialBorderColor,
  initialIcon,
  initialIconColor,
  onSubmit,
  onDelete
}) => {
  const dispatch = useAppDispatch();
  const { lists, radixTheme } = useAppSelector((state) => state.theme);
  const { t } = useTranslation();
  const [title, setTitle] = React.useState(initialTitle);
  const [customColor, setCustomColor] = React.useState(initialColor || "");
  const [customSeparatorColor, setCustomSeparatorColor] = React.useState(initialSeparatorColor || "");
  const [customLinkColor, setCustomLinkColor] = React.useState(initialLinkColor || "");
  const [customBorderColor, setCustomBorderColor] = React.useState(initialBorderColor || "");
  const [icon, setIcon] = React.useState(initialIcon || "");
  const [iconId, setIconId] = React.useState<string | null>(null);
  const [iconType, setIconType] = React.useState<'standard' | 'custom' | null>(null);
  const [iconColor, setIconColor] = React.useState(initialIconColor || "");

  React.useEffect(() => {
    setTitle(initialTitle);
    setCustomColor(initialColor || "");
    setCustomSeparatorColor(initialSeparatorColor || "");
    setCustomLinkColor(initialLinkColor || "");
    setCustomBorderColor(initialBorderColor || "");
    setIcon(initialIcon || "");
    setIconColor(initialIconColor || "");
    
    if (open && listId) {
      const allLists = JSON.parse(localStorage.getItem('lists') || '[]');
      const list = allLists.find((l: any) => l.id === listId);
      if (list) {
        setIconId(list.iconId || null);
        setIconType(list.iconType || null);
      }
    }
  }, [initialTitle, initialColor, initialSeparatorColor, initialLinkColor, initialBorderColor, initialIcon, initialIconColor, open, listId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      // Применяем все изменения при сохранении
      dispatch(setListColor({ id: listId, color: customColor || undefined }));
      dispatch(setListSeparatorColor({ id: listId, color: customSeparatorColor || undefined }));
      dispatch(setListLinkColor({ id: listId, color: customLinkColor || undefined }));
      dispatch(setListBorderColor({ id: listId, color: customBorderColor || undefined }));
      dispatch(setListIcon({ id: listId, icon: icon || undefined, iconId: iconId || undefined, iconType: iconType || undefined }));
      dispatch(setListIconColor({ id: listId, color: iconColor || undefined }));

      onSubmit(title.trim());
      onOpenChange(false);
    }
  };

  const handleClose = () => {
    setTitle(initialTitle);
    setCustomColor(initialColor || "");
    setCustomSeparatorColor(initialSeparatorColor || "");
    setCustomLinkColor(initialLinkColor || "");
    setCustomBorderColor(initialBorderColor || "");
    setIcon(initialIcon || "");
    setIconColor(initialIconColor || "");
    onOpenChange(false);
  };

  const handleDelete = () => {
    if (onDelete && confirm(t('errors.deleteListConfirm'))) {
      onDelete();
      onOpenChange(false);
    }
  };

  const handleColorChange = (color: string) => {
    setCustomColor(color);
  };

  const handleColorReset = () => {
    setCustomColor("");
  };

  const handleSeparatorColorChange = (color: string) => {
    setCustomSeparatorColor(color);
  };

  const handleSeparatorColorReset = () => {
    setCustomSeparatorColor("");
  };

  const handleLinkColorChange = (color: string) => {
    setCustomLinkColor(color);
  };

  const handleLinkColorReset = () => {
    setCustomLinkColor("");
  };

  const handleBorderColorChange = (color: string) => {
    setCustomBorderColor(color);
  };

  const handleBorderColorReset = () => {
    setCustomBorderColor("");
  };

  const handleIconChange = (iconName: string | undefined) => {
    setIcon(iconName || "");
  };

  const handleIconIdChange = (iconId: string | null, iconType: 'standard' | 'custom' | null) => {
    setIconId(iconId);
    setIconType(iconType);
    if (iconId) {
      setIcon(""); // Очищаем старую иконку
    }
  };

  const handleIconReset = () => {
    setIcon("");
    setIconId(null);
    setIconType(null);
  };

  const handleIconColorChange = (color: string) => {
    setIconColor(color);
  };

  const handleIconColorReset = () => {
    setIconColor("");
  };

  return (
    <ThemedDialog
      open={open}
      onOpenChange={onOpenChange}
      ariaLabel={t('lists.editList')}
      ariaDescribedBy="edit-list-desc"
      title={<Text as="div" size="5" weight="bold" mb="2">{t('lists.editList')}</Text>}
      contentClassName="edit-list-dialog-content"
    >
      <Box
        id="edit-list-dialog"
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
        <form onSubmit={handleSubmit} aria-describedby="edit-list-desc">
          <Flex direction="column" gap="4">
            <label>
              <Text as="div" size="2" mb="1" weight="medium">{t('lists.title')}</Text>
              <TextField.Root
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder={t('lists.listName')}
                color="gray"
                required
                autoFocus
              />
            </label>

            <ColorPicker
              label={t('settings.titleColor')}
              value={customColor || lists.titleColor || radixTheme}
              onChange={handleColorChange}
              onReset={handleColorReset}
              showReset={!!customColor}
              disableAlpha={false}
            />

            <ColorPicker
              label={t('settings.separatorColor')}
              value={customSeparatorColor || lists.separatorColor || radixTheme}
              onChange={handleSeparatorColorChange}
              onReset={handleSeparatorColorReset}
              showReset={!!customSeparatorColor}
              disableAlpha={false}
            />

            <ColorPicker
              label={t('lists.linkColor')}
              value={customLinkColor || lists.linkColor || `color-mix(in srgb, ${radixTheme} 70%, var(--gray-12) 30%)`}
              onChange={handleLinkColorChange}
              onReset={handleLinkColorReset}
              showReset={!!customLinkColor}
              disableAlpha={false}
            />

            <ColorPicker
              label={t('settings.borderColor')}
              value={customBorderColor || lists.borderColor || radixTheme}
              onChange={handleBorderColorChange}
              onReset={handleBorderColorReset}
              showReset={!!customBorderColor}
              disableAlpha={false}
            />

            <IconPicker
              label={t('lists.listIcon')}
              iconId={iconId || undefined}
              iconType={iconType || undefined}
              onIconChange={handleIconIdChange}
              onReset={handleIconReset}
              showReset={!!(icon || iconId)}
            />

            {(icon || iconId) && (
              <ColorPicker
                label={t('lists.iconColor')}
                value={iconColor || customColor || lists.titleColor || radixTheme}
                onChange={handleIconColorChange}
                onReset={handleIconColorReset}
                showReset={!!iconColor}
                disableAlpha={false}
              />
            )}

            <Flex gap="3" justify="between" mt="2">
              {onDelete && (
                <DeleteIconButton onClick={handleDelete} aria-label={t('lists.deleteList')} />
              )}
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
