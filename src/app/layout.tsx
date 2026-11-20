import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Yesteryear } from "next/font/google";
import { Encabezado } from "@/components/Encabezado";
import { Pie } from "@/components/Pie";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({ variable: "--font-jakarta", subsets: ["latin"], weight: ["400", "500", "600", "700", "800"] });
const yesteryear = Yesteryear({ variable: "--font-yesteryear", subsets: ["latin"], weight: "400" });

export const metadata: Metadata = {
  title: { default: "Sabana Travel's · Turismo en Sabana de Torres", template: "%s · Sabana Travel's" },
  description: "Hoteles, restaurantes y sitios turísticos de Sabana de Torres, Santander: precios, fotos, ubicación y contacto.",
};

export const viewport: Viewport = { themeColor: "#4da528" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-CO">
      <body className={`${jakarta.variable} ${yesteryear.variable} font-sans antialiased`}>
        <a href="#contenido" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-naranja focus:px-4 focus:py-2 focus:font-bold focus:text-marino">
          Saltar al contenido
        </a>
        <Encabezado />
        <main id="contenido">{children}</main>
        <Pie />
      </body>
    </html>
  );
}
