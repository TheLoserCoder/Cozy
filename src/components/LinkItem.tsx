import * as React from "react";
import { Flex, Text, ContextMenu, IconButton } from "@radix-ui/themes";
import { Pencil2Icon } from "@radix-ui/react-icons";
import { useAppSelector } from "../store/hooks";
import { EditLinkDialog } from "./EditLinkDialog";

interface LinkItemProps {
  id: string;
  url: string;
  title: string;
  iconUrl?: string;
  color?: string;
  customColor?: string;
  className?: string;
  isDragging?: boolean;
  style?: React.CSSProperties;
  dragHandleProps?: any;
  listId?: string; // Для редактирования
}

export const LinkItem: React.FC<LinkItemProps> = ({
  id,
  url,
  title,
  iconUrl,
  color,
  customColor,
  className,
  isDragging = false,
  style = {},
  dragHandleProps = {},
  listId
}) => {
  const { colors } = useAppSelector((state) => state.theme);
  const [editOpen, setEditOpen] = React.useState(false);

  // Определяем цвет ссылки: кастомный цвет ссылки, общий цвет ссылок или дефолтный
  const linkColor = customColor || colors.links || color;

  const linkStyle = {
    color: linkColor,
    textDecoration: "none",
    opacity: isDragging ? 0.5 : 1,
    cursor: "grab",
    ...style,
  };

  return (
    <>
      <ContextMenu.Root>
        <ContextMenu.Trigger>
          <a
            href={url}
            style={linkStyle}
            target="_blank"
            rel="noopener noreferrer"
            className={className}
            draggable={false}
            {...dragHandleProps}
          >
            <Flex
              align="center"
              gap="3"
              px="3"
              py="2"
              style={{
                borderRadius: 9999,
                transition: "background-color 0.2s ease",
                position: "relative"
              }}
            >
              {iconUrl && (
                <span style={{
                  cursor: "grab",
                  display: "flex",
                  alignItems: "center",
                  flexShrink: 0
                }}>
                  <img
                    src={iconUrl}
                    alt="icon"
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 4,
                      objectFit: "contain"
                    }}
                  />
                </span>
              )}
              <Text
                as="span"
                size="3"
                weight="medium"
                style={{
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  flex: 1
                }}
              >
                {title}
              </Text>

              {/* Кнопка редактирования */}
              {listId && (
                <IconButton
                  variant="ghost"
                  size="1"
                  style={{
                    opacity: 0,
                    transition: "opacity 0.2s",
                    position: "absolute",
                    right: "8px",
                    top: "50%",
                    transform: "translateY(-50%)"
                  }}
                  className="edit-link-btn"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setEditOpen(true);
                  }}
                >
                  <Pencil2Icon />
                </IconButton>
              )}
            </Flex>
          </a>
        </ContextMenu.Trigger>

        {listId && (
          <ContextMenu.Content>
            <ContextMenu.Item onClick={() => setEditOpen(true)}>
              Редактировать
            </ContextMenu.Item>
          </ContextMenu.Content>
        )}
      </ContextMenu.Root>

      {/* Диалог редактирования */}
      {listId && (
        <EditLinkDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          listId={listId}
          linkId={id}
          initialTitle={title}
          initialUrl={url}
          initialColor={customColor}
        />
      )}
    </>
  );
};

// Добавляем стили для hover эффекта
const style = document.createElement('style');
style.textContent = `
  .edit-link-btn {
    opacity: 0 !important;
    transition: opacity 0.2s ease !important;
  }

  .edit-link-btn:hover,
  .edit-link-btn:focus {
    opacity: 1 !important;
  }

  a:hover .edit-link-btn {
    opacity: 1 !important;
  }
`;

if (!document.head.querySelector('style[data-link-item-hover]')) {
  style.setAttribute('data-link-item-hover', 'true');
  document.head.appendChild(style);
}
