import { LogOut, UserRound } from 'lucide-react'
import { useI18n } from '../../i18n'
import { useSession } from '../../hooks/useSession'
import type { Boat } from '../../lib/types'
import { IconButton, LanguageToggle } from '../ui'
import { BoatSelector } from './BoatSelector'
import { BrandMark } from './Logo'

interface HeaderProps {
  boats: Boat[]
  selectedBoat: Boat | null
  onSelectBoat: (boat: Boat) => void
  onCreateBoat: () => void
}

export function Header({ boats, selectedBoat, onSelectBoat, onCreateBoat }: HeaderProps) {
  const { t } = useI18n()
  const { username, logout } = useSession()

  return (
    <header className="sticky top-0 z-30 border-b border-navy-200 bg-white/92 backdrop-blur-lg">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3 sm:px-6">
        <BrandMark subtitle={t('app.fleet')} />

        <div className="order-2 ml-auto flex items-center gap-2 sm:order-3">
          <div className="hidden items-center gap-1.5 rounded-xl bg-navy-950 px-3 py-1.5 text-xs text-navy-200 sm:flex">
            <UserRound className="size-3.5 text-brass-300" />
            <span className="font-semibold text-white">{username}</span>
          </div>
          <LanguageToggle />
          <IconButton
            label={t('nav.logout')}
            icon={<LogOut className="size-4.5" />}
            onClick={logout}
          />
        </div>

        <div className="order-3 w-full sm:order-2 sm:mr-auto sm:w-auto">
          <BoatSelector
            boats={boats}
            selected={selectedBoat}
            onSelect={onSelectBoat}
            onCreate={onCreateBoat}
          />
        </div>
      </div>
      <span className="brass-rule block" />
    </header>
  )
}
