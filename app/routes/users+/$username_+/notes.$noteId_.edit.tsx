import {
  Form,
  redirect,
  useFormAction,
  useLoaderData,
  useNavigation,
} from 'react-router'
import { type Route } from './+types/notes.$noteId_.edit'
import { floatingToolbarClassName } from '~/components/floating-toolbar'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { StatusButton } from '~/components/ui/status-button'
import { db } from '~/utils/db.server'
import { invariantResponse } from '~/utils/invariant'
import { useIsPending } from '~/utils/misc'
import { GeneralErrorBoundary } from '~/components/error-boundary'

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
    note: {
      title: note.title,
      content: note.content,
    },
  }
}

export async function action({ request, params }: Route.ActionArgs) {
  const formData = await request.formData()
  const title = formData.get('title')
  const content = formData.get('content')

  invariantResponse(typeof title === 'string', 'title must be a string')
  invariantResponse(typeof content === 'string', 'content must be a string')

  db.note.update({
    where: { id: { equals: params.noteId } },
    data: { title, content },
  })

  return redirect(`/users/${params.username}/notes/${params.noteId}`)
}

export default function NoteEdit() {
  const data = useLoaderData<typeof loader>()
  const isPending = useIsPending()

  return (
    <Form
      method="POST"
      className="flex h-full flex-col gap-y-4 overflow-x-hidden px-10 pt-12 pb-28"
    >
      <div className="flex flex-col gap-2">
        <div>
          <Label>Title</Label>
          <Input
            name="title"
            defaultValue={data.note.title}
            className="bg-background h-10"
          />
        </div>
        <div>
          <Label>Content</Label>
          <Input
            name="content"
            defaultValue={data.note.content}
            className="bg-background h-10"
          />
        </div>
      </div>
      <div className={floatingToolbarClassName}>
        <Button variant="destructive" type="reset">
          Reset
        </Button>
        <StatusButton
          type="submit"
          disabled={isPending}
          status={isPending ? 'pending' : 'idle'}
        >
          Submit
        </StatusButton>
      </div>
    </Form>
  )
}

// export function ErrorBoundary() {
//   return (
//     <GeneralErrorBoundary
//       statusHandlers={{
//         404: ({ params }) => (
//           <p>No note with the id "{params.noteId}" exists</p>
//         ),
//       }}
//     />
//   )
// }
