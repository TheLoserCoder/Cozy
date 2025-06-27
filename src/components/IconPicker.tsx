import * as React from "react";
import { Box, Flex, Text, IconButton, ScrollArea } from "@radix-ui/themes";
import { UpdateIcon } from "@radix-ui/react-icons";
import { ActionIconButton } from "./ActionButtons";
import * as RadixIcons from "@radix-ui/react-icons";
import { createPortal } from "react-dom";

// Список популярных иконок для списков
const AVAILABLE_ICONS = [
  // Общие
  'StarIcon',
  'HeartIcon',
  'BookmarkIcon',
  'HomeIcon',
  'PersonIcon',
  'GearIcon',
  
  // Работа и учеба
  'BackpackIcon',
  'ReaderIcon',
  'FileTextIcon',
  'CalendarIcon',
  'ClockIcon',
  'TargetIcon',
  
  // Развлечения
  'VideoIcon',
  'MusicIcon',
  'CameraIcon',
  'GameController2Icon',
  'MagicWandIcon',
  'RocketIcon',
  
  // Интернет и технологии
  'GlobeIcon',
  'CodeIcon',
  'GitHubLogoIcon',
  'LinkedInLogoIcon',
  'TwitterLogoIcon',
  'DiscordLogoIcon',
  
  // Покупки и финансы
  'ShoppingCartIcon',
  'CurrencyDollarIcon',
  'CardStackIcon',
  'BarChartIcon',
  
  // Здоровье и спорт
  'ActivityLogIcon',
  'HeartFilledIcon',
  'LightningBoltIcon',
  'SunIcon',
  
  // Путешествия
  'CarIcon',
  'PlaneIcon',
  'MapIcon',
  'CameraIcon',
  
  // Еда
  'CookieIcon',
  'CupIcon',
  
  // Коммуникация
  'ChatBubbleIcon',
  'EnvelopeClosedIcon',
  'MobileIcon',
  'SpeakerLoudIcon',
  
  // Инструменты
  'HammerIcon',
  'MagnifyingGlassIcon',
  'PencilIcon',
  'ScissorsIcon',
  'RulerHorizontalIcon',
  
  // Природа
  'TreePineIcon',
  'FlameIcon',
  'DropIcon',
  'SnowflakeIcon',
  
  // Символы
  'PlusIcon',
  'MinusIcon',
  'CrossIcon',
  'CheckIcon',
  'QuestionMarkIcon',
  'ExclamationTriangleIcon',
  'InfoCircledIcon',
  'LockClosedIcon',
  'EyeOpenIcon',
  'EyeClosedIcon',
  
  // Направления
  'ArrowUpIcon',
  'ArrowDownIcon',
  'ArrowLeftIcon',
  'ArrowRightIcon',
  'TriangleUpIcon',
  'TriangleDownIcon',
  
  // Медиа
  'PlayIcon',
  'PauseIcon',
  'StopIcon',
  'TrackNextIcon',
  'TrackPreviousIcon',
  'SpeakerOffIcon',
  
  // Файлы
  'FileIcon',
  'FolderIcon',
  'ArchiveIcon',
  'DownloadIcon',
  'UploadIcon',
  'Share1Icon',
  
  // Дизайн
  'ColorWheelIcon',
  'BlendingModeIcon',
  'OpacityIcon',
  'BorderAllIcon',
  'CropIcon',
  'RotateCounterClockwiseIcon',
  
  // Дополнительные
  'DashboardIcon',
  'GridIcon',
  'ListBulletIcon',
  'TableIcon',
  'LayersIcon',
  'ComponentIcon',
  'TokensIcon',
  'BadgeIcon',
  'AvatarIcon',
  'IdCardIcon',
  'AccessibilityIcon',
  'GiftIcon',
  'BellIcon',
  'TimerIcon',
  'StopwatchIcon',
  'CountdownTimerIcon',
  'LoopIcon',
  'ShuffleIcon',
  'UpdateIcon',
  'ReloadIcon',
  'ExitIcon',
  'EnterIcon',
  'ExternalLinkIcon',
  'Link1Icon',
  'ChainIcon',
  'UnlinkIcon',
  'PinLeftIcon',
  'PinRightIcon',
  'PinTopIcon',
  'PinBottomIcon',
  'DrawingPinIcon',
  'DrawingPinFilledIcon',
  'SewingPinIcon',
  'SewingPinFilledIcon',
  'RadiobuttonIcon',
  'CheckboxIcon',
  'SwitchIcon',
  'SliderIcon',
  'InputIcon',
  'TextAlignLeftIcon',
  'TextAlignCenterIcon',
  'TextAlignRightIcon',
  'TextAlignJustifyIcon',
  'FontBoldIcon',
  'FontItalicIcon',
  'UnderlineIcon',
  'StrikethroughIcon',
  'LetterCaseCapitalizeIcon',
  'LetterCaseLowercaseIcon',
  'LetterCaseUppercaseIcon',
  'LetterCaseToggleIcon',
  'LineHeightIcon',
  'LetterSpacingIcon',
  'FontSizeIcon',
  'FontFamilyIcon',
  'FontStyleIcon',
  'AlignLeftIcon',
  'AlignCenterHorizontallyIcon',
  'AlignRightIcon',
  'AlignTopIcon',
  'AlignCenterVerticallyIcon',
  'AlignBottomIcon',
  'StretchHorizontallyIcon',
  'StretchVerticallyIcon',
  'SizeIcon',
  'AllSidesIcon',
  'WidthIcon',
  'HeightIcon',
  'SquareIcon',
  'BoxIcon',
  'ContainerIcon',
  'SectionIcon',
  'ColumnIcon',
  'RowIcon',
  'StackIcon',
  'SpaceEvenlyHorizontallyIcon',
  'SpaceEvenlyVerticallyIcon',
  'SpaceBetweenHorizontallyIcon',
  'SpaceBetweenVerticallyIcon',
  'PaddingIcon',
  'MarginIcon',
  'BorderWidthIcon',
  'BorderRadiusIcon',
  'BorderStyleIcon',
  'BorderSolidIcon',
  'BorderDashedIcon',
  'BorderDottedIcon',
  'BorderNoneIcon',
  'CornerTopLeftIcon',
  'CornerTopRightIcon',
  'CornerBottomLeftIcon',
  'CornerBottomRightIcon',
  'CornersIcon',
  'AngleIcon',
  'RulerSquareIcon',
  'DimensionsIcon',
  'AspectRatioIcon',
  'ViewHorizontalIcon',
  'ViewVerticalIcon',
  'ViewGridIcon',
  'ViewNoneIcon',
  'ZoomInIcon',
  'ZoomOutIcon',
  'TransformIcon',
  'RotateClockwiseIcon',
  'FlipHorizontalIcon',
  'FlipVerticalIcon',
  'MoveIcon',
  'DragHandleDots1Icon',
  'DragHandleDots2Icon',
  'DragHandleHorizontalIcon',
  'DragHandleVerticalIcon',
  'HandIcon',
  'CursorArrowIcon',
  'CursorTextIcon',
  'CrosshairIcon',
  'DotsHorizontalIcon',
  'DotsVerticalIcon',
  'HamburgerMenuIcon',
  'MixerHorizontalIcon',
  'MixerVerticalIcon',
  'SlashIcon',
  'BackslashIcon',
  'DividerHorizontalIcon',
  'DividerVerticalIcon',
  'ValueIcon',
  'ValueNoneIcon',
  'CommitIcon',
  'PullRequestIcon',
  'BranchIcon',
  'MergeIcon',
  'ForkIcon',
  'IssueOpenedIcon',
  'IssueClosedIcon',
  'PullRequestClosedIcon',
  'PullRequestDraftIcon',
  'GitHubIcon',
  'VercelLogoIcon',
  'NotionLogoIcon',
  'FigmaLogoIcon',
  'FramerLogoIcon',
  'SketchLogoIcon',
  'InstagramLogoIcon',
  'ModulzLogoIcon',
  'StitchesLogoIcon',
  'CodeSandboxLogoIcon',
  'CodesandboxLogoIcon'
] as const;

interface IconPickerProps {
  value?: string;
  onChange: (iconName: string | undefined) => void;
  onReset?: () => void;
  label?: string;
  showReset?: boolean;
  disabled?: boolean;
}

export const IconPicker: React.FC<IconPickerProps> = ({
  value,
  onChange,
  onReset,
  label,
  showReset = false,
  disabled = false
}) => {
  const [showPicker, setShowPicker] = React.useState(false);
  const [pickerPosition, setPickerPosition] = React.useState({ top: 0, left: 0 });
  const triggerRef = React.useRef<HTMLDivElement>(null);

  const calculatePosition = () => {
    if (!triggerRef.current) return { top: 0, left: 0 };

    const rect = triggerRef.current.getBoundingClientRect();
    const pickerHeight = 380;
    const pickerWidth = 320;
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    const margin = 8;

    // Начальная позиция - под триггером, центрированная
    let top = rect.bottom + margin;
    let left = rect.left + (rect.width / 2) - (pickerWidth / 2);

    // Проверяем, помещается ли пикер снизу
    if (top + pickerHeight > viewportHeight - margin) {
      // Если не помещается снизу, размещаем сверху
      top = rect.top - pickerHeight - margin;
    }

    // Проверяем горизонтальные границы
    if (left + pickerWidth > viewportWidth - margin) {
      left = viewportWidth - pickerWidth - margin;
    }

    if (left < margin) {
      left = margin;
    }

    // Если все еще не помещается сверху, размещаем в видимой области
    if (top < margin) {
      top = margin;
    }

    return { top, left };
  };

  const handleTriggerClick = () => {
    if (!showPicker) {
      const position = calculatePosition();
      setPickerPosition(position);
    }
    setShowPicker(!showPicker);
  };

  // Обновление позиции при изменении размера окна или прокрутке
  React.useEffect(() => {
    if (!showPicker) return;

    const updatePosition = () => {
      const position = calculatePosition();
      setPickerPosition(position);
    };

    const handleResize = () => updatePosition();
    const handleScroll = () => updatePosition();

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll, true);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [showPicker]);

  // Закрытие при клике вне компонента
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showPicker && triggerRef.current && !triggerRef.current.contains(event.target as Node)) {
        const pickerElement = document.querySelector('.icon-picker');
        if (pickerElement && !pickerElement.contains(event.target as Node)) {
          setShowPicker(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPicker]);

  const handleIconSelect = (iconName: string) => {
    onChange(iconName);
    setShowPicker(false);
  };

  const handleReset = () => {
    onChange(undefined);
    onReset?.();
    setShowPicker(false);
  };

  // Получаем компонент иконки
  const IconComponent = value ? (RadixIcons as any)[value] : null;

  return (
    <Box style={{ position: "relative" }}>
      <Flex align="center" justify="between" gap="3" style={{ opacity: disabled ? 0.5 : 1 }}>
        {label && (
          <Text size="2" weight="medium" as="div" style={{ flex: 1 }}>
            {label}
          </Text>
        )}

        <Flex align="center" gap="2">
          <Box
            ref={triggerRef}
            onClick={disabled ? undefined : handleTriggerClick}
            style={{
              width: "32px",
              height: "32px",
              border: "2px solid var(--gray-6)",
              borderRadius: "50%",
              cursor: disabled ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "var(--gray-1)"
            }}
          >
            {IconComponent ? (
              <IconComponent style={{ width: 16, height: 16 }} />
            ) : (
              <Text size="1" style={{ color: "var(--gray-9)" }}>
                ?
              </Text>
            )}
          </Box>

          {showReset && (
            <ActionIconButton
              variant="soft"
              size="1"
              onClick={handleReset}
              aria-label="Сбросить иконку"
            >
              <UpdateIcon />
            </ActionIconButton>
          )}
        </Flex>
      </Flex>

      {showPicker && createPortal(
        <Box
          className="icon-picker"
          style={{
            position: "fixed",
            top: pickerPosition.top,
            left: pickerPosition.left,
            zIndex: 2147483649,
            backgroundColor: "white",
            border: "1px solid var(--gray-6)",
            borderRadius: "8px",
            boxShadow: "0 10px 40px 0 rgba(0,0,0,0.25)",
            padding: "12px",
            width: "320px",
            maxHeight: "380px",
            pointerEvents: "auto"
          }}
        >
          <ScrollArea style={{ height: "356px" }}>
            <Flex wrap="wrap" gap="2" justify="center" align="center">
              {AVAILABLE_ICONS.map((iconName) => {
                const Icon = (RadixIcons as any)[iconName];
                if (!Icon) return null;

                return (
                  <IconButton
                    key={iconName}
                    variant={value === iconName ? "solid" : "soft"}
                    size="2"
                    onClick={() => handleIconSelect(iconName)}
                    style={{
                      width: "36px",
                      height: "36px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                  >
                    <Icon style={{ width: 18, height: 18 }} />
                  </IconButton>
                );
              })}
            </Flex>
          </ScrollArea>
        </Box>,
        document.body
      )}
    </Box>
  );
};
