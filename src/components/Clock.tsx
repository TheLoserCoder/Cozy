import * as React from "react";
import { Text, Heading, Box } from "@radix-ui/themes";
import { useAppSelector } from "../store/hooks";

export const Clock: React.FC = () => {
  const [time, setTime] = React.useState<Date>(new Date());
  const { clock } = useAppSelector((state) => state.theme);

  React.useEffect(() => {
    if (!clock.enabled) return;

    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [clock.enabled]);

  const formattedTime = time.toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
    second: clock.showSeconds ? "2-digit" : undefined,
    hour12: false,
  });

  // Если часы отключены, не отображаем их
  if (!clock.enabled) {
    return null;
  }

  return (
    <Box
      mb="6"
      p="4"
      style={{
        textAlign: "center",
        transform: `scale(${clock.size})`,
        transformOrigin: "center",
        transition: "transform 0.3s ease"
      }}
    >
      <Heading
        size="9"
        mb={clock.showDate ? "3" : "0"}
        style={{
          fontSize: "4rem",
          fontWeight: "300",
          letterSpacing: "-0.02em",
          color: clock.color,
          transition: "all 0.3s ease"
        }}
      >
        {formattedTime}
      </Heading>
      {clock.showDate && (
        <Text
          size="4"
          style={{
            fontSize: "1.2rem",
            fontWeight: "400",
            color: clock.color,
            opacity: 0.8,
            transition: "all 0.3s ease"
          }}
        >
          {time.toLocaleDateString("ru-RU", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </Text>
      )}
    </Box>
  );
};
