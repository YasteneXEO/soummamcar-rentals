import { useSearchParams } from 'react-router-dom';
import { ShieldCheck, Clock, CheckCircle, XCircle, AlertTriangle, FileText, Camera, BarChart, Eye, Play } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { usePartnerVehicles, useVehicleVerificationSteps } from '@/hooks/useApi';
import type { VerificationStepName, VerificationStepStatus } from '@/types';

const STEP_ICONS: Record<VerificationStepName, React.ElementType> = {
  SUBMISSION: Play,
  DOCUMENTS: FileText,
  PHOTOS: Camera,
  SCORING: BarChart,
  INSPECTION: Eye,
  PROBATION: ShieldCheck,
};

const STEP_LABELS: Record<VerificationStepName, string> = {
  SUBMISSION: 'Soumission',
  DOCUMENTS: 'Documents',
  PHOTOS: 'Photos',
  SCORING: 'Scoring',
  INSPECTION: 'Inspection',
  PROBATION: 'Probation',
};

const STATUS_ICON: Record<VerificationStepStatus, React.ElementType> = {
  PENDING: Clock,
  IN_PROGRESS: AlertTriangle,
  PASSED: CheckCircle,
  FAILED: XCircle,
  SKIPPED: XCircle,
};

const STATUS_COLOR: Record<VerificationStepStatus, string> = {
  PENDING: 'text-gray-400',
  IN_PROGRESS: 'text-amber-500',
  PASSED: 'text-green-500',
  FAILED: 'text-red-500',
  SKIPPED: 'text-gray-400',
};

export default function PartnerVerificationPage() {
  const [searchParams] = useSearchParams();
  const selectedVehicleId = searchParams.get('vehicle');

  const { data: vehiclesData, isLoading: loadingVehicles } = usePartnerVehicles();
  const vehicles = vehiclesData?.data || vehiclesData || [];

  const { data: stepsData, isLoading: loadingSteps } = useVehicleVerificationSteps(selectedVehicleId || undefined);
  const steps = stepsData?.data || stepsData || [];

  if (loadingVehicles) {
    return <div className="space-y-4"><Skeleton className="h-8 w-60" /><Skeleton className="h-64" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary">Suivi de vérification</h1>
        <p className="text-muted-foreground">Suivez l'avancement du processus de vérification de vos véhicules</p>
      </div>

      {/* Vehicle list with verification status */}
      <div className="grid gap-4">
        {vehicles.map((v: any) => {
          const isSelected = v.id === selectedVehicleId;
          return (
            <Card
              key={v.id}
              className={`cursor-pointer transition-all ${isSelected ? 'ring-2 ring-primary' : 'hover:shadow-md'}`}
              onClick={() => {
                const params = new URLSearchParams(searchParams);
                params.set('vehicle', v.id);
                window.history.replaceState({}, '', `?${params.toString()}`);
                window.location.reload(); // simple refresh to re-trigger query
              }}
            >
              <CardContent className="py-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold">{v.name}</p>
                  <p className="text-sm text-muted-foreground">{v.plateNumber}</p>
                </div>
                <Badge className={
                  v.verificationStatus === 'FULLY_VERIFIED' ? 'bg-green-100 text-green-800' :
                  v.verificationStatus === 'REJECTED' ? 'bg-red-100 text-red-800' :
                  'bg-blue-100 text-blue-800'
                }>
                  {v.verificationStatus?.replace(/_/g, ' ')}
                </Badge>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Step pipeline for selected vehicle */}
      {selectedVehicleId && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5" /> Pipeline de vérification
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingSteps ? (
              <Skeleton className="h-32" />
            ) : steps.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">Aucune étape de vérification trouvée.</p>
            ) : (
              <div className="space-y-4">
                {steps
                  .sort((a: any, b: any) => a.stepNumber - b.stepNumber)
                  .map((step: any, idx: number) => {
                    const Icon = STEP_ICONS[step.stepName as VerificationStepName] || Clock;
                    const StatusIcon = STATUS_ICON[step.status as VerificationStepStatus] || Clock;
                    const color = STATUS_COLOR[step.status as VerificationStepStatus] || 'text-gray-400';
                    const label = STEP_LABELS[step.stepName as VerificationStepName] || step.stepName;

                    return (
                      <div key={step.id} className="flex items-start gap-4">
                        {/* Timeline connector */}
                        <div className="flex flex-col items-center">
                          <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center ${
                            step.status === 'PASSED' ? 'border-green-500 bg-green-50' :
                            step.status === 'IN_PROGRESS' ? 'border-amber-500 bg-amber-50' :
                            step.status === 'FAILED' ? 'border-red-500 bg-red-50' :
                            'border-gray-300 bg-gray-50'
                          }`}>
                            <Icon className={`h-5 w-5 ${color}`} />
                          </div>
                          {idx < steps.length - 1 && (
                            <div className={`w-0.5 h-8 ${step.status === 'PASSED' ? 'bg-green-400' : 'bg-gray-200'}`} />
                          )}
                        </div>

                        {/* Step content */}
                        <div className="flex-1 pb-4">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold">
                              Étape {step.stepNumber}: {label}
                            </h3>
                            <div className="flex items-center gap-1">
                              <StatusIcon className={`h-4 w-4 ${color}`} />
                              <span className={`text-sm ${color}`}>{step.status}</span>
                            </div>
                          </div>
                          {step.notes && (
                            <p className="text-sm text-muted-foreground mt-1">{step.notes}</p>
                          )}
                          {step.completedAt && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Complété le {new Date(step.completedAt).toLocaleDateString('fr-FR')}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
