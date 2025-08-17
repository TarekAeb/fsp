import { Inter } from 'next/font/google';
import "./globals.css";
import SessionProviderWrapper from "@/components/SessionProviderWrapper"; // adjust path if needed

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata = {
  title: "Frame",
  description: "A movie webpage dedicated to the FSP company to showcase their short movies and animations.",
  icons: {
    icon: "/icons/logo colored.svg",
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.className}`}>
      <head>
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description ?? ''} />
        <link rel="icon" href={metadata.icons.icon} />
      </head>
      <body className={inter.className}>
        <SessionProviderWrapper>
          {children}
        </SessionProviderWrapper>
      </body>
    </html>
  );
}