import Navbar from "@/components/navigation/navbar";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 flex flex-col">
        <div className="container mx-auto px-4 py-8 flex-1 max-w-6xl">
          {children}
        </div>
      </main>
      <footer className="bg-gray-100 border-t py-6">
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} Profile App. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
} 