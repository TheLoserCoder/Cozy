import * as React from "react";
import { Flex, IconButton, Link } from "@radix-ui/themes";
import { Pencil2Icon, TrashIcon } from "@radix-ui/react-icons";
import { useAppSelector } from "../store/hooks";
import { EditLinkDialog } from "./EditLinkDialog";
import { Icon } from "./Icon";

interface LinkItemProps {
  id: string;
  url: string;
  title: string;
  iconUrl?: string;
  iconId?: string;
  iconType?: 'standard' | 'custom' | 'pack' | 'favicon';
  iconColor?: string;
  color?: string;
  customColor?: string;
  listLinkColor?: string; // Индивидуальный цвет ссылок списка
  className?: string;
  isDragging?: boolean;
  style?: React.CSSProperties;
  dragHandleProps?: any;
  listId?: string; // Для редактирования
  onDelete?: () => void; // Для удаления
  cleanMode?: boolean; // Чистый режим - скрывает кнопки редактирования
}



export const LinkItem: React.FC<LinkItemProps> = ({
  id,
  url,
  title,
  iconUrl,
  iconId,
  iconType,
  iconColor,
  color,
  customColor,
  listLinkColor,
  className,
  isDragging = false,
  style = {},
  dragHandleProps = {},
  listId,
  onDelete,
  cleanMode = false
}) => {
  const { lists, radixTheme } = useAppSelector((state) => state.theme);
  const [editOpen, setEditOpen] = React.useState(false);
  const [showButtons, setShowButtons] = React.useState(false);



  // Определяем цвет ссылки: кастомный цвет ссылки, индивидуальный цвет ссылок списка, настройки списков, или менее насыщенный акцентный
  const linkColor = customColor || listLinkColor || lists.linkColor || `color-mix(in srgb, ${radixTheme} 70%, var(--gray-12) 30%)`;

  const linkStyle = {
    color: linkColor,
    textDecoration: "none",
    opacity: isDragging ? 0.5 : 1,
    cursor: "grab",
    ...style,
  };

  return (
    <>
      <div
        style={linkStyle}
        className={className}
        {...dragHandleProps}
        onMouseEnter={() => setShowButtons(true)}
        onMouseLeave={() => setShowButtons(false)}
      >
        <Flex
          className="list-item"
          align="center"
          gap="2"
          px="2"
          py="1"
          style={{
            borderRadius: 9999,
            transition: "all 0.2s ease",
            position: "relative",
            background: "transparent",
            transform: showButtons ? "translateX(4px)" : "translateX(0px)"
          }}
        >
          {!lists.hideIcons && (
            <span style={{
              cursor: "grab",
              display: "flex",
              alignItems: "center",
              flexShrink: 0
            }}>
              <Icon
                iconId={iconId || iconUrl}
                iconType={iconType || (iconUrl ? 'favicon' : undefined)}
                fallbackText={title}
                size={20}
                color={iconColor}
              />
            </span>
          )}
          <Link
            href={url}
            target="_self"
            size="3"
            weight="medium"
            style={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              flex: 1,
              background: "transparent",
              color: linkColor,
              textDecoration: "none",
              fontFamily: "var(--app-font-family, inherit)"
            }}
          >
            {title}
          </Link>

          {/* Кнопки редактирования и удаления - скрыты в чистом режиме */}
          {listId && !cleanMode && (
            <Flex
              gap="1"
              style={{
                opacity: showButtons ? 1 : 0,
                transition: "opacity 0.2s",
                position: "absolute",
                right: "4px",
                top: "50%",
                transform: "translateY(-50%)"
              }}
              className="edit-link-btn"
            >
              <IconButton
                variant="soft"
                size="1"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setEditOpen(true);
                }}
              >
                <Pencil2Icon />
              </IconButton>
              {onDelete && (
                <IconButton
                  variant="soft"
                  color="red"
                  size="1"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onDelete();
                  }}
                >
                  <TrashIcon />
                </IconButton>
              )}
            </Flex>
          )}
        </Flex>
      </div>

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
          initialIconId={iconId}
          initialIconType={iconType}
          initialIconColor={iconColor}
        />
      )}
    </>
  );
};


