import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "Aici Era — Arhiva vie a Pantelimonului",
  description:
    "Sub blocurile Pantelimonului există un alt oraș. Explorează harta vie a cartierului, citește amintiri, contribuie la arhiva comunității.",
  openGraph: {
    title: "Aici Era — Arhiva vie a Pantelimonului",
    description:
      "Sub blocurile Pantelimonului există un alt oraș. O hartă vie a cartierului.",
    type: "website",
    locale: "ro_RO",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ro" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col antialiased">
        <Navbar />
        <main className="flex-1 flex flex-col">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
