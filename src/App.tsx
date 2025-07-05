import * as React from "react";
import "./App.css";
import { LinkList } from "./components/LinkList";
import { LinkItem } from "./components/LinkList";
import { LinkListItem } from "./entities/list/list.types";
import { generateLinkId } from "./store/linkId";
import { useAppDispatch, useAppSelector } from "./store/hooks";
import { useFontLoader } from "./hooks/useFontLoader";
import { useErrorHandler } from "./hooks/useErrorHandler";
import { addList, editListTitle, addLinkToList, reorderLinksInList, moveLinkToList, deleteList, setListColor, editLink, deleteLink, setLinkColor } from "./store/listsSlice";
import { applyAllStandardSettings } from "./store/themeSlice";
import { syncLanguageFromRedux, useTranslation } from "./locales";
import { createList } from "./entities/list/list.utils";
import { getFaviconUrl } from "./utils/favicon";
import { Clock } from "./components/Clock";
import { SearchBox } from "./components/SearchBox";
import { FastLinksGrid } from "./components/FastLinksGrid";

import { Background } from "./components/Background";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { Flex, Box } from "@radix-ui/themes";
import { GearIcon } from "@radix-ui/react-icons";
import { ActionIconButton } from "./components/ActionButtons";
import { AddListDialog } from "./components/AddListDialog";
import Settings from "./components/settings";
import { ErrorTestComponent } from "./components/ErrorTestComponent";



export const App: React.FC = () => {
  const dispatch = useAppDispatch();
  const lists = useAppSelector((state) => state.lists);
  const { lists: listsSettings, cleanMode, language } = useAppSelector((state) => state.theme);
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [addListOpen, setAddListOpen] = React.useState(false);
  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const { t } = useTranslation();

  // Инициализируем обработчик ошибок
  const { handleError, handleAsyncError } = useErrorHandler('App');

  // Загружаем и применяем выбранный шрифт
  useFontLoader();
  


  // Синхронизируем язык из Redux с системой переводов
  React.useEffect(() => {
    syncLanguageFromRedux(language);
  }, [language]);

  // Инициализация стандартных настроек только при самом первом запуске
  React.useEffect(() => {
    // Проверяем, есть ли какие-либо сохраненные данные приложения
    const hasThemeSettings = localStorage.getItem('theme-settings');
    const hasBackgroundSettings = localStorage.getItem('background-images');
    const hasFirstRunFlag = localStorage.getItem('app-initialized');

    // Если нет флага инициализации И нет основных настроек - это первый запуск
    const isFirstRun = !hasFirstRunFlag && !hasThemeSettings && !hasBackgroundSettings;

    if (isFirstRun) {
      console.log('First run detected, applying standard settings...');
      // Устанавливаем флаг, что приложение было инициализировано
      localStorage.setItem('app-initialized', 'true');
      // Применяем все стандартные настройки
      dispatch(applyAllStandardSettings());
    }
  }, [dispatch]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // drag начнётся только если мышь сместилась на 5px
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Управление CSS классом для скрытия границ карточек
  React.useEffect(() => {
    try {
      if (listsSettings.hideBackground) {
        document.body.classList.add('hide-card-borders');
      } else {
        document.body.classList.remove('hide-card-borders');
      }
    } catch (error) {
      handleError(error as Error, {
        shouldReload: false,
        logToConsole: true,
        logToStorage: true
      });
    }
  }, [listsSettings.hideBackground, handleError]);

  function findContainer(id: string): string | undefined {
    // Проверяем, является ли id идентификатором списка
    const listExists = lists.find(list => list.id === id);
    if (listExists) {
      return id;
    }

    // Ищем список, содержащий элемент с данным id
    const containerList = lists.find(list =>
      list.links.some((item: LinkListItem) => item.id === id)
    );

    return containerList?.id;
  }

  function handleDragStart(event: any) {
    setActiveId(event.active.id);
  }

  function handleDragOver(event: any) {
    const { active, over, draggingRect } = event;
    const activeId = active.id;
    const overId = over?.id;

    const activeContainer = findContainer(activeId);
    const overContainer = findContainer(overId);

    if (!activeContainer || !overContainer || activeContainer === overContainer) {
      return;
    }

    const activeList = lists.find(list => list.id === activeContainer);
    const overList = lists.find(list => list.id === overContainer);

    if (!activeList || !overList) return;

    const activeItems = activeList.links;
    const overItems = overList.links;
    const activeIndex = activeItems.findIndex((item: LinkListItem) => item.id === activeId);
    const overIndex = overItems.findIndex((item: LinkListItem) => item.id === overId);

    let newIndex: number;
    // Проверяем, перетаскиваем ли мы в пустую область списка
    const isDroppableContainer = lists.some(list => list.id === overId);
    if (isDroppableContainer) {
      // Перетаскиваем в пустую область списка
      newIndex = overItems.length;
    } else {
      // Перетаскиваем на конкретный элемент
      let isBelowLastItem = false;
      if (
        over &&
        overIndex === overItems.length - 1 &&
        draggingRect &&
        over.rect &&
        draggingRect.offsetTop > over.rect.offsetTop + over.rect.height
      ) {
        isBelowLastItem = true;
      }
      const modifier = isBelowLastItem ? 1 : 0;
      newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length;
    }

    if (activeIndex === -1) return;

    // Используем Redux action для перемещения между списками
    dispatch(moveLinkToList({
      fromListId: activeContainer,
      toListId: overContainer,
      linkId: activeId,
      toIndex: newIndex
    }));
  }

  function handleDragEnd(event: any) {
    const { active, over } = event;
    const activeId = active.id;
    const overId = over?.id;

    const activeContainer = findContainer(activeId);
    const overContainer = findContainer(overId);

    if (!activeContainer || !overContainer) {
      setActiveId(null);
      return;
    }

    // Если перетаскиваем в пределах одного списка
    if (activeContainer === overContainer) {
      const activeList = lists.find(list => list.id === activeContainer);
      if (!activeList) {
        setActiveId(null);
        return;
      }

      const items = activeList.links;
      const oldIndex = items.findIndex((item: LinkListItem) => item.id === activeId);
      const newIndex = items.findIndex((item: LinkListItem) => item.id === overId);

      if (oldIndex !== newIndex && newIndex !== -1) {
        dispatch(reorderLinksInList({
          listId: overContainer,
          from: oldIndex,
          to: newIndex
        }));
      }
    }

    setActiveId(null);
  }

  const handleAddLink = (listId: string) => (data: { title: string; url: string }) => {
    try {
      const newLink: LinkListItem = {
        id: generateLinkId(),
        ...data,
        iconUrl: getFaviconUrl(data.url)
      };

      dispatch(addLinkToList({
        listId,
        link: newLink
      }));
    } catch (error) {
      handleError(error as Error, {
        shouldReload: false,
        logToConsole: true,
        logToStorage: true
      });
    }
  };

  const handleEditList = (listId: string) => (newTitle: string) => {
    dispatch(editListTitle({
      id: listId,
      title: newTitle
    }));
  };

  const handleDeleteList = (listId: string) => () => {
    dispatch(deleteList(listId));
  };

  const handleDeleteLink = (listId: string) => (linkId: string) => {
    dispatch(deleteLink({ listId, linkId }));
  };

  const handleAddList = (title: string) => {
    try {
      const newList = createList(title);
      dispatch(addList(newList));
      setAddListOpen(false);
    } catch (error) {
      handleError(error as Error, {
        shouldReload: false,
        logToConsole: true,
        logToStorage: true
      });
    }
  };

  return (
    <>
      <Background />
      <Box className="fade-in" style={{
        minHeight: "100vh",
        background: "transparent",
        display: "flex",
        flexDirection: "column",
        margin: 0,
        padding: 0,
        position: "relative"
      }}>
        {/* Верхняя панель с кнопками */}
      <Flex align="center" justify="start" gap="2" p="4">
        <ActionIconButton
          variant="soft"
          color="gray"
          size="3"
          onClick={() => setSettingsOpen(true)}
          aria-label={t('settings.title')}
          style={{
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)', // Для Safari
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            color: '#FFFFFF',
            opacity: cleanMode ? 0.6 : 1,
            cursor: 'pointer',
            transition: 'opacity 0.3s ease',
          }}
          onMouseEnter={(e) => {
            if (cleanMode) {
              e.currentTarget.style.opacity = '1';
            }
          }}
          onMouseLeave={(e) => {
            if (cleanMode) {
              e.currentTarget.style.opacity = '0.6';
            }
          }}
        >
          <GearIcon />
        </ActionIconButton>
      </Flex>

      {/* Центральная область с часами и списками */}
      <Flex direction="column" align="center" justify="center" style={{ flex: 1 }} gap="6">
        <Clock />

        {/* Поисковик между часами и списками */}
        <SearchBox />

        {/* Быстрые ссылки между поисковиком и списками */}
        <Box style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
          <FastLinksGrid />
        </Box>

        {/* Списки под быстрыми ссылками */}
        <Box>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <>
            {listsSettings.enabled && (
              <Box
                px="4"
                mb="20px"
                style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${lists.length > listsSettings.gridColumns ? listsSettings.gridColumns : lists.length  }, auto)`,
                  gap: 'var(--space-4)',
                  justifyItems: 'start',
                  justifyContent: 'center',
                  alignItems: 'start'
                }}
              >
                {lists.filter(list => list.enabled !== false).map((list) => (
                <LinkList
                  key={list.id}
                  title={list.title}
                  links={list.links}
                  listId={list.id}
                  customColor={list.customColor}
                  activeId={activeId}
                  onAddLink={handleAddLink(list.id)}
                  onEditList={handleEditList(list.id)}
                  onDeleteList={handleDeleteList(list.id)}
                  onDeleteLink={handleDeleteLink(list.id)}
                  cleanMode={cleanMode}
                />
                ))}
              </Box>
            )}
            <DragOverlay>
            {activeId && (() => {
              const allLinks = lists.flatMap(list => list.links);
              const item = allLinks.find((l) => l.id === activeId);
              // Показывать DragOverlay только если элемент ещё есть в списках
              return item ? (
                <Box>
                  <LinkItem {...item} />
                </Box>
              ) : null;
            })()}
          </DragOverlay>
          </>
        </DndContext>
        </Box>
      </Flex>

        <Settings
          open={settingsOpen}
          onOpenChange={setSettingsOpen}
          onAddList={() => setAddListOpen(true)}
        />
        <AddListDialog open={addListOpen} onOpenChange={setAddListOpen} onSubmit={handleAddList} />

        {/* Компонент для тестирования ошибок (только в development) */}
        {process.env.NODE_ENV === 'development' && <ErrorTestComponent />}
      </Box>
    </>
  );
};
