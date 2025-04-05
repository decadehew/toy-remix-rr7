import { useEffect } from 'react'
import {
  isRouteErrorResponse,
  useParams,
  useRouteError,
  type ErrorResponse,
} from 'react-router'
import { getErrorMessage } from '~/utils/misc'

/**
 * 解釋 statusHandler
 * 接受 info 對象作為參數，分別有 error 和 params 屬性
 * 返回 是一個 jsx 元素
 *
 * 這個函數的作用是根據不同的狀態碼來渲染不同的錯誤信息
 */
type StatusHandler = (info: {
  error: ErrorResponse
  params: Record<string, string | undefined>
}) => React.ReactNode

interface GeneralErrorBoundaryProps {
  defaultStatusHandler?: StatusHandler
  statusHandlers?: Record<number, StatusHandler>
  unexpectedErrorHandler?: (error: unknown) => React.ReactNode
}

export function GeneralErrorBoundary({
  defaultStatusHandler = ({ error }) => (
    <p>
      {error.status} {error.data}
    </p>
  ),
  statusHandlers,
  unexpectedErrorHandler = (error) => <p>{getErrorMessage(error)}</p>,
}: GeneralErrorBoundaryProps) {
  const params = useParams()

  const error = useRouteError()
  const isResponse = isRouteErrorResponse(error)

  if (typeof document !== 'undefined') {
    console.error(error)
  }

  useEffect(() => {
    if (isResponse) return
  }, [error, isResponse])

  return (
    <div className="text-h2 container flex items-center justify-center p-20 font-bold text-red-600">
      {isResponse
        ? (statusHandlers?.[error.status] ?? defaultStatusHandler)({
            error,
            params,
          })
        : unexpectedErrorHandler(error)}
    </div>
  )
}
