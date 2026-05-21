import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Política de Privacidad | UrbanStore',
  description: 'Política de privacidad de UrbanStore Oviedo conforme al RGPD y la LOPDGDD.',
}

export default function PrivacidadPage() {
  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-12 pb-24">
      <div className="max-w-3xl">
        <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">Legal</p>
        <h1 className="text-3xl font-bold tracking-tight uppercase mb-10">Política de Privacidad</h1>

        <div className="flex flex-col gap-8 text-sm text-gray-600 leading-relaxed">

          <section>
            <p>
              En cumplimiento de la Ley Orgánica 3/2018, de 5 de diciembre, de Protección de Datos Personales y Garantía de los Derechos Digitales (LOPDGDD) y del Reglamento (UE) 2016/679 del Parlamento Europeo (RGPD), le informamos sobre el tratamiento de sus datos personales.
            </p>
          </section>

          <section>
            <h2 className="text-xs uppercase tracking-widest font-semibold text-gray-900 mb-3">Responsable del tratamiento</h2>
            <ul className="flex flex-col gap-1 text-gray-500">
              <li><span className="text-gray-700 font-medium">Titular:</span> Celestino Ardura Castañon</li>
              <li><span className="text-gray-700 font-medium">NIF:</span> 71769757M</li>
              <li><span className="text-gray-700 font-medium">Dirección:</span> C/ Nueve de Mayo 15, 33002 Oviedo, Asturias</li>
              <li><span className="text-gray-700 font-medium">Correo electrónico:</span> urbanoviedostore@gmail.com</li>
              <li><span className="text-gray-700 font-medium">Teléfono:</span> 696 64 13 81</li>
            </ul>
            <p className="mt-3">El titular se reserva el derecho a modificar la presente Política de Privacidad en cualquier momento.</p>
          </section>

          <section>
            <h2 className="text-xs uppercase tracking-widest font-semibold text-gray-900 mb-3">Contactos del sitio web y correo electrónico</h2>
            <p><span className="font-medium text-gray-700">Datos recogidos:</span> Dirección IP, sistema operativo, tipo de navegador y duración de la visita (de forma anónima). Los datos del formulario de contacto se utilizan únicamente para atender su consulta.</p>
            <p className="mt-2"><span className="font-medium text-gray-700">Finalidades:</span> Atender consultas y solicitudes; gestionar los servicios solicitados; comunicaciones electrónicas relativas a las solicitudes; información comercial (con autorización expresa); análisis y mejora del sitio web.</p>
            <p className="mt-2"><span className="font-medium text-gray-700">Legitimación:</span> Consentimiento del usuario mediante la aceptación de la política de privacidad.</p>
          </section>

          <section>
            <h2 className="text-xs uppercase tracking-widest font-semibold text-gray-900 mb-3">Clientes</h2>
            <p><span className="font-medium text-gray-700">Finalidades:</span> Elaboración y seguimiento de presupuestos; gestión administrativa, comunicativa y logística; facturación y declaraciones fiscales; ejecución de transacciones; gestión de cobros.</p>
            <p className="mt-2"><span className="font-medium text-gray-700">Legitimación:</span> Ejecución de la relación contractual.</p>
          </section>

          <section>
            <h2 className="text-xs uppercase tracking-widest font-semibold text-gray-900 mb-3">Redes sociales</h2>
            <p>Los datos recogidos a través de redes sociales (Facebook, Instagram, TikTok) se utilizan para atender consultas, gestionar los servicios y construir comunidad. La legitimación se basa en la aceptación contractual de la propia red social y su política de privacidad.</p>
          </section>

          <section>
            <h2 className="text-xs uppercase tracking-widest font-semibold text-gray-900 mb-3">Destinatarios de los datos</h2>
            <p>Los datos no serán cedidos a terceros salvo por obligación legal, incluyendo:</p>
            <ul className="mt-2 list-disc list-inside text-gray-500 flex flex-col gap-1">
              <li>Agencia Tributaria</li>
              <li>Entidades bancarias y financieras</li>
              <li>Proveedores de plataformas de pago</li>
              <li>Empresas de desarrollo web y alojamiento (con obligación contractual de confidencialidad)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xs uppercase tracking-widest font-semibold text-gray-900 mb-3">Derechos del usuario</h2>
            <p>Puede ejercer los siguientes derechos enviando un correo a urbanoviedostore@gmail.com:</p>
            <ul className="mt-2 list-disc list-inside text-gray-500 flex flex-col gap-1">
              <li>Acceso a sus datos personales</li>
              <li>Rectificación de datos inexactos</li>
              <li>Supresión de sus datos</li>
              <li>Limitación del tratamiento</li>
              <li>Portabilidad de los datos</li>
              <li>Oposición al tratamiento</li>
              <li>Retirar el consentimiento en cualquier momento</li>
              <li>Reclamar ante la Agencia Española de Protección de Datos (www.aepd.es)</li>
            </ul>
            <p className="mt-3">El plazo de respuesta máximo es de un mes, pudiendo ampliarse a dos meses en casos de especial complejidad.</p>
          </section>

          <section>
            <h2 className="text-xs uppercase tracking-widest font-semibold text-gray-900 mb-3">Conservación de los datos</h2>
            <p>Los datos se conservarán mientras dure la relación y, una vez finalizada, durante los plazos legales aplicables, incluyendo los plazos de prescripción de acciones judiciales y los períodos de garantía de productos y servicios.</p>
          </section>

          <section>
            <h2 className="text-xs uppercase tracking-widest font-semibold text-gray-900 mb-3">Medidas de seguridad</h2>
            <p>Hemos adoptado las medidas técnicas y organizativas necesarias para garantizar un nivel de seguridad adecuado al riesgo, protegiendo sus datos frente a pérdida, uso indebido, acceso no autorizado o robo.</p>
          </section>

        </div>
      </div>
    </div>
  )
}
