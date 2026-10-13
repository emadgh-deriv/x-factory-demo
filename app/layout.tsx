import type { Metadata, Viewport } from "next";
import { Roboto } from "next/font/google";
import { MdLoader } from "./components/MdLoader";
import "./globals.css";

const roboto = Roboto({ subsets: ["latin"], weight: ["400", "500", "700"], display: "swap", variable: "--font-roboto" });

export const metadata: Metadata = {
  title: "Sport-Radar",
  description: "Latest Guardian sport news, read in-app.",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={roboto.variable}>
      <head>
        {/* Icon ligatures must not flash as text, hence display=block. */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font, @next/next/google-font-display */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=block"
        />
      </head>
      <body>
        <MdLoader />
        {children}
      </body>
    </html>
  );
}
