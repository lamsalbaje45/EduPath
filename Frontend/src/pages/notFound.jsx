import { Link, useNavigate } from 'react-router-dom'
import { Button, Card } from '../components/ui'

/**
 * NotFound (404) Page
 * Rendered when navigating to an undefined path.
 */
function NotFound() {
  const navigate = useNavigate()

  return (
    <main className="min-h-[80vh] flex items-center justify-center bg-[#F7F8FA] px-5 py-16 text-slate-950">
      <div className="w-full max-w-lg text-center">
        <Card className="p-8 sm:p-10">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-[#E7EEFF] text-4xl font-black text-[#2551D9] shadow-inner">
            404
          </div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#5472FC]">
            Page Not Found
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl text-slate-950">
            Lost on your path?
          </h1>
          <p className="mt-3 text-sm text-slate-500 leading-relaxed">
            The page you are looking for doesn&apos;t exist or might have been moved. Let&apos;s guide you back to college and career discovery.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
            <Button
              variant="primary"
              size="md"
              onClick={() => navigate('/')}
              className="bg-[#5472FC] hover:bg-[#435DDE] focus:outline-none focus:ring-2 focus:ring-[#5472FC] focus:ring-offset-2"
            >
              Back to Home
            </Button>
            <Button
              variant="outline"
              size="md"
              onClick={() => navigate(-1)}
              className="focus:outline-none focus:ring-2 focus:ring-[#5472FC] focus:ring-offset-2"
            >
              Go Back
            </Button>
          </div>
        </Card>
      </div>
    </main>
  )
}

export default NotFound
