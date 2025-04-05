import { Link, NavLink, Outlet, useLoaderData } from 'react-router'

import { type Route } from './+types/notes'

import { cn } from '~/lib/utils'
import { db } from '~/utils/db.server'
import { invariantResponse } from '~/utils/invariant'
import { GeneralErrorBoundary } from '~/components/error-boundary'

export async function loader({ params }: Route.LoaderArgs) {
  const owner = db.user.findFirst({
    where: {
      username: {
        equals: params.username,
      },
    },
  })

  const notes = db.note
    .findMany({
      where: {
        owner: {
          username: {
            equals: params.username,
          },
        },
      },
    })
    .map(({ id, title }) => ({ id, title }))

  invariantResponse(owner, 'Owner not found', { status: 404 })

  return { owner, notes }
}

export default function NotesRoute() {
  const data = useLoaderData<typeof loader>()
  const ownerDisplayName = data.owner.name ?? data.owner.username
  const navLinkDefaultClassName =
    'line-clamp-2 block rounded-l-full py-2 pl-8 pr-6 text-base lg:text-xl'

  return (
    <main className="container mx-auto flex h-full min-h-[400px] px-0 pb-12 md:px-8">
      <div className="bg-muted grid w-full grid-cols-4 pl-2 md:container md:mx-2 md:rounded-3xl md:pr-0">
        <div className="relative col-span-1">
          <div className="absolute inset-0 flex flex-col">
            <Link to="" relative="path" className="pt-12 pr-4 pb-4 pl-8">
              <h1 className="text-base font-bold md:text-lg lg:text-left lg:text-2xl">
                {ownerDisplayName}'s Notes
              </h1>
            </Link>
            <ul className="overflow-x-hidden overflow-y-auto pb-12">
              {data.notes.map((note) => (
                <li key={note.id} className="p-1 pr-0">
                  <NavLink
                    to={note.id}
                    prefetch="intent"
                    preventScrollReset
                    className={({ isActive }) =>
                      cn(navLinkDefaultClassName, isActive && 'bg-gray-200')
                    }
                  >
                    {note.title}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="relative col-span-3 bg-gray-200 md:rounded-r-3xl">
          <Outlet />
        </div>
      </div>
    </main>
  )
}

export function ErrorBoundary() {
  return (
    <GeneralErrorBoundary
      statusHandlers={{
        404: ({ params }) => (
          <p>
            No user with the username "{params.username}" exists | (notes.tsx)
          </p>
        ),
      }}
    />
  )
}
