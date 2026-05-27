import { PDFDocument } from "pdf-lib";

export async function compressPdf(file: File): Promise<File> {
  const originalBytes = await file.arrayBuffer();
  const originalSize = file.size;

  // Skip compression for already-small files
  if (originalSize < 1024 * 1024) return file;

  const doc = await PDFDocument.load(originalBytes, {
    ignoreEncryption: true,
  });

  // Remove metadata to shave off some bytes
  doc.setTitle("");
  doc.setAuthor("");
  doc.setSubject("");
  doc.setKeywords([]);
  doc.setProducer("");
  doc.setCreator("");

  // Remove empty pages
  const pages = doc.getPages();
  const pageIndices = pages.map((_, i) => i);

  const compressedBytes = await doc.save({
    useObjectStreams: true,
    addDefaultPage: false,
    objectsPerTick: 100,
  });

  // If compression didn't help, return original
  if (compressedBytes.byteLength >= originalSize) return file;

  const compressedName = file.name.replace(/\.pdf$/i, "-compressed.pdf") || "compressed.pdf";

  return new File([compressedBytes as unknown as Blob], compressedName, { type: "application/pdf" });
}
