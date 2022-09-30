import { BaseDirectory, readBinaryFile } from "@tauri-apps/api/fs";

export default async function bin2img(path: string) {
  const content = await readBinaryFile(path, {
    dir: BaseDirectory.App,
  });

  const src = URL.createObjectURL(
    new Blob([content.buffer], { type: "image/png" })
  );

  return src;
}
