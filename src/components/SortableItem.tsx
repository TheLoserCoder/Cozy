import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export default function SortableItem({ id, title, url, isOverlay }: { id: string; title?: string; url?: string; isOverlay?: boolean }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: "grab",
    background: isOverlay ? "#fff" : "#fff",
    border: "1px solid #bbb",
    borderRadius: 8,
    margin: "6px 0",
    padding: 10,
    minHeight: 40,
    display: "flex",
    alignItems: "center",
    boxShadow: isDragging ? "0 2px 8px #0002" : undefined,
    zIndex: isOverlay ? 1000 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <span style={{ fontWeight: 500 }}>{title || id}</span>
      {url && (
        <a href={url} target="_blank" rel="noopener noreferrer" style={{ marginLeft: 12, fontSize: 13, color: "#888" }}>{url}</a>
      )}
    </div>
  );
}
