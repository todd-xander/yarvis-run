import Image from "next/image";
import Link from "next/link";
import { GradientShadowText } from "@/components/ui/gradient-shadow-text";
import type { AvatarAuthor } from "@/lib/content-types";

type AvatarSize = "md" | "lg" | "xl";
type AvatarShape = "square" | "circle";

const sizeMap: Record<AvatarSize, { dim: string; fontSize: string; iconSize: string }> = {
	md: { dim: "size-12", fontSize: "text-2xl", iconSize: "size-8" },
	lg: { dim: "size-20", fontSize: "text-4xl", iconSize: "size-12" },
	xl: { dim: "size-40", fontSize: "text-8xl", iconSize: "size-32" },
};

type AvatarProps = {
	author: AvatarAuthor;
	size?: AvatarSize;
	shape?: AvatarShape;
	href?: string;
	className?: string;
	onMouseEnter?: () => void;
	onMouseLeave?: () => void;
	onFocus?: () => void;
	onBlur?: () => void;
};

function getAuthorIcon(
	author: AvatarAuthor,
	avatarClassName: string,
) {
	if (author.avatar) {
		return (
			<Image
				src={author.avatar}
				alt={author.title}
				width={64}
				height={64}
				className={avatarClassName}
			/>
		);
	}

	return author.title.charAt(0).toUpperCase();
}

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
	const { dim, fontSize } = sizeMap[size];
	const avatarClassName = `shrink-0 ${shape === "circle" ? "rounded-full" : "rounded-lg"} object-cover border border-border/40 ${dim} ${className}`.trim();
	const icon = getAuthorIcon(author, avatarClassName);

	const content = author.avatar ? (
		icon
	) : (
		<span
			className={`inline-flex shrink-0 items-center justify-center ${shape === "circle" ? "rounded-full" : "rounded-lg"} bg-bg-jike-yellow ${dim} ${className}`.trim()}
		>
			<GradientShadowText fontSize={fontSize}>{icon}</GradientShadowText>
		</span>
	);

	if (!href) {
		return content;
	}

	return (
		<Link
			href={href}
			className={`inline-flex ${shape === "circle" ? "rounded-full" : "rounded-lg"} `}
			onMouseEnter={onMouseEnter}
			onMouseLeave={onMouseLeave}
			onFocus={onFocus}
			onBlur={onBlur}
		>
			{content}
		</Link>
	);
}
