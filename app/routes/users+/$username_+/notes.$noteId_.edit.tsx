import {
  getFormProps,
  getInputProps,
  getTextareaProps,
  useForm,
  type FieldMetadata,
  getFieldsetProps,
} from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { parseFormData } from '@mjackson/form-data-parser'
import { DiamondPlus, OctagonX } from 'lucide-react'
import { useState } from 'react'
import {
  data,
  Form,
  redirect,
  useActionData,
  useLoaderData,
} from 'react-router'
import { z } from 'zod'
import { type Route } from './+types/notes.$noteId_.edit'
import { GeneralErrorBoundary } from '~/components/error-boundary'
import { floatingToolbarClassName } from '~/components/floating-toolbar'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { StatusButton } from '~/components/ui/status-button'
import { Textarea } from '~/components/ui/textarea'
import { cn } from '~/lib/utils'
import { db, updateNote } from '~/utils/db.server'
import { invariantResponse } from '~/utils/invariant'
import { useIsPending } from '~/utils/misc'

const titleMinLength = 1
const titleMaxLength = 100
const contentMinLength = 1
const contentMaxLength = 10000

export const MAX_UPLOAD_SIZE = 1024 * 1024 * 3 // 3MB

const ImageFieldsetSchema = z.object({
  id: z.string().optional(),
  file: z
    .instanceof(File)
    .optional()
    .refine((file) => {
      return !file || file.size <= MAX_UPLOAD_SIZE
    }, 'File size must be less than 3MB'),
  altText: z.string().optional(),
})

export type ImageFieldset = z.infer<typeof ImageFieldsetSchema>

const NoteEditorSchema = z.object({
  title: z.string().min(titleMinLength).max(titleMaxLength),
  content: z.string().min(contentMinLength).max(contentMaxLength),
  images: z.array(ImageFieldsetSchema),
})

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
      images: note.images.map((image) => ({
        id: image.id,
        altText: image.altText,
      })),
    },
  }
}

export async function action({ request, params }: Route.ActionArgs) {
  invariantResponse(params.noteId, 'noteId param is required')

  // request.formData()
  const formData = await parseFormData(request, {
    maxFileSize: MAX_UPLOAD_SIZE,
  })
  const submission = parseWithZod(formData, {
    schema: NoteEditorSchema,
  })

  console.log('submission', submission)

  // server side
  if (submission.status !== 'success') {
    console.log('我是 server-side')
    // rr 提供 data()，其實是 Response.json({ result: submission.reply() }, { status: 400 })
    return data(
      {
        result: submission.reply({
          formErrors: ['Failed to send the message. Please try again later.'],
        }),
      },
      { status: submission.status === 'error' ? 400 : 200 },
    )
  }

  const { title, content, images } = submission.value

  await updateNote({
    id: params.noteId,
    title,
    content,
    images,
  })

  return redirect(`/users/${params.username}/notes/${params.noteId}`)
}

function ErrorList({
  id,
  errors,
}: {
  id?: string
  errors?: Array<string> | null
}) {
  return errors?.length ? (
    <ul id={id} className="flex flex-col gap-1">
      {errors.map((error, i) => (
        <li key={i} className="text-[10px] text-red-500">
          {error}
        </li>
      ))}
    </ul>
  ) : null
}

function ImageChooser({ meta }: { meta: FieldMetadata<ImageFieldset> }) {
  const fields = meta.getFieldset()
  const existingImage = Boolean(fields.id.initialValue)
  const [previewImage, setPreviewImage] = useState<string | null>(
    existingImage ? `/resources/images/${fields.id.initialValue}` : null,
  )
  const [altText, setAltText] = useState(fields.altText.initialValue ?? '')
  const { key: fileKey, ...fileProps } = getInputProps(fields.file, {
    type: 'file',
  })
  const { key: altTextKey, ...altTextProps } = getTextareaProps(fields.altText)
  const { key: idKey, ...idProps } = getInputProps(fields.id, {
    type: 'hidden',
  })

  return (
    <fieldset {...getFieldsetProps(meta)}>
      <div className="flex gap-3">
        <div className="w-32">
          <div className="relative h-32 w-32">
            <label
              htmlFor={fields.file.id}
              className={cn('group absolute h-32 w-32 rounded-lg', {
                'bg-accent opacity-40 focus-within:opacity-100 hover:opacity-100':
                  !previewImage,
                'cursor-pointer focus-within:ring-4': !existingImage,
              })}
            >
              {previewImage ? (
                <div className="relative">
                  <img
                    src={previewImage}
                    alt={altText ?? ''}
                    className="h-32 w-32 rounded-lg object-cover"
                  />
                  {existingImage ? null : (
                    <div className="bg-secondary text-secondary-foreground pointer-events-none absolute -top-0.5 -right-0.5 rotate-12 rounded-sm px-2 py-1 text-xs shadow-md">
                      new
                    </div>
                  )}
                </div>
              ) : (
                <div className="border-muted-foreground text-muted-foreground flex h-32 w-32 items-center justify-center rounded-lg border text-4xl">
                  ➕
                </div>
              )}
              {existingImage ? (
                // 針對已存在圖片，取id，server 會進行圖片替換
                <input {...idProps} key={idKey} />
              ) : null}
              <input
                aria-label="Image"
                className="absolute top-0 left-0 z-0 h-32 w-32 cursor-pointer opacity-0"
                onChange={(event) => {
                  // 實現前端 render 圖片
                  const file = event.target.files?.[0]

                  if (file) {
                    const reader = new FileReader()
                    reader.onloadend = () => {
                      // base64
                      setPreviewImage(reader.result as string)
                    }
                    reader.readAsDataURL(file)
                  } else {
                    setPreviewImage(null)
                  }
                }}
                accept="image/*"
                key={fileKey}
                {...fileProps}
              />
            </label>
          </div>
        </div>
        <div className="flex-1 space-y-2">
          <Label htmlFor={fields.altText.id}>Alt Text</Label>
          <Textarea
            className="bg-background"
            onChange={(e) => setAltText(e.currentTarget.value)}
            key={altTextKey}
            {...altTextProps}
          />
        </div>
      </div>
    </fieldset>
  )
}

export default function NoteEdit() {
  const data = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()
  const isPending = useIsPending()

  // console.log('actionData', actionData)
  const [form, fields] = useForm({
    id: 'note-edit',
    constraint: getZodConstraint(NoteEditorSchema),
    defaultValue: {
      title: data.note.title,
      content: data.note.content,
      images: data.note.images.length ? data.note.images : [{}],
    },
    // 當 status === error，會吃 submission.reply()。詳細更多可以 hover 查看 type(TS)
    lastResult: actionData?.result,
    // client side
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: NoteEditorSchema })
    },
    shouldValidate: 'onBlur',
  })

  const imageList = fields.images.getFieldList()

  return (
    <div className="absolute inset-0">
      <Form
        method="POST"
        {...getFormProps(form)}
        className="flex h-full flex-col gap-y-4 overflow-x-hidden px-10 pt-12 pb-28"
        encType="multipart/form-data"
      >
        {/*
					This hidden submit button is here to ensure that when the user hits
					"enter" on an input field, the primary form function is submitted
					rather than the first button in the form (which is delete/add image).
				*/}
        <button type="submit" className="hidden" />
        <div className="flex flex-col gap-2">
          <div className="space-y-2">
            <Label htmlFor={fields.title.id}>Title</Label>
            <Input
              {...getInputProps(fields.title, { type: 'text' })}
              className="bg-background h-10"
              autoFocus
            />
            <div className="min-h-[32px] px-4 pt-1 pb-3">
              <ErrorList id={fields.title.id} errors={fields.title.errors} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor={fields.content.id}>Content</Label>
            <Textarea
              className="bg-background h-10"
              {...getTextareaProps(fields.content)}
            />
            <div className="min-h-[32px] px-4 pt-1 pb-3">
              <ErrorList
                id={fields.content.errorId}
                errors={fields.content.errors}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Images</Label>
            <ul className="flex flex-col gap-4">
              {imageList.map((image, index) => (
                <li key={image.key} className="relative">
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute -top-4 right-0"
                    {...form.remove.getButtonProps({
                      name: fields.images.name,
                      index,
                    })}
                  >
                    <OctagonX className="h-5 w-5" />
                    <span className="sr-only">Remove image {index + 1}</span>
                  </Button>
                  <ImageChooser meta={image} />
                </li>
              ))}
            </ul>
          </div>
          <Button
            className="mt-3"
            {...form.insert.getButtonProps({
              name: fields.images.name,
              defaultValue: {},
            })}
          >
            <DiamondPlus className="h-5 w-5" /> Add Image
            <span className="sr-only">Add image</span>
          </Button>
        </div>
      </Form>
      <div className={floatingToolbarClassName}>
        <Button form={form.id} variant="destructive" type="reset">
          Reset
        </Button>
        <StatusButton
          form={form.id}
          type="submit"
          disabled={isPending}
          status={isPending ? 'pending' : 'idle'}
        >
          Submit
        </StatusButton>
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
