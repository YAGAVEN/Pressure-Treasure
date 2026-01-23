import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Crown, Users, Shield } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-medieval-pattern">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
        
        <div className="container relative mx-auto px-4 py-16 md:py-24">
          <div className="flex flex-col items-center text-center">
            {/* Crown Icon */}
            <div className="mb-6 rounded-full bg-primary/10 p-4 ring-2 ring-primary/20">
              <Crown className="h-12 w-12 text-primary" />
            </div>
            
            {/* Title */}
            <h1 className="font-decorative text-4xl font-bold tracking-wide md:text-6xl lg:text-7xl">
              <span className="text-gold-gradient">Treasure Hunt</span>
            </h1>
            
            <p className="mt-4 font-cinzel text-xl text-muted-foreground md:text-2xl">
              A Game of Thrones Adventure
            </p>
            
            <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
              Embark on an epic quest through the Seven Kingdoms. Complete challenges, 
              outpace your rivals, and claim the Iron Throne!
            </p>
          </div>
        </div>
      </div>

      {/* Action Cards */}
      <div className="container mx-auto px-4 pb-16">
        <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
          {/* Player Card */}
          <Card className="group relative overflow-hidden border-2 border-primary/20 bg-card/50 backdrop-blur transition-all hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            
            <CardHeader className="relative">
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="font-cinzel text-2xl">Join the Hunt</CardTitle>
              <CardDescription className="text-base">
                Enter a room code to join an active treasure hunt and compete against other players.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="relative">
              <Link to="/join">
                <Button size="lg" className="w-full font-cinzel">
                  Enter Room Code
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Admin Card */}
          <Card className="group relative overflow-hidden border-2 border-accent/20 bg-card/50 backdrop-blur transition-all hover:border-accent/40 hover:shadow-lg hover:shadow-accent/10">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            
            <CardHeader className="relative">
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                <Shield className="h-6 w-6 text-accent" />
              </div>
              <CardTitle className="font-cinzel text-2xl">Game Master</CardTitle>
              <CardDescription className="text-base">
                Create and manage treasure hunt rooms. Control timers, monitor progress, and crown winners.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="relative">
              <Link to="/admin/auth">
                <Button size="lg" variant="secondary" className="w-full font-cinzel">
                  Admin Login
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Features */}
        <div className="mx-auto mt-16 max-w-4xl">
          <h2 className="mb-8 text-center font-cinzel text-2xl font-semibold text-foreground/80">
            How It Works
          </h2>
          
          <div className="grid gap-6 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
                1
              </div>
              <h3 className="font-cinzel text-lg font-medium">Join a Room</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Get a 6-character code from your Game Master and enter it to join.
              </p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
                2
              </div>
              <h3 className="font-cinzel text-lg font-medium">Complete Challenges</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Race through 5 epic challenges before the timer runs out.
              </p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
                3
              </div>
              <h3 className="font-cinzel text-lg font-medium">Claim Victory</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Finish first or have the most progress when time expires to win!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border/50 py-6">
        <p className="text-center text-sm text-muted-foreground">
          <span className="font-cinzel">Valar Morghulis</span> — All men must play
        </p>
      </footer>
    </div>
  );
};

export default Index;
