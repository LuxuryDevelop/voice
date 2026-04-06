import type { ButtonHTMLAttributes, PropsWithChildren } from "react";

type ButtonProps = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "primary" | "ghost";
  }
>;

const Button = ({ children, className = "", variant = "primary", ...props }: ButtonProps): JSX.Element => {
  const base =
    "inline-flex items-center justify-center rounded-xl px-4 py-2 font-ui text-sm font-semibold transition-all duration-200";
  const palette =
    variant === "primary"
      ? "bg-[#C9A84C] text-black hover:brightness-110"
      : "bg-white/5 text-white hover:bg-white/10 border border-white/10";

  return (
    <button className={`${base} ${palette} ${className}`} {...props}>
      {children}
    </button>
  );
};

export default Button;

