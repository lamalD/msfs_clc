
import Navbar from "@/components/Navbar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative flex flex-col">
        <main className="relative flex bg-black-3">
          <div className="flex flex-col">
            <div className="flex flex-row justify-between min-w-full">
              <Navbar />
            </div>
            <div className="flex flex-col md:pb-14">
              {/* Toaster */}
              {children}
            </div>
          </div>
        </main>
    </div>
  );
}
