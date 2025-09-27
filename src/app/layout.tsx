import type { Metadata } from "next";
import { Inter } from "next/font/google";
import ChakraLayout from "@/ChakraLayout";
import { AppStoreProvider } from "./app.store.context";
import { Toaster, UnhandledRejectionToaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "Загружатор",
  description: "ETL по-русски!",
};

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className={inter.className} suppressHydrationWarning>
      <body>
        <AppStoreProvider>
          <ChakraLayout>
            {children}
            <Toaster />
            <UnhandledRejectionToaster />
          </ChakraLayout>
        </AppStoreProvider>
      </body>
    </html>
  );
}
