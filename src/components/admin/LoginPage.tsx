import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAdminStore } from '@/store/adminStore';
import { useToast } from '@/hooks/use-toast';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated } = useAdminStore();
  const { toast } = useToast();

  if (isAuthenticated) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate loading delay
    setTimeout(() => {
      const success = login(email, password);
      if (success) {
        toast({
          title: "Connexion réussie",
          description: "Bienvenue dans l'espace d'administration",
        });
      } else {
        toast({
          title: "Erreur de connexion",
          description: "Email ou mot de passe incorrect",
          variant: "destructive",
        });
      }
      setIsLoading(false);
    }, 1000);
  };

  const fillDemoCredentials = () => {
    setEmail('admin@soummamcar.dz');
    setPassword('demo1234');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/20 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <div className="flex items-center justify-center mb-4">
            <div className="text-3xl font-bold text-navy">
              SoummamCar
            </div>
          </div>
          <CardTitle className="text-2xl text-navy">Administration</CardTitle>
          <CardDescription>
            Connectez-vous pour accéder au tableau de bord
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@soummamcar.dz"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-navy hover:bg-navy-dark" 
              disabled={isLoading}
            >
              {isLoading ? "Connexion..." : "Se connecter"}
            </Button>
            
            <div className="text-center pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-2">
                Compte de démonstration :
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={fillDemoCredentials}
                className="text-xs"
              >
                Utiliser les identifiants de test
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};