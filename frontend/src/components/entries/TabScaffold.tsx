import type { ReactNode } from 'react'
import { Panel, PanelBody, PanelHeader } from '../ui'

interface TabHeadingProps {
  title: string
  subtitle: string
  icon: ReactNode
  aside?: ReactNode
}

export function TabHeading({ title, subtitle, icon, aside }: TabHeadingProps) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
      <div className="flex items-center gap-3">
        <span className="flex size-11 items-center justify-center rounded-2xl bg-navy-950 text-brass-300 shadow-chart">
          {icon}
        </span>
        <div>
          <h1 className="text-2xl leading-tight font-semibold text-navy-950">{title}</h1>
          <p className="text-sm text-navy-500">{subtitle}</p>
        </div>
      </div>
      {aside && <div className="flex flex-wrap items-center gap-2">{aside}</div>}
    </div>
  )
}

/** The "new entry" panel — visually separated from the list below (spec rev. 10). */
export function FormPanel({
  title,
  icon,
  children,
}: {
  title: string
  icon?: ReactNode
  children: ReactNode
}) {
  return (
    <Panel className="mb-5">
      <PanelHeader title={title} icon={icon} />
      <PanelBody>{children}</PanelBody>
    </Panel>
  )
}

export function ListPanel({
  title,
  count,
  countLabel,
  search,
  children,
}: {
  title: string
  count?: number
  countLabel?: string
  search?: ReactNode
  children: ReactNode
}) {
  return (
    <Panel>
      <PanelHeader
        title={title}
        subtitle={count !== undefined ? `${count} ${countLabel ?? ''}`.trim() : undefined}
        actions={search ? <div className="w-full sm:w-72">{search}</div> : undefined}
        className="flex-col items-stretch sm:flex-row sm:items-center"
      />
      <PanelBody>{children}</PanelBody>
    </Panel>
  )
}
