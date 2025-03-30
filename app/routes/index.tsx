export default function Index() {
  return (
    <div className="container mx-auto text-center">
      <h1 className="text-h1 my-8">Epic Notes</h1>
      <p>
        <span className="bg-muted text-body-lg text-muted-foreground inline-flex items-center justify-center gap-2 rounded-xl px-8 py-4">
          <span>Built with the Epic Stack</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="inline h-6 w-6"
            fill="none"
            viewBox="0 0 65 65"
          >
            <path
              fill="currentColor"
              d="M39.445 25.555 37 17.163 65 0 47.821 28l-8.376-2.445Zm-13.89 0L28 17.163 0 0l17.179 28 8.376-2.445Zm13.89 13.89L37 47.837 65 65 47.821 37l-8.376 2.445Zm-13.89 0L28 47.837 0 65l17.179-28 8.376 2.445Z"
            />
          </svg>
        </span>
      </p>
    </div>
  )
}
