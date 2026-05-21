import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Política de Cookies | UrbanStore',
  description: 'Política de cookies de UrbanStore Oviedo.',
}

export default function CookiesPage() {
  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-12 pb-24">
      <div className="max-w-3xl">
        <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">Legal</p>
        <h1 className="text-3xl font-bold tracking-tight uppercase mb-2">Política de Cookies</h1>
        <p className="text-xs text-gray-400 mb-10">Última actualización: marzo 2024</p>

        <div className="flex flex-col gap-8 text-sm text-gray-600 leading-relaxed">

          <section>
            <h2 className="text-xs uppercase tracking-widest font-semibold text-gray-900 mb-3">1. Introducción</h2>
            <p>
              El sitio web <span className="font-medium text-gray-700">urbanoviedostore.es</span> utiliza cookies y tecnologías similares. Esta política explica qué son, cómo las usamos y cómo puede gestionarlas.
            </p>
          </section>

          <section>
            <h2 className="text-xs uppercase tracking-widest font-semibold text-gray-900 mb-3">2. ¿Qué son las cookies?</h2>
            <p>
              Una cookie es un pequeño archivo que se envía junto con las páginas de este sitio web y que su navegador almacena en el disco duro de su dispositivo. La información almacenada en ellas puede ser devuelta a nuestros servidores o a los servidores de terceros relevantes en una visita posterior.
            </p>
          </section>

          <section>
            <h2 className="text-xs uppercase tracking-widest font-semibold text-gray-900 mb-3">3. Tipos de cookies que utilizamos</h2>

            <div className="flex flex-col gap-4">
              <div>
                <p className="font-medium text-gray-700 mb-1">Cookies funcionales</p>
                <p>Son necesarias para el correcto funcionamiento del sitio web. Por ejemplo, para mantener el contenido del carrito de compra entre visitas o gestionar la sesión iniciada. No requieren consentimiento.</p>
              </div>
              <div>
                <p className="font-medium text-gray-700 mb-1">Cookies estadísticas</p>
                <p>Nos permiten analizar el uso del sitio web para mejorar la experiencia del usuario. Los datos obtenidos son anónimos y agregados. Para su uso solicitamos su permiso.</p>
              </div>
              <div>
                <p className="font-medium text-gray-700 mb-1">Cookies de redes sociales</p>
                <p>Colocadas por plataformas de redes sociales (Instagram, Facebook, TikTok) cuando hace clic en botones de compartir o sigue nuestros perfiles. Estas plataformas tienen sus propias políticas de cookies.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xs uppercase tracking-widest font-semibold text-gray-900 mb-3">4. Consentimiento</h2>
            <p>
              En su primera visita a nuestro sitio web le mostramos un aviso sobre las cookies. Al hacer clic en "Aceptar" o al continuar navegando, acepta el uso de las cookies descritas en esta política. Puede revocar su consentimiento en cualquier momento mediante los ajustes de su navegador.
            </p>
          </section>

          <section>
            <h2 className="text-xs uppercase tracking-widest font-semibold text-gray-900 mb-3">5. Activación, desactivación y eliminación</h2>
            <p>
              Puede gestionar y/o eliminar las cookies según desee a través de la configuración de su navegador. Tenga en cuenta que deshabilitar las cookies puede afectar a la funcionalidad del sitio web. Para más información sobre cómo gestionar las cookies en su navegador, consulte la documentación del mismo:
            </p>
            <ul className="mt-2 flex flex-col gap-1 text-gray-500 list-disc list-inside">
              <li>Google Chrome: Configuración → Privacidad y seguridad → Cookies</li>
              <li>Mozilla Firefox: Opciones → Privacidad y Seguridad</li>
              <li>Safari: Preferencias → Privacidad</li>
              <li>Microsoft Edge: Configuración → Privacidad, búsqueda y servicios</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xs uppercase tracking-widest font-semibold text-gray-900 mb-3">6. Sus derechos</h2>
            <p>
              Respecto a sus datos personales recogidos a través de cookies, tiene derecho de acceso, rectificación, supresión, portabilidad y oposición. Para ejercerlos, puede contactarnos en:
            </p>
            <ul className="mt-2 flex flex-col gap-1 text-gray-500">
              <li><span className="text-gray-700 font-medium">Email:</span> urbanoviedostore@gmail.com</li>
              <li><span className="text-gray-700 font-medium">Dirección:</span> C/ Nueve de Mayo 15, 33002 Oviedo, Asturias</li>
              <li><span className="text-gray-700 font-medium">Teléfono:</span> 696 64 13 81</li>
            </ul>
          </section>

        </div>
      </div>
    </div>
  )
}
