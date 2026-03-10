import { Star, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useReviews } from '@/hooks/useApi';
import { useAuthStore } from '@/store/authStore';

export default function PartnerReviewsPage() {
  const { user } = useAuthStore();
  const { data, isLoading } = useReviews(user?.partnerProfile?.id ? { partnerId: user.partnerProfile.id } : undefined);
  const reviews = data?.data || data || [];

  if (isLoading) {
    return <div className="space-y-4"><Skeleton className="h-8 w-60" /><Skeleton className="h-64" /></div>;
  }

  const avgRating = reviews.length > 0
    ? (reviews.reduce((s: number, r: any) => s + r.overallRating, 0) / reviews.length).toFixed(1)
    : '—';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Avis clients</h1>
          <p className="text-muted-foreground">{reviews.length} avis reçus — Note moyenne : {avgRating}/5</p>
        </div>
        {avgRating !== '—' && (
          <div className="flex items-center gap-2 text-2xl font-bold text-amber">
            <Star className="h-6 w-6 fill-amber" /> {avgRating}
          </div>
        )}
      </div>

      <div className="space-y-4">
        {reviews.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Aucun avis pour le moment. Les avis apparaîtront après les premières locations.
            </CardContent>
          </Card>
        ) : (
          reviews.map((r: any) => (
            <Card key={r.id}>
              <CardContent className="py-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold">{r.author?.fullName || 'Client'}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(r.createdAt).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-sm space-x-3">
                      <span>Véhicule: {r.vehicleRating}/5</span>
                      <span>Service: {r.serviceRating}/5</span>
                      <span>Propreté: {r.cleanlinessRating}/5</span>
                    </div>
                    <Badge className="bg-amber/10 text-amber">
                      <Star className="h-3 w-3 fill-amber mr-1" /> {r.overallRating.toFixed(1)}
                    </Badge>
                  </div>
                </div>
                {r.comment && <p className="text-muted-foreground">{r.comment}</p>}
                {r.response && (
                  <div className="mt-3 pl-4 border-l-2 border-primary/20 text-sm">
                    <div className="flex items-center gap-1 text-primary font-medium mb-1">
                      <MessageSquare className="h-3 w-3" /> Réponse SoummamCar
                    </div>
                    <p className="text-muted-foreground">{r.response}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
