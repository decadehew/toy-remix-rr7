import {
  Form,
  Link,
  redirect,
  useLoaderData,
  useNavigation,
} from 'react-router'
import { type Info as notesInfo } from './+types/notes'
import { type Route } from './+types/notes.$noteId'
import { floatingToolbarClassName } from '~/components/floating-toolbar'
import { Button } from '~/components/ui/button'
import { db } from '~/utils/db.server'
import { invariantResponse } from '~/utils/invariant'
import { GeneralErrorBoundary } from '~/components/error-boundary'

export const meta: Route.MetaFunction = ({ data, params, matches }) => {
  const notesMatch = matches.find(
    (match) => match?.id === 'routes/users+/$username_+/notes',
  ) as { data: notesInfo['loaderData'] } | undefined

  const displayName = notesMatch?.data.owner.name ?? params.username
  const noteTitle = data?.note.title ?? 'Note'
  const noteContentsSummary =
    data && data.note.content.length > 100
      ? data?.note.content.slice(0, 97) + '...'
      : data?.note.content

  return [
    { title: `${noteTitle} | ${displayName}'s Notes | Epic Notes` },
    {
      name: 'description',
      content: noteContentsSummary,
    },
  ]
}

export async function loader({ params }: Route.LoaderArgs) {
  const note = db.note.findFirst({
    where: {
      id: {
        equals: params.noteId,
      },
    },
  })

  invariantResponse(note, 'Note not found', { status: 404 })

  return {
    note: { title: note.title, content: note.content },
  }
}

export async function action({ request, params }: Route.ActionArgs) {
  const formData = await request.formData()
  const intent = formData.get('intent')

  invariantResponse(intent === 'delete', 'Invalid intent')

  db.note.delete({ where: { id: { equals: params.noteId } } })
  return redirect(`/users/${params.username}/notes`)
}

export default function SomeNoteId() {
  const data = useLoaderData<typeof loader>()
  const navigation = useNavigation()

  return (
    <div className="absolute inset-0 flex flex-col px-10">
      <h2 className="text-h2 mb-2 pt-12 lg:mb-6">{data.note.title}</h2>
      <div className="overflow-y-auto pb-24">
        <p className="text-sm whitespace-break-spaces md:text-lg">
          {data.note.content}
        </p>
      </div>

      <div className={floatingToolbarClassName}>
        <Form method="POST" className="flex space-x-4">
          <Button
            type="submit"
            variant="destructive"
            name="intent"
            value="delete"
            disabled={navigation.formData?.get('intent') === 'delete'}
          >
            Delete
          </Button>
          <Button asChild>
            <Link to="edit">Edit</Link>
          </Button>
        </Form>
      </div>
    </div>
  )
}

export function ErrorBoundary() {
  return (
    <GeneralErrorBoundary
      statusHandlers={{
        404: ({ params }) => (
          <p>No note with the id "{params.noteId}" exists</p>
        ),
      }}
    />
  )
}
