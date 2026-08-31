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
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4 md:items-end">
      <div className="min-w-0">
        <span className="mb-2 flex items-center gap-2 label-mono text-navy-500">
          {icon}
          {subtitle}
        </span>
        <h1 className="text-headline-lg text-navy-950 lg:text-headline-xl">{title}</h1>
      </div>
      {aside && <div className="flex flex-wrap items-center gap-3">{aside}</div>}
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
