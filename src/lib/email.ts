import { formatPrice } from "@/lib/format";

interface OrderEmailItem {
  productName: string;
  variantName: string;
  quantity: number;
  unitPrice: number;
}

interface OrderEmailData {
  orderNumber: string;
  toEmail: string;
  toName: string;
  items: OrderEmailItem[];
  subtotal: number;
  discountTotal: number;
  couponCode: string | null;
  shippingTotal: number;
  taxTotal: number;
  total: number;
  shippingAddress: {
    fullName: string;
    phone: string;
    line1: string;
    line2?: string | null;
    city: string;
    province?: string | null;
    postalCode?: string | null;
  };
}

function buildOrderEmailHtml(data: OrderEmailData): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const itemRows = data.items
    .map(
      (item) => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #ede8df;font-size:14px;color:#3d3d3d;">
          ${item.productName}${item.variantName ? ` <span style="color:#7a7a6e;">(${item.variantName})</span>` : ""}
          &times; ${item.quantity}
        </td>
        <td style="padding:10px 0;border-bottom:1px solid #ede8df;font-size:14px;color:#3d3d3d;text-align:right;white-space:nowrap;">
          ${formatPrice(item.unitPrice * item.quantity)}
        </td>
      </tr>`
    )
    .join("");

  const discountRow =
    data.discountTotal > 0
      ? `<tr>
          <td style="padding:6px 0;font-size:13px;color:#5c7a5e;">Discount${data.couponCode ? ` (${data.couponCode})` : ""}</td>
          <td style="padding:6px 0;font-size:13px;color:#5c7a5e;text-align:right;">-${formatPrice(data.discountTotal)}</td>
        </tr>`
      : "";

  const shippingRow =
    data.shippingTotal > 0
      ? `<tr>
          <td style="padding:6px 0;font-size:13px;color:#3d3d3d;">Shipping</td>
          <td style="padding:6px 0;font-size:13px;color:#3d3d3d;text-align:right;">${formatPrice(data.shippingTotal)}</td>
        </tr>`
      : `<tr>
          <td style="padding:6px 0;font-size:13px;color:#5c7a5e;">Shipping</td>
          <td style="padding:6px 0;font-size:13px;color:#5c7a5e;text-align:right;">Free</td>
        </tr>`;

  const taxRow =
    data.taxTotal > 0
      ? `<tr>
          <td style="padding:6px 0;font-size:13px;color:#3d3d3d;">Tax</td>
          <td style="padding:6px 0;font-size:13px;color:#3d3d3d;text-align:right;">${formatPrice(data.taxTotal)}</td>
        </tr>`
      : "";

  const addr = data.shippingAddress;
  const addressLines = [
    addr.line1,
    addr.line2,
    [addr.city, addr.province].filter(Boolean).join(", "),
    addr.postalCode,
  ]
    .filter(Boolean)
    .join("<br>");

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f0e8;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0e8;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fdfbf7;border-radius:16px;overflow:hidden;">

        <!-- Header -->
        <tr>
          <td style="background:#3d5140;padding:32px 40px;text-align:center;">
            <p style="margin:0;font-size:11px;letter-spacing:3px;color:#a8c4a2;text-transform:uppercase;">ATOM PURE</p>
            <p style="margin:8px 0 0;font-size:22px;color:#fdfbf7;font-weight:300;">Order Confirmed</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:40px;">

            <p style="margin:0 0 8px;font-size:14px;color:#7a7a6e;">Hi ${data.toName},</p>
            <p style="margin:0 0 24px;font-size:14px;color:#3d3d3d;line-height:1.6;">
              Thank you for your order! We&rsquo;ve received it and it&rsquo;s being prepared for delivery.
              You&rsquo;ll pay <strong>Cash on Delivery</strong> when your order arrives.
            </p>

            <!-- Order number -->
            <div style="background:#f5f0e8;border-radius:10px;padding:16px 20px;margin-bottom:28px;">
              <p style="margin:0;font-size:12px;color:#7a7a6e;letter-spacing:1px;text-transform:uppercase;">Order Number</p>
              <p style="margin:4px 0 0;font-size:18px;font-weight:600;color:#3d3d3d;letter-spacing:1px;">${data.orderNumber}</p>
            </div>

            <!-- Items -->
            <p style="margin:0 0 12px;font-size:13px;font-weight:600;color:#3d3d3d;letter-spacing:1px;text-transform:uppercase;">Items</p>
            <table width="100%" cellpadding="0" cellspacing="0">
              ${itemRows}
            </table>

            <!-- Totals -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;border-top:2px solid #ede8df;padding-top:12px;">
              <tr>
                <td style="padding:6px 0;font-size:13px;color:#3d3d3d;">Subtotal</td>
                <td style="padding:6px 0;font-size:13px;color:#3d3d3d;text-align:right;">${formatPrice(data.subtotal)}</td>
              </tr>
              ${discountRow}
              ${shippingRow}
              ${taxRow}
              <tr>
                <td style="padding:12px 0 6px;font-size:15px;font-weight:700;color:#3d3d3d;border-top:1px solid #ede8df;">Total</td>
                <td style="padding:12px 0 6px;font-size:15px;font-weight:700;color:#3d3d3d;text-align:right;border-top:1px solid #ede8df;">${formatPrice(data.total)}</td>
              </tr>
            </table>

            <!-- Shipping -->
            <p style="margin:28px 0 12px;font-size:13px;font-weight:600;color:#3d3d3d;letter-spacing:1px;text-transform:uppercase;">Delivering To</p>
            <p style="margin:0;font-size:14px;color:#3d3d3d;line-height:1.8;">
              ${addr.fullName}<br>
              ${addr.phone}<br>
              ${addressLines}
            </p>

            <!-- CTA -->
            <div style="text-align:center;margin-top:36px;">
              <a href="${siteUrl}/order-confirmation/${data.orderNumber}"
                 style="display:inline-block;background:#3d5140;color:#fdfbf7;text-decoration:none;padding:14px 32px;border-radius:999px;font-size:14px;font-weight:500;letter-spacing:0.5px;">
                View Order Receipt
              </a>
            </div>

          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f5f0e8;padding:24px 40px;text-align:center;">
            <p style="margin:0;font-size:12px;color:#9a9a8e;">
              Questions? Reply to this email or visit
              <a href="${siteUrl}/contact" style="color:#5c7a5e;text-decoration:none;">our contact page</a>.
            </p>
            <p style="margin:8px 0 0;font-size:11px;color:#b8b8ae;">
              &copy; ${new Date().getFullYear()} ATOM PURE. All rights reserved.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function sendOrderConfirmationEmail(data: OrderEmailData): Promise<void> {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) return; // silently skip if not configured

  const html = buildOrderEmailHtml(data);

  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sender: { name: "ATOM PURE", email: "orders@atompurelife.com" },
      to: [{ email: data.toEmail, name: data.toName }],
      subject: `Order Confirmed — ${data.orderNumber}`,
      htmlContent: html,
    }),
  });

  if (!res.ok) {
    // Log but don't throw — a failed email must never block the order
    console.error("[Brevo] Failed to send order confirmation:", await res.text());
  }
}
