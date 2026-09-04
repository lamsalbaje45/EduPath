/**
 * Placeholder page component
 * Used for routes not yet implemented
 */

export const PlaceholderPage = ({ title }) => {
  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-white px-5">
      <div className="text-center">
        <h1 className="text-3xl font-black text-slate-950 sm:text-4xl">
          {title || 'Coming Soon'}
        </h1>
        <p className="mt-3 text-gray-600">This page will be built in the next step.</p>
      </div>
    </main>
  )
}

export default PlaceholderPage
