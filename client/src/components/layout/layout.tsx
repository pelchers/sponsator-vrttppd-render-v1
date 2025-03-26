import Navbar from "../navigation/navbar";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-[#FFFEFF] flex flex-col overflow-x-hidden">
      <Navbar />
      <main className="flex-1 w-full">
        {children}
      </main>
    </div>
  );
} 