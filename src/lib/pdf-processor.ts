export interface ChapterData {
  chapterNumber: number;
  title: string;
  content: string;
  wordCount: number;
}

interface TocEntry {
  num: number;
  title: string;
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
    .replace(/^--\s*\d+\s+of\s+\d+\s*--$/gm, "")
    .trim();
}

function extractToc(pages: { num: number; text: string }[]): TocEntry[] {
  const toc: TocEntry[] = [];
  const tocPageNums = [4, 5, 6];
  const seen = new Set<string>();

  for (const p of pages) {
    if (!tocPageNums.includes(p.num)) continue;
    const lines = p.text.split("\n");
    for (const line of lines) {
      const t = line.trim();
      if (!t) continue;
      let m = t.match(/^(\d{1,2})\.\s+(.+)/);
      if (m) {
        const key = "n:" + m[1];
        if (!seen.has(key)) {
          seen.add(key);
          toc.push({ num: parseInt(m[1]), title: m[2].trim() });
        }
        continue;
      }
      m = t.match(/^(Part)\s+[IVXLCDM\d]+\.?\s+(.+)/i);
      if (m) {
        const key = "p:" + m[0].trim();
        if (!seen.has(key)) {
          seen.add(key);
          toc.push({ num: 0, title: m[0].trim() });
        }
        continue;
      }
      m = t.match(/^(Part)\s+[IVXLCDM]+$/i);
      if (m) {
        const key = "p:" + m[0].trim();
        if (!seen.has(key)) {
          seen.add(key);
          toc.push({ num: 0, title: m[0].trim() });
        }
        continue;
      }
    }
  }
  return toc;
}

function findChapterBoundaries(
  pages: { num: number; text: string }[],
  toc: TocEntry[]
): { page: number; num: number; title: string }[] {
  const boundaries: { page: number; num: number; title: string }[] = [];

  const partSubtitles: { title: string; label: string }[] = [];
  for (const entry of toc) {
    if (entry.num === 0) {
      const stripped = entry.title.replace(/^Part\s+[IVXLCDM\d]+\.?\s*/i, "").trim();
      if (stripped) {
        partSubtitles.push({ title: stripped, label: entry.title });
      }
    }
  }

  for (const p of pages) {
    if (p.num <= 6) continue;
    const lines = p.text.split("\n").filter((l) => l.trim());
    if (lines.length === 0) continue;
    const first = lines[0].trim();

    const pageWords = p.text.split(/\s+/).filter(Boolean).length;

    let partMatch: { title: string; label: string } | undefined;
    for (const ps of partSubtitles) {
      if (first.toLowerCase() === ps.title.toLowerCase()) {
        partMatch = ps;
        break;
      }
    }

    let chapterMatch: TocEntry | undefined;
    for (const entry of toc) {
      if (entry.num > 0 && first.toLowerCase() === entry.title.toLowerCase()) {
        chapterMatch = entry;
        break;
      }
    }

    if (partMatch && chapterMatch) {
      if (pageWords < 10) {
        boundaries.push({ page: p.num, num: 0, title: partMatch.label });
      } else {
        boundaries.push({ page: p.num, num: chapterMatch.num, title: chapterMatch.num + ". " + chapterMatch.title });
      }
      continue;
    }

    if (chapterMatch) {
      boundaries.push({ page: p.num, num: chapterMatch.num, title: chapterMatch.num + ". " + chapterMatch.title });
      continue;
    }

    if (partMatch) {
      boundaries.push({ page: p.num, num: 0, title: partMatch.label });
      continue;
    }

    const structuralMatch = first.match(/^(Introduction|Appendix\s+[A-Z]|Notes|Index|Part\s+\d+)$/i);
    if (structuralMatch) {
      const title = structuralMatch[0];
      if (
        boundaries.length === 0 ||
        boundaries[boundaries.length - 1].title !== title
      ) {
        boundaries.push({ page: p.num, num: 0, title });
      }
    }
  }

  boundaries.sort((a, b) => a.page - b.page);
  return boundaries;
}

function splitIntoChapters(
  pages: { num: number; text: string }[],
  boundaries: { page: number; num: number; title: string }[]
): ChapterData[] {
  const chapters: ChapterData[] = [];
  if (boundaries.length === 0) return chapters;

  let preambleText = "";
  for (const p of pages) {
    if (p.num < boundaries[0].page) {
      preambleText += p.text + "\n";
    }
  }
  if (preambleText.trim()) {
    const clean = cleanText(preambleText.trim());
    const words = clean ? clean.split(/\s+/).length : 0;
    if (words >= 10) {
      chapters.push({
        chapterNumber: 0,
        title: "Front Matter",
        content: clean,
        wordCount: words,
      });
    }
  }

  let mergedTitle = "";

  for (let i = 0; i < boundaries.length; i++) {
    const startPage = boundaries[i].page;
    const endPage = i + 1 < boundaries.length ? boundaries[i + 1].page : pages[pages.length - 1].num;

    let chapterText = "";
    for (const p of pages) {
      if (p.num >= startPage && p.num < endPage) {
        chapterText += p.text + "\n";
      }
    }

    const clean = cleanText(chapterText.trim());
    const words = clean ? clean.split(/\s+/).length : 0;

    if (words < 10 && i + 1 < boundaries.length) {
      mergedTitle = boundaries[i].title + (mergedTitle ? " - " + mergedTitle : "");
      continue;
    }

    const title = mergedTitle
      ? mergedTitle + " - " + boundaries[i].title
      : boundaries[i].title;
    mergedTitle = "";

    chapters.push({
      chapterNumber: 0,
      title,
      content: clean,
      wordCount: words,
    });
  }

  chapters.forEach((ch, i) => {
    ch.chapterNumber = i + 1;
  });

  return chapters;
}

export async function parsePdfBuffer(pdfBuffer: Buffer): Promise<{
  fullText: string;
  chapters: ChapterData[];
  totalWords: number;
  totalPages: number;
}> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const PDFJS = require("pdf-parse/lib/pdf.js/v2.0.550/build/pdf.js");
  PDFJS.disableWorker = true;
  const doc = await PDFJS.getDocument(new Uint8Array(pdfBuffer));
  const totalPages = doc.numPages;

  const pages: { num: number; text: string }[] = [];
  let fullText = "";

  for (let i = 1; i <= totalPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent({
      normalizeWhitespace: false,
      disableCombineTextItems: false,
    });
    let lastY: number | undefined;
    let text = "";
    for (const item of content.items) {
      if (lastY === (item as { transform: number[] }).transform[5] || !lastY) {
        text += (item as { str: string }).str;
      } else {
        text += "\n" + (item as { str: string }).str;
      }
      lastY = (item as { transform: number[] }).transform[5];
    }
    pages.push({ num: i, text });
    fullText += (fullText ? "\n\n" : "") + text;
    page.cleanup();
  }

  await doc.destroy();

  const toc = extractToc(pages);

  const boundaries = findChapterBoundaries(pages, toc);

  const chapters = splitIntoChapters(pages, boundaries);

  if (chapters.length === 0) {
    let allText = "";
    for (const p of pages) {
      if (p.num <= 3) continue;
      allText += p.text + "\n";
    }
    allText = cleanText(allText.trim());
    const words = allText.split(/\s+/);

    if (words.length >= 100) {
      const wordsPerChapter = Math.max(1000, Math.floor(words.length / 10));
      let seq = 1;
      for (let i = 0; i < words.length; i += wordsPerChapter) {
        const chunk = words.slice(i, i + wordsPerChapter).join(" ");
        chapters.push({
          chapterNumber: seq++,
          title: `Chapter ${seq - 1}`,
          content: chunk,
          wordCount: chunk.split(/\s+/).length,
        });
      }
    } else if (words.length > 0) {
      chapters.push({
        chapterNumber: 1,
        title: "Chapter 1",
        content: allText,
        wordCount: words.length,
      });
    }
  }

  return {
    fullText,
    chapters,
    totalWords: fullText.split(/\s+/).length,
    totalPages,
  };
}
