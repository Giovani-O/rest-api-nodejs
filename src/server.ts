import fastify from 'fastify'
import { knex } from './database'
import { env } from './env'

// Inicia um server com fastify
const app = fastify()

// Cria um endpoint
app.get('/hello', async () => {
  const transactions = await knex('transactions').select('*')

  return transactions
})

// Define a porta
app
  .listen({
    port: env.PORT,
  })
  .then(() => {
    console.log('Server is running!!')
  })
