import Navbar from "@/components/navigation/navbar";
import SectionFull from "@/components/sections/section-full";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <SectionFull>
        <Navbar />
      </SectionFull>
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
} 