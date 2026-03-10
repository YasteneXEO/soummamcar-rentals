/**
 * React Query hooks for SoummamCar V3 API
 * Centralizes data fetching with caching, refetching, and mutations.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  vehiclesApi,
  reservationsApi,
  partnersApi,
  verificationApi,
  reviewsApi,
  payoutsApi,
  paymentsApi,
  contractsApi,
  conditionsApi,
  adminApi,
} from '@/services/api';

// ─── Vehicles ──────────────────────────────────────────────────

export function useVehicles(params?: Record<string, string>) {
  return useQuery({
    queryKey: ['vehicles', params],
    queryFn: () => vehiclesApi.list(params),
  });
}

export function useVehicle(id: string | undefined) {
  return useQuery({
    queryKey: ['vehicles', id],
    queryFn: () => vehiclesApi.getById(id!),
    enabled: !!id,
  });
}

export function useVehicleAvailability(id: string, startDate: string, endDate: string) {
  return useQuery({
    queryKey: ['vehicles', id, 'availability', startDate, endDate],
    queryFn: () => vehiclesApi.checkAvailability(id, startDate, endDate),
    enabled: !!id && !!startDate && !!endDate,
  });
}

// ─── Reservations ──────────────────────────────────────────────

export function useReservations(params?: Record<string, string>) {
  return useQuery({
    queryKey: ['reservations', params],
    queryFn: () => reservationsApi.list(params),
  });
}

export function useReservation(id: string | undefined) {
  return useQuery({
    queryKey: ['reservations', id],
    queryFn: () => reservationsApi.getById(id!),
    enabled: !!id,
  });
}

export function useMyReservations() {
  return useQuery({
    queryKey: ['my-reservations'],
    queryFn: () => reservationsApi.getMyReservations(),
  });
}

export function useCreateReservation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => reservationsApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reservations'] });
      qc.invalidateQueries({ queryKey: ['my-reservations'] });
    },
  });
}

// ─── Reviews ───────────────────────────────────────────────────

export function useReviews(params?: Record<string, string>) {
  return useQuery({
    queryKey: ['reviews', params],
    queryFn: () => reviewsApi.list(params),
  });
}

export function useCreateReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => reviewsApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reviews'] }),
  });
}

// ─── Partners ──────────────────────────────────────────────────

export function usePartnerProfile() {
  return useQuery({
    queryKey: ['partner-profile'],
    queryFn: () => partnersApi.getMyProfile(),
  });
}

export function usePartnerDashboard() {
  return useQuery({
    queryKey: ['partner-dashboard'],
    queryFn: () => partnersApi.getDashboard(),
  });
}

export function usePartnerVehicles(params?: Record<string, string>) {
  return useQuery({
    queryKey: ['partner-vehicles', params],
    queryFn: () => partnersApi.getMyVehicles(params),
  });
}

export function usePartnerReservations(params?: Record<string, string>) {
  return useQuery({
    queryKey: ['partner-reservations', params],
    queryFn: () => partnersApi.getMyReservations(params),
  });
}

export function usePartnerPayouts(params?: Record<string, string>) {
  return useQuery({
    queryKey: ['partner-payouts', params],
    queryFn: () => partnersApi.getMyPayouts(params),
  });
}

export function useSubmitVehicle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => partnersApi.submitVehicle(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['partner-vehicles'] }),
  });
}

// ─── Admin: Partners ───────────────────────────────────────────

export function useAdminPartners(params?: Record<string, string>) {
  return useQuery({
    queryKey: ['admin-partners', params],
    queryFn: () => partnersApi.list(params),
  });
}

export function useAdminPartner(id: string | undefined) {
  return useQuery({
    queryKey: ['admin-partners', id],
    queryFn: () => partnersApi.getById(id!),
    enabled: !!id,
  });
}

// ─── Verification ──────────────────────────────────────────────

export function useVerificationQueue(params?: Record<string, string>) {
  return useQuery({
    queryKey: ['verification-queue', params],
    queryFn: () => verificationApi.getQueue(params),
  });
}

export function useReinspectionDue() {
  return useQuery({
    queryKey: ['reinspection-due'],
    queryFn: () => verificationApi.getReinspectionDue(),
  });
}

export function useVehicleVerificationSteps(vehicleId: string | undefined) {
  return useQuery({
    queryKey: ['verification-steps', vehicleId],
    queryFn: () => verificationApi.getVehicleSteps(vehicleId!),
    enabled: !!vehicleId,
  });
}

export function useAdvanceStep() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ vehicleId, data }: { vehicleId: string; data: any }) =>
      verificationApi.advanceStep(vehicleId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['verification-queue'] });
      qc.invalidateQueries({ queryKey: ['verification-steps'] });
    },
  });
}

export function useScoreVehicle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ vehicleId, data }: { vehicleId: string; data: any }) =>
      verificationApi.scoreVehicle(vehicleId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['verification-queue'] });
      qc.invalidateQueries({ queryKey: ['verification-steps'] });
    },
  });
}

// ─── Payouts ───────────────────────────────────────────────────

export function usePayouts(params?: Record<string, string>) {
  return useQuery({
    queryKey: ['payouts', params],
    queryFn: () => payoutsApi.list(params),
  });
}

export function useGeneratePayouts() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => payoutsApi.generate(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['payouts'] }),
  });
}

// ─── Payments ──────────────────────────────────────────────────

export function usePaymentsByReservation(reservationId: string | undefined) {
  return useQuery({
    queryKey: ['payments', reservationId],
    queryFn: () => paymentsApi.listByReservation(reservationId!),
    enabled: !!reservationId,
  });
}

// ─── Contracts ─────────────────────────────────────────────────

export function useContracts(params?: Record<string, string>) {
  return useQuery({
    queryKey: ['contracts', params],
    queryFn: () => contractsApi.list(params),
  });
}

export function useContract(id: string | undefined) {
  return useQuery({
    queryKey: ['contracts', id],
    queryFn: () => contractsApi.getById(id!),
    enabled: !!id,
  });
}

// ─── Conditions ────────────────────────────────────────────────

export function useConditions(params?: Record<string, string>) {
  return useQuery({
    queryKey: ['conditions', params],
    queryFn: () => conditionsApi.list(params),
  });
}

// ─── Admin Dashboard ───────────────────────────────────────────

export function useAdminDashboard() {
  return useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => adminApi.getDashboard(),
    refetchInterval: 60_000, // refresh every minute
  });
}

export function useSettings() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: () => adminApi.getSettings(),
  });
}
