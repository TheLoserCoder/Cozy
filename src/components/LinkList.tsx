import * as React from "react";
import { LinkItem } from "./LinkItem";
import { useDroppable } from "@dnd-kit/core";
import {
  useSortable,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, Flex, Text, Heading, Box, IconButton } from "@radix-ui/themes";
import { Pencil2Icon, PlusIcon, ExternalLinkIcon } from "@radix-ui/react-icons";
import * as RadixIcons from "@radix-ui/react-icons";
import { AddLinkDialog } from "./AddLinkDialog";
import { EditListDialog } from "./EditListDialog";
import { LinkListItem } from "../entities/list/list.types";
import { useAppSelector } from "../store/hooks";
import { useTranslation } from "../locales";

interface LinkListProps {
  title: string;
  links: LinkListItem[];
  listId: string;
  customColor?: string;
  className?: string;
  activeId?: string | null;
  onAddLink?: (data: { title: string; url: string }) => void;
  onEditList?: (newTitle: string) => void;
  onDeleteList?: () => void;
  onDeleteLink?: (linkId: string) => void;
  cleanMode?: boolean;
}

function SortableLinkItem({
  link,
  activeId,
  listId,
  listLinkColor,
  onDelete,
  cleanMode = false,
}: {
  link: LinkListItem;
  activeId?: string | null;
  listId: string;
  listLinkColor?: string;
  onDelete?: (linkId: string) => void;
  cleanMode?: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: link.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1000 : 1,
  };

  const isActive = activeId === link.id;

  return (
    <Box ref={setNodeRef} style={{ ...style, background: 'transparent' }}>
      <LinkItem
        {...link}
        listId={listId}
        listLinkColor={listLinkColor}
        isDragging={isDragging || isActive}
        dragHandleProps={{
          ...attributes,
          ...listeners,
        }}
        onDelete={onDelete ? () => onDelete(link.id) : undefined}
        cleanMode={cleanMode}
      />
    </Box>
  );
}

export function LinkList({
  title,
  links,
  className,
  customColor,
  listId,
  activeId,
  onAddLink,
  onEditList,
  onDeleteList,
  onDeleteLink,
  cleanMode = false
}: LinkListProps) {
  const { setNodeRef } = useDroppable({ id: listId });
  const { lists, radixTheme } = useAppSelector((state) => state.theme);
  const allLists = useAppSelector((state) => state.lists);
  const currentList = allLists.find(list => list.id === listId);
  const items = React.useMemo(() => links.map((l) => l.id), [links]);
  const [addOpen, setAddOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const { t } = useTranslation();

  // Определяем цвет заголовка: кастомный цвет списка, цвет заголовков из настроек списков или акцентный цвет
  const titleColor = customColor || lists.titleColor || radixTheme;

  const handleAddLink = (data: { title: string; url: string }) => {
    setAddOpen(false);
    onAddLink?.(data);
  };

  const handleEditList = (newTitle: string) => {
    setEditOpen(false);
    onEditList?.(newTitle);
  };

  // Функция для открытия ссылок в новых вкладках
  const openAllLinksInNewTabs = () => {
    links.forEach(link => {
      window.open(link.url, '_blank');
    });
  };

  // Обработчики событий мыши для списка
  const handleListMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1) { // Средняя кнопка мыши (колесико)
      e.preventDefault();
      openAllLinksInNewTabs();
    }
  };

  const handleListDoubleClick = () => {
    openAllLinksInNewTabs();
  };

  // Стили для карточки списка
  const cardStyle = {
    minWidth: 320,
    maxWidth: 400,
    padding: "8px",
    backgroundColor: lists.hideBackground ? 'transparent' : lists.backgroundColor,
    backdropFilter: lists.hideBackground ? 'none' : (lists.backdropBlur ? 'blur(10px)' : 'none'),
    WebkitBackdropFilter: lists.hideBackground ? 'none' : (lists.backdropBlur ? 'blur(10px)' : 'none'), // Для Safari
    // Убираем дефолтный фон Radix Card
    '--card-background': 'transparent',
    '--card-background-hover': 'transparent',
    // Границы: скрываем когда фон скрыт или когда границы отключены
    border: lists.hideBackground || lists.borderHidden ? 'none' :
      `${lists.borderThickness}px solid ${lists.borderColor || 'var(--accent-9)'}`,
    boxShadow: lists.hideBackground ? 'none' : undefined,
  } as React.CSSProperties;

  return (
    <SortableContext
      id={listId}
      items={items}
      strategy={verticalListSortingStrategy}
    >
      <Card
        ref={setNodeRef}
        style={cardStyle}
        variant="surface"
        
      >
        <Flex direction="column" gap="2" style={{ background: 'transparent' }}>
          <Flex align="center" justify="between" style={{ background: 'transparent' }}>
            <Flex
              align="center"
              gap="2"
              style={{
                background: 'transparent',
                cursor: 'pointer'
              }}
              onMouseDown={handleListMouseDown}
              onDoubleClick={handleListDoubleClick}
            >
              {currentList?.icon && (() => {
                const IconComponent = (RadixIcons as any)[currentList.icon];
                if (IconComponent) {
                  const iconColor = currentList.iconColor || titleColor;
                  return (
                    <IconComponent
                      style={{
                        width: 20,
                        height: 20,
                        color: iconColor,
                        flexShrink: 0
                      }}
                    />
                  );
                }
                return null;
              })()}
              <Heading className="list-title" size="4" as="h2" style={{ color: titleColor, background: 'transparent', fontFamily: "var(--app-font-family, inherit)" }}>{title}</Heading>
            </Flex>
            <Flex gap="1" style={{ background: 'transparent' }}>
              {!cleanMode && (
                <IconButton
                  variant="soft"
                  size="2"
                  onClick={openAllLinksInNewTabs}
                  aria-label={t('tooltips.openAllLinks')}
                >
                  <ExternalLinkIcon />
                </IconButton>
              )}
              {!cleanMode && (
                <>
                  <IconButton variant="soft" size="2" onClick={() => setEditOpen(true)} aria-label={t('tooltips.editItem')}>
                    <Pencil2Icon />
                  </IconButton>
                  <IconButton variant="soft" size="2" onClick={() => setAddOpen(true)} aria-label={t('tooltips.addLink')}>
                    <PlusIcon />
                  </IconButton>
                </>
              )}
            </Flex>
          </Flex>
          <div
            style={{
              width: '100%',
              height: `${lists.separatorThickness}px`,
              backgroundColor: currentList?.customSeparatorColor || lists.separatorColor || 'var(--accent-9)',
              borderRadius: '1px',
              margin: '2px 0',
              visibility: lists.separatorHidden ? 'hidden' : 'visible'
            }}
          />
          <Flex direction="column" gap="0.4" style={{ background: 'transparent' }}>
            {links.map((link) => (
              <SortableLinkItem
                key={link.id}
                link={link}
                activeId={activeId}
                listId={listId}
                listLinkColor={currentList?.customLinkColor}
                onDelete={onDeleteLink}
                cleanMode={cleanMode}
              />
            ))}
          </Flex>
        </Flex>
        <AddLinkDialog open={addOpen} onOpenChange={setAddOpen} onSubmit={handleAddLink} />
        <EditListDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          initialTitle={title}
          listId={listId}
          initialColor={currentList?.customColor}
          initialSeparatorColor={currentList?.customSeparatorColor}
          initialLinkColor={currentList?.customLinkColor}
          initialIcon={currentList?.icon}
          initialIconColor={currentList?.iconColor}
          onSubmit={handleEditList}
          onDelete={onDeleteList}
        />
      </Card>
    </SortableContext>
  );
}

// Для DragOverlay используем LinkItem напрямую
export { LinkItem };
