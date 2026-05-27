import { PDFParse } from "pdf-parse";

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

  // Build Part subtitle lookup: "Part V. Two Selves" → "Two Selves"
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

    // Calculate approximate word count for this page
    const pageWords = p.text.split(/\s+/).filter(Boolean).length;

    // Check if this is a Part subtitle page (very few words, matches part subtitle)
    let partMatch: { title: string; label: string } | undefined;
    for (const ps of partSubtitles) {
      if (first.toLowerCase() === ps.title.toLowerCase()) {
        partMatch = ps;
        break;
      }
    }

    // Check if this is a numbered chapter match
    let chapterMatch: TocEntry | undefined;
    for (const entry of toc) {
      if (entry.num > 0 && first.toLowerCase() === entry.title.toLowerCase()) {
        chapterMatch = entry;
        break;
      }
    }

    // If both Part subtitle and chapter match the same text:
    // - If page has very few words, it's a Part subtitle page
    // - If page has content, it's a chapter page
    if (partMatch && chapterMatch) {
      if (pageWords < 10) {
        boundaries.push({ page: p.num, num: 0, title: partMatch.label });
      } else {
        boundaries.push({ page: p.num, num: chapterMatch.num, title: chapterMatch.num + ". " + chapterMatch.title });
      }
      continue;
    }

    // Only chapter match (no Part overlap)
    if (chapterMatch) {
      boundaries.push({ page: p.num, num: chapterMatch.num, title: chapterMatch.num + ". " + chapterMatch.title });
      continue;
    }

    // Only Part subtitle match
    if (partMatch) {
      boundaries.push({ page: p.num, num: 0, title: partMatch.label });
      continue;
    }

    // Structural headings (Introduction, Appendix, Notes, Index, Part N)
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

  // Sort by page number
  boundaries.sort((a, b) => a.page - b.page);
  return boundaries;
}

function splitIntoChapters(
  pages: { num: number; text: string }[],
  boundaries: { page: number; num: number; title: string }[]
): ChapterData[] {
  const chapters: ChapterData[] = [];
  if (boundaries.length === 0) return chapters;

  // Preamble (pages before first boundary)
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

  // Build chapters, merging Part subtitle pages (wordCount < 10) into the next chapter
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

  // Assign unique sequential chapter numbers (preserving order)
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
  const parser = new PDFParse({ data: new Uint8Array(pdfBuffer) });
  const result = await parser.getText({ includeMarkedContent: true });

  const pages = result.pages.map((p) => ({
    num: p.num,
    text: p.text,
  }));

  // Extract TOC from early pages
  const toc = extractToc(pages);

  // Find chapter boundaries by matching TOC titles against page first lines
  const boundaries = findChapterBoundaries(pages, toc);

  // Split text into chapters using boundaries
  const chapters = splitIntoChapters(pages, boundaries);

  // Fallback if no boundaries were detected: auto-split by word count
  if (chapters.length === 0) {
    let fullText = "";
    for (const p of pages) {
      if (p.num <= 3) continue;
      fullText += p.text + "\n";
    }
    fullText = cleanText(fullText.trim());
    const words = fullText.split(/\s+/);

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
        content: fullText,
        wordCount: words.length,
      });
    }
  }

  // Build full clean text
  let fullText = "";
  for (const p of pages) {
    if (p.num <= 3) continue;
    fullText += p.text + "\n";
  }
  fullText = cleanText(fullText.trim());

  parser.destroy();

  return {
    fullText,
    chapters,
    totalWords: fullText.split(/\s+/).length,
    totalPages: result.total,
  };
}
