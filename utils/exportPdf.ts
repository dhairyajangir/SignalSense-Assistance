import jsPDF from 'jspdf';
import {
  notoSansLatinBase64,
  notoSansDevanagariBase64,
  notoSansJPBase64,
  notoSansBengaliBase64,
  notoSansGurmukhiBase64,
  notoSansGujaratiBase64,
  notoSansTamilBase64,
  notoSansTeluguBase64,
  notoSansKannadaBase64,
  notoSansMalayalamBase64,
  notoSansOriyaBase64,
} from './customFont';

// --- Type Definition ---
// Added this interface to make the module complete and fix type errors.
export interface TranscriptEntry {
  speaker: 'user' | 'assistant';
  text: string;
}

// --- Layout Constants ---
// Using 20mm margins on A4 (210mm wide)
const MARGIN = 20;
const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const USABLE_WIDTH = PAGE_WIDTH - MARGIN * 2;

// Y-coordinates for layout
const FOOTER_LINE_Y = PAGE_HEIGHT - MARGIN + 3;
const FOOTER_Y = PAGE_HEIGHT - MARGIN + 9;

// Content Y-positions
const CONTENT_START_Y_SUBSEQUENT_PAGE = MARGIN + 14; // Y-start for new pages
const PAGE_BREAK_Y = PAGE_HEIGHT - MARGIN - 12; // Y-pos to trigger page break

// Typography helper: prefer custom font if registered, else fall back to helvetica
const PREFERRED_FONT_NAME = 'NotoSans';

type FontStyle = 'normal' | 'bold' | 'italic';

const SCRIPT_FONT_MAP: Array<{ regex: RegExp; font: string }> = [
  { regex: /[\u0900-\u097F]/, font: 'NotoSansDevanagari' }, // Devanagari (Hindi, Marathi, Nepali)
  { regex: /[\u0980-\u09FF]/, font: 'NotoSansBengali' }, // Bengali, Assamese
  { regex: /[\u0A00-\u0A7F]/, font: 'NotoSansGurmukhi' }, // Punjabi (Gurmukhi)
  { regex: /[\u0A80-\u0AFF]/, font: 'NotoSansGujarati' }, // Gujarati
  { regex: /[\u0B00-\u0B7F]/, font: 'NotoSansOriya' }, // Odia
  { regex: /[\u0B80-\u0BFF]/, font: 'NotoSansTamil' }, // Tamil
  { regex: /[\u0C00-\u0C7F]/, font: 'NotoSansTelugu' }, // Telugu
  { regex: /[\u0C80-\u0CFF]/, font: 'NotoSansKannada' }, // Kannada
  { regex: /[\u0D00-\u0D7F]/, font: 'NotoSansMalayalam' }, // Malayalam
  {
    regex: /[\u3040-\u30FF\u31F0-\u31FF\uFF66-\uFF9F\u3400-\u4DBF\u4E00-\u9FFF]/,
    font: 'NotoSansJP',
  }, // Japanese (Hiragana, Katakana, Kanji) and shared CJK
];

const setFontSafe = (pdf: jsPDF, style: FontStyle = 'normal') => {
  const list = pdf.getFontList() as unknown as Record<string, string[]>;
  const hasPreferred = !!list && Object.prototype.hasOwnProperty.call(list, PREFERRED_FONT_NAME);
  const preferredStyles = hasPreferred ? list[PREFERRED_FONT_NAME] : [];
  const fontName = hasPreferred ? PREFERRED_FONT_NAME : 'helvetica';
  const styles = hasPreferred ? preferredStyles : (list?.helvetica || ['normal', 'bold', 'italic']);
  const finalStyle: FontStyle = styles.includes(style) ? style : 'normal';
  pdf.setFont(fontName, finalStyle as any);
};

// Choose a font by inspecting the text's script; fall back to safe font if unavailable
const setFontByText = (pdf: jsPDF, text: string, style: FontStyle = 'normal') => {
  if (!text) {
    setFontSafe(pdf, style);
    return;
  }

  const list = pdf.getFontList() as unknown as Record<string, string[]>;
  const hasFont = (name: string) => !!list && Object.prototype.hasOwnProperty.call(list, name);

  for (const { regex, font } of SCRIPT_FONT_MAP) {
    if (regex.test(text) && hasFont(font)) {
      const styles = list[font] || [];
      const finalStyle: FontStyle = styles.includes(style) ? style : 'normal';
      pdf.setFont(font, finalStyle as any);
      return;
    }
  }

  if (hasFont(PREFERRED_FONT_NAME)) {
    const styles = list[PREFERRED_FONT_NAME] || [];
    const finalStyle: FontStyle = styles.includes(style) ? style : 'normal';
    pdf.setFont(PREFERRED_FONT_NAME, finalStyle as any);
    return;
  }

  setFontSafe(pdf, style);
};
// const FONT_REGULAR = 'Inter-Regular';
// const FONT_BOLD = 'Inter-Bold';
// const FONT_REGULAR = 'SourceSansPro-Regular';
// const FONT_BOLD = 'SourceSansPro-Bold';
// const FONT_REGULAR = 'WorkSans-Regular';
// const FONT_BOLD = 'WorkSans-SemiBold';

// Define a professional & clean color palette
// const COLOR_PRIMARY = [33, 94, 177];            // NovaX Blue (for user label)
// const COLOR_PRIMARY_LIGHT = [232, 241, 255];   // Light blue for user bubble
// const COLOR_ASSISTANT = [48, 48, 52];         // Dark gray (for assistant)
// const COLOR_ASSISTANT_BG = [248, 249, 252];  // Light gray (assistant bubble)
// const COLOR_BODY = [28, 28, 32];             // Main text color
// const COLOR_HEADER = [25, 31, 46];           // Header text
// const COLOR_MUTED = [134, 139, 149];       // Footer text, timestamps
// const COLOR_LINE = [220, 224, 232];        // Divider lines
// const COLOR_WHITE = [255, 255, 255];

// const COLOR_PRIMARY = [40, 92, 180];            // NovaX Blue — a balanced royal blue
// const COLOR_PRIMARY_LIGHT = [235, 243, 255];   // Very soft sky-blue for bubbles
// const COLOR_ASSISTANT = [60, 64, 72];          // Cool dark gray (neutral and professional)
// const COLOR_ASSISTANT_BG = [246, 247, 250];    // Gentle gray background for assistant
// const COLOR_BODY = [33, 37, 43];               // Rich near-black for readable body text
// const COLOR_HEADER = [20, 28, 44];             // Deep slate-blue header, pairs beautifully with primary
// const COLOR_MUTED = [115, 122, 135];           // Subtle desaturated gray for timestamps & footers
// const COLOR_LINE = [220, 225, 235];            // Softer divider gray (less contrast, more polish)
// const COLOR_WHITE = [255, 255, 255];           // Crisp white — keep for contrast safety

const COLOR_PRIMARY = [59, 113, 202];         // Refined NovaX Blue — slightly brighter, balanced contrast
const COLOR_PRIMARY_LIGHT = [239, 245, 255];  // Light airy blue for user bubbles
const COLOR_ASSISTANT = [55, 58, 63];         // Slightly softer than COLOR_BODY
const COLOR_ASSISTANT_BG = [250, 251, 253];   // Soft off-white gray for assistant background
const COLOR_BODY = [29, 31, 36];              // Almost-black for optimal readability
const COLOR_HEADER = [24, 32, 48];            // Deep slate-blue header — elegant tone
const COLOR_MUTED = [130, 135, 145];          // Gentle muted gray for timestamps and footer
const COLOR_LINE = [225, 229, 238];           // Light divider line, visible but subtle
const COLOR_WHITE = [255, 255, 255];          // Clean white base
const COLOR_ASSISTANT_TEXT = [55, 58, 63];     // Slightly softer than COLOR_BODY for assistant messages


// --- Helper: Draw page footer ---
const addPageFooter = (pdf: jsPDF, pageNumber: number) => {
  const pageWidth = pdf.internal.pageSize.getWidth();
  // --- FOOTER ---
  // This includes the "By NovaX".
  pdf.setDrawColor(COLOR_LINE[0], COLOR_LINE[1], COLOR_LINE[2]);
  pdf.setLineWidth(0.2);
  pdf.line(MARGIN, FOOTER_LINE_Y, pageWidth - MARGIN, FOOTER_LINE_Y);

  // Footer text: muted and italic
  setFontSafe(pdf, 'italic');
  pdf.setFontSize(9);
  pdf.setTextColor(COLOR_MUTED[0], COLOR_MUTED[1], COLOR_MUTED[2]);

  // "By NovaX" footer text (small, italic)
  pdf.text('By NovaX', MARGIN, FOOTER_Y);

  const pageNumText = `Page ${pageNumber}`;
  const pageNumWidth = (pdf.getStringUnitWidth(pageNumText) * pdf.getFontSize()) / pdf.internal.scaleFactor;
  pdf.text(pageNumText, pageWidth - MARGIN - pageNumWidth, FOOTER_Y);
};

// --- Helper: Draw page header (for all pages) ---
const addPageHeader = (pdf: jsPDF) => {
  let y = MARGIN;
  // Main Title: "SignalSense Assistant"
  setFontSafe(pdf, 'bold');
  pdf.setFontSize(16); // per design: Header 16 bold
  pdf.setTextColor(COLOR_HEADER[0], COLOR_HEADER[1], COLOR_HEADER[2]);
  pdf.text('SignalSense Assistant', MARGIN, y);

  // Export Stamp (top right)
  setFontSafe(pdf, 'normal');
  pdf.setFontSize(10); // per design: timestamp 10 regular
  pdf.setTextColor(COLOR_MUTED[0], COLOR_MUTED[1], COLOR_MUTED[2]);
  const exportedStamp = new Intl.DateTimeFormat('en-US', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(new Date());
  const stampWidth = (pdf.getStringUnitWidth(exportedStamp) * pdf.getFontSize()) / pdf.internal.scaleFactor;
  pdf.text(exportedStamp, PAGE_WIDTH - MARGIN - stampWidth, y);
};

// --- Helper: Ensure vertical space is available before drawing ---
const ensureSpace = (
  pdf: jsPDF,
  currentY: number,
  requiredHeight: number,
  pageNumber: number,
): [number, number] => {
  const usableHeight = PAGE_BREAK_Y - CONTENT_START_Y_SUBSEQUENT_PAGE;

  // Check if a page break is needed
  while (currentY + requiredHeight > PAGE_BREAK_Y) {
    // Exception: If a single block is taller than a whole page,
    // draw it anyway to avoid an infinite loop.
    if (requiredHeight > usableHeight && currentY === CONTENT_START_Y_SUBSEQUENT_PAGE) {
      break;
    }

    pdf.addPage();
    pageNumber += 1;
    addPageHeader(pdf); // Add header to new page
    addPageFooter(pdf, pageNumber); // Add footer to new page
    currentY = CONTENT_START_Y_SUBSEQUENT_PAGE; // Reset Y for new page
  }
  return [currentY, pageNumber];
};

// --- Helper: Add a main title block (for page 1) ---
const addTitleBlock = (pdf: jsPDF, title: string): number => {
  addPageHeader(pdf); // Add the standard header
  let y = MARGIN + 7; // Start below header text

  // Subtitle (e.g., "Chat Transcript")
  setFontSafe(pdf, 'normal');
  pdf.setFontSize(13);
  pdf.setTextColor(COLOR_BODY[0], COLOR_BODY[1], COLOR_BODY[2]);
  pdf.text(title, MARGIN, y);

  y += 14; // Space after title block
  return y; // Return the Y position for content
};

// --- Helper: Render wrapped text with simple bullet & paragraph handling ---
const renderWrappedText = (
  pdf: jsPDF,
  rawText: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  pageNumber: number,
): [number, number] => {
  if (!rawText) return [y, pageNumber];

  // Normalize line endings
  const linesIn = rawText.replace(/\r\n/g, '\n').split('\n');

  for (let i = 0; i < linesIn.length; i++) {
    const rawLine = linesIn[i];
    const isBullet = rawLine.trim().startsWith('* ');
    let content = isBullet ? rawLine.trim().slice(2) : rawLine;

    // Split to fit width; bullets get a small indent
    const indent = isBullet ? 4 : 0;
    const available = maxWidth - indent;
    const wrapped = pdf.splitTextToSize(content, available);

    // Ensure space for this block (all wrapped lines)
    const requiredHeight = wrapped.length * lineHeight + (isBullet ? 0 : 0);
    [y, pageNumber] = ensureSpace(pdf, y, requiredHeight, pageNumber);

    // Draw wrapped lines
    wrapped.forEach((wl, idx) => {
      const drawX = x + (idx === 0 ? indent : indent);
      if (isBullet && idx === 0) {
        // Draw a bullet then the first line indented
        pdf.text('•', x + 1, y);
        pdf.text(wl, drawX + 2, y);
      } else {
        pdf.text(wl, drawX, y);
      }
      y += lineHeight;
    });

    // Add an extra paragraph gap if current line is empty (double newline) or next line is empty
    const nextIsEmpty = (i + 1 < linesIn.length) ? linesIn[i + 1].trim() === '' : false;
    if (nextIsEmpty) {
      y += lineHeight; // extra gap between paragraphs
      i++; // skip the empty line
    }
  }

  return [y, pageNumber];
};

// --- Helper: Render wrapped text with simple bullet & paragraph handling ---
// ... (no changes needed)

/**
 * 2. Create a helper function to add the font to a new PDF instance.
 * This avoids repeating the same code in all three export functions.
 */
const registerFont = (pdf: jsPDF) => {
  try {
    const register = (
      fileName: string,
      familyName: string,
      base64: string,
      options?: { registerBold?: boolean },
    ) => {
      if (!base64) return;
      try {
        pdf.addFileToVFS(fileName, base64);
        pdf.addFont(fileName, familyName, 'normal', 'Identity-H');
        if (options?.registerBold) {
          pdf.addFont(fileName, familyName, 'bold', 'Identity-H');
        }
      } catch (err) {
        console.warn(`Failed to register font ${familyName}`, err);
      }
    };

    // Base Latin (covers Latin, Cyrillic, Greek, Vietnamese, etc.)
    register('NotoSans-Regular.ttf', 'NotoSans', notoSansLatinBase64, { registerBold: true });

    // Japanese
    register('NotoSansJP-Regular.otf', 'NotoSansJP', notoSansJPBase64);

    // Indian scripts
    register('NotoSansDevanagari-Regular.ttf', 'NotoSansDevanagari', notoSansDevanagariBase64);
    register('NotoSansBengali-Regular.ttf', 'NotoSansBengali', notoSansBengaliBase64);
    register('NotoSansGurmukhi-Regular.ttf', 'NotoSansGurmukhi', notoSansGurmukhiBase64);
    register('NotoSansGujarati-Regular.ttf', 'NotoSansGujarati', notoSansGujaratiBase64);
    register('NotoSansTamil-Regular.ttf', 'NotoSansTamil', notoSansTamilBase64);
    register('NotoSansTelugu-Regular.ttf', 'NotoSansTelugu', notoSansTeluguBase64);
    register('NotoSansKannada-Regular.ttf', 'NotoSansKannada', notoSansKannadaBase64);
    register('NotoSansMalayalam-Regular.ttf', 'NotoSansMalayalam', notoSansMalayalamBase64);
    register('NotoSansOriya-Regular.ttf', 'NotoSansOriya', notoSansOriyaBase64);
  } catch (e) {
    console.error('Failed to register font:', e);
    // Fallback to helvetica if something goes wrong
    setFontSafe(pdf, 'normal');
  }
};

// --- Export: Chat Transcript ---
export const exportChatToPdf = (transcript: TranscriptEntry[], filename = 'chat_export') => {
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  registerFont(pdf); // <-- 4. Call the register function

  let pageNumber = 1;
  let y = addTitleBlock(pdf, 'Chat Transcript');
  addPageFooter(pdf, pageNumber); // Add footer to the first page

  const textLineHeight = 6;
  const bubblePaddingY = 6;
  const bubblePaddingX = 8;
  const bubbleRadius = 4.5;
  const speakerLabelHeight = 6;
  const bubbleGap = 8;
  const bubbleMaxWidth = USABLE_WIDTH * 0.75; // Reduced max width
  
  transcript.forEach((entry) => {
    const isUser = entry.speaker === 'user';
    const speaker = isUser ? 'You' : 'SignalSense Assistant';
    
  // --- MODIFICATION: Matched to image design ---
  const speakerLabelColor = isUser ? COLOR_PRIMARY : COLOR_ASSISTANT;
  const bubbleFillColor = isUser ? COLOR_PRIMARY_LIGHT : COLOR_ASSISTANT_BG;
  const bubbleStrokeColor = isUser ? COLOR_PRIMARY_LIGHT : COLOR_ASSISTANT_BG; // No border
  // Use slightly softer text for assistant messages so weight doesn't need to differ
  const bubbleTextColor = isUser ? COLOR_BODY : COLOR_ASSISTANT_TEXT;
  // --- End Modification ---

  // Set font by detected script before splitting to ensure accurate measurements
  setFontByText(pdf, entry.text, 'normal');
    pdf.setFontSize(10);
    const textLines = pdf.splitTextToSize(entry.text, bubbleMaxWidth - bubblePaddingX * 2);

    // Calculate bubble width based on longest text line
    let textMaxWidth = 0;
    textLines.forEach(line => {
      const lineWidth = (pdf.getStringUnitWidth(line) * pdf.getFontSize()) / pdf.internal.scaleFactor;
      if (lineWidth > textMaxWidth) textMaxWidth = lineWidth;
    });

    // Handle empty strings just in case
    if (textLines.length > 0 && textMaxWidth === 0) {
        textMaxWidth = (pdf.getStringUnitWidth(textLines[0]) * pdf.getFontSize()) / pdf.internal.scaleFactor;
    }

    const bubbleWidth = textMaxWidth + bubblePaddingX * 2;
    const bubbleHeight = textLines.length * textLineHeight + bubblePaddingY * 2 + 3; // +3 for text start
    
    // This correctly aligns user bubbles to the right and assistant to the left
    const bubbleX = isUser ? PAGE_WIDTH - MARGIN - bubbleWidth : MARGIN;

    // --- Page break check ---
    const requiredHeight = speakerLabelHeight + bubbleHeight + bubbleGap;
    [y, pageNumber] = ensureSpace(pdf, y, requiredHeight, pageNumber);
    
    // --- Speaker label ---
  setFontSafe(pdf, 'bold');
    pdf.setFontSize(10.5); // per design: speaker label 10.5 semibold
    pdf.setTextColor(speakerLabelColor[0], speakerLabelColor[1], speakerLabelColor[2]);
    const speakerWidth = (pdf.getStringUnitWidth(speaker) * pdf.getFontSize()) / pdf.internal.scaleFactor;
    // Aligns speaker label right or left to match the bubble
    const speakerX = isUser ? PAGE_WIDTH - MARGIN - speakerWidth : MARGIN;
    pdf.text(speaker, speakerX, y);
    y += speakerLabelHeight;

    // --- Message bubble ---
    pdf.setFillColor(bubbleFillColor[0], bubbleFillColor[1], bubbleFillColor[2]);
    pdf.setDrawColor(bubbleStrokeColor[0], bubbleStrokeColor[1], bubbleStrokeColor[2]);
    pdf.setLineWidth(0.3);
    pdf.roundedRect(bubbleX, y, bubbleWidth, bubbleHeight, bubbleRadius, bubbleRadius, 'FD');

    // --- Message text ---
  // Reset to regular font (match script of this message)
  setFontByText(pdf, entry.text, 'normal');
    pdf.setFontSize(10); // per design: message text size 10 regular
    pdf.setTextColor(bubbleTextColor[0], bubbleTextColor[1], bubbleTextColor[2]);
    let textY = y + bubblePaddingY + 3; // +3 for font baseline
    textLines.forEach((line) => {
      pdf.text(line, bubbleX + bubblePaddingX, textY);
      textY += textLineHeight;
    });

    y += bubbleHeight + bubbleGap; // Space for next bubble
  });

  pdf.save(`${filename}.pdf`);
};

// --- Export: Transcription ---
export const exportTranscriptionToPdf = (text: string, filename = 'transcription_export') => {
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  registerFont(pdf); // <-- 4. Call the register function

  let pageNumber = 1;
  let y = addTitleBlock(pdf, 'Transcription');
  addPageFooter(pdf, pageNumber); // Add footer to the first page
  const textLineHeight = 7; // Slightly more spacing for a text document

  setFontByText(pdf, text, 'normal');
  pdf.setFontSize(10.5);
  pdf.setTextColor(COLOR_BODY[0], COLOR_BODY[1], COLOR_BODY[2]);

  const textLines = pdf.splitTextToSize(text, USABLE_WIDTH);

  textLines.forEach((line) => {
    [y, pageNumber] = ensureSpace(pdf, y, textLineHeight, pageNumber);
    pdf.text(line, MARGIN, y);
    y += textLineHeight;
  });

  pdf.save(`${filename}.pdf`);
};

// --- Export: Thinking Mode (Complex Query) ---
export const exportThinkingModeToPdf = (query: string, response: string, filename = 'thinking_mode_export') => {
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  registerFont(pdf); // <-- 4. Call the register function

  let pageNumber = 1;
  let y = addTitleBlock(pdf, 'Thinking Mode Analysis');
  addPageFooter(pdf, pageNumber); // Add footer to the first page
  
  const textLineHeight = 7;
  const blockPadding = 5;

  // --- Query Section ---
  [y, pageNumber] = ensureSpace(pdf, y, textLineHeight * 1.5, pageNumber); // Ensure space for title
  setFontSafe(pdf, 'bold');
  pdf.setFontSize(13);
  pdf.setTextColor(COLOR_PRIMARY[0], COLOR_PRIMARY[1], COLOR_PRIMARY[2]);
  pdf.text('Your Query:', MARGIN, y);
  y += textLineHeight * 1.5;

  setFontByText(pdf, query, 'normal');
  pdf.setFontSize(10.5);
  // Render query inside a highlighted box
  const queryLines = pdf.splitTextToSize(query, USABLE_WIDTH - blockPadding * 2);
  const queryBlockHeight = queryLines.length * textLineHeight + blockPadding * 2;
  [y, pageNumber] = ensureSpace(pdf, y, queryBlockHeight + textLineHeight, pageNumber);
  pdf.setFillColor(COLOR_PRIMARY_LIGHT[0], COLOR_PRIMARY_LIGHT[1], COLOR_PRIMARY_LIGHT[2]);
  pdf.setDrawColor(COLOR_LINE[0], COLOR_LINE[1], COLOR_LINE[2]);
  pdf.roundedRect(MARGIN, y, USABLE_WIDTH, queryBlockHeight, 3, 3, 'FD');
  setFontByText(pdf, query, 'normal');
  pdf.setFontSize(10.5);
  pdf.setTextColor(COLOR_BODY[0], COLOR_BODY[1], COLOR_BODY[2]);
  let innerY = y + blockPadding + 4;
  [innerY, pageNumber] = renderWrappedText(pdf, query, MARGIN + blockPadding, innerY, USABLE_WIDTH - blockPadding * 2, textLineHeight, pageNumber);
  y = innerY + 12 - textLineHeight; // Space after block

  // --- Response Section ---
  [y, pageNumber] = ensureSpace(pdf, y, textLineHeight * 1.5, pageNumber);
  
  setFontSafe(pdf, 'bold');
  pdf.setFontSize(13);
  pdf.setTextColor(COLOR_ASSISTANT[0], COLOR_ASSISTANT[1], COLOR_ASSISTANT[2]);
  pdf.text('Analysis Response:', MARGIN, y);
  y += textLineHeight * 1.5;

  setFontByText(pdf, response, 'normal');
  pdf.setFontSize(10.5);
  pdf.setTextColor(COLOR_BODY[0], COLOR_BODY[1], COLOR_BODY[2]);
  // Use renderWrappedText so bullets and paragraphs are respected
  [y, pageNumber] = renderWrappedText(pdf, response, MARGIN, y, USABLE_WIDTH, textLineHeight, pageNumber);

  pdf.save(`${filename}.pdf`);
};

