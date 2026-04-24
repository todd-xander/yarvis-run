"use client";

import {
	RiArrowLeftLine,
	RiArrowRightLine,
	RiCloseLargeLine,
	RiImageCircleLine,
	RiRefreshLine,
} from "@remixicon/react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { PostImage } from "@/lib/content-types";

type ImageLightboxProps = {
	images: PostImage[];
	activeIndex: number | null;
	onClose: () => void;
	onSelect: (index: number) => void;
};

function getWrappedIndex(index: number, length: number) {
	return ((index % length) + length) % length;
}

export function ImageLightbox({
	images,
	activeIndex,
	onClose,
	onSelect,
}: ImageLightboxProps) {
	const [visibleIndex, setVisibleIndex] = useState<number | null>(null);
	const [transitionActive, setTransitionActive] = useState(false);
	const [transitionDirection, setTransitionDirection] = useState<1 | -1>(1);
	const [hasImageError, setHasImageError] = useState(false);
	const [retryTrigger, setRetryTrigger] = useState(0);
	const preloadRequestRef = useRef(0);
	const previousActiveIndexRef = useRef<number | null>(null);

	const handleRetry = useCallback(() => {
		setRetryTrigger((v) => v + 1);
	}, []);

	useEffect(() => {
		if (activeIndex === null || images.length === 0) return;

		const originalOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				onClose();
				return;
			}

			if (event.key === "ArrowLeft") {
				event.preventDefault();
				onSelect(getWrappedIndex(activeIndex - 1, images.length));
			}

			if (event.key === "ArrowRight") {
				event.preventDefault();
				onSelect(getWrappedIndex(activeIndex + 1, images.length));
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => {
			document.body.style.overflow = originalOverflow;
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, [activeIndex, images.length, onClose, onSelect]);

	useEffect(() => {
		if (activeIndex === null || images.length === 0) {
			previousActiveIndexRef.current = null;
			return;
		}

		const nextIndex = getWrappedIndex(activeIndex, images.length);
		const nextImage = images[nextIndex];
		void retryTrigger;
		const previousIndex = previousActiveIndexRef.current;
		const nextDirection =
			previousIndex === null
				? 1
				: nextIndex === getWrappedIndex(previousIndex + 1, images.length)
					? 1
					: -1;
		const requestId = preloadRequestRef.current + 1;
		preloadRequestRef.current = requestId;
		previousActiveIndexRef.current = nextIndex;

		setTransitionDirection(nextDirection);
		setVisibleIndex(null);
		setTransitionActive(false);
		setHasImageError(false);

		const preloadedImage = new window.Image();
		preloadedImage.decoding = "async";
		preloadedImage.loading = "eager";
		preloadedImage.onload = () => {
			if (preloadRequestRef.current !== requestId) return;
			setVisibleIndex(nextIndex);
			setTransitionActive(true);
			requestAnimationFrame(() => {
				requestAnimationFrame(() => {
					if (preloadRequestRef.current !== requestId) return;
					setTransitionActive(false);
				});
			});
		};
		preloadedImage.onerror = () => {
			if (preloadRequestRef.current !== requestId) return;
			setVisibleIndex(null);
			setTransitionActive(false);
			setHasImageError(true);
		};
		preloadedImage.src = nextImage.src;
	}, [activeIndex, images, retryTrigger]);

	if (
		activeIndex === null ||
		images.length === 0 ||
		typeof document === "undefined"
	) {
		return null;
	}

	const currentIndex = getWrappedIndex(activeIndex, images.length);
	const currentImage = images[currentIndex];
	const visibleImage = visibleIndex === null ? null : images[visibleIndex];

	return createPortal(
		<div
			className="fixed inset-0 z-50 bg-black/88 p-4 sm:p-6"
			role="dialog"
			aria-modal="true"
			aria-label="图片幻灯片"
		>
			<button
				type="button"
				className="absolute inset-0 z-0"
				onClick={onClose}
				aria-label="关闭图片预览背景"
			/>
			<div className="pointer-events-none relative z-10 flex h-full flex-col">
				<div className="pointer-events-auto flex items-center justify-between text-white/90">
					<p className="text-sm">
						{currentIndex + 1} / {images.length}
					</p>
					<button
						type="button"
						onClick={onClose}
						className="inline-flex size-10 items-center justify-center rounded-full bg-white/10 outline-none hover:bg-white/18 focus:outline-none focus-visible:outline-none focus-visible:ring-0"
						aria-label="关闭图片预览"
					>
						<RiCloseLargeLine className="size-5" />
					</button>
				</div>

				<div className="pointer-events-none flex min-h-0 flex-1 items-center justify-center gap-3">
					{images.length > 1 ? (
						<button
							type="button"
							onClick={() =>
								onSelect(getWrappedIndex(currentIndex - 1, images.length))
							}
							className="pointer-events-auto inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-white/10 text-white outline-none hover:bg-white/18 focus:outline-none focus-visible:outline-none focus-visible:ring-0"
							aria-label="上一张图片"
						>
							<RiArrowLeftLine className="size-6" />
						</button>
					) : (
						<div className="size-11 shrink-0" />
					)}

					<div className="pointer-events-none relative flex min-h-0 flex-1 items-center justify-center self-stretch">
						{visibleIndex === null && !hasImageError ? (
							<div className="absolute inset-0 flex items-center justify-center">
								<div className="size-8 animate-spin rounded-full border-2 border-white/20 border-t-white/80" />
							</div>
						) : null}
						{hasImageError ? (
							<div className="pointer-events-auto flex max-w-sm flex-col items-center rounded-lg border border-white/10 bg-white/5 px-6 py-5 text-center text-white/85 backdrop-blur-sm">
								<RiImageCircleLine className="size-10 text-white/65" />
								<p className="mt-3 text-base font-medium text-white">
									图片加载失败
								</p>
								<p className="mt-1 text-sm leading-6 text-white/65">
									请重试，或切换到其他图片继续浏览。
								</p>
								<button
									type="button"
									onClick={handleRetry}
									className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-white outline-none hover:bg-white/16 focus:outline-none focus-visible:outline-none focus-visible:ring-0"
								>
									<RiRefreshLine className="size-4" />
									重试
								</button>
							</div>
						) : null}
						{visibleImage ? (
							<div
								className={`pointer-events-auto relative transition-all duration-200 ease-out ${transitionActive
									? transitionDirection === 1
										? "translate-x-8 opacity-0"
										: "-translate-x-8 opacity-0"
									: "translate-x-0 opacity-100"
									}`}
							>
								<Image
									src={visibleImage.src}
									alt={visibleImage.alt}
									title={visibleImage.title}
									width={1600}
									height={1600}
									sizes="100vw"
									className="mx-auto h-auto max-h-[calc(100vh-8rem)] w-auto max-w-full rounded-xl object-contain"
								/>
							</div>
						) : null}
					</div>

					{images.length > 1 ? (
						<button
							type="button"
							onClick={() =>
								onSelect(getWrappedIndex(currentIndex + 1, images.length))
							}
							className="pointer-events-auto inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-white/10 text-white outline-none hover:bg-white/18 focus:outline-none focus-visible:outline-none focus-visible:ring-0"
							aria-label="下一张图片"
						>
							<RiArrowRightLine className="size-6" />
						</button>
					) : (
						<div className="size-11 shrink-0" />
					)}
				</div>

				<div className="pointer-events-none min-h-6 pt-2 text-center text-sm text-white/75">
					{currentImage.title || currentImage.alt || ""}
				</div>
			</div>
		</div>,
		document.body,
	);
}
