import Link from "next/link";
import type { PropsWithChildren, ReactNode } from "react";

type PillVariant = "topic" | "outline" | "soft" | "action";

type PillProps = PropsWithChildren<{
	variant: PillVariant;
	icon?: ReactNode;
	href?: string;
	ariaLabel?: string;
	className?: string;
}>;

const baseClasses =
	"inline-flex items-center rounded-full transition-colors duration-200";

const variantClasses: Record<PillVariant, string> = {
	topic:
		"h-6 gap-1 bg-surface-soft pl-1 pr-2 text-xs font-medium text-jike-blue",
	outline: "border border-border px-3 py-1 text-xs",
	soft: "bg-surface-soft px-3 py-0.5 text-xs",
	action:
		"h-9 gap-1 px-3 text-sm leading-5 cursor-pointer hover:bg-interactive-hover",
};

function getPillClassName(
	variant: PillVariant,
	className: string,
) {
	return `${baseClasses} ${variantClasses[variant]} ${className}`.trim();
}

export function Pill({
	variant,
	children,
	icon,
	href,
	ariaLabel,
	className = "",
}: PillProps) {
	const content = (
		<>
			{icon ? <span className="inline-flex">{icon}</span> : null}
			{children ? <span>{children}</span> : null}
		</>
	);

	return (
		<Link
			href={href || "#"}
			aria-label={ariaLabel}
			title={ariaLabel}
			className={getPillClassName(variant, className)}
		>
			{content}
		</Link>
	);
}
