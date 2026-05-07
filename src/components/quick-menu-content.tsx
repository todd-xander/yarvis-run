"use client";

import { RiArrowRightSLine } from "@remixicon/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { PropsWithChildren } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useThemeMode } from "@/components/theme-provider";
import type { MenuGroup, PostRouteEntry } from "@/lib/content-types";
import type { ThemeMode } from "@/lib/theme";

export function SectionGroup({ title, children }: PropsWithChildren<{ title: string }>) {
	return (
		<div>
			<h2 className="py-3 text-sm font-medium leading-none tracking-[0.25px] text-muted">
				{title}
			</h2>
			<div>{children}</div>
		</div>
	);
}

export function Row({
	href,
	onClick,
	label,
	children,
}: PropsWithChildren<{
	href?: string;
	onClick?: () => void;
	label: string;
}>) {
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
			<Link href={href} className={cls} onClick={onClick}>
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

export const quickMenuShortcuts: Array<{
	keys: readonly string[];
	macKeys?: readonly string[];
	description: string;
}> = [
	{ keys: ["Ctrl", "K"], macKeys: ["Cmd", "K"], description: "打开捷径菜单" },
	{ keys: ["H"], description: "打开快捷键帮助" },
	{ keys: ["Esc"], description: "关闭弹窗" },
	{ keys: ["Enter"], description: "执行当前命令" },
] as const;

export function ShortcutHelpModal({ open, onClose }: ShortcutModalProps) {
	const isMac = typeof navigator !== "undefined" && navigator.platform.toLowerCase().includes("mac");

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
					{quickMenuShortcuts.map((s) => (
						<div
							key={s.description}
							className="flex items-center justify-between"
						>
							<span className="text-sm text-muted">{s.description}</span>
							<div className="flex gap-1">
								{(isMac && s.macKeys ? s.macKeys : s.keys).map((key) => (
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

export type QuickMenuCommand = {
	id: string;
	label: string;
	group: string;
	keywords?: string[];
	href?: string;
	run?: () => void;
};

export type QuickMenuSection = {
	title: string;
	commands: QuickMenuCommand[];
};

type QuickMenuContentProps = {
	postSlugs: PostRouteEntry[];
	menuGroups: MenuGroup[];
	onNavigate?: () => void;
	enableHelpHotkey?: boolean;
	className?: string;
};

function getThemeSwitchCommands(mode: ThemeMode, setMode: (mode: ThemeMode) => void): QuickMenuCommand[] {
	const options: Array<{ mode: ThemeMode; label: string; keywords: string[] }> = [
		{ mode: "system", label: "切换到自动主题", keywords: ["system", "auto", "主题", "自动"] },
		{ mode: "light", label: "切换到浅色主题", keywords: ["light", "主题", "浅色"] },
		{ mode: "dark", label: "切换到深色主题", keywords: ["dark", "主题", "深色"] },
	];

	return options
		.filter((option) => option.mode !== mode)
		.map((option) => ({
			id: `theme-${option.mode}`,
			label: option.label,
			group: "界面外观",
			keywords: option.keywords,
			run: () => setMode(option.mode),
		}));
}

export function useQuickMenuSections({
	postSlugs,
	menuGroups,
	onNavigate,
}: {
	postSlugs: PostRouteEntry[];
	menuGroups: MenuGroup[];
	onNavigate?: () => void;
}) {
	const { mode, setMode } = useThemeMode();
	const router = useRouter();

	const handleRandom = useCallback(() => {
		if (postSlugs.length === 0) return;
		const entry = postSlugs[Math.floor(Math.random() * postSlugs.length)];
		onNavigate?.();
		router.push(`/${entry.section}/${entry.slug}`);
	}, [onNavigate, postSlugs, router]);

	const openShortcutHelp = useCallback(() => {
		window.dispatchEvent(new CustomEvent("yarvis:open-shortcut-help"));
	}, []);

	return useMemo(() => ([
		{
			title: "界面外观",
			commands: getThemeSwitchCommands(mode, (nextMode) => {
				onNavigate?.();
				setMode(nextMode);
			}),
		},
		...menuGroups.map((group) => ({
			title: group.group,
			commands: group.items.map((item) => ({
				id: `menu-${group.group}-${item.href}`,
				label: item.label,
				group: group.group,
				keywords: [item.href, item.key].filter(Boolean) as string[],
				href: item.href,
				run: onNavigate,
			})),
		})),
		{
			title: "其他",
			commands: [
				{
					id: "shortcut-help",
					label: "魔法捷径",
					group: "其他",
					keywords: ["shortcut", "快捷键", "帮助", "魔法"],
					run: () => {
						onNavigate?.();
						openShortcutHelp();
					},
				},
				{
					id: "random-post",
					label: "随便看看",
					group: "其他",
					keywords: ["random", "随机", "文章"],
					run: handleRandom,
				},
			],
		},
	]) satisfies QuickMenuSection[], [handleRandom, menuGroups, mode, onNavigate, openShortcutHelp, setMode]);
}

export function QuickMenuContent({
	postSlugs,
	menuGroups,
	onNavigate,
	enableHelpHotkey = false,
	className = "space-y-4 p-4",
}: QuickMenuContentProps) {
	const [shortcutOpen, setShortcutOpen] = useState(false);
	const sections = useQuickMenuSections({ postSlugs, menuGroups, onNavigate });

	useEffect(() => {
		if (!enableHelpHotkey) return;

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
	}, [enableHelpHotkey]);

	useEffect(() => {
		const handler = () => setShortcutOpen(true);
		window.addEventListener("yarvis:open-shortcut-help", handler);
		return () => window.removeEventListener("yarvis:open-shortcut-help", handler);
	}, []);

	return (
		<>
			<div className={className}>
				{sections.map((section) => (
					<SectionGroup key={section.title} title={section.title}>
						{section.commands.map((command) => (
							<Row
								key={command.id}
								href={command.href}
								label={command.label}
								onClick={command.run}
							/>
						))}
					</SectionGroup>
				))}
			</div>

			<ShortcutHelpModal
				open={shortcutOpen}
				onClose={() => setShortcutOpen(false)}
			/>
		</>
	);
}
