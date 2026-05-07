"use client";

import { cloneElement, isValidElement } from "react";
import type { ReactNode } from "react";

type GradientShadowTextProps = {
	children: ReactNode;
	fontSize?: string;
};

export function GradientShadowText({
	children,
	fontSize = "text-3xl",
}: GradientShadowTextProps) {
	const child = children;
	const isIconChild = isValidElement<{ className?: string }>(child);
	const content = isIconChild
		? cloneElement(child, { className: child.props.className })
		: child;
	const renderIconLayer = (className: string) => (
		isIconChild
			? cloneElement(child, {
				className: `${child.props.className || ""} ${className}`.trim(),
			})
			: null
	);

	return (
		<span className={`relative inline-flex items-center justify-center font-black leading-none text-solid-white ${fontSize}`}>
			{isIconChild ? (
				<>
					<span
						aria-hidden
						className="absolute inset-0 z-0 inline-flex items-center justify-center text-solid-white"
						style={{
							filter: "blur(1px)",
							transform: "translate(2px, 2px)",
							opacity: 0.9,
						}}
					>
						{renderIconLayer("text-solid-white")}
					</span>
					<span
						aria-hidden
						className="absolute inset-0 z-0 inline-flex items-center justify-center text-jike-blue"
						style={{
							filter: "blur(1px)",
							transform: "translate(2px, 2px)",
							opacity: 0.75,
						}}
					>
						{renderIconLayer("text-jike-blue")}
					</span>
					<span className="relative z-1 inline-flex items-center justify-center">
						{content}
					</span>
				</>
			) : (
				<>
					<span
						aria-hidden
						className={`absolute inset-0 z-0 font-black leading-none text-transparent bg-clip-text ${fontSize}`}
						style={{
							backgroundImage: "linear-gradient(to bottom, var(--solid-white), var(--jike-blue))",
							filter: "blur(1px)",
							transform: "translate(2px, 2px)",
						}}
					>
						{content}
					</span>
					<span className="relative z-1 font-mono">{content}</span>
				</>
			)}
		</span>
	);
}
