import { useState } from 'react';
import { Star, Eye, EyeOff, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useReviews } from '@/hooks/useApi';
import { reviewsApi } from '@/services/api';
import { useQueryClient } from '@tanstack/react-query';

export function ReviewsPage() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const { data, isLoading } = useReviews();
  const reviews = data?.data || data || [];

  const [responseText, setResponseText] = useState('');
  const [respondingTo, setRespondingTo] = useState<string | null>(null);

  const handleModerate = async (id: string, isPublished: boolean) => {
    try {
      await reviewsApi.moderate(id, { isPublished });
      toast({ title: isPublished ? 'Avis publié' : 'Avis masqué' });
      qc.invalidateQueries({ queryKey: ['reviews'] });
    } catch (error: any) {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
    }
  };

  const handleRespond = async (id: string) => {
    try {
      await reviewsApi.respond(id, { response: responseText });
      toast({ title: 'Réponse enregistrée' });
      setRespondingTo(null);
      setResponseText('');
      qc.invalidateQueries({ queryKey: ['reviews'] });
    } catch (error: any) {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
    }
  };

  if (isLoading) {
    return <div className="space-y-4"><Skeleton className="h-8 w-60" /><Skeleton className="h-64" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary">Modération des avis</h1>
        <p className="text-muted-foreground">{reviews.length} avis</p>
      </div>

      <div className="space-y-4">
        {reviews.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Aucun avis pour le moment.
            </CardContent>
          </Card>
        ) : (
          reviews.map((r: any) => (
            <Card key={r.id} className={!r.isPublished ? 'opacity-60' : ''}>
              <CardContent className="py-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{r.author?.fullName || 'Client'}</span>
                      {!r.isPublished && <Badge variant="destructive">Masqué</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(r.createdAt).toLocaleDateString('fr-FR')} — Réservation #{r.reservationId?.slice(0, 8)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-xs space-x-2">
                      <span>Véhicule: {r.vehicleRating}/5</span>
                      <span>Service: {r.serviceRating}/5</span>
                      <span>Propreté: {r.cleanlinessRating}/5</span>
                    </div>
                    <Badge className="bg-amber/10 text-amber gap-1">
                      <Star className="h-3 w-3 fill-amber" /> {r.overallRating?.toFixed(1)}
                    </Badge>
                  </div>
                </div>

                {r.comment && <p className="text-muted-foreground mb-3">{r.comment}</p>}

                {r.response && (
                  <div className="mb-3 pl-4 border-l-2 border-primary/20 text-sm">
                    <span className="font-medium text-primary">Réponse: </span>{r.response}
                  </div>
                )}

                <div className="flex items-center gap-2 flex-wrap">
                  {r.isPublished ? (
                    <Button variant="outline" size="sm" onClick={() => handleModerate(r.id, false)}>
                      <EyeOff className="h-4 w-4 mr-1" /> Masquer
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" onClick={() => handleModerate(r.id, true)}>
                      <Eye className="h-4 w-4 mr-1" /> Publier
                    </Button>
                  )}

                  {!r.response && (
                    respondingTo === r.id ? (
                      <div className="flex gap-2 items-end flex-1">
                        <Textarea
                          value={responseText}
                          onChange={(e) => setResponseText(e.target.value)}
                          placeholder="Réponse SoummamCar…"
                          rows={2}
                          className="flex-1"
                        />
                        <Button size="sm" onClick={() => handleRespond(r.id)} disabled={!responseText.trim()}>
                          Envoyer
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => { setRespondingTo(null); setResponseText(''); }}>
                          Annuler
                        </Button>
                      </div>
                    ) : (
                      <Button variant="ghost" size="sm" onClick={() => setRespondingTo(r.id)}>
                        <MessageSquare className="h-4 w-4 mr-1" /> Répondre
                      </Button>
                    )
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
