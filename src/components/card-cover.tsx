import Image from "next/image";

const fallbackThemes = [
	{
		shell: "from-[#fff0a6] via-[#ffe36d] to-[#ffd14f]",
		glow: "bg-[radial-gradient(circle_at_18%_18%,rgba(255,255,255,0.92),transparent_34%)]",
		accent:
			"bg-[radial-gradient(circle_at_82%_24%,rgba(3,169,244,0.3),transparent_24%),radial-gradient(circle_at_72%_78%,rgba(255,255,255,0.36),transparent_26%)]",
		text: "text-[#2f2a14]",
	},
	{
		shell: "from-[#dff4ff] via-[#bde4ff] to-[#9bc9ff]",
		glow: "bg-[radial-gradient(circle_at_20%_22%,rgba(255,255,255,0.9),transparent_30%)]",
		accent:
			"bg-[radial-gradient(circle_at_84%_20%,rgba(255,228,17,0.34),transparent_20%),radial-gradient(circle_at_70%_78%,rgba(255,255,255,0.36),transparent_26%)]",
		text: "text-[#17324a]",
	},
	{
		shell: "from-[#ece7ff] via-[#d9d3ff] to-[#c7c4ff]",
		glow: "bg-[radial-gradient(circle_at_22%_18%,rgba(255,255,255,0.88),transparent_32%)]",
		accent:
			"bg-[radial-gradient(circle_at_80%_22%,rgba(255,255,255,0.42),transparent_18%),radial-gradient(circle_at_74%_76%,rgba(255,228,17,0.28),transparent_28%)]",
		text: "text-[#31295c]",
	},
	{
		shell: "from-[#d9f4ea] via-[#bce9d6] to-[#97d8c0]",
		glow: "bg-[radial-gradient(circle_at_18%_20%,rgba(255,255,255,0.88),transparent_30%)]",
		accent:
			"bg-[radial-gradient(circle_at_82%_22%,rgba(255,255,255,0.38),transparent_18%),radial-gradient(circle_at_74%_78%,rgba(3,169,244,0.22),transparent_28%)]",
		text: "text-[#173c32]",
	},
] as const;

function getThemeIndex(seed: string) {
	let hash = 0;
	for (const char of seed) {
		hash = (hash * 31 + char.charCodeAt(0)) % fallbackThemes.length;
	}
	return hash;
}

type CardCoverProps = {
	title: string;
	image?: string;
	className?: string;
	titleClassName?: string;
};

export function CardCover({
	title,
	image,
	className = "",
	titleClassName = "",
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
					className="object-contain p-6"
				/>
			</div>
		);
	}

	const theme = fallbackThemes[getThemeIndex(title)];

	return (
		<div
			className={`relative overflow-hidden bg-linear-to-br ${theme.shell} ${theme.text} ${className}`.trim()}
		>
			<div className={`absolute inset-0 ${theme.glow}`} />
			<div className={`absolute inset-0 ${theme.accent}`} />
			<div className="absolute inset-x-[-12%] bottom-[-28%] h-32 rounded-full border border-white/45 bg-white/20 blur-2xl" />
			<div className="relative flex h-full items-end p-5">
				<h2
					className={`max-w-[11ch] text-balance text-2xl font-semibold leading-[1.05] tracking-[-0.03em] ${titleClassName}`.trim()}
				>
					{title}
				</h2>
			</div>
		</div>
	);
}
