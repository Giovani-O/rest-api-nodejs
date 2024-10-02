import fastify from 'fastify'

// Inicia um server com fastify
const app = fastify()

// Cria um endpoint
app.get('/hello', () => {
  return 'Hello World'
})

// Define a porta
app
  .listen({
    port: 3333,
  })
  .then(() => {
    console.log('Server is running!!')
  })
