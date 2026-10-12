import type { MonthlyReport } from "./buildReport";
import { downloadBlob } from "./download";

const MIME = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
const HEAD = ["Date", "Type", "Description", "Category", "Account", "Amount"];

/**
 * Excel export (ExcelJS).
 *
 * Dynamically imported so the ~1 MB worksheet library never lands in the main
 * chunk (the production build already warns about bundle size).
 */
export async function exportMonthlyXlsx(report: MonthlyReport, filename: string): Promise<void> {
  const ExcelJS = await import("exceljs");

  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet(report.periodLabel);

  ws.addRow(["Aureus — Monthly Financial Report"]).font = { bold: true, size: 14 };
  ws.addRow([report.periodLabel]);
  ws.addRow([report.rangeLabel]);
  ws.addRow([]);
  ws.addRow(["Income", report.totalIncome]);
  ws.addRow(["Expenses", report.totalExpense]);
  ws.addRow(["Net", report.net]);
  ws.addRow(["Transactions", report.count]);
  ws.addRow([]);
  const header = ws.addRow(HEAD);
  header.font = { bold: true, color: { argb: "FFFFFFFF" } };
  header.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0F172A" } };

  for (const row of report.rows) {
    const r = ws.addRow([row.date, row.type, row.description, row.category, row.account, row.value]);
    r.getCell(6).numFmt = '#,##0.00;[Red]-#,##0.00';
  }

  const widths = [16, 10, 36, 22, 22, 16];
  widths.forEach((width, index) => {
    ws.getColumn(index + 1).width = width;
  });

  const buffer = await wb.xlsx.writeBuffer();
  downloadBlob(new Blob([buffer], { type: MIME }), filename);
}