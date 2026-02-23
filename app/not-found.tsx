// Global 404 error page.
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Home } from "lucide-react";
import MouseGradientBackground from "@/components/MouseGradientBackground";
import FloatingIcons from "@/components/FloatingIcons";

export default function NotFound() {
  return (
    <div className="flex flex-col flex-1 relative min-h-full">
      <MouseGradientBackground />
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-transparent relative z-10 flex-1 flex items-center">
        <FloatingIcons />
        <div className="container px-4 md:px-6 relative z-20">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2 animate-in slide-in-from-bottom-10 fade-in duration-700">
              <p className="text-8xl font-bold text-primary font-mono mb-4">404</p>
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-primary bg-300% animate-gradient select-none">
                Page Not Found
              </h1>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl pt-4">
                Oops! It seems like you've wandered into an uncharted area of Sharehive. 
                Let's get you back on track.
              </p>
            </div>
            <div className="space-x-4 pt-8 animate-in slide-in-from-bottom-10 fade-in duration-1000 fill-mode-backwards delay-300 flex flex-col sm:flex-row gap-4 items-center justify-center">
              <Button
                asChild
                size="lg"
                className="h-12 px-8 text-lg shadow-lg hover:shadow-xl transition-shadow"
              >
                <Link href="/">
                  <Home className="mr-2 h-5 w-5" />
                  Back to Home
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-12 px-8 text-lg glass hover:bg-card transition-all"
              >
                <Link href="/discover">
                  Explore Courses <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
