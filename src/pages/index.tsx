import ControlPanel from "@/components/control_panel";
import { Geist, Geist_Mono } from "next/font/google";
import { TuringTape } from "@/components/tape";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function Home() {
  return (
    
    <div
      className={`${geistSans.className} ${geistMono.className} flex min-h-screen bg-zinc-50 font-sans dark:bg-black flex h-screen flex-col-reverse md:flex-row`}
    >
      {/* Zone de commandes */}
      <aside
        className="
          bg-gray-100 p-4 flex-shrink-0
          h-[calc(100vh-400px)]  /* mobile: hauteur fixe */
          md:h-auto              /* tablette+desktop: hauteur auto */
          md:w-[400px]           /* tablette */
          lg:w-[560px]           /* desktop */
        "
      >
        <ControlPanel />
      </aside>

      {/* Zone principale */}
      <main
        className="
          flex-1 bg-white p-4
          h-[400px]             /* mobile: occupe le reste */
          md:h-auto             /* tablette+desktop: height auto */
        "
      >
        <TuringTape />
      </main>
    </div>
  );
}
