import Link from "next/link";
import type { ReactNode } from "react";

type PillVariant = "topic" | "outline" | "soft" | "action";

type PillProps = {
	variant: PillVariant;
	children?: ReactNode;
	icon?: ReactNode;
	href?: string;
	ariaLabel?: string;
	className?: string;
};

const baseClasses =
	"inline-flex items-center rounded-full transition-colors duration-200";

const variantClasses: Record<PillVariant, string> = {
	topic:
		"h-6 gap-1 bg-surface-soft pl-1 pr-2 text-xs font-medium text-jike-blue",
	outline: "border border-border px-3 py-1 text-xs",
	soft: "bg-surface-soft px-3 py-0.5 text-xs",
	action:
		"h-9 gap-1 px-3 text-sm leading-5 text-muted hover:bg-interactive-hover",
};

function getPillClassName(
	variant: PillVariant,
	iconOnly: boolean,
	className: string,
) {
	const iconOnlyClasses = iconOnly
		? variant === "action"
			? "px-2 justify-center"
			: "justify-center"
		: "";

	return `${baseClasses} ${variantClasses[variant]} ${iconOnlyClasses} ${className}`.trim();
}

export function Pill({
	variant,
	children,
	icon,
	href,
	ariaLabel,
	className = "",
}: PillProps) {
	const iconOnly = !children;
	const content = (
		<>
			{icon ? <span className="inline-flex">{icon}</span> : null}
			{children ? <span>{children}</span> : null}
		</>
	);

	if (href) {
		return (
			<Link
				href={href}
				aria-label={ariaLabel}
				className={getPillClassName(variant, iconOnly, className)}
			>
				{content}
			</Link>
		);
	}

	return (
		<span className={getPillClassName(variant, iconOnly, className)}>
			{content}
		</span>
	);
}
