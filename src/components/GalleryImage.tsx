import * as React from "react";
import { Box, Skeleton } from "@radix-ui/themes";
import { TrashIcon } from "@radix-ui/react-icons";
import { ActionIconButton } from "./ActionButtons";
import { useTranslation } from "../locales";

interface GalleryImageProps {
  src: string;
  alt: string;
  isSelected: boolean;
  onClick: () => void;
  onDelete?: () => void;
  index: number;
}

export const GalleryImage: React.FC<GalleryImageProps> = ({
  src,
  alt,
  isSelected,
  onClick,
  onDelete,
  index
}) => {
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [isError, setIsError] = React.useState(false);
  const [isInView, setIsInView] = React.useState(false);
  const imgRef = React.useRef<HTMLImageElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  // Intersection Observer для lazy loading
  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: "50px" // Начинаем загрузку за 50px до появления в viewport
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, []);

  const handleImageLoad = () => {
    setIsLoaded(true);
    setIsError(false);
  };

  const handleImageError = () => {
    setIsError(true);
    setIsLoaded(false);
  };

  return (
    <Box
      ref={containerRef}
      style={{
        position: "relative",
        aspectRatio: "1",
        borderRadius: "6px",
        overflow: "hidden",
        cursor: "pointer",
        border: isSelected ? "2px solid var(--accent-9)" : "1px solid var(--gray-6)",
        transition: "all 0.3s ease-in-out",
        animation: `slideInGallery 0.3s ease-out ${index * 0.05}s both`
      }}
      onClick={onClick}
      className="gallery-item"
    >
      {/* Скелетон пока изображение не загружено */}
      {(!isLoaded || !isInView) && !isError && (
        <Skeleton
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            borderRadius: "6px"
          }}
        />
      )}

      {/* Изображение с lazy loading */}
      {isInView && (
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          loading="lazy"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: isLoaded ? 1 : 0,
            transition: "opacity 0.3s ease-in-out, transform 0.3s ease-in-out",
            transform: "scale(1)",
            display: isError ? "none" : "block"
          }}
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
      )}

      {/* Fallback для ошибки загрузки */}
      {isError && (
        <Box
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "var(--gray-3)",
            color: "var(--gray-9)",
            fontSize: "12px"
          }}
        >
          {t('errors.loadingError')}
        </Box>
      )}

      {/* Кнопка удаления */}
      {onDelete && (
        <div
          style={{
            position: "absolute",
            top: "4px",
            right: "4px",
            opacity: 0,
            transition: "opacity 0.2s",
            zIndex: 10
          }}
          className="delete-btn"
        >
          <ActionIconButton
            variant="solid"
            color="red"
            size="1"
            onClick={(e) => {
              e?.stopPropagation();
              onDelete();
            }}
            aria-label={t('settings.deleteImage')}
          >
            <TrashIcon />
          </ActionIconButton>
        </div>
      )}
    </Box>
  );
};
