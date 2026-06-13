import { readFile, writeFile } from "fs/promises";
import { join } from "path";
import { homedir } from "os";
import { PDFDocument } from "pdf-lib";

const DOWNLOADS = join(homedir(), "Downloads");
const INPUT = join(DOWNLOADS, "The 48 Laws Of Power ( PDFDrive.com ).pdf");
const OUTPUT = join(process.cwd(), "public", "The 48 Laws Of Power - compressed.pdf");

async function compress() {
  console.log("Reading PDF...");
  const originalBytes = await readFile(INPUT);
  const originalSize = originalBytes.length;
  console.log(`Original size: ${(originalSize / 1024 / 1024).toFixed(2)} MB`);

  let bestBytes = originalBytes;
  let bestSize = originalSize;

  const strategies = [
    { useObjectStreams: true, objectsPerTick: 20 },
    { useObjectStreams: true, objectsPerTick: 50 },
    { useObjectStreams: true, objectsPerTick: 100 },
    { useObjectStreams: true, objectsPerTick: 200 },
  ];

  for (const strategy of strategies) {
    try {
      console.log(`Trying strategy: objectsPerTick=${strategy.objectsPerTick}...`);
      const doc = await PDFDocument.load(originalBytes, { ignoreEncryption: true });

      // Strip all metadata
      doc.setTitle("");
      doc.setAuthor("");
      doc.setSubject("");
      doc.setKeywords([]);
      doc.setProducer("");
      doc.setCreator("");

      const pageCount = doc.getPageCount();
      console.log(`  Pages: ${pageCount}`);

      const bytes = await doc.save(strategy);
      const ratio = ((1 - bytes.byteLength / originalSize) * 100).toFixed(1);
      console.log(`  Result: ${(bytes.byteLength / 1024 / 1024).toFixed(2)} MB (${ratio}% reduction)`);

      if (bytes.byteLength < bestSize) {
        bestBytes = bytes;
        bestSize = bytes.byteLength;
      }
    } catch (err) {
      console.log(`  Strategy failed: ${err.message}`);
    }
  }

  // Second pass: take the best result and try to compress again
  if (bestSize < originalSize) {
    try {
      console.log("\nSecond pass on best result...");
      const doc = await PDFDocument.load(bestBytes, { ignoreEncryption: true });
      doc.setTitle("");
      doc.setAuthor("");
      doc.setSubject("");
      doc.setKeywords([]);
      doc.setProducer("");
      doc.setCreator("");

      const bytes = await doc.save({ useObjectStreams: true, objectsPerTick: 50 });
      if (bytes.byteLength < bestSize) {
        bestBytes = bytes;
        bestSize = bytes.byteLength;
      }
    } catch {
      // ignore
    }
  }

  const reduction = ((1 - bestSize / originalSize) * 100).toFixed(1);
  console.log(`\nFinal: ${(bestSize / 1024 / 1024).toFixed(2)} MB (${reduction}% reduction)`);

  await writeFile(OUTPUT, Buffer.from(bestBytes));
  console.log(`Saved to: ${OUTPUT}`);
}

compress().catch(console.error);
