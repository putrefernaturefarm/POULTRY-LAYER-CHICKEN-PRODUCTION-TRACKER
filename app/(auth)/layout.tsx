export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-farm-green-700 via-farm-green-600 to-green-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-float mb-4">
            <span className="text-3xl">🐔</span>
          </div>
          <h1 className="text-2xl font-bold text-white">LayerPro</h1>
          <p className="text-green-200 text-sm mt-1">Poultry Layer Production Tracker</p>
        </div>
        {children}
      </div>
    </div>
  )
}
