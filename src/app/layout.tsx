import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import StorefrontChrome from "@/components/layout/StorefrontChrome";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { CompareProvider } from "@/context/CompareContext";
import { homepageRepository } from "@/lib/live-edit/content-repository";

// Sole font for English/Latin text site-wide — no other font (e.g. Poppins)
// should be introduced for Latin text; Kalpurush below stays for Bangla.
const gilroy = localFont({
  src: [
    { path: "../fonts/gilroy/Gilroy-Thin.ttf", weight: "100", style: "normal" },
    { path: "../fonts/gilroy/Gilroy-ThinItalic.ttf", weight: "100", style: "italic" },
    { path: "../fonts/gilroy/Gilroy-UltraLight.ttf", weight: "200", style: "normal" },
    { path: "../fonts/gilroy/Gilroy-UltraLightItalic.ttf", weight: "200", style: "italic" },
    { path: "../fonts/gilroy/Gilroy-Light.ttf", weight: "300", style: "normal" },
    { path: "../fonts/gilroy/Gilroy-LightItalic.ttf", weight: "300", style: "italic" },
    { path: "../fonts/gilroy/Gilroy-Regular.ttf", weight: "400", style: "normal" },
    { path: "../fonts/gilroy/Gilroy-RegularItalic.ttf", weight: "400", style: "italic" },
    { path: "../fonts/gilroy/Gilroy-Medium.ttf", weight: "500", style: "normal" },
    { path: "../fonts/gilroy/Gilroy-MediumItalic.ttf", weight: "500", style: "italic" },
    { path: "../fonts/gilroy/Gilroy-SemiBold.ttf", weight: "600", style: "normal" },
    { path: "../fonts/gilroy/Gilroy-SemiBoldItalic.ttf", weight: "600", style: "italic" },
    { path: "../fonts/gilroy/Gilroy-Bold.ttf", weight: "700", style: "normal" },
    { path: "../fonts/gilroy/Gilroy-BoldItalic.ttf", weight: "700", style: "italic" },
    { path: "../fonts/gilroy/Gilroy-ExtraBold.ttf", weight: "800", style: "normal" },
    { path: "../fonts/gilroy/Gilroy-ExtraBoldItalic.ttf", weight: "800", style: "italic" },
    { path: "../fonts/gilroy/Gilroy-Black.ttf", weight: "900", style: "normal" },
    { path: "../fonts/gilroy/Gilroy-BlackItalic.ttf", weight: "900", style: "italic" },
    { path: "../fonts/gilroy/Gilroy-Heavy.ttf", weight: "950", style: "normal" },
    { path: "../fonts/gilroy/Gilroy-HeavyItalic.ttf", weight: "950", style: "italic" },
  ],
  variable: "--font-gilroy",
  display: "swap",
});

const kalpurush = localFont({
  src: "../fonts/Kalpurush.ttf",
  variable: "--font-kalpurush",
  display: "swap",
});

// Latin fonts can carry their own glyph for the Bengali currency sign, which
// would shadow the Kalpurush fallback. Scoping a second face to just that
// codepoint via unicode-range forces every ৳ on the site onto Kalpurush
// without having to touch each of the many places that render it.
const taka = localFont({
  src: "../fonts/Kalpurush.ttf",
  variable: "--font-taka",
  display: "swap",
  declarations: [{ prop: "unicode-range", value: "U+09F3" }],
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
    <html lang="en" className={`${gilroy.variable} ${kalpurush.variable} ${taka.variable} h-full antialiased`}>
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
