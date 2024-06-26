import { cn } from "@/lib/utils";
import { cs } from "./cs";
import { signInWithGoogle } from "@/db/firebase";

interface ButtonInterface {
  className?: string;
  children?: React.ReactNode;
  color?: string;
  onClick?: () => void;
}

export const CustomButton = (props: ButtonInterface) => {
  const { className, children, color, onClick } = props;
  const colors = cs({ color: color || "blue" });
  return (
    <button
      className={cn(`px-6 py-3 rounded-xl transition text-white`, className, colors.bg, colors.bgd)}
      onClick={() => {
        onClick && onClick();
      }}
    >
      {children}
    </button>
  );
};

export const CustomButtonSmall = (props: ButtonInterface) => {
  const { className, children, color, onClick } = props;
  const colors = cs({ color: color || "blue" });
  return (
    <button
      className={cn(`px-3 py-1 rounded-full transition text-white text-sm`, className, colors.bg, colors.bgd)}
      onClick={() => {
        onClick && onClick();
      }}
    >
      {children}
    </button>
  );
};
