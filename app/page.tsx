import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Music, Users, ThumbsUp } from "lucide-react";
import { Appbar } from "./components/Appbar";
import { Redirect } from "./components/Redirect";

export default function LandingPage() {
  return (
    <>
      <div className="flex flex-col min-h-screen bg-white text-gray-100">
        <header className="px-4 lg:px-6 h-14 flex items-center bg-gray-900 backdrop-blur-sm">
          <Appbar />
        </header>
        <Redirect /> 
        <main className="flex flex-col items-center mx-auto w-full text-center">
          <section className="flex flex-col justify-center items-center mx-auto w-full h-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-b from-gray-900 to-gray-800">
            <div className="container px-4 md:px-6">
              <div className="flex flex-col items-center space-y-4">
                <div className="space-y-3">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none text-teal-400">
                    Let Your Spectators Shape Your Stream
                  </h1>
                  <p className="mx-auto max-w-[700px] text-gray-400 md:text-xl">
                    MuSync: Where creators and fans collaborate to create the perfect streaming soundtrack.
                  </p>
                </div>
                <div className="space-x-8 space-y-2">
                  <Button className="bg-teal-500 text-gray-900 hover:bg-teal-400">
                    Get Started
                    <ArrowRight className=" h-4 w-4" />
                  </Button>
                  {/* <Button
                    variant="outline"
                    className="border-teal-500 text-black hover:bg-teal-500 hover:text-gray-900"
                  >
                    Learn More
                  </Button> */}
                </div>
              </div>
            </div>
          </section>
          <section
            id="features"
            className="flex items-center justify-center w-full py-12 md:py-24 lg:py-32 bg-gray-800">
            <div className="container px-4 md:px-6 text-center">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-center mb-12 text-teal-400">
                Key Features
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <FeatureCard
                  icon={<Music className="h-10 w-10 mb-4 text-teal-400" />}
                  title="Curated Playlists"
                  description="Create and share playlists that your fans can vote on."/>
                <FeatureCard
                  icon={<Users className="h-10 w-10 mb-4 text-teal-400" />}
                  title="Fan Engagement"
                  description="Interact with your audience in real-time through music choices."/>
                <FeatureCard
                  icon={<ThumbsUp className="h-10 w-10 mb-4 text-teal-400" />}
                  title="Democratic Selection"
                  description="Let popular votes determine the next track in your stream."/>
              </div>
            </div>
          </section>
          <section className="flex flex-col justify-center items-center w-full py-12 md:py-24 lg:py-32 bg-gray-800">
            <div className="container px-4 md:px-6 text-center">
              <div className="flex flex-col items-center space-y-4">
                <div className="space-y-3">
                  <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-teal-400">
                    Ready to Amplify Your Stream?
                  </h2>
                  <p className="mx-auto max-w-[700px] text-gray-300 md:text-xl">
                    Join MuSync today and start creating unforgettable music
                    experiences with your audience.
                  </p>
                </div>
                <div className="space-x-4">
                  <Button className="bg-teal-500 text-gray-900 hover:bg-teal-400">
                    Get Started Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </section>
        </main>
        <footer className="flex flex-col sm:flex-row py-6 w-full items-center justify-center px-4 md:px-6 border-t border-gray-700 bg-gray-800 backdrop-blur-sm">
          <p className="text-xs text-gray-400">© 2024 MuSync. All rights reserved.</p>
          <nav className="sm:ml-auto flex gap-4 sm:gap-6">
            <Link
              className="text-xs hover:underline underline-offset-4 text-gray-400 hover:text-teal-400"
              href="#">
              Terms of Service
            </Link>
            <Link
              className="text-xs hover:underline underline-offset-4 text-gray-400 hover:text-teal-400"
              href="#">
              Privacy
            </Link>
          </nav>
        </footer>
      </div>
    </>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="flex flex-col items-center text-center">
      {icon}
      <h2 className="text-xl font-bold mb-2 text-teal-400">{title}</h2>
      <p className="text-gray-300">{description}</p>
    </div>
  );
}
