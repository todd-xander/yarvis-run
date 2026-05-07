"use client";

import { RiArrowRightSLine } from "@remixicon/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuickMenuSections } from "@/components/quick-menu-content";
import type { MenuGroup, PostRouteEntry } from "@/lib/content-types";

type QuickMenuLauncherProps = {
	postSlugs: PostRouteEntry[];
	menuGroups: MenuGroup[];
};

type RenderRow =
	| { type: "heading"; id: string; title: string }
	| { type: "command"; id: string; label: string; href?: string; run?: () => void };

function normalizeText(value: string) {
	return value.trim().toLowerCase();
}

export function QuickMenuLauncher({
	postSlugs,
	menuGroups,
}: QuickMenuLauncherProps) {
	const [open, setOpen] = useState(false);
	const [query, setQuery] = useState("");
	const [selectedIndex, setSelectedIndex] = useState(0);
	const inputRef = useRef<HTMLInputElement>(null);
	const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);
	const router = useRouter();
	const sections = useQuickMenuSections({
		postSlugs,
		menuGroups,
		onNavigate: () => setOpen(false),
	});

	const rows = useMemo(() => {
		const q = normalizeText(query);
		const nextRows: RenderRow[] = [];

		for (const section of sections) {
			const commands = section.commands.filter((command) => {
				if (!q) return true;
				const haystack = [
					command.label,
					command.group,
					...(command.keywords || []),
				].join(" ");
				return normalizeText(haystack).includes(q);
			});
			if (commands.length === 0) continue;

			nextRows.push({ type: "heading", id: `heading-${section.title}`, title: section.title });
			for (const command of commands) {
				nextRows.push({
					type: "command",
					id: command.id,
					label: command.label,
					href: command.href,
					run: command.run,
				});
			}
		}

		return nextRows;
	}, [query, sections]);

	const commandRows = rows.filter((row) => row.type === "command");
	const safeSelectedIndex = commandRows.length === 0
		? 0
		: Math.min(selectedIndex, commandRows.length - 1);
	const activeCommand = commandRows[safeSelectedIndex];

	useEffect(() => {
		if (!open) return;
		inputRef.current?.focus();
	}, [open]);

	useEffect(() => {
		if (!open) return;
		const activeElement = itemRefs.current[safeSelectedIndex];
		activeElement?.scrollIntoView({ block: "nearest" });
	}, [open, safeSelectedIndex]);

	useEffect(() => {
		const handler = (event: KeyboardEvent) => {
			const isTrigger = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k";
			if (isTrigger) {
				event.preventDefault();
				setOpen((current) => !current);
				return;
			}

			if (!open) return;

			if (event.key === "Escape") {
				event.preventDefault();
				setOpen(false);
				setQuery("");
				return;
			}

			if (event.key === "ArrowDown") {
				event.preventDefault();
				setSelectedIndex((current) => (
					commandRows.length === 0 ? 0 : (current + 1) % commandRows.length
				));
				return;
			}

			if (event.key === "ArrowUp") {
				event.preventDefault();
				setSelectedIndex((current) => (
					commandRows.length === 0 ? 0 : (current - 1 + commandRows.length) % commandRows.length
				));
				return;
			}

			if (event.key === "Enter" && activeCommand) {
				event.preventDefault();
				setOpen(false);
				setQuery("");
				if (activeCommand.href) {
					router.push(activeCommand.href);
					activeCommand.run?.();
					return;
				}
				activeCommand.run?.();
			}
		};

		window.addEventListener("keydown", handler);
		return () => window.removeEventListener("keydown", handler);
	}, [activeCommand, commandRows.length, open, router]);

	if (!open) return null;

	let commandIndex = -1;

	return (
		<div
			className="fixed inset-0 z-50 flex items-start justify-center bg-black/45 px-4 pt-[10vh]"
			role="dialog"
			aria-modal="true"
			aria-label="捷径菜单"
			onClick={() => {
				setOpen(false);
				setQuery("");
			}}
		>
			<div
				className="w-full max-w-xl overflow-hidden rounded-lg border border-border/60 bg-card shadow-xl"
				onClick={(event) => event.stopPropagation()}
			>
				<div className="border-b border-border/50 p-2.5">
					<input
						ref={inputRef}
						type="text"
						value={query}
						onChange={(event) => {
							setQuery(event.target.value);
							setSelectedIndex(0);
						}}
						placeholder="搜索命令或页面"
						className="w-full rounded-sm border border-border/50 bg-background px-3 py-2 text-sm outline-none placeholder:text-muted focus:border-border"
					/>
				</div>
				<div className="max-h-[60vh] overflow-y-auto p-2.5">
					{rows.length === 0 ? (
						<div className="rounded-sm border border-dashed border-border/50 px-4 py-7 text-center text-sm text-muted">
							没有匹配的命令
						</div>
					) : (
						<div className="space-y-2">
							{rows.map((row) => {
								if (row.type === "heading") {
									return (
										<div key={row.id} className="px-2 pt-1 text-[11px] font-medium tracking-[0.25px] text-muted">
											{row.title}
										</div>
									);
								}

								commandIndex += 1;
								const currentCommandIndex = commandIndex;
								const isSelected = currentCommandIndex === safeSelectedIndex;

								return (
									<button
										key={row.id}
										ref={(element) => {
											itemRefs.current[currentCommandIndex] = element;
										}}
										type="button"
										onMouseEnter={() => setSelectedIndex(currentCommandIndex)}
										onClick={() => {
											setOpen(false);
											setQuery("");
											if (row.href) {
												router.push(row.href);
												row.run?.();
												return;
											}
											row.run?.();
										}}
										className={`flex w-full items-center cursor-pointer justify-between rounded-sm px-3 py-2 text-left transition-colors ${isSelected ? "bg-accent text-foreground" : "text-foreground hover:bg-surface-subtle"}`}
									>
										<span className="text-sm leading-5">{row.label}</span>
										<RiArrowRightSLine className={`size-5 ${isSelected ? "text-foreground" : "text-muted"}`} />
									</button>
								);
							})}
						</div>
					)}
				</div>
				<div className="flex items-center justify-end border-t border-border/50 px-4 py-2 text-xs text-muted">
					<div className="flex items-center gap-5">
						<span className="inline-flex items-center gap-1">
							<kbd className="rounded border border-border bg-surface-subtle px-1.5 py-0.5">Esc</kbd>
							退出
						</span>
						<span className="inline-flex items-center gap-1">
							<kbd className="rounded border border-border bg-surface-subtle px-1.5 py-0.5">Enter</kbd>
							选择
						</span>
					</div>
				</div>
			</div>
		</div>
	);
}
