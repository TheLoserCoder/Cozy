import * as React from "react";
import { Box, Flex, IconButton } from "@radix-ui/themes";
import { PlusIcon } from "@radix-ui/react-icons";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { reorderFastLinks, deleteFastLink } from "../store/fastLinksSlice";
import { FastLink } from "./FastLink";
import { FastLink as FastLinkType } from "../entities/list/list.types";
import { AddFastLinkDialog } from "./AddFastLinkDialog";
import { EditFastLinkDialog } from "./EditFastLinkDialog";
import { useTranslation } from "../locales";

interface SortableFastLinkProps {
  fastLink: FastLinkType;
  onEdit: (fastLink: FastLinkType) => void;
  onDelete: (id: string) => void;
  cleanMode?: boolean;
}

function SortableFastLink({ fastLink, onEdit, onDelete, cleanMode = false }: SortableFastLinkProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: fastLink.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1000 : 1,
  };

  return (
    <FastLink
      ref={setNodeRef}
      fastLink={fastLink}
      isDragging={isDragging}
      style={style}
      dragHandleProps={{ ...attributes, ...listeners }}
      onEdit={() => onEdit(fastLink)}
      onDelete={() => onDelete(fastLink.id)}
      cleanMode={cleanMode}
    />
  );
}

export const FastLinksGrid: React.FC = () => {
  const dispatch = useAppDispatch();
  const fastLinks = useAppSelector((state) => state.fastLinks);
  const { fastLinks: fastLinksSettings, cleanMode } = useAppSelector((state) => state.theme);
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [addDialogOpen, setAddDialogOpen] = React.useState(false);
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [editingFastLink, setEditingFastLink] = React.useState<FastLinkType | null>(null);
  const { t } = useTranslation();

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

  // Если быстрые ссылки отключены, не показываем компонент
  if (!fastLinksSettings.enabled) {
    return null;
  }

  // Если нет быстрых ссылок, показываем кнопку добавления только если не чистый режим
  if (fastLinks.length === 0) {
    return !cleanMode ? (
      <Box style={{ textAlign: 'center', padding: '20px' }}>
        <IconButton
          variant="soft"
          size="3"
          onClick={() => setAddDialogOpen(true)}
          aria-label={t('tooltips.addFastLink')}
          style={{
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)', // Для Safari
            cursor: 'pointer',
          }}
        >
          <PlusIcon />
        </IconButton>
        <AddFastLinkDialog
          open={addDialogOpen}
          onOpenChange={setAddDialogOpen}
        />
      </Box>
    ) : null;
  }

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = fastLinks.findIndex((item) => item.id === active.id);
      const newIndex = fastLinks.findIndex((item) => item.id === over?.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        dispatch(reorderFastLinks({ from: oldIndex, to: newIndex }));
      }
    }

    setActiveId(null);
  };

  const handleEdit = (fastLink: FastLinkType) => {
    setEditingFastLink(fastLink);
    setEditDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    dispatch(deleteFastLink(id));
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setEditingFastLink(null);
  };

  // Вычисляем количество колонок на основе настроек
  const columns = Math.max(2, Math.min(12, fastLinksSettings.columns));

  return (
    <Box
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        textAlign: 'center'
      }}
    >
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={fastLinks.map(link => link.id)} strategy={rectSortingStrategy}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${columns}, auto)`,
              justifyContent: 'center',
              justifyItems: 'center',
              alignItems: 'start',
              padding: '16px',
              margin: '0 auto',
              maxWidth: 'fit-content',
            }}
          >
            {fastLinks.map((fastLink) => (
              <SortableFastLink
                key={fastLink.id}
                fastLink={fastLink}
                onEdit={handleEdit}
                onDelete={handleDelete}
                cleanMode={cleanMode}
              />
            ))}
            
            {/* Кнопка добавления новой быстрой ссылки - скрыта в чистом режиме */}
            {!cleanMode && (
              <Flex
                direction="column"
                align="center"
                justify="center"
                style={{
                  width: 'auto',
                  minWidth: '80px',
                  height: '80px',
                  cursor: 'pointer',
                  padding: '8px',
                }}
                onClick={() => setAddDialogOpen(true)}
              >
                <IconButton
                  variant="soft"
                  size="3"
                  style={{backdropFilter: "blur(10px)"}}
                  aria-label={t('tooltips.addFastLink')}
                >
                  <PlusIcon />
                </IconButton>
              </Flex>
            )}
          </div>
        </SortableContext>

        <DragOverlay>
          {activeId && (() => {
            const item = fastLinks.find((link) => link.id === activeId);
            return item ? (
              <FastLink
                fastLink={item}
                isDragging={true}
              />
            ) : null;
          })()}
        </DragOverlay>
      </DndContext>

      {/* Диалоги */}
      <AddFastLinkDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
      />
      
      {editingFastLink && (
        <EditFastLinkDialog
          open={editDialogOpen}
          onOpenChange={handleCloseEditDialog}
          fastLink={editingFastLink}
        />
      )}
    </Box>
  );
};
