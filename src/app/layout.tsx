import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import StorefrontChrome from "@/components/layout/StorefrontChrome";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { CompareProvider } from "@/context/CompareContext";
import { homepageRepository } from "@/lib/live-edit/content-repository";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Monarchit | Top Tech Product Store in Bangladesh",
  description:
    "Monarchit is Bangladesh's top retailer for laptops, computers, gaming PCs, components, accessories, and gadgets, offering the latest tech at unbeatable prices.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const content = await homepageRepository.read();

  return (
    <html lang="en" className={`${poppins.variable} h-full antialiased`}>
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css" />
      </head>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <AuthProvider>
          <WishlistProvider>
            <CompareProvider>
              <CartProvider>
                <StorefrontChrome
                  header={content.header}
                  footer={content.footer}
                  sideMenu={content.sideMenu}
                >
                  {children}
                </StorefrontChrome>
              </CartProvider>
            </CompareProvider>
          </WishlistProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
