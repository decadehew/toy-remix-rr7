import { z } from 'zod'

const schema = z.object({
  NODE_ENV: z.enum(['production', 'development', 'test'] as const),
})

declare global {
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof schema> {}
  }
}

export function init() {
  const parsed = schema.safeParse(process.env)

  if (parsed.success === false) {
    console.error(
      '❌ Invalid environment variables:',
      parsed.error.flatten().fieldErrors,
    )

    throw new Error('Invalid environment variables')
  }
}

/**
 * This is used in both `entry.server.ts` and `root.tsx` to ensure that
 * the environment variables are set and globally available before the app is
 * started.
 *
 * NOTE: Do *not* add any environment variables in here that you do not wish to
 * be included in the client.
 * @returns all public ENV variables
 */

export function getEnv() {
  return {
    MODE: process.env.NODE_ENV,
    SENTRY_DSN: process.env.SENTRY_DSN,
    ALLOW_INDEXING: process.env.ALLOW_INDEXING,
  }
}

type ENV = ReturnType<typeof getEnv>

/**
 * 只是在告訴 TypeScript：「在全局作用域中會有一個名為 ENV 的變量，其類型為 ENV」
 * 只是在告訴 TypeScript：「全局命名空間中的 window 介面應該包含一個名為 ENV 的屬性，其類型為 ENV」
 */
declare global {
  // 針對 Node.js 環境
  // eslint-disable-next-line no-var
  var ENV: ENV
  // 針對 browser 環境
  interface window {
    ENV: ENV
  }
}
