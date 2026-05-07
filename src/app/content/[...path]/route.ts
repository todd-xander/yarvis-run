import fs from "node:fs/promises";
import path from "node:path";
import { CONTENT_ROOT } from "@/lib/site-config";

const MIME_TYPES: Record<string, string> = {
	".avif": "image/avif",
	".gif": "image/gif",
	".jpeg": "image/jpeg",
	".jpg": "image/jpeg",
	".md": "text/markdown; charset=utf-8",
	".png": "image/png",
	".svg": "image/svg+xml",
	".txt": "text/plain; charset=utf-8",
	".webp": "image/webp",
};

function getMimeType(filePath: string): string {
	return MIME_TYPES[path.extname(filePath).toLowerCase()] || "application/octet-stream";
}

function resolveContentFile(parts: string[]): string | undefined {
	const candidatePath = path.resolve(CONTENT_ROOT, ...parts);
	const relativePath = path.relative(CONTENT_ROOT, candidatePath);
	if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) return undefined;
	return candidatePath;
}

export async function GET(
	_request: Request,
	{ params }: { params: Promise<{ path: string[] }> },
) {
	const { path: parts } = await params;
	const filePath = resolveContentFile(parts);
	if (!filePath) {
		return new Response("Not found", { status: 404 });
	}

	try {
		const stat = await fs.stat(filePath);
		if (!stat.isFile()) {
			return new Response("Not found", { status: 404 });
		}

		const file = await fs.readFile(filePath);
		return new Response(file, {
			headers: {
				"Content-Type": getMimeType(filePath),
				"Cache-Control": process.env.NODE_ENV === "production"
					? "public, max-age=31536000, immutable"
					: "no-store",
			},
		});
	} catch {
		return new Response("Not found", { status: 404 });
	}
}
