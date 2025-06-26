import * as React from "react";
import { LinkItem } from "./LinkItem";
import { useDroppable } from "@dnd-kit/core";
import {
  useSortable,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, Flex, Text, Heading, Separator, Box, IconButton } from "@radix-ui/themes";
import { Pencil2Icon, PlusIcon } from "@radix-ui/react-icons";
import { AddLinkDialog } from "./AddLinkDialog";
import { EditListDialog } from "./EditListDialog";
import { LinkListItem } from "../entities/list/list.types";
import { useAppSelector } from "../store/hooks";

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
}

function SortableLinkItem({
  link,
  activeId,
  listId,
}: {
  link: LinkListItem;
  activeId?: string | null;
  listId: string;
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
    <Box ref={setNodeRef} style={style}>
      <LinkItem
        {...link}
        listId={listId}
        isDragging={isDragging || isActive}
        dragHandleProps={{
          ...attributes,
          ...listeners,
        }}
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
}: LinkListProps) {
  const { setNodeRef } = useDroppable({ id: listId });
  const { colors } = useAppSelector((state) => state.theme);
  const items = React.useMemo(() => links.map((l) => l.id), [links]);
  const [addOpen, setAddOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);

  // Определяем цвет заголовка: кастомный цвет списка или акцентный цвет
  const titleColor = customColor || colors.accent;

  const handleAddLink = (data: { title: string; url: string }) => {
    setAddOpen(false);
    onAddLink?.(data);
  };

  const handleEditList = (newTitle: string) => {
    setEditOpen(false);
    onEditList?.(newTitle);
  };

  return (
    <SortableContext
      id={listId}
      items={items}
      strategy={verticalListSortingStrategy}
    >
      <Card ref={setNodeRef} style={{ minWidth: 320, maxWidth: 400 }}>
        <Flex direction="column" gap="3">
          <Flex align="center" justify="between">
            <Heading size="4" as="h2" style={{ color: titleColor }}>{title}</Heading>
            <Flex gap="2">
              <IconButton variant="soft" size="2" onClick={() => setEditOpen(true)} aria-label="Редактировать список">
                <Pencil2Icon />
              </IconButton>
              <IconButton variant="soft" size="2" onClick={() => setAddOpen(true)} aria-label="Добавить ссылку">
                <PlusIcon />
              </IconButton>
            </Flex>
          </Flex>
          <Separator size="4" />
          <Flex direction="column" gap="2">
            {links.map((link) => (
              <SortableLinkItem
                key={link.id}
                link={link}
                activeId={activeId}
                listId={listId}
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
          initialColor={customColor}
          onSubmit={handleEditList}
          onDelete={onDeleteList}
        />
      </Card>
    </SortableContext>
  );
}

// Для DragOverlay используем LinkItem напрямую
export { LinkItem };
