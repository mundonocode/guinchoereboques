import type { Metadata } from "next";
import { Roboto, Poppins } from "next/font/google";
import { AuthProvider } from "@/contexts/AuthContext";
import "./globals.css";

const roboto = Roboto({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-roboto",
});

const poppins = Poppins({
  weight: ["400", "500", "600", "700", "900"],
  subsets: ["latin"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "Guinchos e Reboques",
  description: "O app que encontra seu guincho mais próximo em instantes.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Guinchos",
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="scroll-smooth">
      <body className={`${roboto.variable} ${poppins.variable} font-sans antialiased text-foreground bg-background`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
