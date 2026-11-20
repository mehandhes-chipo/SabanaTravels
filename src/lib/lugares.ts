// Lugares de Sabana de Torres (mismos 9 que la v1, con sus fotos reales).
// ⚠ Precios, horarios y coordenadas son DE EJEMPLO: reemplazar con los datos reales de cada negocio.

export type Tipo = "hotel" | "restaurante" | "sitio";

export type Lugar = {
  slug: string;
  tipo: Tipo;
  nombre: string;
  resumen: string;
  desde: number;
  servicios: string[];
  pagos?: string[];
  lat: number;
  lng: number;
  fotos: string[];
  precios: { nombre: string; detalle: string; precio: number }[];
  paquete?: { nombre: string; incluye: string[]; precio: number };
};

export const TIPOS: Record<Tipo, { uno: string; varios: string; pilar: string; color: string }> = {
  restaurante: { uno: "Restaurante", varios: "Restaurantes", pilar: "Sabor", color: "bg-naranja" },
  hotel: { uno: "Hotel", varios: "Hoteles", pilar: "Descanso", color: "bg-cian" },
  sitio: { uno: "Sitio turístico", varios: "Sitios turísticos", pilar: "Placer", color: "bg-verde" },
};

const f = (slug: string, ...n: string[]) => n.map((x) => `/fotos/${slug}/${x}.webp`);

const hotel = (desde: number) => [
  { nombre: "Sencilla", detalle: "1 persona, por noche", precio: desde },
  { nombre: "Doble", detalle: "2 personas, por noche", precio: Math.round(desde * 1.5) },
  { nombre: "Familiar", detalle: "4 personas, por noche", precio: Math.round(desde * 2.2) },
];
const menu = (desde: number) => [
  { nombre: "Plato del día", detalle: "Sopa, seco y jugo", precio: desde },
  { nombre: "Carne a la brasa", detalle: "Con yuca y ensalada", precio: desde + 12000 },
  { nombre: "Jugo natural", detalle: "Frutas de la región", precio: 6000 },
];
const entrada = (desde: number) => [
  { nombre: "Adulto", detalle: "Entrada", precio: desde },
  { nombre: "Niño", detalle: "De 3 a 10 años", precio: Math.round(desde * 0.6) },
];
const pasadia = (desde: number) => ({ nombre: "Pasadía", incluye: ["Entrada", "Almuerzo típico"], precio: desde + 30000 });

export const LUGARES: Lugar[] = [
  { slug: "reserva-natural-cabildo-verde", tipo: "sitio", nombre: "Reserva Natural Cabildo Verde", resumen: "Bosque, fauna rescatada y senderos: hogar del jaguar.", desde: 25000, servicios: ["Guía local", "Senderismo", "Avistamiento de fauna"], lat: 7.36, lng: -73.47, fotos: f("reserva-natural-cabildo-verde", "27", "05", "40"), precios: entrada(25000), paquete: pasadia(25000) },
  { slug: "balneario-las-vegas", tipo: "sitio", nombre: "Balneario Las Vegas", resumen: "Río, piscinas naturales y descanso al aire libre.", desde: 10000, servicios: ["Baño en río", "Kiosco", "Parqueadero"], lat: 7.41, lng: -73.51, fotos: f("balneario-las-vegas", "06", "12", "20"), precios: entrada(10000), paquete: pasadia(10000) },
  { slug: "estadero-villa-juliana", tipo: "sitio", nombre: "Estadero Villa Juliana", resumen: "Piscina, kiosco y comida para pasar el día en familia.", desde: 15000, servicios: ["Piscina", "Kiosco", "Parqueadero"], lat: 7.3995, lng: -73.489, fotos: f("estadero-villa-juliana", "11", "04"), precios: entrada(15000), paquete: pasadia(15000) },
  { slug: "hotel-santa-maria-real", tipo: "hotel", nombre: "Hotel Santa María Real", resumen: "Hospedaje con piscina y zonas verdes.", desde: 120000, servicios: ["Wi-Fi", "Piscina", "Aire acondicionado", "Parqueadero"], lat: 7.3942, lng: -73.4951, fotos: f("hotel-santa-maria-real", "10", "03"), precios: hotel(120000) },
  { slug: "hotel-el-dorado", tipo: "hotel", nombre: "Hotel El Dorado", resumen: "Habitaciones cómodas en el centro del municipio.", desde: 90000, servicios: ["Wi-Fi", "Aire acondicionado", "Parqueadero"], lat: 7.3931, lng: -73.4968, fotos: f("hotel-el-dorado", "22", "10"), precios: hotel(90000) },
  { slug: "hotel-el-nuevo-despertar", tipo: "hotel", nombre: "Hotel El Nuevo Despertar", resumen: "Descanso tranquilo a pocos pasos del parque principal.", desde: 80000, servicios: ["Wi-Fi", "Ventilador", "Desayuno"], lat: 7.3918, lng: -73.4985, fotos: f("hotel-el-nuevo-despertar", "06", "02"), precios: hotel(80000) },
  { slug: "el-fogon", tipo: "restaurante", nombre: "El Fogón", resumen: "Comida típica casera y sancochos de leña.", desde: 18000, servicios: ["Comida típica", "Almuerzos"], pagos: ["Efectivo", "Tarjeta"], lat: 7.3936, lng: -73.499, fotos: f("el-fogon", "09", "05"), precios: menu(18000) },
  { slug: "brasas-la-14", tipo: "restaurante", nombre: "Brasas La 14", resumen: "Carnes a la brasa y asados santandereanos.", desde: 25000, servicios: ["Asados", "Pollo a la brasa"], pagos: ["Efectivo", "Nequi"], lat: 7.3912, lng: -73.4962, fotos: f("brasas-la-14", "12", "04"), precios: menu(25000) },
  { slug: "el-marquez", tipo: "restaurante", nombre: "El Márquez", resumen: "Platos de la región y menú del día.", desde: 20000, servicios: ["Menú del día", "Platos regionales"], pagos: ["Efectivo", "Nequi", "Tarjeta"], lat: 7.3924, lng: -73.4944, fotos: f("el-marquez", "12", "03"), precios: menu(20000) },
];

export const getLugar = (slug: string) => LUGARES.find((l) => l.slug === slug);
export const sm = (url: string) => url.replace(/\.webp$/, "-sm.webp");

const cop = new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });
export const precio = (n: number) => cop.format(n);
export const comoLlegar = (l: Lugar) => `https://www.google.com/maps/dir/?api=1&destination=${l.lat},${l.lng}`;
