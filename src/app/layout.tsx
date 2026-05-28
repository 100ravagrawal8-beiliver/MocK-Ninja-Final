import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MockNinja AI — India's First AI-Powered Mock Interview Platform",
  description:
    "Practice with real IIM/ISB panelists. AI-matched interviewers, structured scorecards, and brutally honest feedback.",
  openGraph: {
    title: "MockNinja AI — Your IIM Interview, Mastered",
    description:
      "India's first AI-powered mock interview platform for 1-year MBA aspirants.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
