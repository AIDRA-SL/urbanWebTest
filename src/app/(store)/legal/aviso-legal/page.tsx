import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Aviso Legal | UrbanStore',
  description: 'Aviso legal de UrbanStore Oviedo.',
}

export default function AvisoLegalPage() {
  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-12 pb-24">
      <div className="max-w-3xl">
        <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">Legal</p>
        <h1 className="text-3xl font-bold tracking-tight uppercase mb-10">Aviso Legal</h1>

        <div className="flex flex-col gap-8 text-sm text-gray-600 leading-relaxed">

          <section>
            <h2 className="text-xs uppercase tracking-widest font-semibold text-gray-900 mb-3">Datos del titular</h2>
            <p>
              En cumplimiento de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y del Comercio Electrónico, se informa que el titular del presente sitio web es:
            </p>
            <ul className="mt-3 flex flex-col gap-1 text-gray-500">
              <li><span className="text-gray-700 font-medium">Titular:</span> Celestino Ardura Castañon</li>
              <li><span className="text-gray-700 font-medium">NIF:</span> 71769757M</li>
              <li><span className="text-gray-700 font-medium">Dirección:</span> C/ Nueve de Mayo 15, 33002 Oviedo, Asturias</li>
              <li><span className="text-gray-700 font-medium">Correo electrónico:</span> urbanoviedostore@gmail.com</li>
              <li><span className="text-gray-700 font-medium">Teléfono:</span> 696 64 13 81</li>
              <li><span className="text-gray-700 font-medium">Horario:</span> Lun–Vie 10:30–14:00, 17:00–20:30 · Sáb 11:00–14:00, 17:00–20:30</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xs uppercase tracking-widest font-semibold text-gray-900 mb-3">Usuarios</h2>
            <p>
              El acceso y/o uso de este portal atribuye la condición de usuario, que acepta, desde dicho acceso y/o uso, las condiciones generales de uso aquí reflejadas. Las condiciones anteriores regirán independientemente de las condiciones generales de contratación que en su caso resulten de obligado cumplimiento.
            </p>
          </section>

          <section>
            <h2 className="text-xs uppercase tracking-widest font-semibold text-gray-900 mb-3">Uso del portal</h2>
            <p>
              El usuario se obliga a hacer un uso correcto del portal de conformidad con las leyes, la buena fe, el orden público, los usos del tráfico y el presente Aviso Legal. El usuario responderá frente al titular o frente a terceros, de cualesquiera daños y perjuicios que pudieran causarse como consecuencia del incumplimiento de dicha obligación.
            </p>
            <p className="mt-3">
              Queda expresamente prohibido el uso del portal con fines lesivos de bienes o intereses de terceros o que de cualquier otra forma sobrecarguen, dañen o inutilicen las redes, servidores y demás equipos informáticos (hardware) o productos y aplicaciones informáticas (software) de terceros.
            </p>
          </section>

          <section>
            <h2 className="text-xs uppercase tracking-widest font-semibold text-gray-900 mb-3">Propiedad intelectual e industrial</h2>
            <p>
              El titular es propietario de todos los derechos de propiedad intelectual e industrial de su página web, así como de los elementos contenidos en la misma (a título enunciativo: imágenes, sonido, audio, vídeo, software o textos; marcas o logotipos, combinaciones de colores, estructura y diseño, selección de materiales usados, programas de ordenador necesarios para su funcionamiento, acceso y uso, etc.).
            </p>
            <p className="mt-3">
              El usuario puede visualizar todos los elementos, imprimirlos, copiarlos y almacenarlos en el disco duro de su ordenador o en cualquier otro soporte físico siempre y cuando sea, única y exclusivamente, para su uso personal y privado. El usuario deberá abstenerse de suprimir, alterar, eludir o manipular cualquier dispositivo de protección o sistema de seguridad que estuviera instalado en la página.
            </p>
          </section>

          <section>
            <h2 className="text-xs uppercase tracking-widest font-semibold text-gray-900 mb-3">Funcionamiento del portal</h2>
            <p>
              El titular no garantiza la continuidad del funcionamiento del portal, ni que estará libre de error. El titular tampoco garantiza que el contenido o software al que pueda accederse a través de este portal esté libre de error o cause un daño. En ningún caso el titular será responsable por las pérdidas, daños o perjuicios de cualquier tipo que surjan por el acceso, navegación y el uso del portal, incluyéndose, pero no limitándose, a los ocasionados a los sistemas informáticos o los provocados por la introducción de virus.
            </p>
          </section>

          <section>
            <h2 className="text-xs uppercase tracking-widest font-semibold text-gray-900 mb-3">Legislación aplicable y jurisdicción</h2>
            <p>
              La relación entre el titular y el usuario se regirá por la normativa española vigente y cualquier controversia se someterá a los Juzgados y Tribunales de la ciudad de Oviedo, salvo que la ley aplicable establezca otro fuero de forma imperativa.
            </p>
          </section>

        </div>
      </div>
    </div>
  )
}
