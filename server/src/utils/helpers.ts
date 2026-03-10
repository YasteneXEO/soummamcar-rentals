import crypto from 'crypto';

/**
 * Generate a unique reservation reference number: SC-XXXXXX
 */
export function generateReferenceNumber(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no ambiguous chars
  let ref = '';
  for (let i = 0; i < 6; i++) {
    ref += chars[crypto.randomInt(chars.length)];
  }
  return `SC-${ref}`;
}

/**
 * Calculate rental days from pickup/return dates & times.
 * Minimum 1 day.
 */
export function calculateRentalDays(
  pickupDate: Date,
  returnDate: Date,
  pickupTime: string,
  returnTime: string
): number {
  const [ph, pm] = pickupTime.split(':').map(Number);
  const [rh, rm] = returnTime.split(':').map(Number);

  const pickup = new Date(pickupDate);
  pickup.setHours(ph, pm, 0, 0);

  const ret = new Date(returnDate);
  ret.setHours(rh, rm, 0, 0);

  const diffMs = ret.getTime() - pickup.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  return Math.max(1, diffDays);
}
