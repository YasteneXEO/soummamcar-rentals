import logger from '../utils/logger.js';

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

interface SmsPayload {
  to: string;
  body: string;
}

interface WhatsAppPayload {
  to: string;
  template: string;
  params: Record<string, string>;
}

/**
 * Unified notification service.
 * Supports Email (Resend), SMS (Twilio), and WhatsApp Business API.
 */
export class NotificationService {
  // ─── Email via Resend ────────────────────────────────────────
  async sendEmail(payload: EmailPayload): Promise<void> {
    try {
      // TODO: Replace with actual Resend SDK call
      // import { Resend } from 'resend';
      // const resend = new Resend(env.RESEND_API_KEY);
      // await resend.emails.send({
      //   from: payload.from || 'SoummamCar <noreply@soummamcar.dz>',
      //   to: payload.to,
      //   subject: payload.subject,
      //   html: payload.html,
      // });
      logger.info(`Email sent to ${payload.to}: ${payload.subject}`);
    } catch (error) {
      logger.error(`Failed to send email to ${payload.to}`, error);
      throw error;
    }
  }

  // ─── SMS via Twilio ──────────────────────────────────────────
  async sendSms(payload: SmsPayload): Promise<void> {
    try {
      // TODO: Replace with actual Twilio SDK call
      // import twilio from 'twilio';
      // const client = twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);
      // await client.messages.create({
      //   body: payload.body,
      //   from: env.TWILIO_PHONE_NUMBER,
      //   to: payload.to,
      // });
      logger.info(`SMS sent to ${payload.to}`);
    } catch (error) {
      logger.error(`Failed to send SMS to ${payload.to}`, error);
      throw error;
    }
  }

  // ─── WhatsApp Business API ───────────────────────────────────
  async sendWhatsApp(payload: WhatsAppPayload): Promise<void> {
    try {
      // TODO: Replace with actual WhatsApp Business API call
      // await fetch(`https://graph.facebook.com/v18.0/${env.WA_PHONE_ID}/messages`, {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${env.WA_ACCESS_TOKEN}`,
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     messaging_product: 'whatsapp',
      //     to: payload.to,
      //     type: 'template',
      //     template: { name: payload.template, language: { code: 'fr' }, components: [...] },
      //   }),
      // });
      logger.info(`WhatsApp sent to ${payload.to} (template: ${payload.template})`);
    } catch (error) {
      logger.error(`Failed to send WhatsApp to ${payload.to}`, error);
      throw error;
    }
  }

  // ─── Pre-built notification templates ────────────────────────

  async notifyReservationCreated(email: string, phone: string, reference: string, details: {
    vehicle: string;
    startDate: string;
    endDate: string;
    totalAmount: number;
  }) {
    await this.sendEmail({
      to: email,
      subject: `Réservation ${reference} confirmée — SoummamCar`,
      html: `
        <h2>Votre réservation est confirmée !</h2>
        <p>Référence : <strong>${reference}</strong></p>
        <p>Véhicule : ${details.vehicle}</p>
        <p>Du ${details.startDate} au ${details.endDate}</p>
        <p>Montant total : ${details.totalAmount.toLocaleString('fr-DZ')} DZD</p>
        <p>Merci de votre confiance.<br/>L'équipe SoummamCar</p>
      `,
    });

    if (phone) {
      await this.sendWhatsApp({
        to: phone,
        template: 'reservation_confirmed',
        params: { reference, vehicle: details.vehicle, date: details.startDate },
      });
    }
  }

  async notifyPaymentReceived(email: string, reference: string, amount: number, method: string) {
    await this.sendEmail({
      to: email,
      subject: `Paiement reçu — ${reference}`,
      html: `
        <h2>Paiement reçu</h2>
        <p>Réservation : <strong>${reference}</strong></p>
        <p>Montant : ${amount.toLocaleString('fr-DZ')} DZD</p>
        <p>Mode : ${method}</p>
        <p>Merci !<br/>L'équipe SoummamCar</p>
      `,
    });
  }

  async notifyContractReady(email: string, reference: string, contractUrl: string) {
    await this.sendEmail({
      to: email,
      subject: `Contrat prêt à signer — ${reference}`,
      html: `
        <h2>Votre contrat est prêt</h2>
        <p>Réservation : <strong>${reference}</strong></p>
        <p><a href="${contractUrl}">Consultez et signez votre contrat</a></p>
        <p>L'équipe SoummamCar</p>
      `,
    });
  }

  async notifyReturnReminder(email: string, phone: string, reference: string, returnDate: string) {
    await this.sendEmail({
      to: email,
      subject: `Rappel de retour — ${reference}`,
      html: `
        <h2>Rappel : retour prévu le ${returnDate}</h2>
        <p>Réservation : <strong>${reference}</strong></p>
        <p>Merci de ramener le véhicule à la date convenue.</p>
        <p>L'équipe SoummamCar</p>
      `,
    });

    if (phone) {
      await this.sendSms({
        to: phone,
        body: `SoummamCar — Rappel : retour du véhicule prévu le ${returnDate}. Réf: ${reference}`,
      });
    }
  }

  async notifyAdminNewReservation(reference: string, clientName: string, vehicle: string) {
    await this.sendEmail({
      to: 'admin@soummamcar.dz', // TODO: From settings
      subject: `[Admin] Nouvelle réservation ${reference}`,
      html: `
        <h2>Nouvelle réservation</h2>
        <p>Référence : ${reference}</p>
        <p>Client : ${clientName}</p>
        <p>Véhicule : ${vehicle}</p>
      `,
    });
  }
}

// Singleton export
export const notificationService = new NotificationService();
