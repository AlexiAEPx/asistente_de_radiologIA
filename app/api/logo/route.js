import { readFile } from "node:fs/promises";
import path from "node:path";

export async function GET() {
  const logoPath = path.join(process.cwd(), "logo web.png");
  const file = await readFile(logoPath);

  return new Response(file, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
