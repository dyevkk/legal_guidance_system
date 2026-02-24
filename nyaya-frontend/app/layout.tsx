import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NyayaAI – Intelligent Legal Guidance System",
  description: "Get AI-powered legal guidance, document analysis, and find nearby legal services across India. Powered by NyayaAI.",
  keywords: "legal help India, AI lawyer, legal advice, IPC sections, consumer rights, legal aid",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
