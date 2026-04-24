import type { SortConfig } from "@/lib/content-types";

function getNestedValue(obj: Record<string, unknown>, keyPath: string): unknown {
	const val = keyPath.split(".").reduce((current: unknown, key: string) => {
		if (current && typeof current === "object") return (current as Record<string, unknown>)[key];
		return undefined;
	}, obj);
	if (val !== undefined) return val;
	const fm = (obj as Record<string, unknown>).frontmatter;
	if (fm && typeof fm === "object") {
		return keyPath.split(".").reduce((current: unknown, key: string) => {
			if (current && typeof current === "object") return (current as Record<string, unknown>)[key];
			return undefined;
		}, fm);
	}
	return undefined;
}

export function applySortConfig<T>(
	items: T[],
	sort: SortConfig | undefined,
): T[] {
	if (!sort) return items;
	const { key, order } = sort;
	return [...items].sort((a, b) => {
		const va = getNestedValue(a as Record<string, unknown>, key);
		const vb = getNestedValue(b as Record<string, unknown>, key);
		let cmp = 0;
		if (va instanceof Date && vb instanceof Date) {
			cmp = va.getTime() - vb.getTime();
		} else if (typeof va === "string" && typeof vb === "string") {
			cmp = va.localeCompare(vb);
		} else if (typeof va === "number" && typeof vb === "number") {
			cmp = va - vb;
		} else {
			const sa = String(va ?? "");
			const sb = String(vb ?? "");
			cmp = sa.localeCompare(sb);
		}
		return order === "ascend" ? cmp : -cmp;
	});
}
