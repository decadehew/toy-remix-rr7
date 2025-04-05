import { LucideBan } from 'lucide-react'
import { Link, useLocation } from 'react-router'
import { GeneralErrorBoundary } from '~/components/error-boundary'

/**
 * Splat route
 * loader 和 action 用意
 * 只要未定義路由或沒有匹配路由，將會到 $ 的路由都會直接吐 404
 */
export async function loader() {
  throw new Response('Not Found', { status: 404 })
}

export async function action() {
  throw new Response('Not Found', { status: 404 })
}

export default function NotFound() {
  return <ErrorBoundary />
}

export function ErrorBoundary() {
  const location = useLocation()
  return (
    <GeneralErrorBoundary
      statusHandlers={{
        404: () => (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <h1>We can't find this page:</h1>
              <pre className="text-body-lg break-all whitespace-pre-wrap">
                {location.pathname}
              </pre>
            </div>
            <Link to="/" className="text-lg underline">
              <LucideBan className="inline h-16 w-16" /> 回去吧！！！
            </Link>
          </div>
        ),
      }}
    />
  )
}
