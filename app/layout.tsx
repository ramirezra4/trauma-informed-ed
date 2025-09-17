import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gentle Path",
  description: "A trauma-informed student support tool that builds momentum with tiny wins and compassionate guidance.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background antialiased">
        {children}
      </body>
    </html>
  );
}