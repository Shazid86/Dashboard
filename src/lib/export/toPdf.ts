import type { MonthlyReport } from "./buildReport";

const HEAD = ["Date", "Type", "Description", "Category", "Account", "Amount"];

/**
 * PDF export (jsPDF + jspdf-autotable).
 *
 * Both libraries are dynamically imported inside this function so they never
 * enter the main bundle — they are only needed on the rare click that exports.
 */
export async function exportMonthlyPdf(report: MonthlyReport, filename: string): Promise<void> {
  const [{ jsPDF }, { default: autoTable }] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);

  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42);
  doc.text("Aureus — Monthly Financial Report", 40, 44);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(71, 85, 105);
  doc.text(report.periodLabel, 40, 64);
  doc.text(report.rangeLabel, pageWidth - 40, 64, { align: "right" });

  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(`Income:   ${report.totalIncome.toFixed(2)}`, 40, 90);
  doc.text(`Expenses: ${report.totalExpense.toFixed(2)}`, 220, 90);
  doc.text(`Net:      ${report.net.toFixed(2)}`, 400, 90);
  doc.text(`Transactions: ${report.count}`, 560, 90);

  autoTable(doc, {
    head: [HEAD],
    body: report.rows.map((r) => [r.date, r.type, r.description, r.category, r.account, r.amount]),
    startY: 108,
    margin: { left: 40, right: 40 },
    styles: { font: "helvetica", fontSize: 9, cellPadding: 6, textColor: [30, 41, 59] },
    headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: "bold" },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: { 5: { halign: "right" } },
  });

  doc.save(filename);
}