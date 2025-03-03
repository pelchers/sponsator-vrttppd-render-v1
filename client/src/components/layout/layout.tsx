import Navbar from "@/components/navigation/navbar";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col overflow-x-hidden">
      <main className="flex-1 w-full">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          {children}
        </div>
      </main>
    </div>
  );
} 