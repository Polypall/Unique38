import {
  Drama, Gamepad2, Film, Tv, BookOpen, Box, Palette, CircleDot,
  Boxes, Smile, Bot, Shirt, Heart, Sparkles, type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  Drama, Gamepad2, Film, Tv, BookOpen, Box, Palette, CircleDot,
  Boxes, Smile, Bot, Shirt, Heart,
};

export function getGroupIcon(icon: string | null | undefined): LucideIcon {
  if (icon && ICONS[icon]) return ICONS[icon];
  return Sparkles;
}
