"use client";

type GradientShadowTextProps = {
	children: string;
	fontSize?: string;
};

export function GradientShadowText({
	children,
	fontSize = "text-3xl",
}: GradientShadowTextProps) {
	return (
		<span className={`relative font-black leading-none text-solid-white ${fontSize}`}>
			<span
				aria-hidden
				className={`absolute inset-0 z-0 font-black leading-none text-transparent bg-clip-text ${fontSize}`}
				style={{
					backgroundImage: "linear-gradient(to bottom, var(--solid-white), var(--jike-blue))",
					filter: "blur(1px)",
					transform: "translate(2px, 2px)",
				}}
			>
				{children}
			</span>
			<span className="relative z-10">{children}</span>
		</span>
	);
}
