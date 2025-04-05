import {
  isRouteErrorResponse,
  Link,
  useLoaderData,
  useParams,
  useRouteError,
} from 'react-router'
import { type Route } from './+types/$username'

import { db } from '~/utils/db.server'
import { invariantResponse } from '~/utils/invariant'
import { GeneralErrorBoundary } from '~/components/error-boundary'

export const meta: Route.MetaFunction = ({ data, params }) => {
  const displayName = data?.user.name ?? params.username
  return [
    { title: `${displayName} | Epic Notes` },
    {
      name: 'description',
      content: `Profile of ${displayName} on Epic Notes`,
    },
  ]
}

export async function loader({ params }: Route.LoaderArgs) {
  // throw new Error('This is a test error')
  const user = await db.user.findFirst({
    where: {
      username: {
        equals: params.username,
      },
    },
  })

  invariantResponse(user, 'User not found', { status: 404 })

  console.log('user', user)
  return {
    user: {
      name: user.name,
      username: user.username,
    },
  }
}

export default function DecadeProfileRoute() {
  const data = useLoaderData<typeof loader>()

  return (
    <div className="container mx-auto mt-36 mb-48 border-4 border-green-500">
      <h1 className="text-h1">{data.user.name ?? data.user.username}</h1>
      <Link to="notes" className="underline">
        Notes
      </Link>
    </div>
  )
}

export function ErrorBoundary() {
  return (
    <GeneralErrorBoundary
      statusHandlers={{
        404: ({ params }) => (
          <p>No user with the username "{params.username}" exists</p>
        ),
      }}
    />
  )
}
