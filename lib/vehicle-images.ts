import { NextRequest, NextResponse } from "next/server";
import { db } from "./db";
import { lockVehicles } from "./reservations";
import { z } from "zod";
import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
export async function uploadVehicleImages(req: NextRequest, vehicleId: string) {
  const form = await req.formData();
  const files = [...form.getAll("files"), ...form.getAll("file")].filter(
    (v): v is File => v instanceof File && v.size > 0,
  );
  if (!files.length || files.length > 12)
    throw new Error("Select 1–12 photos per upload.");
  if (files.reduce((s, f) => s + f.size, 0) > 32 * 1024 * 1024)
    throw new Error("Upload up to 32 MB at a time.");
  const alt = z
    .string()
    .trim()
    .min(1)
    .max(200)
    .parse(form.get("alt") || "Vehicle photo");
  const uploads = [] as { name: string; buffer: Buffer }[];
  for (const file of files) {
    if (file.size > 8 * 1024 * 1024)
      throw new Error("Each photo must be under 8 MB.");
    const buffer = Buffer.from(await file.arrayBuffer());
    let metadata;
    try {
      metadata = await sharp(buffer, { limitInputPixels: 40000000 }).metadata();
    } catch {
      throw new Error("The file is not a readable photo.");
    }
    if (!["png", "jpeg", "webp"].includes(metadata.format || ""))
      throw new Error("Only PNG, JPEG and WebP photos are supported.");
    const ext = metadata.format === "jpeg" ? "jpg" : metadata.format;
    uploads.push({ name: randomUUID() + "." + ext, buffer });
  }
  return NextResponse.json(
    await db.$transaction(
      async (tx) => {
        await lockVehicles(tx, [vehicleId]);
        await tx.vehicle.findUniqueOrThrow({ where: { id: vehicleId } });
        const current = await tx.vehicleImage.findMany({
          where: { vehicleId },
          orderBy: [{ position: "asc" }, { createdAt: "asc" }, { id: "asc" }],
        });
        const makePrimary = form.get("makePrimary") === "on";
        if (makePrimary)
          for (let i = 0; i < current.length; i++)
            await tx.vehicleImage.update({
              where: { id: current[i].id },
              data: { position: i + 1 },
            });
        let position = Math.max(
          current.reduce((max, v) => Math.max(max, v.position), -1) + 1,
          makePrimary ? current.length + 1 : 0,
        );
        const result = [];
        await mkdir(path.join(process.cwd(), "public", "uploads"), {
          recursive: true,
        });
        for (let i = 0; i < uploads.length; i++) {
          const upload = uploads[i];
          await writeFile(
            path.join(process.cwd(), "public", "uploads", upload.name),
            upload.buffer,
          );
          result.push(
            await tx.vehicleImage.create({
              data: {
                vehicleId,
                url: "/uploads/" + upload.name,
                alt:
                  uploads.length > 1
                    ? alt.slice(0, 185) + " · " + (i + 1)
                    : alt,
                position: makePrimary && i === 0 ? 0 : position++,
              },
            }),
          );
        }
        return result;
      },
      { timeout: 20000 },
    ),
  );
}
export async function setPrimaryVehicleImage(
  req: NextRequest,
  vehicleId: string,
) {
  const { imageId } = z
    .object({ imageId: z.string().min(1) })
    .parse(await req.json());
  return NextResponse.json(
    await db.$transaction(async (tx) => {
      await lockVehicles(tx, [vehicleId]);
      const images = await tx.vehicleImage.findMany({
        where: { vehicleId },
        orderBy: [{ position: "asc" }, { createdAt: "asc" }, { id: "asc" }],
      });
      const chosen = images.find((v) => v.id === imageId);
      if (!chosen) throw new Error("Select a photo belonging to this vehicle.");
      const ordered = [chosen, ...images.filter((v) => v.id !== imageId)];
      for (let i = 0; i < ordered.length; i++)
        await tx.vehicleImage.update({
          where: { id: ordered[i].id },
          data: { position: i },
        });
      return { ok: true };
    }),
  );
}
