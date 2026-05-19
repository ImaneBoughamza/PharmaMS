import nodemailer from "nodemailer";
import logger from "../utils/logger.js";

const hasValue = (value) =>
  Boolean(value && !String(value).toLowerCase().includes("placeholder") && !String(value).startsWith("your_"));

const createTransportConfig = () => {
  if (hasValue(process.env.SMTP_HOST) && hasValue(process.env.SMTP_USER) && hasValue(process.env.SMTP_PASS)) {
    return {
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    };
  }

  if (hasValue(process.env.SENDGRID_API_KEY)) {
    return {
      host: "smtp.sendgrid.net",
      port: 587,
      secure: false,
      auth: {
        user: "apikey",
        pass: process.env.SENDGRID_API_KEY,
      },
    };
  }

  return null;
};

const transportConfig = createTransportConfig();
const transporter = transportConfig ? nodemailer.createTransport(transportConfig) : null;
const fromEmail =
  process.env.EMAIL_FROM ||
  process.env.SENDGRID_FROM_EMAIL ||
  process.env.SMTP_FROM_EMAIL ||
  process.env.SMTP_USER;

if (transporter) {
  transporter
    .verify()
    .then(() => logger.info("Email transporter ready"))
    .catch((err) => logger.warn(`Email transporter not ready: ${err.message}`));
} else {
  logger.warn("Email sending disabled: configure SENDGRID_API_KEY or SMTP_HOST/SMTP_USER/SMTP_PASS");
}

const styles = {
  body: "font-family: Arial, sans-serif; color: #1A1A1A; max-width: 600px; margin: 0 auto;",
  header: "background: #0B1C35; color: white; padding: 20px 24px;",
  logo: "font-size: 20px; font-weight: bold; color: white;",
  content: "padding: 24px;",
  code: "background: #F7F5F0; border: 1px solid #DDD9D0; padding: 12px 20px; font-size: 24px; font-weight: bold; font-family: monospace; color: #1B5E42; display: inline-block; margin: 16px 0;",
  table: "width: 100%; border-collapse: collapse; margin: 16px 0;",
  th: "background: #F7F5F0; padding: 8px 12px; text-align: left; border-bottom: 2px solid #DDD9D0; font-size: 12px; text-transform: uppercase;",
  td: "padding: 8px 12px; border-bottom: 1px solid #EEE9E0; font-size: 14px;",
  footer: "background: #F7F5F0; padding: 16px 24px; font-size: 12px; color: #64748B;",
  green: "color: #1B5E42;",
  red: "color: #7F1D1D;",
  amber: "color: #B45309;",
};

const escapeHtml = (value = "") =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

/**
 * Send an email. Never throws - logs errors instead.
 */
export const sendEmail = async ({ to, subject, html }) => {
  if (!transporter || !fromEmail) {
    logger.warn(`Email skipped to ${to}: missing email transport configuration`);
    return { success: false, skipped: true };
  }

  try {
    await transporter.sendMail({
      from: `PharmaOS <${fromEmail}>`,
      to,
      subject,
      html,
    });
    logger.info(`Email sent to ${to} - subject: ${subject}`);
    return { success: true };
  } catch (err) {
    logger.error(`Email failed to ${to}: ${err.message}`);
    return { success: false, error: err.message };
  }
};

export const sendReservationConfirmation = async ({
  customerEmail,
  customerName,
  confirmationCode,
  items,
  expiresAt,
}) => {
  const itemRows = items
    .map((item) => {
      const type = item.type || item.productType;
      return `<tr>
        <td style="${styles.td}">${escapeHtml(item.name)}</td>
        <td style="${styles.td}">${type === "medicine" ? "Medicine" : "Parapharmacy"}</td>
        <td style="${styles.td}">${escapeHtml(item.qty)}</td>
      </tr>`;
    })
    .join("");

  const html = `
    <div style="${styles.body}">
      <div style="${styles.header}">
        <span style="${styles.logo}">+ PharmaMS</span>
      </div>
      <div style="${styles.content}">
        <h2>Reservation Submitted</h2>
        <p>Hello <strong>${escapeHtml(customerName)}</strong>,</p>
        <p>Your reservation has been received and is awaiting pharmacist review.</p>

        <p>Your confirmation code:</p>
        <div style="${styles.code}">${escapeHtml(confirmationCode)}</div>
        <p style="font-size: 13px; color: #64748B;">Save this code - you will need it to track or modify your reservation.</p>

        <h3>Reserved Items</h3>
        <table style="${styles.table}">
          <thead>
            <tr>
              <th style="${styles.th}">Product</th>
              <th style="${styles.th}">Type</th>
              <th style="${styles.th}">Qty</th>
            </tr>
          </thead>
          <tbody>${itemRows}</tbody>
        </table>

        <p><strong>Valid until:</strong> ${new Date(expiresAt).toLocaleString("fr-MA")}</p>
        <p>Your reservation will expire automatically if not collected within 48 hours.</p>
      </div>
      <div style="${styles.footer}">
        PharmaMS - Automated Pharmacy Management System
      </div>
    </div>
  `;

  await sendEmail({
    to: customerEmail,
    subject: `Reservation Confirmed - Code: ${confirmationCode}`,
    html,
  });
};

export const sendReservationApproved = async ({
  customerEmail,
  customerName,
  confirmationCode,
}) => {
  const html = `
    <div style="${styles.body}">
      <div style="${styles.header}">
        <span style="${styles.logo}">+ PharmaMS</span>
      </div>
      <div style="${styles.content}">
        <h2 style="${styles.green}">Reservation Approved</h2>
        <p>Hello <strong>${escapeHtml(customerName)}</strong>,</p>
        <p>Your reservation <strong>${escapeHtml(confirmationCode)}</strong> has been approved by the pharmacist.</p>
        <p>You will receive another notification when your items are ready for pickup.</p>
      </div>
      <div style="${styles.footer}">PharmaMS</div>
    </div>
  `;

  await sendEmail({
    to: customerEmail,
    subject: `Reservation Approved - ${confirmationCode}`,
    html,
  });
};

export const sendReservationRejected = async ({
  customerEmail,
  customerName,
  confirmationCode,
  reason,
}) => {
  const html = `
    <div style="${styles.body}">
      <div style="${styles.header}">
        <span style="${styles.logo}">+ PharmaMS</span>
      </div>
      <div style="${styles.content}">
        <h2 style="${styles.red}">Reservation Not Available</h2>
        <p>Hello <strong>${escapeHtml(customerName)}</strong>,</p>
        <p>Unfortunately your reservation <strong>${escapeHtml(confirmationCode)}</strong> could not be confirmed.</p>
        ${reason ? `<p><strong>Reason:</strong> ${escapeHtml(reason)}</p>` : ""}
        <p>Please contact the pharmacy or submit a new reservation.</p>
      </div>
      <div style="${styles.footer}">PharmaMS</div>
    </div>
  `;

  await sendEmail({
    to: customerEmail,
    subject: `Reservation Update - ${confirmationCode}`,
    html,
  });
};

export const sendReservationReady = async ({
  customerEmail,
  customerName,
  confirmationCode,
  expiresAt,
}) => {
  const html = `
    <div style="${styles.body}">
      <div style="${styles.header}">
        <span style="${styles.logo}">+ PharmaMS</span>
      </div>
      <div style="${styles.content}">
        <h2 style="${styles.green}">Ready for Pickup</h2>
        <p>Hello <strong>${escapeHtml(customerName)}</strong>,</p>
        <p>Your reservation <strong>${escapeHtml(confirmationCode)}</strong> is ready for pickup.</p>
        <p><strong>Please collect before:</strong> ${new Date(expiresAt).toLocaleString("fr-MA")}</p>
        <p>Please bring this email or your confirmation code when you visit the pharmacy.</p>
      </div>
      <div style="${styles.footer}">PharmaMS</div>
    </div>
  `;

  await sendEmail({
    to: customerEmail,
    subject: `Ready for Pickup - ${confirmationCode}`,
    html,
  });
};

export const sendReservationExpired = async ({
  customerEmail,
  customerName,
  confirmationCode,
}) => {
  const html = `
    <div style="${styles.body}">
      <div style="${styles.header}">
        <span style="${styles.logo}">+ PharmaMS</span>
      </div>
      <div style="${styles.content}">
        <h2 style="${styles.amber}">Reservation Expired</h2>
        <p>Hello <strong>${escapeHtml(customerName)}</strong>,</p>
        <p>Your reservation <strong>${escapeHtml(confirmationCode)}</strong> has expired and the reserved stock has been released.</p>
        <p>If you still need these items, please submit a new reservation.</p>
      </div>
      <div style="${styles.footer}">PharmaMS</div>
    </div>
  `;

  await sendEmail({
    to: customerEmail,
    subject: `Reservation Expired - ${confirmationCode}`,
    html,
  });
};

export const sendReservationCancelled = async ({
  customerEmail,
  customerName,
  confirmationCode,
}) => {
  const html = `
    <div style="${styles.body}">
      <div style="${styles.header}">
        <span style="${styles.logo}">+ PharmaMS</span>
      </div>
      <div style="${styles.content}">
        <h2>Reservation Cancelled</h2>
        <p>Hello <strong>${escapeHtml(customerName)}</strong>,</p>
        <p>Your reservation <strong>${escapeHtml(confirmationCode)}</strong> has been cancelled as requested.</p>
        <p>Reserved stock has been released.</p>
        <p>You can submit a new reservation at any time.</p>
      </div>
      <div style="${styles.footer}">PharmaMS</div>
    </div>
  `;

  await sendEmail({
    to: customerEmail,
    subject: `Reservation Cancelled - ${confirmationCode}`,
    html,
  });
};

export default {
  sendReservationConfirmation,
  sendReservationApproved,
  sendReservationRejected,
  sendReservationReady,
  sendReservationExpired,
  sendReservationCancelled,
};
