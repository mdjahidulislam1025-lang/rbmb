import { jsPDF } from 'jspdf';
import { Language, LocalizedString, StudyGroup } from '../types';
import { getDhakaTodayISO } from './dhakaTime';
import { NctbSyllabusChapter, NctbSyllabusSubjectDetail } from './nctbSyllabus';

export interface DownloadSyllabusPdfOptions {
  schoolName: string;
  eiin?: string;
  location?: string;
  className: string;
  classId: string;
  year: string;
  lang: Language;
  groupLabel?: string;
  studentInfo?: {
    name: string;
    roll?: string;
  };
  portalUrl?: string;
  subjects: NctbSyllabusSubjectDetail[];
  translate: (s: LocalizedString) => string;
}

const PAGE_W = 1240; // A4 @ 150 DPI
const PAGE_H = 1754;
const MARGIN_X = 64;
const CONTENT_W = PAGE_W - MARGIN_X * 2;
const FOOTER_RESERVE = 92;
const FONT_FAMILY = "'Hind Siliguri', 'Plus Jakarta Sans', 'Noto Sans Bengali', system-ui, sans-serif";
const MONO_FONT = "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace";

function drawRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const clean = String(text || '').replace(/\s+/g, ' ').trim();
  if (!clean) return [];
  const words = clean.split(' ');
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (ctx.measureText(candidate).width <= maxWidth) {
      current = candidate;
    } else {
      if (current) {
        lines.push(current);
        current = '';
      }
      if (ctx.measureText(word).width <= maxWidth) {
        current = word;
      } else {
        let chunk = '';
        for (const ch of Array.from(word)) {
          const next = chunk + ch;
          if (ctx.measureText(next).width > maxWidth && chunk) {
            lines.push(chunk);
            chunk = ch;
          } else {
            chunk = next;
          }
        }
        current = chunk;
      }
    }
  }
  if (current) lines.push(current);
  return lines;
}

function formatGroupBadge(group: StudyGroup, lang: Language): string {
  switch (group) {
    case 'Science':
      return lang === 'bn' ? 'বিজ্ঞান' : 'Science';
    case 'Humanities':
      return lang === 'bn' ? 'মানবিক' : 'Humanities';
    case 'Business Studies':
      return lang === 'bn' ? 'ব্যবসায় শিক্ষা' : 'Business';
    default:
      return lang === 'bn' ? 'আবশ্যিক' : 'Common';
  }
}

export async function downloadSyllabusPdf(options: DownloadSyllabusPdfOptions): Promise<void> {
  const {
    schoolName,
    eiin,
    location,
    className,
    classId,
    year,
    lang,
    groupLabel,
    studentInfo,
    portalUrl,
    subjects,
    translate,
  } = options;

  if (typeof document !== 'undefined' && 'fonts' in document) {
    try {
      await document.fonts.ready;
    } catch {
      // Proceed with fallback system fonts if font readiness rejects
    }
  }

  const pages: HTMLCanvasElement[] = [];

  const createPageCanvas = (): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } => {
    const canvas = document.createElement('canvas');
    canvas.width = PAGE_W;
    canvas.height = PAGE_H;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Could not initialize 2D canvas context for PDF generation.');
    }
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, PAGE_W, PAGE_H);
    pages.push(canvas);
    return { canvas, ctx };
  };

  const drawFirstPageHeader = (ctx: CanvasRenderingContext2D): number => {
    const bannerX = MARGIN_X;
    const bannerY = 48;
    const bannerW = CONTENT_W;
    const bannerH = 148;

    drawRoundRect(ctx, bannerX, bannerY, bannerW, bannerH, 20);
    ctx.fillStyle = '#064e3b';
    ctx.fill();

    drawRoundRect(ctx, bannerX, bannerY, 10, bannerH, 5);
    ctx.fillStyle = '#10b981';
    ctx.fill();

    const badgeText = `NCTB ${year}`;
    ctx.font = `800 20px ${FONT_FAMILY}`;
    const badgeW = Math.max(150, ctx.measureText(badgeText).width + 44);
    const badgeX = bannerX + bannerW - badgeW - 28;
    const badgeY = bannerY + 28;
    drawRoundRect(ctx, badgeX, badgeY, badgeW, 44, 12);
    ctx.fillStyle = 'rgba(255,255,255,0.16)';
    ctx.fill();
    ctx.fillStyle = '#ecfdf5';
    ctx.textBaseline = 'middle';
    ctx.fillText(badgeText, badgeX + 22, badgeY + 23);

    ctx.fillStyle = '#ffffff';
    ctx.font = `800 32px ${FONT_FAMILY}`;
    ctx.textBaseline = 'top';
    const maxTitleW = bannerW - badgeW - 88;
    const titleLines = wrapText(ctx, schoolName, maxTitleW).slice(0, 2);
    let textY = bannerY + 28;
    for (const line of titleLines) {
      ctx.fillText(line, bannerX + 34, textY);
      textY += 40;
    }

    const subParts: string[] = [];
    if (eiin) subParts.push(`EIIN: ${eiin}`);
    if (location) subParts.push(location);
    if (subParts.length > 0) {
      ctx.fillStyle = '#a7f3d0';
      ctx.font = `600 18px ${FONT_FAMILY}`;
      const subLines = wrapText(ctx, subParts.join('  ·  '), bannerW - 72).slice(0, 1);
      ctx.fillText(subLines[0] || '', bannerX + 34, Math.max(textY + 4, bannerY + 106));
    }

    const metaY = bannerY + bannerH + 22;
    const hasStudent = Boolean(studentInfo?.name);
    const metaH = hasStudent ? 124 : 96;
    drawRoundRect(ctx, MARGIN_X, metaY, CONTENT_W, metaH, 16);
    ctx.fillStyle = '#ecfdf5';
    ctx.fill();
    ctx.strokeStyle = '#a7f3d0';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#065f46';
    ctx.font = `800 25px ${FONT_FAMILY}`;
    ctx.textBaseline = 'top';
    const heading =
      lang === 'bn'
        ? `${className} — NCTB অনুমোদিত বিষয়, অধ্যায় ও টপিক সিলেবাস (${year})`
        : `${className} — Official NCTB Chapters & Topics Syllabus (${year})`;
    ctx.fillText(heading, MARGIN_X + 24, metaY + 18);

    const todayIso = getDhakaTodayISO();
    const metaItems: string[] = [
      lang === 'bn' ? `মোট বিষয়: ${subjects.length}টি` : `Total Subjects: ${subjects.length}`,
    ];
    if (groupLabel) {
      metaItems.push(lang === 'bn' ? `বিভাগ: ${groupLabel}` : `Group: ${groupLabel}`);
    }
    metaItems.push(lang === 'bn' ? `প্রস্তুত তারিখ: ${todayIso}` : `Generated: ${todayIso}`);

    ctx.fillStyle = '#047857';
    ctx.font = `600 18px ${FONT_FAMILY}`;
    ctx.fillText(metaItems.join('   |   '), MARGIN_X + 24, metaY + 56);

    if (hasStudent && studentInfo) {
      const studentLine =
        lang === 'bn'
          ? `শিক্ষার্থী: ${studentInfo.name}${studentInfo.roll ? `   |   রোল: ${studentInfo.roll}` : ''}`
          : `Student: ${studentInfo.name}${studentInfo.roll ? `   |   Roll: ${studentInfo.roll}` : ''}`;
      ctx.fillStyle = '#064e3b';
      ctx.font = `700 18px ${FONT_FAMILY}`;
      ctx.fillText(studentLine, MARGIN_X + 24, metaY + 86);
    }

    return metaY + metaH + 24;
  };

  const drawContinuationHeader = (ctx: CanvasRenderingContext2D): number => {
    const barY = 42;
    const barH = 58;
    drawRoundRect(ctx, MARGIN_X, barY, CONTENT_W, barH, 12);
    ctx.fillStyle = '#064e3b';
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = `700 20px ${FONT_FAMILY}`;
    ctx.textBaseline = 'middle';
    const leftText = `${schoolName}  ·  ${className}`;
    ctx.fillText(leftText, MARGIN_X + 22, barY + barH / 2);

    const rightText =
      lang === 'bn' ? `NCTB অধ্যায় ও টপিক সিলেবাস ${year}` : `NCTB Syllabus ${year}`;
    ctx.font = `700 18px ${FONT_FAMILY}`;
    const rightW = ctx.measureText(rightText).width;
    ctx.fillStyle = '#a7f3d0';
    ctx.fillText(rightText, MARGIN_X + CONTENT_W - rightW - 22, barY + barH / 2);

    return barY + barH + 22;
  };

  const measureChapterRow = (
    ctx: CanvasRenderingContext2D,
    chapter: NctbSyllabusChapter,
    chIdx: number
  ) => {
    const chapterText = `${chIdx + 1}. ${translate(chapter.chapterTitle)}`;
    const topicText =
      lang === 'bn'
        ? `পাঠ্য টপিক: ${translate(chapter.topics)}`
        : `Topics Covered: ${translate(chapter.topics)}`;

    const innerLeft = 28;
    const textMaxW = CONTENT_W - innerLeft - 24;

    ctx.font = `700 18px ${FONT_FAMILY}`;
    const chTitleLines = wrapText(ctx, chapterText, textMaxW);

    ctx.font = `500 16px ${FONT_FAMILY}`;
    const topicLines = wrapText(ctx, topicText, textMaxW);

    const chTitleH = Math.max(1, chTitleLines.length) * 24;
    const topicH = Math.max(1, topicLines.length) * 23;
    const rowH = 14 + chTitleH + 5 + topicH + 14;

    return { chTitleLines, topicLines, rowH };
  };

  let current = createPageCanvas();
  let y = drawFirstPageHeader(current.ctx);

  const isSecondary = classId === '9' || classId === '10';

  if (subjects.length === 0) {
    current.ctx.fillStyle = '#475569';
    current.ctx.font = `600 22px ${FONT_FAMILY}`;
    current.ctx.textBaseline = 'top';
    current.ctx.fillText(
      lang === 'bn' ? 'এই শ্রেণীর কোনো বিষয় পাওয়া যায়নি।' : 'No subjects available for this class.',
      MARGIN_X + 12,
      y + 20
    );
  } else {
    subjects.forEach((sub, idx) => {
      const ctx = current.ctx;
      const subName = translate(sub.name);
      const breakdown = translate(sub.marksBreakdown);
      const breakdownLabel =
        lang === 'bn'
          ? `নম্বর বণ্টন: ${breakdown}`
          : `Marks Breakdown: ${breakdown}`;

      const chapters: NctbSyllabusChapter[] =
        sub.chapters && sub.chapters.length > 0
          ? sub.chapters
          : [
              {
                chapterTitle: {
                  bn: 'নির্ধারিত অধ্যায়সমূহ',
                  en: 'Prescribed Chapters',
                },
                topics: sub.chaptersOutline,
              },
            ];

      const innerLeft = 74;
      const rightMetaReserve = isSecondary && sub.group ? 290 : 250;
      const titleMaxW = CONTENT_W - innerLeft - rightMetaReserve;

      ctx.font = `800 22px ${FONT_FAMILY}`;
      const titleLines = wrapText(ctx, subName, titleMaxW);

      ctx.font = `700 16px ${FONT_FAMILY}`;
      const breakdownLines = wrapText(ctx, breakdownLabel, CONTENT_W - innerLeft - 24);

      const titleH = Math.max(1, titleLines.length) * 29;
      const breakdownH = Math.max(1, breakdownLines.length) * 22;
      const subjectHeaderH = 18 + titleH + 6 + breakdownH + 16;

      const measuredChapters = chapters.map((chItem, chIdx) =>
        measureChapterRow(ctx, chItem, chIdx)
      );
      const firstChapterH = measuredChapters[0]?.rowH || 0;

      // Ensure subject header + first chapter stay together cleanly
      if (y + subjectHeaderH + firstChapterH + 12 > PAGE_H - FOOTER_RESERVE) {
        current = createPageCanvas();
        y = drawContinuationHeader(current.ctx);
      }

      const drawSubjectHeader = (drawCtx: CanvasRenderingContext2D, topY: number) => {
        const cardX = MARGIN_X;
        const cardW = CONTENT_W;

        drawRoundRect(drawCtx, cardX, topY, cardW, subjectHeaderH, 14);
        drawCtx.fillStyle = '#f0fdf4';
        drawCtx.fill();
        drawCtx.strokeStyle = '#86efac';
        drawCtx.lineWidth = 1.6;
        drawCtx.stroke();

        // Number badge
        const numX = cardX + 18;
        const numY = topY + 18;
        drawRoundRect(drawCtx, numX, numY, 40, 40, 10);
        drawCtx.fillStyle = '#065f46';
        drawCtx.fill();

        drawCtx.fillStyle = '#ffffff';
        drawCtx.font = `800 18px ${FONT_FAMILY}`;
        drawCtx.textBaseline = 'middle';
        const numStr = String(idx + 1);
        const numW = drawCtx.measureText(numStr).width;
        drawCtx.fillText(numStr, numX + (40 - numW) / 2, numY + 21);

        // Right pills: Group (if 9-10) + Marks + #Code
        const marksText =
          lang === 'bn' ? `${sub.totalMarks} নম্বর` : `${sub.totalMarks} Marks`;
        const codeText = `#${sub.code}`;

        drawCtx.font = `700 15px ${FONT_FAMILY}`;
        const marksW = drawCtx.measureText(marksText).width + 22;
        drawCtx.font = `700 15px ${MONO_FONT}`;
        const codeW = drawCtx.measureText(codeText).width + 20;

        let cursorX = cardX + cardW - 18;
        const pillY = topY + 18;

        // Code pill
        cursorX -= codeW;
        drawRoundRect(drawCtx, cursorX, pillY, codeW, 30, 8);
        drawCtx.fillStyle = '#e2e8f0';
        drawCtx.fill();
        drawCtx.fillStyle = '#334155';
        drawCtx.font = `700 15px ${MONO_FONT}`;
        drawCtx.textBaseline = 'middle';
        drawCtx.fillText(codeText, cursorX + 10, pillY + 16);

        // Marks pill
        cursorX -= marksW + 8;
        drawRoundRect(drawCtx, cursorX, pillY, marksW, 30, 8);
        drawCtx.fillStyle = '#bbf7d0';
        drawCtx.fill();
        drawCtx.fillStyle = '#065f46';
        drawCtx.font = `800 15px ${FONT_FAMILY}`;
        drawCtx.fillText(marksText, cursorX + 11, pillY + 16);

        // Group badge
        if (isSecondary && sub.group) {
          const groupText = formatGroupBadge(sub.group, lang);
          drawCtx.font = `700 14px ${FONT_FAMILY}`;
          const groupW = drawCtx.measureText(groupText).width + 20;
          cursorX -= groupW + 8;
          drawRoundRect(drawCtx, cursorX, pillY, groupW, 30, 8);
          drawCtx.fillStyle = sub.group === 'Common' ? '#ffffff' : '#fef3c7';
          drawCtx.fill();
          drawCtx.strokeStyle = sub.group === 'Common' ? '#cbd5e1' : '#fcd34d';
          drawCtx.lineWidth = 1;
          drawCtx.stroke();
          drawCtx.fillStyle = sub.group === 'Common' ? '#475569' : '#92400e';
          drawCtx.fillText(groupText, cursorX + 10, pillY + 16);
        }

        // Title & Marks breakdown
        let rowY = topY + 18;
        drawCtx.fillStyle = '#0f172a';
        drawCtx.font = `800 22px ${FONT_FAMILY}`;
        drawCtx.textBaseline = 'top';
        for (const line of titleLines) {
          drawCtx.fillText(line, cardX + innerLeft, rowY);
          rowY += 29;
        }
        rowY += 6;
        drawCtx.fillStyle = '#047857';
        drawCtx.font = `700 16px ${FONT_FAMILY}`;
        for (const line of breakdownLines) {
          drawCtx.fillText(line, cardX + innerLeft, rowY);
          rowY += 22;
        }
      };

      drawSubjectHeader(current.ctx, y);
      y += subjectHeaderH + 8;

      measuredChapters.forEach((mCh) => {
        if (y + mCh.rowH > PAGE_H - FOOTER_RESERVE) {
          current = createPageCanvas();
          y = drawContinuationHeader(current.ctx);

          // Compact continuation sub-banner so reader knows which subject these chapters belong to
          const subBannerH = 40;
          drawRoundRect(current.ctx, MARGIN_X, y, CONTENT_W, subBannerH, 10);
          current.ctx.fillStyle = '#ecfdf5';
          current.ctx.fill();
          current.ctx.strokeStyle = '#a7f3d0';
          current.ctx.lineWidth = 1.2;
          current.ctx.stroke();

          current.ctx.fillStyle = '#065f46';
          current.ctx.font = `800 17px ${FONT_FAMILY}`;
          current.ctx.textBaseline = 'middle';
          const contLabel =
            lang === 'bn'
              ? `${idx + 1}. ${subName} (#${sub.code}) — চলমান অধ্যায় ও টপিকসমূহ`
              : `${idx + 1}. ${subName} (#${sub.code}) — Chapters & Topics (cont.)`;
          current.ctx.fillText(contLabel, MARGIN_X + 18, y + subBannerH / 2);
          y += subBannerH + 8;
        }

        const drawCtx = current.ctx;
        const rowX = MARGIN_X;
        const rowW = CONTENT_W;

        drawRoundRect(drawCtx, rowX, y, rowW, mCh.rowH, 10);
        drawCtx.fillStyle = '#ffffff';
        drawCtx.fill();
        drawCtx.strokeStyle = '#e2e8f0';
        drawCtx.lineWidth = 1.2;
        drawCtx.stroke();

        // Left emerald accent bar for chapter
        drawRoundRect(drawCtx, rowX + 12, y + 12, 5, mCh.rowH - 24, 3);
        drawCtx.fillStyle = '#10b981';
        drawCtx.fill();

        let chY = y + 14;
        drawCtx.fillStyle = '#0f172a';
        drawCtx.font = `700 18px ${FONT_FAMILY}`;
        drawCtx.textBaseline = 'top';
        for (const line of mCh.chTitleLines) {
          drawCtx.fillText(line, rowX + 28, chY);
          chY += 24;
        }

        chY += 5;
        drawCtx.fillStyle = '#475569';
        drawCtx.font = `500 16px ${FONT_FAMILY}`;
        for (const line of mCh.topicLines) {
          drawCtx.fillText(line, rowX + 28, chY);
          chY += 23;
        }

        y += mCh.rowH + 7;
      });

      y += 14;
    });
  }

  // Stamp page footers across all generated pages
  const totalPages = pages.length;
  pages.forEach((canvas, idx) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const lineY = PAGE_H - 68;
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(MARGIN_X, lineY);
    ctx.lineTo(PAGE_W - MARGIN_X, lineY);
    ctx.stroke();

    ctx.fillStyle = '#64748b';
    ctx.font = `600 15px ${FONT_FAMILY}`;
    ctx.textBaseline = 'top';
    const leftFooter = portalUrl
      ? `NCTB Official Portal: ${portalUrl}`
      : 'National Curriculum & Textbook Board (NCTB)';
    ctx.fillText(leftFooter, MARGIN_X, lineY + 16);

    const pageStr =
      lang === 'bn'
        ? `পৃষ্ঠা ${idx + 1} / ${totalPages}  ·  ${schoolName}`
        : `Page ${idx + 1} of ${totalPages}  ·  ${schoolName}`;
    const pageStrW = ctx.measureText(pageStr).width;
    ctx.fillText(pageStr, PAGE_W - MARGIN_X - pageStrW, lineY + 16);
  });

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  pages.forEach((canvas, idx) => {
    if (idx > 0) {
      doc.addPage('a4', 'portrait');
    }
    const imgData = canvas.toDataURL('image/png');
    doc.addImage(imgData, 'PNG', 0, 0, 210, 297, undefined, 'FAST');
  });

  const safeClass = String(classId || 'Class').replace(/[^a-zA-Z0-9_-]/g, '');
  const safeYear = String(year || '2026').replace(/[^a-zA-Z0-9_-]/g, '');
  doc.save(`NCTB_Syllabus_Class_${safeClass}_${safeYear}.pdf`);
}
