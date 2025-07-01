import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "晶圆制造物料配送仿真系统",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="cn">
      <body>
        {children}
      </body>
    </html>
  );
}
