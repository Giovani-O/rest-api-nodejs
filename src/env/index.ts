import 'dotenv/config'
import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('production'),
  DATABASE_URL: z.string(),
  PORT: z.number().default(3333),
})

/**
 * Cuida da validação e tratativa de erros para as variáveis de ambiente
 */
const _env = envSchema.safeParse(process.env)

if (_env.success === false) {
  console.error('Variáveis de ambiente inválidas', _env.error.format())

  throw new Error('Variáveis de ambiente inválidas')
}

export const env = _env.data
