import { cn } from "@/lib/utils";
import { cs } from "./cs";

interface BadgeInterface {
  className?: string;
  children?: React.ReactNode;
  color?: string;
}

export const Badge = (props: BadgeInterface) => {
  const { className, children, color } = props;
  const colors = cs({ color: color || "blue" });
  return <div className={cn(`px-4 py-2 rounded-full text-white text-sm font-medium`, className, colors.bg)}>{children}</div>;
};

export const RoundedNumberBadge = (props: BadgeInterface) => {
  const { className, children, color } = props;
  const colors = cs({ color: color || "blue" });
  return <div className={cn(`max-w-10 px-2 py-1 rounded-full text-white text-xs truncate`, className, colors.bg)}>{children}</div>;
};
