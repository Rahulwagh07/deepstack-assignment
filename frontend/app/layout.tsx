import type { Metadata } from "next";
import "./globals.css";
import { Inter as FontSans } from "next/font/google";
import { cn } from "@/lib/utils";
import { Toaster } from "react-hot-toast";
import { config } from "@/wagmi/index";
import { headers } from "next/headers";
import Providers from "@/context";
import { cookieToInitialState } from "wagmi";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Reverse Auction",
  description: "Reverse Auction Platform",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const initialState = cookieToInitialState(config, headersList.get("cookie"));

  return (
    <html lang="en">
      <body className={cn("min-h-screen font-sans", fontSans.variable)}>
        <Providers initialState={initialState}>
          <Toaster />
          {children}
        </Providers>
      </body>
    </html>
  );
}
