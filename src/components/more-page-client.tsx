"use client";

import { RiArrowRightSLine } from "@remixicon/react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ThemeToggleGroup } from "@/components/theme-toggle-group";
import type { MenuGroup } from "@/lib/content-types";

function SectionGroup({
	title,
	children,
}: {
	title: string;
	children: React.ReactNode;
}) {
	return (
		<div>
			<h2 className="py-3 text-sm font-medium leading-none tracking-[0.25px] text-muted">
				{title}
			</h2>
			<div>{children}</div>
		</div>
	);
}

function Row({
	href,
	onClick,
	label,
	children,
}: {
	href?: string;
	onClick?: () => void;
	label: string;
	children?: React.ReactNode;
}) {
	const cls =
		"flex w-full cursor-pointer items-center justify-between py-2.5 border-t border-border/50";
	const inner = (
		<>
			<span className="text-base leading-6">{label}</span>
			{children ?? <RiArrowRightSLine className="size-5" />}
		</>
	);

	if (href) {
		return (
			<Link href={href} className={cls}>
				{inner}
			</Link>
		);
	}

	return (
		<button type="button" onClick={onClick} className={cls}>
			{inner}
		</button>
	);
}

type ShortcutModalProps = {
	open: boolean;
	onClose: () => void;
};

const shortcuts = [
	{ keys: ["H"], description: "打开快捷键帮助" },
	{ keys: ["Esc"], description: "关闭弹窗" },
	{ keys: ["←", "→"], description: "幻灯片中切换图片" },
];

function ShortcutHelpModal({ open, onClose }: ShortcutModalProps) {
	useEffect(() => {
		if (!open) return;
		const handler = (e: KeyboardEvent) => {
			if (e.key === "Escape") onClose();
		};
		window.addEventListener("keydown", handler);
		return () => window.removeEventListener("keydown", handler);
	}, [open, onClose]);

	if (!open) return null;

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
			role="dialog"
			aria-modal="true"
			aria-label="快捷键帮助"
			onClick={onClose}
			onKeyDown={(e) => {
				if (e.key === "Escape") onClose();
			}}
		>
			<div
				className="mx-4 w-full max-w-sm rounded-lg bg-card p-6 shadow-xl"
				onClick={(e) => e.stopPropagation()}
			>
				<h3 className="text-lg font-semibold">快捷键</h3>
				<div className="mt-4 space-y-3">
					{shortcuts.map((s) => (
						<div
							key={s.description}
							className="flex items-center justify-between"
						>
							<span className="text-sm text-muted">{s.description}</span>
							<div className="flex gap-1">
								{s.keys.map((key) => (
									<kbd
										key={key}
										className="inline-flex h-7 min-w-7 items-center justify-center rounded-md border border-border bg-surface-subtle px-2 text-xs font-medium"
									>
										{key}
									</kbd>
								))}
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}

export function MorePageClient({
	postSlugs,
	menuGroups,
}: {
	postSlugs: { slug: string; section: string }[];
	menuGroups: MenuGroup[];
}) {
	const [shortcutOpen, setShortcutOpen] = useState(false);

	const handleRandom = useCallback(() => {
		if (postSlugs.length === 0) return;
		const entry = postSlugs[Math.floor(Math.random() * postSlugs.length)];
		window.location.href = `/${entry.section}/${entry.slug}`;
	}, [postSlugs]);

	useEffect(() => {
		const handler = (e: KeyboardEvent) => {
			if (
				e.key === "h" &&
				!e.metaKey &&
				!e.ctrlKey &&
				!e.altKey &&
				!(e.target instanceof HTMLInputElement) &&
				!(e.target instanceof HTMLTextAreaElement)
			) {
				e.preventDefault();
				setShortcutOpen(true);
			}
		};
		window.addEventListener("keydown", handler);
		return () => window.removeEventListener("keydown", handler);
	}, []);

	return (
		<>
			<div className="space-y-4 p-4">
				<SectionGroup title="通用">
					<div className="flex items-center justify-between py-2.5 border-t border-border/50">
						<span className="text-base leading-6">主题</span>
						<ThemeToggleGroup />
					</div>
				</SectionGroup>

				{menuGroups.map((group) => (
					<SectionGroup key={group.group} title={group.group}>
						{group.items.map((item) => (
							<Row key={item.href} href={item.href} label={item.label} />
						))}
					</SectionGroup>
				))}

				<SectionGroup title="其他">
					<Row onClick={() => setShortcutOpen(true)} label="魔法捷径" />
					<Row onClick={handleRandom} label="随便看看" />
				</SectionGroup>
			</div>

			<ShortcutHelpModal
				open={shortcutOpen}
				onClose={() => setShortcutOpen(false)}
			/>
		</>
	);
}
