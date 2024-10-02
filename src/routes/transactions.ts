import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { knex } from '../database'
import crypto from 'node:crypto'
import { checkIfSessionIdExists } from '../middlewares/check-if-session-id-exists'

// plugin
export async function transactionRoutes(app: FastifyInstance) {
  // GET endpoints
  // O get abaixo tem um middleware checkIfSessionIdExists
  app.get('/', { preHandler: [checkIfSessionIdExists] }, async (request) => {
    const { sessionId } = request.cookies

    const transactions = await knex('transactions')
      .where('session_id', sessionId)
      .select()

    return {
      transactions,
    }
  })

  app.get('/:id', { preHandler: [checkIfSessionIdExists] }, async (request) => {
    const getTransactionParamsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = getTransactionParamsSchema.parse(request.params)

    const { sessionId } = request.cookies

    // Busca por id, semelhante ao FirstOrDefault do .NET
    const transaction = await knex('transactions')
      .where({
        session_id: sessionId,
        id,
      })
      .first()

    return { transaction }
  })

  // GET endpoint, obtém a soma das transações
  app.get(
    '/summary',
    { preHandler: [checkIfSessionIdExists] },
    async (request) => {
      const { sessionId } = request.cookies

      const summary = await knex('transactions')
        .where('session_id', sessionId)
        .sum('amount', { as: 'amount' })
        .first()

      return summary
    },
  )

  // POST endpoint, tipado com zod
  app.post('/', async (request, reply) => {
    const createTransactionBodySchema = z.object({
      title: z.string(),
      amount: z.number(),
      type: z.enum(['credit', 'debit']),
    })

    // Desestrutura a request, tipando os valores, semelhante ao Mapper no .NET
    const { title, amount, type } = createTransactionBodySchema.parse(
      request.body,
    )

    // Busca sessionId dos cookies
    let sessionId = request.cookies.sessionId

    // Cria sessionId e salva nos cookies
    if (!sessionId) {
      sessionId = crypto.randomUUID()

      reply.cookie('sessionId', sessionId, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 dias
      })
    }

    // Salva no banco de dados, semelhante a repository/unit of work
    await knex('transactions').insert({
      id: crypto.randomUUID(),
      title,
      amount: type === 'credit' ? amount : amount * -1,
      session_id: sessionId,
    })

    return reply.status(201).send()
  })
}
