import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { knex } from '../database'
import crypto from 'node:crypto'

// plugin
export async function transactionRoutes(app: FastifyInstance) {
  // GET endpoints
  app.get('/', async () => {
    const transactions = await knex('transactions').select()

    return {
      transactions,
    }
  })

  app.get('/:id', async (request) => {
    const getTransactionParamsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = getTransactionParamsSchema.parse(request.params)

    // Busca por id, semelhante ao FirstOrDefault do .NET
    const transaction = await knex('transactions').where('id', id).first()

    return { transaction }
  })

  // GET endpoint, obtém a soma das transações
  app.get('/summary', async () => {
    const summary = await knex('transactions')
      .sum('amount', { as: 'amount' })
      .first()

    return summary
  })

  // POST endpoint, tipado com zod
  app.post('/', async (request, response) => {
    const createTransactionBodySchema = z.object({
      title: z.string(),
      amount: z.number(),
      type: z.enum(['credit', 'debit']),
    })

    // Desestrutura a request, tipando os valores, semelhante ao Mapper no .NET
    const { title, amount, type } = createTransactionBodySchema.parse(
      request.body,
    )

    // Salva no banco de dados, semelhante a repository/unit of work
    await knex('transactions').insert({
      id: crypto.randomUUID(),
      title,
      amount: type === 'credit' ? amount : amount * -1,
    })

    return response.status(201).send()
  })
}
