import fs from "fs";
import path from "path";
import os from "os";
import { createRequire } from "module";

const require = createRequire(import.meta.url);

export interface ChapterData {
  chapterNumber: number;
  title: string;
  content: string;
  wordCount: number;
}

function cleanText(text: string): string {
  return text
    .replace(/\f/g, "\n\n")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\t/g, " ")
    .replace(/\u0000/g, "")
    .replace(/[^\S\n]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function detectChapterTitle(line: string): boolean {
  const patterns = [
    /^chapter\s+\d+/i,
    /^chapter\s+(one|two|three|four|five|six|seven|eight|nine|ten)/i,
    /^\d+\.\s+/,
    /^part\s+\d+/i,
    /^section\s+\d+/i,
    /^prologue/i,
    /^epilogue/i,
    /^introduction/i,
    /^preface/i,
  ];
  return patterns.some((p) => p.test(line.trim()));
}

export async function parsePdfText(pdfPath: string): Promise<{
  fullText: string;
  chapters: ChapterData[];
  totalWords: number;
}> {
  const pdfParse = require("pdf-parse");
  const dataBuffer = fs.readFileSync(pdfPath);
  const data = await pdfParse(dataBuffer);

  const cleanedText = cleanText(data.text);
  const lines = cleanedText.split("\n").filter((l) => l.trim());

  const chapters: ChapterData[] = [];
  let currentChapter: ChapterData = {
    chapterNumber: 0,
    title: "Preamble",
    content: "",
    wordCount: 0,
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (detectChapterTitle(trimmed)) {
      if (currentChapter.content.trim()) {
        currentChapter.wordCount = currentChapter.content.split(/\s+/).length;
        chapters.push(currentChapter);
      }
      const chapterMatch = trimmed.match(/(\d+)/);
      currentChapter = {
        chapterNumber: chapterMatch ? parseInt(chapterMatch[1]) : chapters.length + 1,
        title: trimmed,
        content: "",
        wordCount: 0,
      };
    } else {
      currentChapter.content += trimmed + "\n\n";
    }
  }

  if (currentChapter.content.trim()) {
    currentChapter.wordCount = currentChapter.content.split(/\s+/).length;
    chapters.push(currentChapter);
  }

  if (chapters.length === 1 && chapters[0].chapterNumber === 0) {
    const words = cleanedText.split(/\s+/);
    const wordsPerChapter = Math.max(1000, Math.floor(words.length / 10));

    chapters.length = 0;
    let chapNum = 1;
    for (let i = 0; i < words.length; i += wordsPerChapter) {
      const chunk = words.slice(i, i + wordsPerChapter).join(" ");
      chapters.push({
        chapterNumber: chapNum,
        title: `Chapter ${chapNum}`,
        content: chunk,
        wordCount: chunk.split(/\s+/).length,
      });
      chapNum++;
    }
  }

  return {
    fullText: cleanedText,
    chapters,
    totalWords: cleanedText.split(/\s+/).length,
  };
}

export async function downloadPdf(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to download PDF: ${response.statusText}`);

  const buffer = Buffer.from(await response.arrayBuffer());
  const tmpDir = os.tmpdir();
  const tmpPath = path.join(tmpDir, `samtech-pdf-${Date.now()}.pdf`);
  fs.writeFileSync(tmpPath, buffer);
  return tmpPath;
}

export function cleanupTempFile(filePath: string) {
  try {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch { }
}
