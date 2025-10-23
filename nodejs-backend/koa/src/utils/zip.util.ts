import archiver from "archiver";
import { createReadStream, existsSync } from "fs";
import fs from "fs/promises";
import path from "path";
import { PassThrough, type Readable } from "stream";
import { fileURLToPath } from "url";

import type { FileRemoteItem } from "#app/enum/zip.enum.ts";
import UndiciUtil from "#utils/request.util.ts";

/**
 * 判断是否为本地路径（file://、绝对路径、相对路径）
 */
function isLocalFile(input: string) {
  return (
    input.startsWith("file://") ||
    path.isAbsolute(input) ||
    input.startsWith("./") ||
    input.startsWith("../")
  );
}

/**
 * 统一获取文件名，优先使用自定义名，其次URL文件名，最后用默认名
 */
function getFileName(srcOrUrl: string, customName: string | undefined, index: number) {
  if (customName) return customName;
  const baseName = srcOrUrl.split("/").pop();
  if (baseName) return baseName;
  return `file_${index}`;
}

/**
 * 下载/读取多个 URL 或本地路径并以指定目录结构打包为 ZIP 格式流,无零食文件。
 *
 * @param {Record<string, (string|{url:string, name?:string})[]>} urlMap - 键为目录路径，值为文件路径（URL、本地路径或对象）的数组
 * @returns 可读流，表示生成的 zip 文件
 */
export async function createZipFromUrlMap(urlMap: Record<string, FileRemoteItem[]>) {
  const zipStream = new PassThrough();
  const archive = archiver("zip", { zlib: { level: 9 } });

  // urlMap["/测试课堂12_施烔_2024030002/附件"] = urlMap["/测试课堂12_施烔_2024030002/附件"].slice(
  //   1,
  //   3,
  // );
  archive.pipe(zipStream);
  archive.on("finish", () => console.log("archive finished"));
  archive.on("end", () => console.log("archive end"));
  archive.on("close", () => console.log("archive closed"));
  archive.on("warning", (err) => console.warn("warn", err));
  archive.on("error", (err) => {
    console.error(err);
  });
  for (const [dir, items] of Object.entries(urlMap)) {
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      let src: string;
      let customName: undefined | string;

      if (item.url) {
        src = item.url;
        customName = item.name;
      } else if (item.buffer) {
        archive.append(item.buffer, { name: `${dir}/${item.name || `file_${i}`}` });
        continue;
      } else if (item.stream) {
        archive.append(item.stream, { name: `${dir}/${item.name || `file_${i}`}` });
        continue;
      } else if (item.content) {
        archive.append(item.content, { name: `${dir}/${item.name}` });
        continue;
      } else {
        continue;
      }

      const fileName = getFileName(src, customName, i);
      const fullPathInZip = `${dir}/${fileName}`;

      try {
        if (isLocalFile(src)) {
          const localPath = src.startsWith("file://") ? fileURLToPath(src) : src;
          if (!existsSync(localPath)) {
            archive.append(`Local file not found: ${localPath}`, {
              name: `${dir}/error_local_${i}.txt`,
            });
            continue;
          }
          archive.append(createReadStream(localPath), { name: fullPathInZip });
        } else {
          const res = await UndiciUtil.retry({
            url: src,
            method: "GET",
            headers: {
              "Content-Type": "application/octet-stream",
            },
          });
          archive.append(res.body, { name: fullPathInZip });
        }
      } catch (error: unknown) {
        const err = error as Error;
        archive.append(`Error reading ${src}: ${err.message}`, {
          name: `${dir}/error_${i}.txt`,
        });
      }
    }
  }
  //这里不能await
  // eslint-disable-next-line
  archive.finalize();

  return zipStream;
}

export async function streamToBuffer(stream: Readable): Promise<Buffer> {
  return new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on("data", (chunk: Buffer | string) => {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    });
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", (err) => reject(err));
  });
}

/**
 * 把 buffer 写入到 storagePath 下
 * @param buffer 文件内容
 * @param storagePath 目录
 * @param filename 文件名
 * @returns 文件完整路径
 */
export async function saveBufferToFile(
  buffer: Buffer,
  storagePath: string,
  filename: string,
): Promise<string> {
  // 确保存储目录存在
  await fs.mkdir(storagePath, { recursive: true });

  const filePath = path.join(storagePath, filename);

  // 写入文件
  await fs.writeFile(filePath, buffer);

  return filePath;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
