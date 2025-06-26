import * as React from "react";
import { TextField, Flex, Text, Box, Switch, Slider, Separator, Tabs, Select } from "@radix-ui/themes";
import { SimpleTooltip } from "./SimpleTooltip";
import { GalleryImage } from "./GalleryImage";
import { Drawer } from "./Drawer";
import { Cross2Icon, ChevronDownIcon, ChevronUpIcon, GlobeIcon, PlusIcon, TrashIcon, PlayIcon, PauseIcon, UpdateIcon } from "@radix-ui/react-icons";
import { PrimaryButton, ActionIconButton } from "./ActionButtons";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { addImage, removeImage, setCurrentBackground, setFilter, resetFilters, setBackgroundType, setSolidBackground, setGradientBackground, setParallaxEnabled, setShadowOverlayEnabled, setShadowOverlayIntensity, setShadowOverlayHeight, setAutoSwitchEnabled, setAutoSwitchMode, switchToRandomImage } from "../store/backgroundSlice";
import { setClockColor, setClockEnabled, setClockShowSeconds, setClockShowDate, setClockSize, setRadixTheme, setListBackgroundColor, setListBackdropBlur, setListTitleColor, setListLinkColor, setListHideBackground, setListSeparatorColor, setListSeparatorHidden, setListSeparatorThickness, setListBorderColor, setListBorderHidden, setListBorderThickness, setListHideIcons, resetToDefaultTheme } from "../store/themeSlice";
import { resetAllCustomColors } from "../store/listsSlice";
import { validateImageUrl } from "../utils/imageValidation";
import { ColorPicker } from "./ColorPicker";
import { RadixThemePicker } from "./RadixThemePicker";
import { AutoColorButton } from "./AutoColorButton";
import { nanoid } from "nanoid";

interface SettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const Settings: React.FC<SettingsProps> = ({ open, onOpenChange }) => {
  const dispatch = useAppDispatch();
  const { images, currentBackground, filters, backgroundType, solidBackground, gradientBackground, parallaxEnabled, shadowOverlay, autoSwitch } = useAppSelector((state) => state.background);
  const { colors, clock, lists, radixTheme } = useAppSelector((state) => state.theme);
  const [imageUrl, setImageUrl] = React.useState("");
  const [isValidating, setIsValidating] = React.useState(false);
  const [error, setError] = React.useState("");
  const [filtersExpanded, setFiltersExpanded] = React.useState(false);

  console.log("Settings component - images:", images, "currentBackground:", currentBackground, "colors:", colors, "clock:", clock, "radixTheme:", radixTheme);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (imageUrl.trim() === "") return;

    setIsValidating(true);
    setError("");

    try {
      console.log("Validating image URL:", imageUrl.trim());
      const isValid = await validateImageUrl(imageUrl.trim());
      console.log("Validation result:", isValid);

      if (isValid) {
        const newImage = {
          id: nanoid(),
          url: imageUrl.trim(),
          addedAt: Date.now()
        };
        console.log("Adding image:", newImage);
        dispatch(addImage(newImage));
        setImageUrl("");
        console.log("Image added successfully");
      } else {
        setError("Недопустимый URL изображения");
        console.log("Image validation failed");
      }
    } catch (err) {
      console.error("Error during validation:", err);
      setError("Ошибка при проверке изображения");
    } finally {
      setIsValidating(false);
    }
  };

  const handleRemoveImage = (imageId: string) => {
    dispatch(removeImage(imageId));
  };



  const handleSetBackground = (imageUrl: string) => {
    dispatch(setCurrentBackground(imageUrl));
  };

  // Функция для быстрого добавления тестового изображения
  const handleAddTestImage = () => {
    // Генерируем фиксированный seed для постоянного изображения
    const seed = Math.floor(Math.random() * 1000);
    const testImage = {
      id: nanoid(),
      url: `https://picsum.photos/seed/${seed}/1920/1080`,
      addedAt: Date.now()
    };
    console.log("Adding random image:", testImage);
    dispatch(addImage(testImage));
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange} side="left" width={420}>
      <Box p="4" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <Flex justify="between" align="center" mb="4">
          <Text size="5" weight="bold">
            Настройки
          </Text>
          <ActionIconButton
            variant="soft"
            size="3"
            onClick={() => onOpenChange(false)}
            aria-label="Закрыть настройки"
          >
            <Cross2Icon />
          </ActionIconButton>
        </Flex>
        <form onSubmit={handleSubmit} aria-label="Форма настроек" style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <Flex
            direction="column"
            gap="4"
            style={{
              flex: 1,
              overflowY: "auto",
              paddingRight: "8px",
              scrollbarWidth: "thin",
              scrollbarColor: "var(--gray-6) transparent"
            }}
            className="settings-scroll"
          >
            {/* Настройки цветов */}
            <Box>
              <Text size="4" weight="bold" mb="3">
                Цветовая схема
              </Text>

              <Flex direction="column" gap="3">
                <Flex align="center" gap="2">
                  <Box style={{ flex: 1 }}>
                    <RadixThemePicker
                      label="Акцентный цвет (кнопки, заголовки списков)"
                      value={radixTheme}
                      onChange={(theme) => dispatch(setRadixTheme(theme))}
                    />
                  </Box>
                  <AutoColorButton size="2" />
                  <ActionIconButton
                    variant="soft"
                    color="gray"
                    size="2"
                    type="button"
                    onClick={() => {
                      // Сбрасываем все цветовые настройки к стандартным
                      dispatch(resetToDefaultTheme());
                      // Сбрасываем все индивидуальные цвета списков и ссылок
                      dispatch(resetAllCustomColors());
                    }}
                    aria-label="Сбросить все цветовые настройки"
                  >
                    <UpdateIcon />
                  </ActionIconButton>
                </Flex>
              </Flex>
            </Box>

            <Separator size="4" />

            {/* Настройки часов */}
            <Box>
              <Text size="4" weight="bold" mb="3">
                Настройки часов
              </Text>

              <Flex direction="column" gap="4">
                {/* Включение/выключение часов */}
                <Flex align="center" justify="between">
                  <Text size="3" weight="medium">
                    Показывать часы
                  </Text>
                  <Switch
                    checked={clock.enabled}
                    onCheckedChange={(checked) => dispatch(setClockEnabled(checked))}
                  />
                </Flex>

                {/* Показ секунд */}
                <Flex align="center" justify="between">
                  <Text size="3" weight="medium">
                    Показывать секунды
                  </Text>
                  <Switch
                    checked={clock.showSeconds}
                    onCheckedChange={(checked) => dispatch(setClockShowSeconds(checked))}
                    disabled={!clock.enabled}
                  />
                </Flex>

                {/* Показ даты */}
                <Flex align="center" justify="between">
                  <Text size="3" weight="medium">
                    Показывать дату
                  </Text>
                  <Switch
                    checked={clock.showDate}
                    onCheckedChange={(checked) => dispatch(setClockShowDate(checked))}
                    disabled={!clock.enabled}
                  />
                </Flex>

                {/* Размер часов */}
                <Box>
                  <Flex align="center" justify="between" mb="2">
                    <Text size="3" weight="medium">
                      Размер часов
                    </Text>
                    <Text size="2" color="gray">
                      {Math.round(clock.size * 100)}%
                    </Text>
                  </Flex>
                  <Slider
                    value={[clock.size]}
                    onValueChange={(value) => dispatch(setClockSize(value[0]))}
                    min={0.5}
                    max={2.5}
                    step={0.1}
                    disabled={!clock.enabled}
                  />
                </Box>

                {/* Цвет часов */}
                <ColorPicker
                  label="Цвет часов и даты"
                  value={clock.color}
                  onChange={(color) => dispatch(setClockColor(color))}
                  disableAlpha={false}
                />
              </Flex>
            </Box>

            <Separator size="4" />

            {/* Настройки списков */}
            <Box>
              <Text size="4" weight="bold" mb="3">
                Настройки списков
              </Text>

              <Flex direction="column" gap="4">
                {/* Группа: Фон списков */}
                <Box>
                  <Text size="3" weight="medium" mb="2" color="gray">
                    Фон списков
                  </Text>
                  <Flex direction="column" gap="2">
                    <ColorPicker
                      label="Цвет фона"
                      value={lists.backgroundColor}
                      onChange={(color) => dispatch(setListBackgroundColor(color))}
                      disableAlpha={false}
                    />

                    <ColorPicker
                      label="Цвет границы"
                      value={lists.borderColor || radixTheme}
                      onChange={(color) => dispatch(setListBorderColor(color))}
                      disableAlpha={false}
                      disabled={lists.borderHidden}
                    />

                    <Flex align="center" justify="between">
                      <Text size="2" weight="medium" style={{ opacity: lists.borderHidden ? 0.5 : 1 }}>
                        Толщина границы
                      </Text>
                      <Flex align="center" gap="2" style={{ width: '120px' }}>
                        <Text size="1" color="gray" style={{ opacity: lists.borderHidden ? 0.5 : 1, minWidth: '24px' }}>
                          {lists.borderThickness}px
                        </Text>
                        <Slider
                          value={[lists.borderThickness]}
                          onValueChange={(value) => dispatch(setListBorderThickness(value[0]))}
                          min={1}
                          max={5}
                          step={1}
                          disabled={lists.borderHidden}
                          style={{
                            flex: 1,
                            opacity: lists.borderHidden ? 0.5 : 1
                          }}
                        />
                      </Flex>
                    </Flex>

                    <Flex align="center" justify="between">
                      <Text size="2" weight="medium">
                        Скрыть границу
                      </Text>
                      <Switch
                        checked={lists.borderHidden}
                        onCheckedChange={(checked) => dispatch(setListBorderHidden(checked))}
                      />
                    </Flex>

                    <Flex align="center" justify="between">
                      <Text size="2" weight="medium">
                        Размытие фона
                      </Text>
                      <Switch
                        checked={lists.backdropBlur}
                        onCheckedChange={(checked) => dispatch(setListBackdropBlur(checked))}
                      />
                    </Flex>

                    <Flex align="center" justify="between">
                      <Text size="2" weight="medium">
                        Скрыть фон
                      </Text>
                      <Switch
                        checked={lists.hideBackground}
                        onCheckedChange={(checked) => dispatch(setListHideBackground(checked))}
                      />
                    </Flex>
                  </Flex>
                </Box>

                {/* Группа: Разделитель */}
                <Box>
                  <Text size="3" weight="medium" mb="2" color="gray">
                    Разделитель
                  </Text>
                  <Flex direction="column" gap="2">
                    <ColorPicker
                      label="Цвет разделителя"
                      value={lists.separatorColor || radixTheme}
                      onChange={(color) => dispatch(setListSeparatorColor(color))}
                      disableAlpha={false}
                      disabled={lists.separatorHidden}
                    />

                    <Flex align="center" justify="between">
                      <Text size="2" weight="medium" style={{ opacity: lists.separatorHidden ? 0.5 : 1 }}>
                        Толщина разделителя
                      </Text>
                      <Flex align="center" gap="2" style={{ width: '120px' }}>
                        <Text size="1" color="gray" style={{ opacity: lists.separatorHidden ? 0.5 : 1, minWidth: '24px' }}>
                          {lists.separatorThickness}px
                        </Text>
                        <Slider
                          value={[lists.separatorThickness]}
                          onValueChange={(value) => dispatch(setListSeparatorThickness(value[0]))}
                          min={1}
                          max={10}
                          step={1}
                          disabled={lists.separatorHidden}
                          style={{
                            flex: 1,
                            opacity: lists.separatorHidden ? 0.5 : 1
                          }}
                        />
                      </Flex>
                    </Flex>

                    <Flex align="center" justify="between">
                      <Text size="2" weight="medium">
                        Скрыть разделитель
                      </Text>
                      <Switch
                        checked={lists.separatorHidden}
                        onCheckedChange={(checked) => dispatch(setListSeparatorHidden(checked))}
                      />
                    </Flex>
                  </Flex>
                </Box>

                {/* Группа: Содержимое */}
                <Box>
                  <Text size="3" weight="medium" mb="2" color="gray">
                    Содержимое
                  </Text>
                  <Flex direction="column" gap="2">
                    <ColorPicker
                      label="Цвет заголовков (переопределяет акцентный)"
                      value={lists.titleColor || radixTheme}
                      onChange={(color) => dispatch(setListTitleColor(color))}
                      disableAlpha={false}
                    />

                    <ColorPicker
                      label="Цвет ссылок (переопределяет акцентный)"
                      value={lists.linkColor || `color-mix(in srgb, ${radixTheme} 70%, var(--gray-12) 30%)`}
                      onChange={(color) => dispatch(setListLinkColor(color))}
                      disableAlpha={false}
                    />

                    <Flex align="center" justify="between">
                      <Text size="2" weight="medium">
                        Скрыть иконки ссылок
                      </Text>
                      <Switch
                        checked={lists.hideIcons}
                        onCheckedChange={(checked) => dispatch(setListHideIcons(checked))}
                      />
                    </Flex>


                  </Flex>
                </Box>
              </Flex>
            </Box>

            <Separator size="4" />

            <Text size="4" weight="bold" mb="2">
              Фон
            </Text>

            <Tabs.Root value={backgroundType} onValueChange={(value) => dispatch(setBackgroundType(value as any))}>
              <Tabs.List>
                <Tabs.Trigger value="image">Изображение</Tabs.Trigger>
                <Tabs.Trigger value="solid">Цвет</Tabs.Trigger>
                <Tabs.Trigger value="gradient">Градиент</Tabs.Trigger>
              </Tabs.List>

              {/* Вкладка изображений */}
              <Tabs.Content value="image">
                <Box mt="3">
                  <Flex direction="column" gap="3" style={{ padding: "0 8px" }}>
                    <Box>
                      <Text size="2" mb="2" weight="medium" as="div">
                        Добавить изображение
                      </Text>
                      <TextField.Root
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="https://example.com/image.jpg"
                        required
                        type="url"
                      />
                      {error && (
                        <Text size="1" color="red" mt="1" as="div">
                          {error}
                        </Text>
                      )}
                    </Box>

                    <Flex gap="2" align="center">
                      <PrimaryButton
                        type="submit"
                        disabled={isValidating}
                      >
                        {isValidating ? "Проверка..." : "Добавить изображение"}
                      </PrimaryButton>

                      {/* Кнопка добавления случайного фото */}
                      <SimpleTooltip content="Добавить случайное фото из интернета">
                        <ActionIconButton
                          variant="soft"
                          size="2"
                          onClick={(e) => {
                            e?.preventDefault();
                            e?.stopPropagation();
                            handleAddTestImage();
                          }}
                          aria-label="Добавить случайное фото"
                        >
                          <GlobeIcon />
                        </ActionIconButton>
                      </SimpleTooltip>
                    </Flex>

                    {/* Переключатель параллакса */}
                    <Box>
                      <Flex align="center" gap="2">
                        <Switch
                          checked={parallaxEnabled}
                          onCheckedChange={(checked) => dispatch(setParallaxEnabled(checked))}
                        />
                        <Text size="2" weight="medium">
                          Эффект параллакса
                        </Text>
                      </Flex>
                      <Text size="1" color="gray" mt="1">
                        Фоновое изображение будет следовать за движением мышки
                      </Text>
                    </Box>

                    {/* Настройки затенения */}
                    <Box>
                      <Flex align="center" gap="2" mb="2">
                        <Switch
                          checked={shadowOverlay.enabled}
                          onCheckedChange={(checked) => dispatch(setShadowOverlayEnabled(checked))}
                        />
                        <Text size="2" weight="medium">
                          Затенение снизу
                        </Text>
                      </Flex>
                      <Text size="1" color="gray" mb="3">
                        Градиентное затенение для лучшей видимости списков
                      </Text>

                      {shadowOverlay.enabled && (
                        <Box>
                          <Flex align="center" gap="2" mb="2">
                            <Text size="1" color="gray" style={{ minWidth: '100px' }}>
                              Интенсивность:
                            </Text>
                            <Slider
                              value={[shadowOverlay.intensity]}
                              onValueChange={(value) => dispatch(setShadowOverlayIntensity(value[0]))}
                              max={200}
                              min={0}
                              step={5}
                              style={{ flex: 1, width: '120px' }}
                            />
                            <Text size="1" color="gray" style={{ minWidth: '40px' }}>
                              {shadowOverlay.intensity}%
                            </Text>
                          </Flex>

                          <Flex align="center" gap="2" mb="2">
                            <Text size="1" color="gray" style={{ minWidth: '100px' }}>
                              Высота:
                            </Text>
                            <Slider
                              value={[shadowOverlay.height]}
                              onValueChange={(value) => dispatch(setShadowOverlayHeight(value[0]))}
                              max={100}
                              min={20}
                              step={5}
                              style={{ flex: 1, width: '120px' }}
                            />
                            <Text size="1" color="gray" style={{ minWidth: '40px' }}>
                              {shadowOverlay.height}%
                            </Text>
                          </Flex>
                        </Box>
                      )}
                    </Box>
                  </Flex>

            {/* Мини-галерея */}
            {images.length > 0 && (
              <Box mt="4">
                <Flex align="center" justify="between" mb="3">
                  <Text size="3" weight="medium">
                    Галерея ({images.length})
                  </Text>

                  {/* Автоматическое переключение */}
                  <Flex align="center" gap="2">
                    <SimpleTooltip content={autoSwitch.enabled ? "Остановить автоматическое переключение" : "Запустить автоматическое переключение"}>
                      <ActionIconButton
                        onClick={() => dispatch(setAutoSwitchEnabled(!autoSwitch.enabled))}
                        variant="soft"
                        size="1"
                        type="button"
                      >
                        {autoSwitch.enabled ? <PauseIcon /> : <PlayIcon />}
                      </ActionIconButton>
                    </SimpleTooltip>

                    <Select.Root
                      value={autoSwitch.mode}
                      onValueChange={(value) => dispatch(setAutoSwitchMode(value as any))}
                      size="1"
                    >
                      <Select.Trigger style={{ minWidth: "120px" }} />
                      <Select.Content style={{ zIndex: 10000 }}>
                        <Select.Item value="onLoad">При загрузке</Select.Item>
                        <Select.Item value="daily">Раз в день</Select.Item>
                      </Select.Content>
                    </Select.Root>
                  </Flex>
                </Flex>
                <Box
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, 1fr)",
                    gap: "4px",
                    maxHeight: "280px",
                    overflowY: "auto"
                  }}
                >
                  {images.map((image, index) => (
                    <Box
                      key={image.id}
                      style={{
                        position: "relative"
                      }}
                    >
                      <GalleryImage
                        src={image.url}
                        alt="Background"
                        isSelected={currentBackground === image.url}
                        onClick={() => handleSetBackground(image.url)}
                        index={index}
                      />
                      <div
                        style={{
                          position: "absolute",
                          top: "4px",
                          right: "4px",
                          opacity: 0,
                          transition: "opacity 0.2s",
                          zIndex: 10
                        }}
                        className="delete-btn"
                      >
                        <ActionIconButton
                          variant="solid"
                          color="red"
                          size="1"
                          onClick={(e) => {
                            e?.stopPropagation();
                            handleRemoveImage(image.id);
                          }}
                          aria-label="Удалить изображение"
                        >
                          <TrashIcon />
                        </ActionIconButton>
                      </div>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
                </Box>
              </Tabs.Content>

              {/* Вкладка цвета */}
              <Tabs.Content value="solid">
                <Box mt="3" style={{ padding: "0 8px" }}>
                  <ColorPicker
                    label="Цвет фона"
                    value={solidBackground.color}
                    onChange={(color) => dispatch(setSolidBackground({ color }))}
                    disableAlpha={false}
                  />
                </Box>
              </Tabs.Content>

              {/* Вкладка градиента */}
              <Tabs.Content value="gradient">
                <Box mt="3" style={{ padding: "0 8px" }}>
                  <Flex direction="column" gap="3">
                    <Box>
                      <Text size="2" mb="2" weight="medium" as="div">Тип градиента</Text>
                      <Tabs.Root
                        value={gradientBackground.type}
                        onValueChange={(value) =>
                          dispatch(setGradientBackground({
                            ...gradientBackground,
                            type: value as 'linear' | 'radial'
                          }))
                        }
                      >
                        <Tabs.List>
                          <Tabs.Trigger value="linear">Линейный</Tabs.Trigger>
                          <Tabs.Trigger value="radial">Радиальный</Tabs.Trigger>
                        </Tabs.List>
                      </Tabs.Root>
                    </Box>

                    {/* Цвета градиента */}
                    <Box>
                      <Flex align="center" justify="between" mb="2">
                        <Text size="2" weight="medium">Цвета</Text>
                        <SimpleTooltip content="Добавить цвет">
                          <ActionIconButton
                            variant="soft"
                            size="1"
                            onClick={() => {
                              const newColors = [...gradientBackground.colors, '#ffffff'];
                              dispatch(setGradientBackground({
                                ...gradientBackground,
                                colors: newColors
                              }));
                            }}
                            aria-label="Добавить цвет"
                          >
                            <PlusIcon />
                          </ActionIconButton>
                        </SimpleTooltip>
                      </Flex>

                      {gradientBackground.colors.map((color, index) => (
                        <Flex key={index} align="center" gap="2" mb="2">
                          <ColorPicker
                            label={`Цвет ${index + 1}`}
                            value={color}
                            onChange={(newColor) => {
                              const newColors = [...gradientBackground.colors];
                              newColors[index] = newColor;
                              dispatch(setGradientBackground({
                                ...gradientBackground,
                                colors: newColors
                              }));
                            }}
                            disableAlpha={false}
                          />
                          {gradientBackground.colors.length > 2 && (
                            <SimpleTooltip content="Удалить цвет">
                              <ActionIconButton
                                variant="soft"
                                size="1"
                                onClick={() => {
                                  const newColors = gradientBackground.colors.filter((_, i) => i !== index);
                                  dispatch(setGradientBackground({
                                    ...gradientBackground,
                                    colors: newColors
                                  }));
                                }}
                                aria-label="Удалить цвет"
                              >
                                <TrashIcon />
                              </ActionIconButton>
                            </SimpleTooltip>
                          )}
                        </Flex>
                      ))}
                    </Box>

                    {gradientBackground.type === 'linear' && (
                      <Box>
                        <Text size="2" mb="2" weight="medium" as="div">Направление</Text>
                        <Select.Root
                          value={gradientBackground.direction || 'to right'}
                          onValueChange={(value) =>
                            dispatch(setGradientBackground({
                              ...gradientBackground,
                              direction: value
                            }))
                          }
                        >
                          <Select.Trigger />
                          <Select.Content style={{ zIndex: 2147483647 }}>
                            <Select.Item value="to right">Вправо</Select.Item>
                            <Select.Item value="to left">Влево</Select.Item>
                            <Select.Item value="to bottom">Вниз</Select.Item>
                            <Select.Item value="to top">Вверх</Select.Item>
                            <Select.Item value="to bottom right">Вниз-вправо</Select.Item>
                            <Select.Item value="to bottom left">Вниз-влево</Select.Item>
                            <Select.Item value="to top right">Вверх-вправо</Select.Item>
                            <Select.Item value="to top left">Вверх-влево</Select.Item>
                            <Select.Item value="45deg">45°</Select.Item>
                            <Select.Item value="90deg">90°</Select.Item>
                            <Select.Item value="135deg">135°</Select.Item>
                            <Select.Item value="180deg">180°</Select.Item>
                          </Select.Content>
                        </Select.Root>
                      </Box>
                    )}

                    {gradientBackground.type === 'radial' && (
                      <Box>
                        <Text size="2" mb="2" weight="medium" as="div">Позиция</Text>
                        <Select.Root
                          value={gradientBackground.position || 'center'}
                          onValueChange={(value) =>
                            dispatch(setGradientBackground({
                              ...gradientBackground,
                              position: value
                            }))
                          }
                        >
                          <Select.Trigger />
                          <Select.Content style={{ zIndex: 2147483647 }}>
                            <Select.Item value="center">Центр</Select.Item>
                            <Select.Item value="top">Верх</Select.Item>
                            <Select.Item value="bottom">Низ</Select.Item>
                            <Select.Item value="left">Лево</Select.Item>
                            <Select.Item value="right">Право</Select.Item>
                            <Select.Item value="top left">Верх-лево</Select.Item>
                            <Select.Item value="top right">Верх-право</Select.Item>
                            <Select.Item value="bottom left">Низ-лево</Select.Item>
                            <Select.Item value="bottom right">Низ-право</Select.Item>
                          </Select.Content>
                        </Select.Root>
                      </Box>
                    )}
                  </Flex>
                </Box>
              </Tabs.Content>
            </Tabs.Root>

            {/* Фильтры фона */}
            <Box mt="4" id="filters-section">
              <Flex
                align="center"
                justify="between"
                style={{ cursor: "pointer" }}
                onClick={() => {
                  setFiltersExpanded(!filtersExpanded);
                  // Автоматическая прокрутка к фильтрам при раскрытии
                  if (!filtersExpanded) {
                    setTimeout(() => {
                      document.getElementById('filters-section')?.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                      });
                    }, 100);
                  }
                }}
              >
                <Text size="3" weight="medium">
                  Фильтры фона
                </Text>
                <Flex align="center" gap="1">
                  <ActionIconButton
                    variant="soft"
                    color="gray"
                    size="1"
                    onClick={(e) => {
                      e?.stopPropagation();
                      dispatch(resetFilters());
                    }}
                    aria-label="Сбросить фильтры"
                  >
                    <UpdateIcon />
                  </ActionIconButton>
                  <ActionIconButton
                    variant="ghost"
                    size="1"
                    onClick={(e) => {
                      e?.stopPropagation();
                      setFiltersExpanded(!filtersExpanded);
                      // Автоматическая прокрутка к фильтрам при раскрытии
                      if (!filtersExpanded) {
                        setTimeout(() => {
                          document.getElementById('filters-section')?.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                          });
                        }, 100);
                      }
                    }}
                    aria-label={filtersExpanded ? "Свернуть фильтры" : "Развернуть фильтры"}
                  >
                    {filtersExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
                  </ActionIconButton>
                </Flex>
              </Flex>

              {filtersExpanded && (
                <Box mt="3" style={{
                  animation: "slideDown 0.2s ease-out",
                  overflow: "hidden",
                  padding: "0 8px"
                }}>
                  <Flex direction="column" gap="3">
                    {/* Размытие */}
                    <Box>
                      <Text size="2" mb="1" as="div">Размытие: {filters.blur}px</Text>
                      <Slider
                        value={[filters.blur]}
                        onValueChange={([value]) => dispatch(setFilter({ key: 'blur', value }))}
                        max={20}
                        step={1}
                      />
                    </Box>

                    {/* Яркость */}
                    <Box>
                      <Text size="2" mb="1" as="div">Яркость: {filters.brightness}%</Text>
                      <Slider
                        value={[filters.brightness]}
                        onValueChange={([value]) => dispatch(setFilter({ key: 'brightness', value }))}
                        min={0}
                        max={200}
                        step={5}
                      />
                    </Box>

                    {/* Контрастность */}
                    <Box>
                      <Text size="2" mb="1" as="div">Контрастность: {filters.contrast}%</Text>
                      <Slider
                        value={[filters.contrast]}
                        onValueChange={([value]) => dispatch(setFilter({ key: 'contrast', value }))}
                        min={0}
                        max={200}
                        step={5}
                      />
                    </Box>

                    {/* Насыщенность */}
                    <Box>
                      <Text size="2" mb="1" as="div">Насыщенность: {filters.saturate}%</Text>
                      <Slider
                        value={[filters.saturate]}
                        onValueChange={([value]) => dispatch(setFilter({ key: 'saturate', value }))}
                        min={0}
                        max={200}
                        step={5}
                      />
                    </Box>

                    {/* Поворот оттенка */}
                    <Box>
                      <Text size="2" mb="1" as="div">Поворот оттенка: {filters.hueRotate}°</Text>
                      <Slider
                        value={[filters.hueRotate]}
                        onValueChange={([value]) => dispatch(setFilter({ key: 'hueRotate', value }))}
                        min={0}
                        max={360}
                        step={5}
                      />
                    </Box>

                    {/* Сепия */}
                    <Box>
                      <Text size="2" mb="1" as="div">Сепия: {filters.sepia}%</Text>
                      <Slider
                        value={[filters.sepia]}
                        onValueChange={([value]) => dispatch(setFilter({ key: 'sepia', value }))}
                        min={0}
                        max={100}
                        step={5}
                      />
                    </Box>

                    {/* Черно-белое */}
                    <Box>
                      <Text size="2" mb="1" as="div">Черно-белое: {filters.grayscale}%</Text>
                      <Slider
                        value={[filters.grayscale]}
                        onValueChange={([value]) => dispatch(setFilter({ key: 'grayscale', value }))}
                        min={0}
                        max={100}
                        step={5}
                      />
                    </Box>

                    {/* Инверсия */}
                    <Box>
                      <Text size="2" mb="1" as="div">Инверсия: {filters.invert}%</Text>
                      <Slider
                        value={[filters.invert]}
                        onValueChange={([value]) => dispatch(setFilter({ key: 'invert', value }))}
                        min={0}
                        max={100}
                        step={5}
                      />
                    </Box>




                  </Flex>
                </Box>
              )}
            </Box>
          </Flex>
        </form>
      </Box>
    </Drawer>
  );
};

export default Settings;

// Добавляем стили для скроллбара и исправления Select
const scrollStyle = document.createElement('style');
scrollStyle.textContent = `
  .settings-scroll::-webkit-scrollbar {
    width: 6px;
  }

  .settings-scroll::-webkit-scrollbar-track {
    background: transparent;
  }

  .settings-scroll::-webkit-scrollbar-thumb {
    background: var(--gray-6);
    border-radius: 3px;
  }

  .settings-scroll::-webkit-scrollbar-thumb:hover {
    background: var(--gray-8);
  }

  /* Исправляем проблему с масштабированием Select в настройках */
  .settings-scroll [data-radix-select-trigger],
  .settings-scroll [data-radix-select-trigger] *,
  [data-radix-select-content],
  [data-radix-select-content] *,
  [data-radix-select-viewport],
  [data-radix-select-viewport] *,
  [data-radix-select-item],
  [data-radix-select-item] * {
    transform: none !important;
    scale: 1 !important;
  }

  /* Портал для Select должен игнорировать родительские transform */
  [data-radix-popper-content-wrapper] {
    transform: none !important;
    scale: 1 !important;
  }

  /* Высокий z-index для Select и Tooltip в диалоге */
  [data-radix-select-content],
  [data-radix-tooltip-content],
  [data-radix-popper-content] {
    z-index: 2147483647 !important;
    transform: none !important;
    scale: 1 !important;
    position: fixed !important;
  }

  /* Специально для Tooltip */
  [data-radix-tooltip-content] {
    z-index: 2147483648 !important;
    position: fixed !important;
    pointer-events: none !important;
  }

  /* Tooltip портал */
  [data-radix-tooltip-portal] {
    z-index: 2147483648 !important;
  }

  /* Анимация для аккордеона */
  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* Анимация для элементов галереи */
  @keyframes slideInGallery {
    from {
      opacity: 0;
      transform: translateY(20px) scale(0.9);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  /* Hover эффекты для галереи */
  .gallery-item:hover img {
    transform: scale(1.1) !important;
  }

  .gallery-item:active img {
    transform: scale(1.05) !important;
  }

  /* Анимация для кнопки автоподбора цветов */
  @keyframes pulse {
    0% {
      transform: scale(1);
      opacity: 1;
    }
    50% {
      transform: scale(1.1);
      opacity: 0.8;
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }
`;

if (!document.head.querySelector('style[data-settings-scroll]')) {
  scrollStyle.setAttribute('data-settings-scroll', 'true');
  document.head.appendChild(scrollStyle);
}

// Добавляем стили для hover эффекта
const hoverStyle = document.createElement('style');
hoverStyle.textContent = `
  .delete-btn {
    opacity: 0 !important;
    transition: opacity 0.2s ease !important;
  }

  .delete-btn:hover,
  .delete-btn:focus {
    opacity: 1 !important;
  }

  [style*="position: relative"]:hover .delete-btn {
    opacity: 1 !important;
  }
`;

if (!document.head.querySelector('style[data-settings-hover]')) {
  hoverStyle.setAttribute('data-settings-hover', 'true');
  document.head.appendChild(hoverStyle);
}


