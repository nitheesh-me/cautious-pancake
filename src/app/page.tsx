import BankersAlgorithm from "@/components/bankers-algorithm"

export default function Home() {
  return (
    <main className="w-full min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Banker's Algorithm</h1>
        <BankersAlgorithm />
      </div>
    </main>
  )
}
