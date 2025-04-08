import fs from 'node:fs'
import { PassThrough } from 'node:stream'
// import { getImgResponse } from 'openimg/node'
// import { createReadableStreamFromReadable } from 'react-router'
import { type Route } from './+types/images.$imageId'
import { db } from '~/utils/db.server'
import { invariantResponse } from '~/utils/invariant'

export async function loader({ params }: Route.LoaderArgs) {
  invariantResponse(params.imageId, 'Invalid image ID')
  const image = db.image.findFirst({
    where: { id: { equals: params.imageId } },
  })
  invariantResponse(image, 'Image not found', { status: 404 })

  const { filepath, contentType } = image
  const fileStat = await fs.promises.stat(filepath)

  // 創建一個 ReadableStream
  const readableStream = new ReadableStream({
    start(controller) {
      // 創建檔案讀取流
      const stream = fs.createReadStream(filepath)

      // 設置流的事件處理
      stream.on('data', (chunk) => {
        // 將每個數據塊加入 ReadableStream
        controller.enqueue(chunk)
      })

      stream.on('error', (err) => {
        console.error('Stream error:', err)
        controller.error(err)
      })

      stream.on('end', () => {
        // 完成時關閉流
        controller.close()
      })
    },
  })

  return new Response(readableStream, {
    status: 200,
    headers: {
      'content-type': contentType,
      'content-length': fileStat.size.toString(),
      'content-disposition': `inline; filename="${params.imageId}"`,
      'cache-control': 'public, max-age=31536000, immutable',
    },
  })
}
