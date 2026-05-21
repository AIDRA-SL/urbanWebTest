const messages = [
  'Autenticidad garantizada',
  'Pago seguro',
  'Envío rápido 24/48h',
  'Envíos y devoluciones gratis en compras +60€',
]

const separator = <span className="mx-6 opacity-30">·</span>

function Track() {
  return (
    <>
      {messages.map((msg, i) => (
        <span key={i} className="inline-flex items-center">
          {msg}
          {separator}
        </span>
      ))}
    </>
  )
}

export function AnnouncementBar() {
  return (
    <div className="bg-black text-white text-[11px] tracking-widest uppercase h-8 flex items-center overflow-hidden">
      <div className="animate-marquee-bar flex whitespace-nowrap" aria-hidden="true">
        <Track />
        <Track />
        <Track />
        <Track />
      </div>
    </div>
  )
}
