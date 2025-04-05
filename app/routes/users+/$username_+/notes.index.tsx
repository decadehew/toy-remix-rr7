import { type Info as notesInfo } from './+types/notes'
import { type Route } from './+types/notes.index'

export const meta: Route.MetaFunction = ({ params, matches }) => {
  const notesMatch = matches.find(
    (match) => match?.id === 'routes/users+/$username_+/notes',
  ) as { data: notesInfo['loaderData'] } | undefined

  const displayName = notesMatch?.data.owner.name ?? params.username
  const noteCount = notesMatch?.data.notes.length ?? 0
  const notesText = noteCount === 1 ? 'note' : 'notes'

  return [
    { title: `${displayName}'s ${noteCount} Notes | Epic Notes` },
    {
      name: 'description',
      content: `Checkout ${displayName}'s ${noteCount} ${notesText} on Epic Notes`,
    },
  ]
}
export default function NotesIndexRoute() {
  return (
    <div className="container pt-12">
      <p className="text-xl font-bold">Select a note</p>
    </div>
  )
}
