import * as React from "react";
import { LinkItem } from "./LinkItem";
import { useDroppable } from "@dnd-kit/core";
import {
  useSortable,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, Flex, Text, Heading, Separator, Box, Button, IconButton } from "@radix-ui/themes";
import { Pencil2Icon, PlusIcon } from "@radix-ui/react-icons";
import { AddLinkDialog } from "./AddLinkDialog";
import { EditListDialog } from "./EditListDialog";

export interface LinkListItem {
  url: string;
  title: string;
  iconUrl?: string;
  color?: string;
  className?: string;
}

interface LinkListProps {
  title: string;
  links: LinkListItem[];
  listId: string;
  className?: string;
  globalDisableClick?: boolean;
  activeId?: string | null;
}

function SortableLinkItem({
  link,
  globalDisableClick,
}: {
  link: LinkListItem;
  globalDisableClick?: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: link.url });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: "grab",
  };
  return (
    <Box ref={setNodeRef} style={style}>
      <LinkItem {...link} globalDisableClick={globalDisableClick} dragHandleProps={listeners} />
    </Box>
  );
}

export function LinkList({
  title,
  links,
  className,
  globalDisableClick,
  listId,
  activeId,
}: LinkListProps) {
  const { setNodeRef } = useDroppable({ id: listId });
  const items = React.useMemo(() => links.map((l) => l.url), [links]);
  const [addOpen, setAddOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);

  // Заглушки для onSubmit (реализация зависит от родителя)
  const handleAddLink = (data: { title: string; url: string }) => {
    setAddOpen(false);
    // TODO: вызвать callback из props, если потребуется
  };
  const handleEditList = (newTitle: string) => {
    setEditOpen(false);
    // TODO: вызвать callback из props, если потребуется
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
            <Heading size="4" as="h2">{title}</Heading>
            <Flex gap="2">
              <IconButton variant="soft" color="gray" size="2" onClick={() => setEditOpen(true)} aria-label="Редактировать список">
                <Pencil2Icon />
              </IconButton>
              <IconButton variant="soft" color="green" size="2" onClick={() => setAddOpen(true)} aria-label="Добавить ссылку">
                <PlusIcon />
              </IconButton>
            </Flex>
          </Flex>
          <Separator size="4" />
          <Flex direction="column" gap="2">
            {links.map((link) => (
              <SortableLinkItem
                key={link.url}
                link={link}
                globalDisableClick={globalDisableClick}
              />
            ))}
          </Flex>
        </Flex>
        <AddLinkDialog open={addOpen} onOpenChange={setAddOpen} onSubmit={handleAddLink} />
        <EditListDialog open={editOpen} onOpenChange={setEditOpen} initialTitle={title} onSubmit={handleEditList} />
      </Card>
    </SortableContext>
  );
}

// Для DragOverlay используем LinkItem напрямую
export { LinkItem };

