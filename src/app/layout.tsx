import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import localFont from "next/font/local";
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

const kalpurush = localFont({
  src: "../fonts/Kalpurush.ttf",
  variable: "--font-kalpurush",
  display: "swap",
});

// Latin fonts can carry their own glyph for the Bengali currency sign, which
// would shadow the Kalpurush fallback. Scoping a second face to just that
// codepoint via unicode-range forces every ৳ on the site onto Kalpurush
// without having to touch each of the many places that render it.
// adjustFontFallback is off because next/font's auto-generated fallback face
// doesn't inherit the unicode-range restriction above — left on, that
// fallback matched every character (not just ৳) and shadowed Poppins
// everywhere in the site's normal text.
const taka = localFont({
  src: "../fonts/Kalpurush.ttf",
  variable: "--font-taka",
  display: "swap",
  adjustFontFallback: false,
  declarations: [{ prop: "unicode-range", value: "U+09F3" }],
});

/**
 * Absolute base for metadata URLs (canonicals, OG images).
 *
 * Without this Next resolves relative metadata URLs against localhost, so a shared
 * link would advertise a preview image nobody else can load.
 */
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'http://localhost:3000')

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
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
    <html lang="en" className={`${poppins.variable} ${kalpurush.variable} ${taka.variable} h-full antialiased`}>
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
