export default function CategoryLoading() {
  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8 animate-pulse">
      <div className="flex gap-2 mb-6">
        <div className="h-3 w-10 bg-gray-100" />
        <div className="h-3 w-3 bg-gray-100" />
        <div className="h-3 w-24 bg-gray-100" />
      </div>
      <div className="h-8 w-56 bg-gray-100 mb-2" />
      <div className="h-3 w-20 bg-gray-100 mb-8" />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-8">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i}>
            <div className="aspect-[3/4] bg-gray-100 mb-3" />
            <div className="h-4 bg-gray-100 mb-2 w-3/4" />
            <div className="h-3 bg-gray-100 w-1/3" />
          </div>
        ))}
      </div>
    </div>
  )
}
