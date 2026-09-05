import { useNavigate } from 'react-router-dom'
import { Button, Card } from '../components/ui'

/**
 * Unauthorized (403) Page
 * Rendered when an authenticated user attempts to access a route restricted to roles they do not possess.
 */
function Unauthorized() {
  const navigate = useNavigate()

  return (
    <main className="min-h-[80vh] flex items-center justify-center bg-[#F7F8FA] px-5 py-16 text-slate-950">
      <div className="w-full max-w-lg text-center">
        <Card className="p-8 sm:p-10">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-rose-50 text-4xl font-black text-rose-600 border border-rose-200">
            🔒
          </div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-rose-600">
            403 Access Denied
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl text-slate-950">
            Permission Required
          </h1>
          <p className="mt-3 text-sm text-slate-500 leading-relaxed">
            You do not have the required role or privileges to access this area of EduPath. If you believe this is an error, please switch accounts or contact your administrator.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
            <Button
              variant="primary"
              size="md"
              onClick={() => navigate('/')}
              className="bg-[#5472FC] hover:bg-[#435DDE] focus:outline-none focus:ring-2 focus:ring-[#5472FC] focus:ring-offset-2"
            >
              Return Home
            </Button>
            <Button
              variant="outline"
              size="md"
              onClick={() => navigate('/profile')}
              className="focus:outline-none focus:ring-2 focus:ring-[#5472FC] focus:ring-offset-2"
            >
              Go to Profile
            </Button>
          </div>
        </Card>
      </div>
    </main>
  )
}

export default Unauthorized
