import { LogOut, User } from 'lucide-react'
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

/** Top bar: vessel status on the left, session controls & user badge on the right. */
export function Header({ boats, selectedBoat, onSelectBoat, onCreateBoat }: HeaderProps) {
  const { t } = useI18n()
  const { username, logout } = useSession()

  return (
    <header className="sticky top-0 z-30 bg-surface/85 backdrop-blur-xl border-b border-outline-variant/30 shadow-xs transition-colors">
      <div className="flex flex-wrap items-center gap-3 px-4 py-3 sm:px-6 lg:h-20 lg:flex-nowrap lg:px-8 lg:py-0">
        <div className="lg:hidden">
          <BrandMark subtitle={t('app.fleet')} />
        </div>

        {selectedBoat && (
          <div className="hidden items-center gap-2 rounded-full bg-primary-fixed text-on-primary-fixed px-3.5 py-1.5 label-caps lg:inline-flex">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-secondary" />
            </span>
            <span className="font-semibold">{selectedBoat.name}</span>
          </div>
        )}

        <div className="order-2 ml-auto flex items-center gap-2 sm:gap-3 lg:order-3 lg:gap-4">
          <LanguageToggle />

          <div className="flex items-center gap-3 border-l border-outline-variant/30 pl-3 sm:pl-4">
            <div className="hidden items-center gap-2 sm:flex">
              <div className="flex size-8 items-center justify-center rounded-full bg-secondary-container text-white font-bold text-xs shadow-xs">
                {username ? username.slice(0, 1).toUpperCase() : <User className="size-4" />}
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-semibold text-on-surface truncate max-w-[120px]">
                  {username}
                </span>
                <span className="text-[10px] text-on-surface-variant uppercase tracking-wider font-medium">
                  {t('app.fleet')}
                </span>
              </div>
            </div>

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
