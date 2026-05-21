export default function ProductLoading() {
  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8 animate-pulse">
      <div className="flex gap-2 mb-8">
        <div className="h-3 w-10 bg-gray-100" />
        <div className="h-3 w-3 bg-gray-100" />
        <div className="h-3 w-20 bg-gray-100" />
        <div className="h-3 w-3 bg-gray-100" />
        <div className="h-3 w-32 bg-gray-100" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="aspect-[3/4] bg-gray-100" />
        <div className="flex flex-col gap-6 pt-2">
          <div className="h-3 w-24 bg-gray-100" />
          <div className="h-8 w-3/4 bg-gray-100" />
          <div className="h-6 w-24 bg-gray-100" />
          <div className="flex gap-2 mt-2">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-10 w-14 bg-gray-100" />
            ))}
          </div>
          <div className="h-12 bg-gray-100 mt-2" />
        </div>
      </div>
    </div>
  )
}
