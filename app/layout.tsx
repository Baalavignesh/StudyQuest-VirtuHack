import type { Metadata } from "next";
import "./globals.css";
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { AuthProvider } from "@/contexts/AuthContext";
config.autoAddCss = false;

export const metadata: Metadata = {
  title: "StudyQuest | Gamified Learning Platform",
  description: "Transform learning into an epic adventure with StudyQuest's gamified education platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased font-game`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
