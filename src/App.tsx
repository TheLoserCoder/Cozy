import * as React from "react";
import "./App.css";
import { LinkList } from "./components/LinkList";
import { LinkItem } from "./components/LinkList";
import type { LinkListItem } from "./components/LinkList";
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
  arrayMove,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";

const initialFavorites: LinkListItem[] = [
  {
    url: "https://www.google.com/",
    title: "Google",
    iconUrl: "https://www.google.com/favicon.ico",
  },
  {
    url: "https://www.youtube.com/",
    title: "YouTube",
    iconUrl: "https://www.youtube.com/favicon.ico",
  },
  {
    url: "https://github.com/",
    title: "GitHub",
    iconUrl: "https://github.com/favicon.ico",
  },
];

const initialAI: LinkListItem[] = [
  {
    url: "https://gemini.google.com/",
    title: "Gemini",
    iconUrl: "https://gemini.google.com/favicon.ico",
  },
  {
    url: "https://chat.openai.com/",
    title: "ChatGPT",
    iconUrl: "https://chat.openai.com/favicon.ico",
  },
  {
    url: "https://copilot.microsoft.com/",
    title: "Copilot",
    iconUrl: "https://copilot.microsoft.com/favicon.ico",
  },
];

export const App: React.FC = () => {
  const [lists, setLists] = React.useState({
    favorites: initialFavorites,
    ai: initialAI,
  });
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const overIdRef = React.useRef<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function findContainer(id: string) {
    if (id in lists) {
      return id;
    }
    return Object.keys(lists).find((key) => lists[key].some((item) => item.url === id));
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
    
    setLists((prev) => {
      const activeItems = prev[activeContainer];
      const overItems = prev[overContainer];
      const activeIndex = activeItems.findIndex((item) => item.url === activeId);
      const overIndex = overItems.findIndex((item) => item.url === overId);
      let newIndex;
      if (overId in prev) {
        newIndex = overItems.length + 1;
      } else {
        // draggingRect и over.rect могут быть undefined, поэтому нужна проверка
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
        newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
      }
      if (activeIndex === -1) return prev;
      const moved = activeItems[activeIndex];
      return {
        ...prev,
        [activeContainer]: activeItems.filter((item) => item.url !== activeId),
        [overContainer]: [
          ...overItems.slice(0, newIndex),
          moved,
          ...overItems.slice(newIndex, overItems.length),
        ],
      };
    });
  }

  function handleDragEnd(event: any) {
    const { active, over } = event;
    const activeId = active.id;
    const overId = over?.id;
    const activeContainer = findContainer(activeId);
    const overContainer = findContainer(overId);
    if (!activeContainer || !overContainer || activeContainer !== overContainer) {
      setActiveId(null);
      return;
    }
    const items = lists[activeContainer];
    const oldIndex = items.findIndex((item) => item.url === activeId);
    const newIndex = items.findIndex((item) => item.url === overId);
    if (oldIndex !== newIndex && newIndex !== -1) {
      setLists((items) => ({
        ...items,
        [overContainer]: arrayMove(items[overContainer], oldIndex, newIndex),
      }));
    }
    setActiveId(null);
  }

  return (
    <div className="app p-8 min-h-screen bg-gray-50 flex flex-col md:flex-row gap-8">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex-1">
          <LinkList
            title="Избранное"
            links={lists.favorites}
            listId="favorites"
            activeId={activeId}
          />
        </div>
        <div className="flex-1">
          <LinkList
            title="ИИ"
            links={lists.ai}
            listId="ai"
            activeId={activeId}
          />
        </div>
        <DragOverlay>
          {activeId && (() => {
            const item = lists.favorites.concat(lists.ai).find((l) => l.url === activeId);
            return item ? <div className="drag-overlay"><LinkItem {...item} /></div> : null;
          })()}
        </DragOverlay>
      </DndContext>
    </div>
  );
};
