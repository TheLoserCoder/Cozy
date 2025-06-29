import * as React from "react";
import { Box, Flex, Text, IconButton, ScrollArea } from "@radix-ui/themes";
import { UpdateIcon } from "@radix-ui/react-icons";
import { ActionIconButton } from "./ActionButtons";
import * as RadixIcons from "@radix-ui/react-icons";
import { createPortal } from "react-dom";
import { useTranslation } from "../locales";

// Список популярных иконок для списков
const AVAILABLE_ICONS = [
  // Общие и избранное
  'StarIcon',
  'StarFilledIcon',
  'HeartIcon',
  'HeartFilledIcon',
  'BookmarkIcon',
  'BookmarkFilledIcon',
  'HomeIcon',
  'PersonIcon',
  'GearIcon',
  'MagicWandIcon',

  // Работа и учеба
  'BackpackIcon',
  'ReaderIcon',
  'FileTextIcon',
  'FileIcon',
  'CalendarIcon',
  'ClockIcon',
  'TargetIcon',
  'PencilIcon',
  'NotebookIcon',
  'ArchiveIcon',
  'FolderIcon',
  'FolderOpenIcon',

  // Повседневная жизнь
  'CoffeeIcon',
  'FoodIcon',
  'ShoppingBagIcon',
  'ShoppingCartIcon',
  'GiftIcon',
  'CameraIcon',
  'ImageIcon',
  'ChatBubbleIcon',
  'EnvelopeClosedIcon',
  'BellIcon',
  'CheckIcon',
  'CrossIcon',
  'PlusIcon',
  'MinusIcon',

  // Интернет и технологии
  'GlobeIcon',
  'CodeIcon',
  'DesktopIcon',
  'MobileIcon',
  'LaptopIcon',
  'KeyboardIcon',
  'GitHubLogoIcon',
  'LinkedInLogoIcon',
  'TwitterLogoIcon',
  'DiscordLogoIcon',
  'InstagramLogoIcon',

  // Финансы и покупки
  'CurrencyDollarIcon',
  'CardStackIcon',
  'BarChartIcon',
  'PieChartIcon',
  'TrendingUpIcon',
  'CreditCardIcon',

  // Здоровье и спорт
  'ActivityLogIcon',
  'LightningBoltIcon',
  'SunIcon',
  'MoonIcon',
  'TimerIcon',
  'StopwatchIcon',
  'HeartPulseIcon',

  // Путешествия и транспорт
  'CarIcon',
  'PlaneIcon',
  'MapIcon',
  'CompassIcon',
  'RoadIcon',
  'TrainIcon',
  
  // Еда и напитки
  'CookieIcon',
  'CupIcon',

  // Инструменты и утилиты
  'HammerIcon',
  'MagnifyingGlassIcon',
  'ScissorsIcon',
  'RulerHorizontalIcon',
  'WrenchIcon',
  'SewingPinIcon',
  'PaperPlaneIcon',
  'RocketIcon',

  // Природа и погода
  'TreePineIcon',
  'FlameIcon',
  'DropIcon',
  'SnowflakeIcon',
  'CloudIcon',
  'ThunderIcon',

  // Символы и статусы
  'QuestionMarkIcon',
  'ExclamationTriangleIcon',
  'InfoCircledIcon',
  'LockClosedIcon',
  'LockOpen1Icon',
  'EyeOpenIcon',
  'EyeClosedIcon',
  'ShieldIcon',
  'BadgeIcon',

  // Направления и навигация
  'ArrowUpIcon',
  'ArrowDownIcon',
  'ArrowLeftIcon',
  'ArrowRightIcon',
  'TriangleUpIcon',
  'TriangleDownIcon',
  'DoubleArrowUpIcon',
  'DoubleArrowDownIcon',

  // Организация и планирование
  'ListBulletIcon',
  'TableIcon',
  'GridIcon',
  'LayoutIcon',
  'DashboardIcon',
  'ViewGridIcon',
  
  // Файлы и документы
  'FileIcon',
  'FileTextIcon',
  'FilePlusIcon',
  'FolderIcon',
  'FolderOpenIcon',
  'FolderPlusIcon',
  'ArchiveIcon',
  'DownloadIcon',
  'UploadIcon',
  'Share1Icon',
  'Share2Icon',
  'CopyIcon',
  'ClipboardIcon',
  'ClipboardCopyIcon',
  'DocumentIcon',
  'ReaderIcon',
  'BookOpenIcon',
  'BookmarkIcon',
  'BookmarkFilledIcon',

  // Дизайн и творчество
  'ColorWheelIcon',
  'PaletteIcon',
  'BrushIcon',
  'PencilIcon',
  'Pencil1Icon',
  'Pencil2Icon',
  'EraserIcon',
  'CropIcon',
  'FrameIcon',
  'AspectRatioIcon',
  'TransformIcon',
  'RotateCounterClockwiseIcon',
  'MoveIcon',
  'DragHandleDots2Icon',

  // Медиа и развлечения
  'VideoIcon',
  'CameraIcon',
  'ImageIcon',
  'MusicIcon',
  'SpeakerLoudIcon',
  'SpeakerModerateIcon',
  'SpeakerQuietIcon',
  'SpeakerOffIcon',
  'HeadphonesIcon',
  'MicrophoneIcon',
  'RadioIcon',
  'TvIcon',
  'DesktopIcon',
  'TabletIcon',
  'MobileIcon',

  // Социальные сети и коммуникации
  'ChatBubbleIcon',
  'EnvelopeClosedIcon',
  'EnvelopeOpenIcon',
  'PaperPlaneIcon',
  'PersonIcon',
  'AvatarIcon',
  'FaceIcon',
  'GroupIcon',
  'IdCardIcon',
  'BadgeIcon',
  'HandIcon',
  'ThumbsUpIcon',

  // Покупки и бизнес
  'ShoppingBagIcon',
  'ShoppingCartIcon',
  'StoreIcon',
  'CreditCardIcon',
  'WalletIcon',
  'ReceiptIcon',
  'InvoiceIcon',
  'CurrencyDollarIcon',
  'CoinIcon',
  'BankNoteIcon',
  'TrendingUpIcon',
  'TrendingDownIcon',
  'GraphIcon',
  'BarChartIcon',
  'PieChartIcon',
  'LineChartIcon',

  // Образование и наука
  'BackpackIcon',
  'GraduationCapIcon',
  'AcademicCapIcon',
  'BookIcon',
  'NotebookIcon',
  'CalculatorIcon',
  'BeakerIcon',
  'FlaskIcon',
  'MicroscopeIcon',
  'TelescopeIcon',
  'GlobeIcon',
  'AtomIcon',
  'DNAIcon',

  // Здоровье и медицина
  'HeartIcon',
  'HeartFilledIcon',
  'HeartPulseIcon',
  'CrossCircledIcon',
  'PlusCircledIcon',
  'MedicalIcon',
  'PillIcon',
  'ThermometerIcon',
  'StethoscopeIcon',
  'BandageIcon',
  'EyeIcon',
  'EyeOpenIcon',
  'EyeClosedIcon',

  // Спорт и фитнес
  'ActivityLogIcon',
  'RunningIcon',
  'WalkingIcon',
  'BicycleIcon',
  'SwimmingIcon',
  'WeightIcon',
  'TimerIcon',
  'StopwatchIcon',
  'TrophyIcon',
  'MedalIcon',
  'TargetIcon',
  'BullseyeIcon',

  // Путешествия и места
  'PlaneIcon',
  'CarIcon',
  'TrainIcon',
  'BusIcon',
  'BoatIcon',
  'RocketIcon',
  'MapIcon',
  'CompassIcon',
  'RoadIcon',
  'BuildingIcon',
  'HomeIcon',
  'OfficeIcon',
  'HotelIcon',
  'RestaurantIcon',
  'CafeIcon',
  'ShopIcon',
  'HospitalIcon',
  'SchoolIcon',
  'LibraryIcon',
  'MuseumIcon',
  'ParkIcon',
  'BeachIcon',
  'MountainIcon',
  'ForestIcon',

  // Технологии и устройства
  'LaptopIcon',
  'KeyboardIcon',
  'MouseIcon',
  'PrinterIcon',
  'ScannerIcon',
  'RouterIcon',
  'ServerIcon',
  'DatabaseIcon',
  'CloudIcon',
  'WifiIcon',
  'BluetoothIcon',
  'UsbIcon',
  'BatteryIcon',
  'PlugIcon',
  'PowerIcon',
  'SettingsIcon',
  'CodeIcon',
  'TerminalIcon',
  'BugIcon',
  'GitIcon',

  // Еда и кулинария
  'FoodIcon',
  'CoffeeIcon',
  'TeaIcon',
  'CakeIcon',
  'PizzaIcon',
  'BurgerIcon',
  'IceCreamIcon',
  'FruitIcon',
  'VegetableIcon',
  'BreadIcon',
  'ChefHatIcon',
  'KnifeIcon',
  'ForkIcon',
  'SpoonIcon',
  'PlateIcon',
  'CupIcon',
  'GlassIcon',
  'BottleIcon',
  'WineIcon',
  'BeerIcon',

  // Хобби и развлечения
  'GameController2Icon',
  'DiceIcon',
  'PuzzleIcon',
  'ChessIcon',
  'CardsIcon',
  'MagicWandIcon',
  'PaintBrushIcon',
  'YarnIcon',
  'NeedleIcon',
  'GuitarIcon',
  'PianoIcon',
  'DrumIcon',
  'MicIcon',
  'TheaterIcon',
  'CinemaIcon',
  'TicketIcon',
  'PartyIcon',
  'BalloonIcon',
  'FireworksIcon',
  'CelebrationIcon',

  // Погода и природа
  'SunIcon',
  'MoonIcon',
  'CloudIcon',
  'CloudRainIcon',
  'CloudSnowIcon',
  'ThunderIcon',
  'LightningBoltIcon',
  'WindIcon',
  'SnowflakeIcon',
  'UmbrellaIcon',
  'ThermometerIcon',
  'DropIcon',
  'FlameIcon',
  'TreeIcon',
  'TreePineIcon',
  'FlowerIcon',
  'LeafIcon',
  'SeedIcon',
  'BugIcon',
  'ButterflyIcon',
  'BirdIcon',
  'FishIcon',
  'PawIcon',

  // Инструменты и ремонт
  'HammerIcon',
  'WrenchIcon',
  'ScrewdriverIcon',
  'DrillIcon',
  'SawIcon',
  'PlierIcon',
  'MeasureIcon',
  'LevelIcon',
  'ToolboxIcon',
  'NailIcon',
  'ScrewIcon',
  'BoltIcon',
  'NutIcon',
  'GearIcon',
  'CogIcon',
  'EngineIcon',
  'OilIcon',
  'FuelIcon',
  'BatteryIcon',
  'ElectricIcon',

  // Безопасность и защита
  'ShieldIcon',
  'LockClosedIcon',
  'LockOpen1Icon',
  'KeyIcon',
  'PasswordIcon',
  'FingerprintIcon',
  'EyeIcon',
  'EyeClosedIcon',
  'CameraOffIcon',
  'MicOffIcon',
  'WarningIcon',
  'AlertIcon',
  'DangerIcon',
  'EmergencyIcon',
  'FirstAidIcon',
  'FireIcon',
  'ExtinguisherIcon',
  'HelmetIcon',
  'VestIcon',
  'GlovesIcon',

  // Дополнительные общие иконки
  'DotIcon',
  'DotFilledIcon',
  'CircleIcon',
  'SquareIcon',
  'TriangleUpIcon',
  'TriangleDownIcon',
  'TriangleLeftIcon',
  'TriangleRightIcon',
  'DiamondIcon',
  'HeartIcon',
  'SpadeIcon',
  'ClubIcon',
  'StarIcon',
  'CrossIcon',
  'CheckIcon',
  'QuestionMarkIcon',
  'ExclamationTriangleIcon',
  'InfoCircledIcon',
  'BellIcon',
  'BellSlashIcon',

  // Дополнительные файлы и документы
  'FileMinusIcon',
  'FilePlusIcon',
  'FileTextIcon',
  'DocumentIcon',
  'PaperIcon',
  'ScrollIcon',
  'BookIcon',
  'BookOpenIcon',
  'JournalIcon',
  'NewspaperIcon',
  'MagazineIcon',
  'CertificateIcon',
  'DiplomaIcon',
  'ContractIcon',
  'InvoiceIcon',
  'ReceiptIcon',
  'TicketIcon',
  'TagIcon',
  'LabelIcon',
  'StickerIcon',

  // Дополнительные коммуникации
  'PhoneIcon',
  'VideoCallIcon',
  'MessageIcon',
  'CommentIcon',
  'FeedbackIcon',
  'ReviewIcon',
  'RatingIcon',
  'ThumbsUpIcon',
  'ThumbsDownIcon',
  'LikeIcon',
  'DislikeIcon',
  'ShareIcon',
  'ForwardIcon',
  'ReplyIcon',
  'QuoteIcon',
  'MentionIcon',
  'HashtagIcon',
  'AtSignIcon',
  'LinkIcon',
  'ChainIcon',
  'UnlinkIcon',

  // Дополнительные покупки и финансы
  'MoneyIcon',
  'CoinIcon',
  'BankIcon',
  'ATMIcon',
  'PaymentIcon',
  'TransactionIcon',
  'BudgetIcon',
  'SavingsIcon',
  'InvestmentIcon',
  'StockIcon',
  'CryptoIcon',
  'ExchangeIcon',
  'RefundIcon',
  'DiscountIcon',
  'CouponIcon',
  'VoucherIcon',
  'LoyaltyIcon',
  'RewardIcon',
  'CashbackIcon',
  'TaxIcon',

  // Дополнительные образование и наука
  'SchoolIcon',
  'UniversityIcon',
  'LibraryIcon',
  'ClassroomIcon',
  'BlackboardIcon',
  'WhiteboardIcon',
  'PresentationIcon',
  'LectureIcon',
  'SeminarIcon',
  'WorkshopIcon',
  'TrainingIcon',
  'CertificationIcon',
  'ExamIcon',
  'TestIcon',
  'QuizIcon',
  'HomeworkIcon',
  'AssignmentIcon',
  'ProjectIcon',
  'ResearchIcon',
  'ExperimentIcon',

  // Дополнительные здоровье и медицина
  'DoctorIcon',
  'NurseIcon',
  'PatientIcon',
  'AppointmentIcon',
  'CheckupIcon',
  'DiagnosisIcon',
  'TreatmentIcon',
  'SurgeryIcon',
  'TherapyIcon',
  'RehabilitationIcon',
  'VaccineIcon',
  'InjectionIcon',
  'BloodIcon',
  'DNAIcon',
  'XRayIcon',
  'ScanIcon',
  'UltrasoundIcon',
  'ECGIcon',
  'PulseIcon',
  'TemperatureIcon',

  // Дополнительные спорт и фитнес
  'GymIcon',
  'WorkoutIcon',
  'ExerciseIcon',
  'StrengthIcon',
  'CardioIcon',
  'YogaIcon',
  'PilatesIcon',
  'StretchingIcon',
  'MeditationIcon',
  'RelaxationIcon',
  'MassageIcon',
  'SaunaIcon',
  'PoolIcon',
  'TennisIcon',
  'FootballIcon',
  'BasketballIcon',
  'BaseballIcon',
  'SoccerIcon',
  'VolleyballIcon',
  'BadmintonIcon',

  // Дополнительные развлечения и хобби
  'ArtIcon',
  'PaintIcon',
  'DrawIcon',
  'SketchIcon',
  'DesignIcon',
  'CreativeIcon',
  'CraftIcon',
  'SewingIcon',
  'KnittingIcon',
  'EmbroideryIcon',
  'WoodworkingIcon',
  'MetalworkingIcon',
  'PotteryIcon',
  'SculptureIcon',
  'PhotographyIcon',
  'FilmIcon',
  'VideoEditingIcon',
  'AnimationIcon',
  'GraphicsIcon',
  'IllustrationIcon',

  // Дополнительные музыка и аудио
  'SongIcon',
  'PlaylistIcon',
  'AlbumIcon',
  'ArtistIcon',
  'BandIcon',
  'ConcertIcon',
  'FestivalIcon',
  'RecordingIcon',
  'StudioIcon',
  'MixingIcon',
  'MasteringIcon',
  'SoundIcon',
  'AudioIcon',
  'WaveformIcon',
  'EqualizerIcon',
  'AmplifierIcon',
  'SpeakerIcon',
  'HeadsetIcon',
  'EarbudsIcon',
  'TurntableIcon',

  // Дополнительные дом и быт
  'FurnitureIcon',
  'SofaIcon',
  'ChairIcon',
  'TableIcon',
  'BedIcon',
  'WardrobeIcon',
  'ShelfIcon',
  'MirrorIcon',
  'LampIcon',
  'LightIcon',
  'FanIcon',
  'HeaterIcon',
  'AirConditionerIcon',
  'VacuumIcon',
  'WashingMachineIcon',
  'DryerIcon',
  'IronIcon',
  'CleaningIcon',
  'LaundryIcon',
  'DishwasherIcon',

  // Дополнительные кухня и готовка
  'OvenIcon',
  'MicrowaveIcon',
  'RefrigeratorIcon',
  'FreezerIcon',
  'BlenderIcon',
  'MixerIcon',
  'ToasterIcon',
  'CoffeeMakerIcon',
  'KettleIcon',
  'PotIcon',
  'PanIcon',
  'CuttingBoardIcon',
  'RecipeIcon',
  'CookbookIcon',
  'MenuIcon',
  'DietIcon',
  'NutritionIcon',
  'CaloriesIcon',
  'VitaminsIcon',
  'SupplementsIcon',

  // Дополнительные транспорт и логистика
  'DeliveryIcon',
  'ShippingIcon',
  'PackageIcon',
  'BoxIcon',
  'ContainerIcon',
  'WarehouseIcon',
  'InventoryIcon',
  'StockIcon',
  'SupplyIcon',
  'LogisticsIcon',
  'TrackingIcon',
  'RouteIcon',
  'NavigationIcon',
  'GPSIcon',
  'LocationIcon',
  'DestinationIcon',
  'DistanceIcon',
  'SpeedIcon',
  'FuelIcon',
  'ParkingIcon',

  // Дополнительные офис и работа
  'MeetingIcon',
  'ConferenceIcon',
  'PresentationIcon',
  'ProjectorIcon',
  'WhiteboardIcon',
  'FlipchartIcon',
  'BrainstormingIcon',
  'PlanningIcon',
  'StrategyIcon',
  'GoalIcon',
  'TaskIcon',
  'DeadlineIcon',
  'ScheduleIcon',
  'AgendaIcon',
  'MinutesIcon',
  'ReportIcon',
  'AnalysisIcon',
  'StatisticsIcon',
  'MetricsIcon',
  'KPIIcon',

  // Дополнительные социальные и события
  'PartyIcon',
  'CelebrationIcon',
  'BirthdayIcon',
  'WeddingIcon',
  'AnniversaryIcon',
  'HolidayIcon',
  'VacationIcon',
  'WeekendIcon',
  'EventIcon',
  'FestivalIcon',
  'CarnivalIcon',
  'ParadeIcon',
  'ConcertIcon',
  'ShowIcon',
  'PerformanceIcon',
  'TheaterIcon',
  'OperaIcon',
  'BalletIcon',
  'DanceIcon',
  'ComedyIcon',

  // Дополнительные природа и экология
  'EcoIcon',
  'GreenIcon',
  'SustainableIcon',
  'RecycleIcon',
  'RenewableIcon',
  'SolarIcon',
  'WindIcon',
  'WaterIcon',
  'EarthIcon',
  'PlanetIcon',
  'EnvironmentIcon',
  'ConservationIcon',
  'WildlifeIcon',
  'ForestIcon',
  'JungleIcon',
  'DesertIcon',
  'OceanIcon',
  'RiverIcon',
  'LakeIcon',
  'MountainIcon'
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
  const { t } = useTranslation();

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
              aria-label={t('common.resetIcon')}
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
                    color="gray"
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
