import Link from "next/link";

export default function NotFound() {
  return (
    <section className="contenedor py-32 text-center">
      <p className="font-script text-4xl text-verde">¡Uy! Te desviaste del camino</p>
      <h1 className="mt-2 text-4xl">No encontramos esta página</h1>
      <Link href="/" className="btn-verde mt-8">Volver al inicio</Link>
    </section>
  );
}
