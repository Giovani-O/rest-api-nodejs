import fastify from 'fastify'

import { env } from './env'
import { transactionRoutes } from './routes/transactions'

// Inicia um server com fastify
const app = fastify()

// Aqui são definidos os plugins
// É bem semelhante ao builder.Services.Add... que é usado no .NET
app.register(transactionRoutes, {
  prefix: 'transactions',
})

// Define a porta
app
  .listen({
    port: env.PORT,
  })
  .then(() => {
    console.log('Server is running!!')
  })
