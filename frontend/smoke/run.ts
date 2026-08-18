/* eslint-disable */
// Headless smoke test: renders the whole app tree in jsdom against a mocked API.
import { JSDOM } from 'jsdom'
import fs from 'node:fs'

const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', {
  url: 'http://localhost:5173/',
  pretendToBeVisual: true,
})

const boats = [{ id: 1, name: 'Morning Star', description: '40ft', created_at: '2026-01-01T10:00:00Z' }]
const logbook = [
  {
    id: 1,
    date: '2026-06-15',
    crew: 'Skipper',
    start: 'Monaco',
    goal: 'Calvi',
    description: 'calm',
    created_at: '2026-06-15T08:00:00Z',
    waypoints: [
      { id: 1, log_id: 1, latitude: 43.7384, longitude: 7.4246, timestamp: '2026-06-15T08:30:00', name: 'A' },
      { id: 2, log_id: 1, latitude: 43.4, longitude: 8.1, timestamp: '2026-06-15T13:30:00', name: null },
    ],
  },
]
const documents = [
  { id: 1, title: 'Manual', description: 'desc', filename: 'a.pdf', content_type: 'application/pdf', uploaded_at: '2026-01-01T09:00:00Z' },
]
const maintenance = [
  { id: 1, title: 'Impeller', date: '2026-05-10', description: 'done', receipt_filename: null, created_at: '2026-05-10T14:00:00Z' },
]
const todos = [{ id: 1, text: 'Check bilge', done: false, file_filename: null, file_content_type: null, created_at: '2026-01-01T09:00:00Z' }]
const shopping = [
  { id: 1, name: 'Shackle', description: 'steel', link: 'https://x.y', done: false, file_filename: null, file_content_type: null, created_at: '2026-01-01T09:00:00Z' },
]

const routes: [RegExp, unknown][] = [
  [/\/api\/boats$/, boats],
  [/\/api\/boats\/\d+\/logbook$/, logbook],
  [/\/api\/boats\/\d+\/documents/, documents],
  [/\/api\/boats\/\d+\/maintenance$/, maintenance],
  [/\/api\/boats\/\d+\/todos$/, todos],
  [/\/api\/boats\/\d+\/shopping$/, shopping],
]

const calls: string[] = []

dom.window.localStorage.setItem('auth_header', 'Basic YWRtaW46YWRtaW4=')
dom.window.localStorage.setItem('current_user', 'admin')
dom.window.localStorage.setItem('selected_boat_id', '1')

const g = globalThis as any
g.window = dom.window
g.document = dom.window.document
Object.defineProperty(g, 'navigator', { value: dom.window.navigator, configurable: true })
g.HTMLElement = dom.window.HTMLElement
g.Element = dom.window.Element
g.Node = dom.window.Node
g.SVGElement = dom.window.SVGElement
g.MouseEvent = dom.window.MouseEvent
g.KeyboardEvent = dom.window.KeyboardEvent
g.Event = dom.window.Event
g.DOMParser = dom.window.DOMParser
g.trustedTypes = undefined
g.requestAnimationFrame = dom.window.requestAnimationFrame.bind(dom.window)
g.cancelAnimationFrame = dom.window.cancelAnimationFrame.bind(dom.window)
g.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
}
dom.window.ResizeObserver = g.ResizeObserver
g.IS_REACT_ACT_ENVIRONMENT = false

g.fetch = async (input: any) => {
  const url = String(input)
  calls.push(url)
  const match = routes.find(([pattern]) => pattern.test(url))
  return new Response(JSON.stringify(match ? match[1] : { ok: true }), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  }) as any
}

const errors: string[] = []
const originalError = console.error
console.error = (...args: unknown[]) => {
  errors.push(args.map(String).join(' '))
  originalError(...args)
}
dom.window.addEventListener('error', (event: any) => errors.push(`window error: ${event.message}`))

const bundle = fs.readFileSync(new URL('./bundle.cjs', import.meta.url), 'utf8')
// Execute the bundled app inside the jsdom-backed globals.
const run = new Function('require', 'module', 'exports', '__filename', '__dirname', bundle)
const module_ = { exports: {} }
const { createRequire } = await import('node:module')
run(createRequire(import.meta.url), module_, module_.exports, 'bundle.cjs', process.cwd())

await new Promise((resolve) => setTimeout(resolve, 800))

const html: string = dom.window.document.getElementById('root').innerHTML
const body: string = dom.window.document.body.innerHTML
const checks: [string, boolean][] = [
  ['renders root markup', html.length > 2000],
  ['renders header brand', html.includes('Boat Organizer')],
  ['renders tab bar', html.includes('Log Book')],
  ['renders voyage card', html.includes('Monaco')],
  ['renders detail dialog', dom.window.document.body.innerHTML.includes('Engine Manual')],
  ['renders markdown', dom.window.document.body.innerHTML.includes('<strong>Page 42</strong>')],
  ['renders waypoint table', dom.window.document.body.innerHTML.includes('43.73840')],
  ['renders leg distance', /\d+\.\d\d NM/.test(dom.window.document.body.innerHTML)],
  ['fetched boats', calls.some((url) => url.endsWith('/api/boats'))],
  ['fetched logbook', calls.some((url) => url.includes('/logbook'))],
  ['renders documents tab', body.includes('Manual') && body.includes('Documents Locker')],
  ['renders maintenance preview as date - title', body.includes('10-05-2026 - Impeller')],
  ['renders todos tab', body.includes('Check bilge')],
  ['renders shopping tab', body.includes('Shackle')],
  ['renders settings tab', body.includes('Danger zone')],
  ['renders login page', body.includes('Welcome aboard')],
  ['renders create dialogs', body.includes('Register a new vessel') && body.includes('New voyage')],
  ['fetched all collections', ['/documents', '/maintenance', '/todos', '/shopping'].every((p) => calls.some((url) => url.includes(p)))],
  ['no console errors', errors.length === 0],
]

let failed = false
for (const [name, ok] of checks) {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`)
  if (!ok) failed = true
}
if (errors.length) console.log('\n--- console errors ---\n' + errors.join('\n'))
process.exit(failed ? 1 : 0)
