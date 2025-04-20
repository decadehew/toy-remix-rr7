import { styleText } from 'util'
import RateLimit from '@fastify/rate-limit'
import { reactRouterFastify } from '@mcansh/remix-fastify/react-router'
import { ip as ipAddress } from 'address'
import closeWithGrace from 'close-with-grace'
import { fastify } from 'fastify'
import getPort, { portNumbers } from 'get-port'
import sourceMapSupport from 'source-map-support'

const MODE = process.env.NODE_ENV ?? 'development'
const IS_PROD = MODE === 'production'
const IS_DEV = MODE === 'development'

sourceMapSupport.install()

const app = fastify({
  // logger: true,
})

async function registerPlugins() {
  await app.register(RateLimit, {
    max: 5,
    timeWindow: '1 minute',
  })

  await app.register(reactRouterFastify)
}

await registerPlugins()

app.get(
  '/api/limited',
  {
    config: {
      rateLimit: {
        max: 2, // 最多允許2次請求
        timeWindow: '1 minute', // 時間窗口為1分鐘
      },
    },
  },
  async (request, reply) => {
    return { message: '這是限流的 API' }
  },
)

app.get('/api/unlimited', async (request, reply) => {
  return { message: '這個 API 不限流' }
})

app.get('/api/products', async (request, reply) => {
  return [
    { id: 1, name: '商品A', price: 100 },
    { id: 2, name: '商品B', price: 200 },
    { id: 3, name: '商品C', price: 300 },
  ]
})

const desiredPort = Number(process.env.PORT) || 3000
const portToUse = await getPort({
  port: portNumbers(desiredPort, desiredPort + 100),
})
const portAvailable = desiredPort === portToUse

if (!portAvailable && !IS_DEV) {
  console.log(`⚠️ Port ${desiredPort} is not available.`)
  process.exit(1)
}

app.listen({ port: portToUse, host: '0.0.0.0' }, (err, address) => {
  if (!portAvailable) {
    console.warn(
      styleText(
        'yellow',
        `⚠️  Port ${desiredPort} is not available, using ${portToUse} instead.`,
      ),
    )
  }

  console.log(`🚀  We have liftoff!`)
  const localUrl = `http://localhost:${portToUse}`
  let lanUrl: string | null = null
  const localIp = ipAddress() ?? 'Unknown'
  // Check if the address is a private ip
  // https://en.wikipedia.org/wiki/Private_network#Private_IPv4_address_spaces
  // https://github.com/facebook/create-react-app/blob/d960b9e38c062584ff6cfb1a70e1512509a966e7/packages/react-dev-utils/WebpackDevServerUtils.js#LL48C9-L54C10
  if (/^10[.]|^172[.](1[6-9]|2[0-9]|3[0-1])[.]|^192[.]168[.]/.test(localIp)) {
    lanUrl = `http://${localIp}:${portToUse}`
  }

  console.log(
    `
        ${styleText('bold', 'Local:')}            ${styleText('cyan', localUrl)}
        ${lanUrl ? `${styleText('bold', 'On Your Network:')}  ${styleText('cyan', lanUrl)}` : ''}
        ${styleText('bold', 'Press Ctrl+C to stop')}
		`.trim(),
  )
})

closeWithGrace(async ({ err }) => {
  await new Promise((resolve, reject) => {
    app.close().then(resolve).catch(reject)
  })
  if (err) {
    console.error(styleText('red', String(err)))
    console.error(styleText('red', String(err.stack)))
  }
})
