import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "./components/header";
import { getCurrentUser } from "../lib/auth";

// Force dynamic rendering to avoid static generation errors with cookies
export const dynamic = 'force-dynamic';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Abaile - Physiotherapy Booking Platform",
  description: "Find and book appointments with qualified physiotherapists in Ireland",
};

export default async function RootLayout({ children }) {
  // Get current user data for header
  const user = await getCurrentUser();

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Header user={user} />
        {children}
      </body>
    </html>
  );
}
