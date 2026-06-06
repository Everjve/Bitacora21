import Link from 'next/link'

export default function PrivacyPage() {
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
          Aviso de Privacidad
        </h1>
        <p className="font-sans text-sm text-stone-400 mb-10">
          Versión prototipo &ndash; Vigencia: 4 meses
        </p>

        <div className="space-y-8 font-sans text-sm text-stone-700 leading-relaxed">
          <section>
            <h2 className="font-serif text-lg text-stone-800 mb-2">
              Responsable del tratamiento
            </h2>
            <p>
              Ever Vega &ndash; Contacto:{' '}
              <a
                href="mailto:everjvega@gmail.com"
                className="text-stone-600 underline decoration-stone-300 underline-offset-2 hover:decoration-stone-500 transition-colors"
              >
                everjvega@gmail.com
              </a>
            </p>
          </section>

          <section>
            <h2 className="font-serif text-lg text-stone-800 mb-2">
              Finalidad del tratamiento
            </h2>
            <p>
              Sus datos personales (nombre y correo) se usarán exclusivamente para permitirle el
              acceso al prototipo Bitácora 21, gestionar su registro, recuperación de contraseña y
              enviarle una encuesta de cierre.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-lg text-stone-800 mb-2">
              Datos recolectados
            </h2>
            <p>
              Nombre, correo electrónico y reflexiones personales voluntarias.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-lg text-stone-800 mb-2">
              Uso de los contenidos
            </h2>
            <p>
              Sus escritos son de su propiedad. En esta versión del prototipo no se usan para ningún
              fin distinto a mostrárselos a usted. No hay supervisión humana ni compartición con
              terceros.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-lg text-stone-800 mb-2">
              Seguridad
            </h2>
            <p>
              Bitácora 21 es un prototipo. La información se almacena bajo medidas estándar. Los
              textos personales no se almacenan con cifrado de extremo a extremo, aunque solo el
              usuario autenticado puede ver sus propias entradas.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-lg text-stone-800 mb-2">
              Plazo de conservación
            </h2>
            <p>
              Toda la información será eliminada de forma definitiva al término del prototipo (4
              meses). Usted puede solicitar eliminación anticipada escribiendo a{' '}
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
              Derechos ARCO
            </h2>
            <p>
              Puede solicitar acceso, rectificación, cancelación u oposición escribiendo a{' '}
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
              Aceptación
            </h2>
            <p>Al registrarse, usted acepta este aviso.</p>
          </section>
        </div>

        <div className="mt-16 pt-8 border-t border-stone-200">
          <Link
            href="/terms"
            className="font-sans text-sm text-stone-600 underline decoration-stone-300 underline-offset-2 hover:decoration-stone-500 transition-colors"
          >
            Ver Términos y Condiciones
          </Link>
        </div>
      </div>
    </main>
  )
}
