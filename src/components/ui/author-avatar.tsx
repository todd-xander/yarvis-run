import Image from "next/image";
import Link from "next/link";
import { GradientShadowText } from "@/components/ui/gradient-shadow-text";
import type { DimensionItem } from "@/lib/content-types";

type AvatarSize = "md" | "lg" | "xl";
type AvatarShape = "square" | "circle";

const sizeMap: Record<AvatarSize, { dim: string; fontSize: string }> = {
	md: { dim: "size-11", fontSize: "text-lg" },
	lg: { dim: "size-20", fontSize: "text-4xl" },
	xl: { dim: "size-40", fontSize: "text-2xl" },
};

type AvatarProps = {
	author: DimensionItem;
	size?: AvatarSize;
	shape?: AvatarShape;
	href?: string;
	className?: string;
	onMouseEnter?: () => void;
	onMouseLeave?: () => void;
	onFocus?: () => void;
	onBlur?: () => void;
};

export function AuthorAvatar({
	author,
	size = "md",
	shape = "square",
	href,
	className = "",
	onMouseEnter,
	onMouseLeave,
	onFocus,
	onBlur,
}: AvatarProps) {
	const initials = author.name.charAt(0).toUpperCase();
	const { dim, fontSize } = sizeMap[size];

	const content = author.avatar ? (
		<Image
			src={author.avatar}
			alt={author.name}
			width={64}
			height={64}
			className={`shrink-0 ${shape === "circle" ? "rounded-full" : "rounded-lg"} object-cover border border-border/40 ${dim} ${className}`.trim()}
		/>
	) : (
		<span
			className={`inline-flex shrink-0 items-center justify-center ${shape === "circle" ? "rounded-full" : "rounded-lg"} bg-bg-jike-yellow ${dim} ${className}`.trim()}
		>
			<GradientShadowText fontSize={fontSize}>{initials}</GradientShadowText>
		</span>
	);

	if (!href) {
		return content;
	}

	return (
		<Link
			href={href}
			className={`inline-flex`}
			onMouseEnter={onMouseEnter}
			onMouseLeave={onMouseLeave}
			onFocus={onFocus}
			onBlur={onBlur}
		>
			{content}
		</Link>
	);
}
