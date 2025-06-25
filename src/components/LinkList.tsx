import * as React from "react";
import { LinkItem } from "./LinkItem";
import { useDroppable } from "@dnd-kit/core";
import {
  useSortable,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

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
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
    >
      <LinkItem {...link} globalDisableClick={globalDisableClick} dragHandleProps={listeners} />
    </div>
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
  return (
    <SortableContext
      id={listId}
      items={items}
      strategy={verticalListSortingStrategy}
    >
      <div
        ref={setNodeRef}
        className={
          "link-list flex flex-col gap-2 " +
          (className ? className : "")
        }
      >
        <div className="link-list-title">{title}</div>
        <div className="flex flex-col gap-1">
          {links.map((link) => (
            <SortableLinkItem
              key={link.url}
              link={link}
              globalDisableClick={globalDisableClick}
            />
          ))}
        </div>
      </div>
    </SortableContext>
  );
}

// Для DragOverlay используем LinkItem напрямую
export { LinkItem };

