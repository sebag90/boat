import { LogOut } from 'lucide-react'
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

/** Top bar: vessel status on the left, session controls on the right. */
export function Header({ boats, selectedBoat, onSelectBoat, onCreateBoat }: HeaderProps) {
  const { t } = useI18n()
  const { username, logout } = useSession()

  return (
    <header className="sticky top-0 z-30 bg-parchment/80 shadow-[0_1px_8px_rgba(0,33,71,0.05)] backdrop-blur-xl">
      <div className="flex flex-wrap items-center gap-3 px-4 py-3 sm:px-6 lg:h-20 lg:flex-nowrap lg:px-8 lg:py-0">
        <div className="lg:hidden">
          <BrandMark subtitle={t('app.fleet')} />
        </div>

        <span className="hidden items-center gap-2 rounded-chip bg-ocean-100 px-3 py-1.5 label-mono text-ocean-800 lg:inline-flex">
          <span className="size-2.5 rounded-full bg-ocean-600" />
          {selectedBoat?.name ?? t('nav.selectVessel')}
        </span>

        <div className="order-2 ml-auto flex items-center gap-2 lg:order-3 lg:gap-4">
          <LanguageToggle />
          <div className="flex items-center gap-3 lg:border-l lg:border-navy-200 lg:pl-4">
            <span className="hidden text-right text-body-sm font-semibold text-navy-950 sm:block">
              {username}
            </span>
            <IconButton
              label={t('nav.logout')}
              icon={<LogOut className="size-4.5" />}
              onClick={logout}
            />
          </div>
        </div>

        <div className="order-3 w-full lg:order-2 lg:hidden">
          <BoatSelector
            boats={boats}
            selected={selectedBoat}
            onSelect={onSelectBoat}
            onCreate={onCreateBoat}
          />
        </div>
      </div>
    </header>
  )
}
