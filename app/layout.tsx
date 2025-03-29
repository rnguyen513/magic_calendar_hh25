import { Metadata } from "next";
import { Toaster } from "sonner";

import { Navbar } from "@/components/custom/navbar";
import { ThemeProvider } from "@/components/custom/theme-provider";

import "./globals.css";

// TODO: change metadata
export const metadata: Metadata = {
  metadataBase: new URL("https://gemini.vercel.ai"),
  title: "My Magic Calendar",
  description: "Canvas LMS integration that provides smart suggestions and advice.",
};

export default async function RootLayout({
    children,
  }: Readonly<{ children: React.ReactNode }>) {
    return (
      <html lang="en">
        <body className="antialiased flex flex-col min-h-screen">
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Toaster position="top-center" />
            <Navbar />
            <main className="flex-grow">{children}</main>
          </ThemeProvider>
        </body>
      </html>
    );
}
