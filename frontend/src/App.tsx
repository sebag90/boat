import { useSession } from './hooks/useSession'
import { LoginPage } from './pages/LoginPage'
import { WorkspacePage } from './pages/WorkspacePage'

export function App() {
  const { authenticated } = useSession()
  return authenticated ? <WorkspacePage /> : <LoginPage />
}
