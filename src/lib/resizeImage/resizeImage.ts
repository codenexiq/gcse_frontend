/**
 * Shrinks a picture in the browser before it is sent: it is cropped from the middle to the wanted shape and
 * saved as a JPEG. That keeps uploads small (usually a few hundred KB) and removes hidden data such as the
 * place where a photo was taken.
 */
export async function resizeImage(file: File, width: number, height: number, quality = 0.88): Promise<Blob> {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error("That file could not be read as a picture. Please choose a PNG, JPG or WebP file.");
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Your browser could not prepare the picture.");

  // "Cover": fill the whole shape and cut off what does not fit, equally from both sides.
  const scale = Math.max(width / bitmap.width, height / bitmap.height);
  const w = bitmap.width * scale;
  const h = bitmap.height * scale;
  ctx.fillStyle = "#ffffff"; // a PNG with see-through parts gets a white background
  ctx.fillRect(0, 0, width, height);
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bitmap, (width - w) / 2, (height - h) / 2, w, h);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
  if (!blob) throw new Error("The picture could not be prepared. Please try another one.");
  return blob;
}
