import type { MonthlyReport } from "./buildReport";
import { downloadBlob } from "./download";

const HEAD = ["Date", "Type", "Description", "Category", "Account", "Amount"];
const HEADER_FILL = "0F172A";

/**
 * Word export (docx).
 *
 * Dynamically imported for the same bundle-size reason as the PDF and Excel
 * writers. `Packer.toBlob` is the browser build — no fs/polyfill needed.
 */
export async function exportMonthlyDocx(report: MonthlyReport, filename: string): Promise<void> {
  const {
    Document,
    Packer,
    Paragraph,
    TextRun,
    Table,
    TableRow,
    TableCell,
    WidthType,
    BorderStyle,
  } = await import("docx");

  const cell = (text: string, options: { header?: boolean } = {}) =>
    new TableCell({
      children: [
        new Paragraph({
          children: [
            new TextRun({ text, bold: options.header ?? false, color: options.header ? "FFFFFF" : "1E293B" }),
          ],
          spacing: { before: 40, after: 40 },
        }),
      ],
      shading: options.header ? { fill: HEADER_FILL, type: "clear", color: "auto" } : undefined,
      margins: { top: 80, bottom: 80, left: 100, right: 100 },
    });

  const line = (label: string, value: string) =>
    new Paragraph({
      children: [
        new TextRun({ text: `${label}: `, bold: true }),
        new TextRun({ text: value }),
      ],
      spacing: { after: 60 },
    });

  const table = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 4, color: "E2E8F0" },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: "E2E8F0" },
      left: { style: BorderStyle.SINGLE, size: 4, color: "E2E8F0" },
      right: { style: BorderStyle.SINGLE, size: 4, color: "E2E8F0" },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: "E2E8F0" },
      insideVertical: { style: BorderStyle.SINGLE, size: 4, color: "E2E8F0" },
    },
    rows: [
      new TableRow({
        tableHeader: true,
        children: HEAD.map((h) => cell(h, { header: true })),
      }),
      ...report.rows.map(
        (row) =>
          new TableRow({
            children: [row.date, row.type, row.description, row.category, row.account, row.amount].map(
              (value) => cell(value)
            ),
          })
      ),
    ],
  });

  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({
            children: [new TextRun({ text: "Aureus — Monthly Financial Report", bold: true, size: 32 })],
            spacing: { after: 160 },
          }),
          line("Period", report.periodLabel),
          line("Date range", report.rangeLabel),
          line("Currency", report.currency),
          new Paragraph({ children: [], spacing: { after: 120 } }),
          line("Income", report.totalIncome.toFixed(2)),
          line("Expenses", report.totalExpense.toFixed(2)),
          line("Net", report.net.toFixed(2)),
          line("Transactions", String(report.count)),
          new Paragraph({ children: [], spacing: { after: 200 } }),
          table,
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  downloadBlob(blob, filename);
}