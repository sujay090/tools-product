import { validationResult } from "express-validator";
import sharp from "sharp";

export async function uploadFile(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const quality = parseInt(req.body.quality) || 80;
    if (!(quality > 1 && quality <= 100)) {
      return res
        .status(400)
        .json({ message: "Quality must be between 1 and 100" });
    }

    const format = req.file.mimetype.split("/")[1];

    const supportedFormats = [
      "jpeg",
      "png",
      "webp",
      "gif",
      "tiff",
      "avif",
      "heif",
      "bmp",
    ];
    if (!supportedFormats.includes(format)) {
      return res
        .status(400)
        .json({ message: `Unsupported file type: ${format}` });
    }

    const originalBase64 = `data:${
      req.file.mimetype
    };base64,${req.file.buffer.toString("base64")}`;
    const originalSize = req.file.buffer.length;
    const compressedBuffer = await sharp(req.file.buffer)
      .toFormat(format, { quality })
      .toBuffer();
    const compressedSize = compressedBuffer.length;
    const bytesReduced = originalSize - compressedSize;
    const compressedBase64 = `data:image/${format};base64,${compressedBuffer.toString(
      "base64"
    )}`;
    res.json({
      message: "File compressed successfully",
      originalSize: `(${(originalSize / 1024).toFixed(
        2
      )} KB)`,
      compressedSize: `bytes (${(
        compressedSize / 1024
      ).toFixed(2)} KB)`,
      bytesReduced: `(${(bytesReduced / 1024).toFixed(
        2
      )} KB)`,
      originalImage: originalBase64,
      compressedImage: compressedBase64,
      format: format,
    });

  } catch (err) {
    console.error("Error:", err.message);
    res
      .status(500)
      .json({ message: "Error processing image", error: err.message });
  }
}
