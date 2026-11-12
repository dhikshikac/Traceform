// Text extraction for research uploads.
//
// The Research page reads uploads as text, which turns a PDF into binary noise and
// poisons every downstream AI stage. PDFs are extracted here instead, page by page,
// so what reaches the model is the words the document actually contains.
//
// Scanned PDFs hold no text layer; there is nothing to extract and we say so rather
// than returning an empty artifact that silently weakens the research.

const MAX_PAGES = 60;
const MAX_CHARS = 200_000;

let pdfjs = null;
async function lib() {
  if (!pdfjs) pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  return pdfjs;
}

export async function extractPdf(buf) {
  const { getDocument } = await lib();
  const doc = await getDocument({
    data: new Uint8Array(buf),
    // No fetching, no eval, no worker thread: this runs inside the dev server.
    isEvalSupported: false,
    useSystemFonts: false,
    disableFontFace: true,
    // We extract text and never render glyphs, so missing standard font data is
    // irrelevant here; errors only, so it does not log a warning per document.
    verbosity: 0,
  }).promise;

  const pages = Math.min(doc.numPages, MAX_PAGES);
  const out = [];
  for (let i = 1; i <= pages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    // Rebuild lines from item positions; getTextContent returns runs, not lines.
    let line = [], lastY = null, text = "";
    for (const it of content.items) {
      if (!("str" in it)) continue;
      const y = it.transform ? Math.round(it.transform[5]) : null;
      if (lastY !== null && y !== null && Math.abs(y - lastY) > 2) { text += line.join("") + "\n"; line = []; }
      line.push(it.str);
      if (it.hasEOL) { text += line.join("") + "\n"; line = []; }
      lastY = y;
    }
    text += line.join("");
    const clean = text.replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
    if (clean) out.push(pages > 1 ? `--- page ${i} ---\n${clean}` : clean);
    if (out.join("\n\n").length > MAX_CHARS) break;
  }
  await doc.destroy?.();

  const text = out.join("\n\n").slice(0, MAX_CHARS);
  return {
    text,
    pages: doc.numPages,
    truncated: doc.numPages > pages,
    empty: !text.trim(),
  };
}
