"use client";

import { code } from "@streamdown/code";
import { math } from "@streamdown/math";
import { mermaid } from "@streamdown/mermaid";
import remarkSlug from "remark-slug";
import { useCallback, useEffect, useRef, useState } from "react";
import { Streamdown, defaultRemarkPlugins } from "streamdown";
import { ImageLightbox } from "@/components/image-lightbox";
import type { PostImage } from "@/lib/content-types";

function MarkdownLink({
	children,
	href,
	...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement> & { node?: unknown }) {
	const isExternal = href?.startsWith("http");
	return (
		<a
			href={href}
			{...props}
			target={isExternal ? "_blank" : undefined}
			rel={isExternal ? "noreferrer" : undefined}
		>
			{children}
		</a>
	);
}

export function PostMarkdown({ content }: { content: string }) {
	const containerRef = useRef<HTMLDivElement | null>(null);
	const [lightboxImages, setLightboxImages] = useState<PostImage[]>([]);
	const [activeIndex, setActiveIndex] = useState<number | null>(null);

	const openLightboxFromImage = useCallback((target: HTMLImageElement) => {
		const container = containerRef.current;
		if (!container) return;

		const imageNodes = [...container.querySelectorAll("img")].filter((node) =>
			node.getAttribute("src"),
		);
		const images = imageNodes.map((node) => ({
			src: node.getAttribute("src") ?? "",
			alt: node.getAttribute("alt") ?? "",
			title: node.getAttribute("title") ?? undefined,
		}));
		const clickedIndex = imageNodes.indexOf(target);

		if (clickedIndex === -1 || images.length === 0) return;

		setLightboxImages(images);
		setActiveIndex(clickedIndex);
	}, []);

	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;

		const handleClick = (event: MouseEvent) => {
			const target = event.target;
			if (!(target instanceof HTMLImageElement)) return;
			event.preventDefault();
			openLightboxFromImage(target);
		};

		container.addEventListener("click", handleClick);
		return () => container.removeEventListener("click", handleClick);
	}, [openLightboxFromImage]);

	return (
		<div ref={containerRef}>
			<Streamdown
				className="post-markdown"
				mode="static"
				plugins={{ code, math, mermaid }}
				components={{ a: MarkdownLink }}
				rehypePlugins={undefined}
				remarkPlugins={[...Object.values(defaultRemarkPlugins), remarkSlug as never]}
				remarkRehypeOptions={{ clobberPrefix: "" }}
				controls={{
					code: true,
					table: true,
					mermaid: true,
				}}
				linkSafety={{ enabled: false }}
				mermaid={{
					config: {
						theme: "neutral",
					},
				}}
				allowedTags={{
					figure: [],
					figcaption: [],
					img: ["src", "alt", "title", "width", "height"],
				}}
			>
				{content}
			</Streamdown>

			<ImageLightbox
				images={lightboxImages}
				activeIndex={activeIndex}
				onClose={() => setActiveIndex(null)}
				onSelect={setActiveIndex}
			/>
		</div>
	);
}
