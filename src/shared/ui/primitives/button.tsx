import { forwardRef } from "react";
import { cn } from "../cn";

type Variant =
	| "primary"
	| "secondary"
	| "secondaryDark"
	| "ghost"
	| "danger";
type Size = "sm" | "md" | "lg";

const VARIANT: Record<Variant, string> = {
	primary: "bg-brand-500 text-white font-bold hover:bg-brand-600",
	secondary:
		"bg-white text-ink-700 font-semibold border border-ink-200 hover:bg-ink-50",
	// 다크 셸(이벤트·아케이드) 위의 secondary.
	// className으로 색을 덮으면 Tailwind의 CSS 생성 순서 때문에 기본 variant에
	// 밀릴 수 있어, 전용 variant로 분리한다.
	secondaryDark:
		"bg-transparent text-ink-300 font-semibold border border-ink-700 hover:bg-white/10",
	ghost: "bg-transparent text-brand-700 font-semibold hover:bg-brand-50",
	danger:
		"bg-brand-50 text-brand-700 font-bold border border-brand-200 hover:bg-brand-100",
};

const SIZE: Record<Size, string> = {
	sm: "h-8 px-3.5 rounded-[8px] text-[13px]",
	md: "h-10 px-5 rounded-[10px] text-[15px]",
	lg: "h-12 px-6 rounded-md text-[16px]",
};

export interface ButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: Variant;
	size?: Size;
	fullWidth?: boolean;
}

/** 시안 §03 PRIMITIVES — primary/secondary/ghost/danger × lg 48 · md 40 · sm 32 */
const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
	{ variant = "primary", size = "md", fullWidth, className, ...props },
	ref
) {
	return (
		<button
			ref={ref}
			className={cn(
				"inline-flex items-center justify-center gap-2 transition-colors",
				"disabled:opacity-50 disabled:pointer-events-none",
				VARIANT[variant],
				SIZE[size],
				fullWidth && "w-full",
				className
			)}
			{...props}
		/>
	);
});

export default Button;
