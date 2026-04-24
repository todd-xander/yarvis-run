import { AuthorAvatar } from "@/components/ui/author-avatar";
import { Pill } from "@/components/ui/pill";
import type { DimensionItem } from "@/lib/content-types";

export function AuthorHoverCard({
	dimItem,
	visible,
	onMouseEnter,
	onMouseLeave,
	dimDir,
}: {
	dimItem: DimensionItem;
	visible: boolean;
	onMouseEnter?: () => void;
	onMouseLeave?: () => void;
	dimDir?: string;
}) {
	return (
		<div
			className={`absolute left-0 top-11 z-20 w-72 rounded-xl border border-border bg-card p-4 shadow-md transition ${visible
				? "pointer-events-auto visible opacity-100"
				: "pointer-events-none invisible opacity-0"
				}`}
			role="dialog"
			aria-hidden={!visible}
			onMouseEnter={onMouseEnter}
			onMouseLeave={onMouseLeave}
		>
			<div className="flex items-center gap-3">
				<AuthorAvatar author={dimItem} size="md" shape="circle" />
				<div className="flex min-w-0 flex-1 flex-col justify-center self-stretch">
					<p className="truncate text-sm font-semibold leading-5">{dimItem.name}</p>
					<p className="line-clamp-2 text-xs leading-5 text-muted">{dimItem.description}</p>
				</div>
				<Pill variant="outline" href={`/${dimDir}/${dimItem.id}`} className="shrink-0">
					进入主页
				</Pill>
			</div>
		</div>
	);
}
