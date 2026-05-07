import Image from "next/image";

type CardCoverProps = {
	title: string;
	image?: string;
	className?: string;
	titleClassName?: string;
	variant?: "default" | "compact";
	imageFit?: "contain" | "cover";
};

function normalizeTitle(title: string) {
	return title.trim().replace(/\s+/g, " ");
}

export function CardCover({
	title,
	image,
	className = "",
	titleClassName = "",
	variant = "default",
	imageFit = "contain",
}: CardCoverProps) {
	if (image) {
		return (
			<div
				className={`relative overflow-hidden bg-surface-subtle ${className}`.trim()}
			>
				<Image
					src={image}
					alt={title}
					fill
					sizes="(max-width: 768px) 100vw, 50vw"
					className={imageFit === "cover"
						? "object-cover"
						: variant === "compact"
							? "object-contain p-3"
							: "object-contain p-6"}
				/>
			</div>
		);
	}

	const normalizedTitle = normalizeTitle(title);

	if (variant === "compact") {
		return (
			<div
				className={`relative overflow-hidden border border-border/30 bg-card text-foreground ${className}`.trim()}
			>
				<div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,208,1,0.12),transparent_42%),radial-gradient(circle_at_bottom_right,rgba(3,169,244,0.08),transparent_38%)]" />
				<div className="absolute inset-x-0 top-0 px-3 pt-3">
					<div className="h-px w-6 bg-jike-yellow/40" />
				</div>
				<div className="relative flex h-full items-end px-3 pb-3">
					<div className="w-full">
						<h2
							className={`text-left font-semibold ${titleClassName}`.trim()}
						>
							{title}
						</h2>
						<div className="mt-2 flex items-center gap-2">
							<div className="h-px w-4 bg-jike-blue/28" />
						</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div
			className={`relative overflow-hidden border border-border/30 bg-card text-foreground ${className}`.trim()}
		>
			<div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,208,1,0.1),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(3,169,244,0.08),transparent_36%)]" />
			<div className="absolute inset-x-0 top-0 px-4 pt-4">
				<div className="h-px w-12 bg-jike-yellow/40" />
			</div>
			<div className="relative flex h-full items-end px-4 pb-4">
				<div className="w-full">
					<h2
						className={`font-semibold ${titleClassName}`.trim()}
					>
						{title}
					</h2>
					<div className="mt-3 flex items-center gap-3">
						<div className="h-px w-8 bg-jike-blue/28" />
						<span className="text-xs font-medium text-muted-soft uppercase">
							{normalizedTitle}
						</span>
					</div>
				</div>
			</div>
		</div>
	);
}
