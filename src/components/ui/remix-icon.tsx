"use client";

import React from "react";
import * as RemixIcons from "@remixicon/react";

function toPascalCase(str: string) {
	return str
		.split("-")
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join("");
}

function resolveRemixIcon(name: string, className?: string): React.ReactNode {
	const componentName = `Ri${toPascalCase(name)}`;
	const Icon = (RemixIcons as Record<string, React.ComponentType<{ className?: string }>>)[componentName];
	if (!Icon) return null;
	return React.createElement(Icon, { className });
}

export function RemixIcon({
	name,
	className,
}: {
	name?: string;
	variant?: "Line" | "Fill";
	className?: string;
}) {
	if (!name) return null;
	return resolveRemixIcon(name, className);
}
