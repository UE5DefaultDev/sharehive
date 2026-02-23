// The landing page introducing Sharehive to new users.
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Globe, Share2, Users } from "lucide-react";
import { auth } from "@clerk/nextjs/server";
import MouseGradientBackground from "@/components/MouseGradientBackground";
import FloatingIcons from "@/components/FloatingIcons";

export default async function LandingPage() {
  const { userId } = await auth();

  return (
    <div className="flex flex-col min-h-screen relative">
      <MouseGradientBackground />
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-transparent relative z-10">
        <FloatingIcons />
        <div className="container px-4 md:px-6 relative z-20">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2 animate-in slide-in-from-bottom-10 fade-in duration-700">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-primary bg-300% animate-gradient select-none">
                Share Knowledge. Grow Together.
              </h1>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl pt-4">
                Join a community of learners and creators. Share your expertise,
                discover new skills, and connect with like-minded individuals on
                Sharehive.
              </p>
            </div>
            <div className="space-x-4 pt-8 animate-in slide-in-from-bottom-10 fade-in duration-1000 fill-mode-backwards delay-300">
              <Button
                asChild
                size="lg"
                className="h-12 px-8 text-lg shadow-lg hover:shadow-xl transition-shadow"
              >
                <Link href={userId ? "/discover" : "/sign-up"}>
                  {userId ? "Explore Courses" : "Get Started"}{" "}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 relative z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent pointer-events-none" />
        <div className="container px-4 md:px-6 relative z-20">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex flex-col items-center space-y-4 text-center p-8 rounded-2xl glass hover:bg-card hover:scale-[1.02] hover:shadow-2xl transition-all duration-500 border-white/20">
              <div className="p-4 bg-primary/10 rounded-2xl ring-1 ring-primary/20 group-hover:bg-primary/20 transition-colors">
                <Share2 className="h-10 w-10 text-primary animate-pulse-slow" />
              </div>
              <h2 className="text-xl font-bold">Share Your Passion</h2>
              <p className="text-muted-foreground leading-relaxed">
                Create courses on topics you love. From coding to cooking, your
                knowledge is valuable to others.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-4 text-center p-8 rounded-2xl glass hover:bg-card hover:scale-[1.02] hover:shadow-2xl transition-all duration-500 border-white/20">
              <div className="p-4 bg-primary/10 rounded-2xl ring-1 ring-primary/20 group-hover:bg-primary/20 transition-colors">
                <Globe className="h-10 w-10 text-primary animate-pulse-slow" />
              </div>
              <h2 className="text-xl font-bold">Discover New Skills</h2>
              <p className="text-muted-foreground leading-relaxed">
                Browse a diverse library of community-created courses and expand
                your horizons with expert content.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-4 text-center p-8 rounded-2xl glass hover:bg-card hover:scale-[1.02] hover:shadow-2xl transition-all duration-500 border-white/20">
              <div className="p-4 bg-primary/10 rounded-2xl ring-1 ring-primary/20 group-hover:bg-primary/20 transition-colors">
                <Users className="h-10 w-10 text-primary animate-pulse-slow" />
              </div>
              <h2 className="text-xl font-bold">Join the Community</h2>
              <p className="text-muted-foreground leading-relaxed">
                Connect with instructors and fellow learners through comments,
                discussions, and real-time chat.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 relative z-10">
        <div className="container px-4 md:px-6">
          <h2 className="text-3xl font-bold tracking-tighter text-center mb-16 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/60">
            How it Works
          </h2>
          <div className="grid gap-12 md:grid-cols-3">
            <div className="relative p-8 rounded-2xl glass border-white/20 hover:shadow-xl transition-all duration-300">
              <div className="absolute -top-6 -left-6 w-12 h-12 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl shadow-lg rotate-[-12deg]">
                1
              </div>
              <h3 className="text-xl font-bold mb-4">Sign Up</h3>
              <p className="text-muted-foreground leading-relaxed">
                Create your free account in seconds using Clerk's secure
                authentication.
              </p>
            </div>
            <div className="relative p-8 rounded-2xl glass border-white/20 hover:shadow-xl transition-all duration-300">
              <div className="absolute -top-6 -left-6 w-12 h-12 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl shadow-lg rotate-[8deg]">
                2
              </div>
              <h3 className="text-xl font-bold mb-4">Explore & Learn</h3>
              <p className="text-muted-foreground leading-relaxed">
                Search for courses that interest you and start learning at your
                own pace.
              </p>
            </div>
            <div className="relative p-8 rounded-2xl glass border-white/20 hover:shadow-xl transition-all duration-300">
              <div className="absolute -top-6 -left-6 w-12 h-12 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl shadow-lg rotate-[-5deg]">
                3
              </div>
              <h3 className="text-xl font-bold mb-4">Share & Connect</h3>
              <p className="text-muted-foreground leading-relaxed">
                Create your own courses and engage with the community to grow
                together.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-6 bg-background border-t relative z-10">
        <div className="container px-4 md:px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Sharehive. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link
              href="#"
              className="text-sm text-muted-foreground hover:underline"
            >
              Terms of Service
            </Link>
            <Link
              href="#"
              className="text-sm text-muted-foreground hover:underline"
            >
              Privacy Policy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
