import Link from 'next/link'

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#FAFAFA]">
      <div className="max-w-2xl mx-auto px-6 py-16">
        <Link
          href="/"
          className="inline-block font-serif text-lg text-stone-600 hover:text-stone-900 transition-colors mb-12"
        >
          &larr; Bitácora 21
        </Link>

        <h1 className="font-serif text-3xl text-stone-800 mb-2">
          Términos y Condiciones de Uso
        </h1>
        <p className="font-sans text-sm text-stone-400 mb-10">
          Versión prototipo &ndash; 4 meses
        </p>

        <div className="space-y-8 font-sans text-sm text-stone-700 leading-relaxed">
          <section>
            <h2 className="font-serif text-lg text-stone-800 mb-2">
              1. Naturaleza del servicio
            </h2>
            <p>
              Bitácora 21 es una aplicación de escritura guiada en fase de prototipo, con
              disponibilidad limitada a 4 meses.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-lg text-stone-800 mb-2">
              2. Aceptación
            </h2>
            <p>Al registrarse, usted acepta estos términos.</p>
          </section>

          <section>
            <h2 className="font-serif text-lg text-stone-800 mb-2">
              3. Propiedad del contenido
            </h2>
            <p>
              Usted conserva todos los derechos sobre sus escritos. En esta versión del prototipo no
              se utilizan para ningún fin distinto a mostrárselos a usted.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-lg text-stone-800 mb-2">
              4. No sustitución de terapia
            </h2>
            <p>
              Bitácora 21 NO es un servicio de diagnóstico, tratamiento, psicoterapia, ni reemplaza
              la atención médica o psicológica profesional. Si requiere apoyo clínico, debe consultar
              con un profesional competente.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-lg text-stone-800 mb-2">
              5. Responsabilidad del usuario
            </h2>
            <p>
              Usted es el único responsable de las decisiones, interpretaciones y acciones derivadas
              del uso de la aplicación. Ever Vega y Bitácora 21 no asumen responsabilidad por
              resultados o conclusiones basadas en su contenido.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-lg text-stone-800 mb-2">
              6. Limitaciones del prototipo
            </h2>
            <p>
              El servicio se ofrece &ldquo;como está&rdquo;, sin garantías de disponibilidad
              continua. No hay supervisión humana de los contenidos escritos.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-lg text-stone-800 mb-2">
              7. Eliminación de datos
            </h2>
            <p>
              Toda la información será eliminada al término del prototipo (4 meses). Puede solicitar
              eliminación anticipada a{' '}
              <a
                href="mailto:everjvega@gmail.com"
                className="text-stone-600 underline decoration-stone-300 underline-offset-2 hover:decoration-stone-500 transition-colors"
              >
                everjvega@gmail.com
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="font-serif text-lg text-stone-800 mb-2">
              8. Vigencia
            </h2>
            <p>
              Estos términos rigen durante el prototipo. Al finalizar, el servicio dejará de operar y
              los datos serán eliminados.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-lg text-stone-800 mb-2">
              9. Contacto
            </h2>
            <p>
              <a
                href="mailto:everjvega@gmail.com"
                className="text-stone-600 underline decoration-stone-300 underline-offset-2 hover:decoration-stone-500 transition-colors"
              >
                everjvega@gmail.com
              </a>
            </p>
          </section>
        </div>

        <div className="mt-16 pt-8 border-t border-stone-200">
          <Link
            href="/privacy"
            className="font-sans text-sm text-stone-600 underline decoration-stone-300 underline-offset-2 hover:decoration-stone-500 transition-colors"
          >
            Ver Aviso de Privacidad
          </Link>
        </div>
      </div>
    </main>
  )
}
