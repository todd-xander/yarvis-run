import type { ReactNode } from "react";

export function EmptyStateCard({ children }: { children: ReactNode }) {
	return (
		<div className="rounded-lg border border-border border-dashed bg-card m-4 p-8 text-center text-sm text-muted">
			{children}
		</div>
	);
}
