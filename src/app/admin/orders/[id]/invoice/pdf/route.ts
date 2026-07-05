import { NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { requireAdmin } from "@/lib/auth/require-admin";
import { getAdminOrderById } from "@/lib/data/admin/orders";
import { formatPrice } from "@/lib/format";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  await requireAdmin();

  const order = await getAdminOrderById(params.id);
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let y = 800;
  const left = 50;
  const charcoal = rgb(0.14, 0.14, 0.14);
  const sage = rgb(0.34, 0.42, 0.28);

  function text(value: string, x: number, yPos: number, opts: { size?: number; bold?: boolean; color?: ReturnType<typeof rgb> } = {}) {
    page.drawText(value, {
      x,
      y: yPos,
      size: opts.size ?? 11,
      font: opts.bold ? fontBold : font,
      color: opts.color ?? charcoal,
    });
  }

  text("ATOM PURE", left, y, { size: 22, bold: true, color: sage });
  text(`Invoice ${order.order_number}`, 595 - left - 200, y, { size: 12, bold: true });
  y -= 40;

  text("Bill To", left, y, { bold: true });
  y -= 18;
  text(order.shipping_full_name ?? "", left, y);
  y -= 16;
  text(order.shipping_phone ?? "", left, y);
  y -= 16;
  text(order.shipping_line1 ?? "", left, y);
  y -= 16;
  text(
    `${order.shipping_city ?? ""}${order.shipping_province ? ", " + order.shipping_province : ""} ${order.shipping_postal_code ?? ""}`,
    left,
    y
  );
  y -= 40;

  text("Item", left, y, { bold: true });
  text("Qty", 350, y, { bold: true });
  text("Price", 420, y, { bold: true });
  text("Total", 500, y, { bold: true });
  y -= 10;
  page.drawLine({ start: { x: left, y }, end: { x: 545, y }, thickness: 0.5, color: charcoal });
  y -= 20;

  for (const item of order.order_items) {
    const name = `${item.product_variant?.product?.name ?? ""} (${item.product_variant?.name ?? ""})`;
    text(name.slice(0, 45), left, y);
    text(String(item.quantity), 350, y);
    text(formatPrice(item.unit_price), 420, y);
    text(formatPrice(item.unit_price * item.quantity), 500, y);
    y -= 20;
  }

  y -= 10;
  page.drawLine({ start: { x: left, y }, end: { x: 545, y }, thickness: 0.5, color: charcoal });
  y -= 24;

  text("Subtotal", 420, y);
  text(formatPrice(order.subtotal), 500, y);
  y -= 18;

  if (order.discount_total > 0) {
    text(`Discount${order.coupon_code ? ` (${order.coupon_code})` : ""}`, 420, y);
    text(`-${formatPrice(order.discount_total)}`, 500, y);
    y -= 18;
  }

  if (order.shipping_total > 0) {
    text("Shipping", 420, y);
    text(formatPrice(order.shipping_total), 500, y);
    y -= 18;
  }

  if (order.tax_total > 0) {
    text("Tax", 420, y);
    text(formatPrice(order.tax_total), 500, y);
    y -= 18;
  }

  text("Total", 420, y, { bold: true });
  text(formatPrice(order.total), 500, y, { bold: true });
  y -= 30;

  text(`Payment Method: ${order.payment_method.toUpperCase()}`, left, y);

  const pdfBytes = await pdfDoc.save();

  return new NextResponse(Buffer.from(pdfBytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="invoice-${order.order_number}.pdf"`,
    },
  });
}
