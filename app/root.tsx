import os from 'node:os'
import {
  Links,
  Link,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from 'react-router'

import { type Route } from './+types/root'
import { GeneralErrorBoundary } from './components/error-boundary'
import tailwindStyleSheetUrl from './tailwind.css?url'
import { getEnv } from '~/utils/env.server'

export const links: Route.LinksFunction = () => [
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  {
    rel: 'preconnect',
    href: 'https://fonts.gstatic.com',
    crossOrigin: 'anonymous',
  },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap',
  },
  {
    rel: 'stylesheet',
    href: tailwindStyleSheetUrl,
  },
]

export const meta: Route.MetaFunction = ({ data }) => {
  return [
    { title: data ? 'Epic Notes' : 'Error | Epic Notes' },
    { name: 'description', content: `Your own captain's log` },
  ]
}

export async function loader() {
  // throw new Error('我錯了')
  return {
    username: os.userInfo().username,
    ENV: getEnv(),
  }
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full overflow-x-hidden">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="bg-background text-foreground flex h-full flex-col justify-between">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

export default function App() {
  const data = useLoaderData<typeof loader>()

  return (
    <>
      <header className="container mx-auto py-6">
        <nav className="flex justify-between">
          <Link to="/">
            <div className="font-light">epic</div>
            <div className="font-bold">notes</div>
          </Link>
          <Link className="underline" to="users/decade/notes">
            DecadeHew's Notes
          </Link>
        </nav>
      </header>
      <div className="flex-1">
        <Outlet />
      </div>
      <div className="container mx-auto flex justify-between">
        <Link to="/">
          <div className="font-light">decadehew</div>
          <div className="font-bold">notes</div>
        </Link>
        <p>Built with ♥️ by {data.username}</p>
      </div>
      <div className="h-5" />
      <script
        dangerouslySetInnerHTML={{
          __html: ` window.ENV = ${JSON.stringify(data.ENV)}`,
        }}
      />
    </>
  )
}

export const ErrorBoundary = GeneralErrorBoundary
