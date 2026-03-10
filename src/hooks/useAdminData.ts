/**
 * React hooks for admin data fetching from backend API.
 * These progressively replace the in-memory adminStore.
 */
import { useState, useEffect, useCallback } from 'react';
import { vehiclesApi, reservationsApi, contractsApi, paymentsApi } from '@/services/api';

interface UseQueryResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

function useApiQuery<T>(fetcher: () => Promise<T>): UseQueryResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetcher();
      setData(result);
    } catch (err: any) {
      setError(err.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, [fetcher]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

// ─── Vehicles ──────────────────────────────────────────────────
export function useVehicles(params?: Record<string, string>) {
  return useApiQuery(() => vehiclesApi.list(params));
}

// ─── Reservations ──────────────────────────────────────────────
export function useReservations(params?: Record<string, string>) {
  return useApiQuery(() => reservationsApi.list(params));
}

// ─── Contracts ─────────────────────────────────────────────────
export function useContracts(params?: Record<string, string>) {
  return useApiQuery(() => contractsApi.list(params));
}

// ─── Payments by reservation ───────────────────────────────────
export function usePaymentsByReservation(reservationId: string) {
  return useApiQuery(() => paymentsApi.listByReservation(reservationId));
}

// ─── CSV Export utility ────────────────────────────────────────
export function downloadCsv(filename: string, headers: string[], rows: string[][]) {
  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
  ].join('\n');

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' }); // BOM for Excel
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export function exportReservationsCsv(reservations: any[]) {
  downloadCsv(
    'reservations',
    ['Référence', 'Client', 'Véhicule', 'Début', 'Fin', 'Montant', 'Statut'],
    reservations.map((r) => [
      r.reference,
      r.user?.fullName || '',
      `${r.vehicle?.brand || ''} ${r.vehicle?.model || ''}`.trim(),
      new Date(r.startDate).toLocaleDateString('fr-FR'),
      new Date(r.endDate).toLocaleDateString('fr-FR'),
      String(r.totalAmount),
      r.status,
    ]),
  );
}

export function exportVehiclesCsv(vehicles: any[]) {
  downloadCsv(
    'vehicules',
    ['Marque', 'Modèle', 'Immatriculation', 'Tarif/jour', 'Statut', 'Catégorie'],
    vehicles.map((v) => [
      v.brand,
      v.model,
      v.plateNumber,
      String(v.dailyRate),
      v.status,
      v.category,
    ]),
  );
}
