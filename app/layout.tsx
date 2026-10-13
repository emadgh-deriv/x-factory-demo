import type { Metadata, Viewport } from "next";
import { Roboto } from "next/font/google";
import { cookies } from "next/headers";
import { MdLoader } from "./components/MdLoader";
import { MODE_COOKIE, parseMode, parseTheme, THEME_COOKIE } from "@/lib/theme";
import "./globals.css";

const roboto = Roboto({ subsets: ["latin"], weight: ["400", "500", "700"], display: "swap", variable: "--font-roboto" });

export const metadata: Metadata = {
  title: "Sport-Radar",
  description: "Latest Guardian sport news, read in-app.",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Stored theme on first paint, no flash. No stored mode → tokens.css follows the device.
  const jar = await cookies();
  const theme = parseTheme(jar.get(THEME_COOKIE)?.value);
  const mode = parseMode(jar.get(MODE_COOKIE)?.value);
  return (
    <html lang="en" className={roboto.variable} data-theme={theme} data-mode={mode}>
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
