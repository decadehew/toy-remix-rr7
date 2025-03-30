import { useLoaderData } from 'react-router'
import { type Route } from './+types/notes.$noteId'
import { db } from '~/utils/db.server'
import { invariantResponse } from '~/utils/invariant'

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

export default function SomeNoteId() {
  const data = useLoaderData<typeof loader>()

  return (
    <div className="absolute inset-0 flex flex-col px-10">
      <h2 className="text-h2 mb-2 pt-12 lg:mb-6">{data.note.title}</h2>
      <div className="overflow-y-auto pb-24">
        <p className="text-sm whitespace-break-spaces md:text-lg">
          {data.note.content}
        </p>
      </div>
    </div>
  )
}
