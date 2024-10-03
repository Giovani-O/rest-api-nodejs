import { test, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import { app } from '../src/app'

// Vai aguardar o app estar pronto antes de testar
beforeAll(async () => {
  await app.ready()
})

// Fecha a aplicação após todos os testes
afterAll(async () => {
  await app.close()
})

test('User can create a new transaction', async () => {
  // request vem de supertest e simula um servidor http
  // post e send fazem a requisição (POST com corpo)
  // expect faz a validação do código retornado
  await request(app.server)
    .post('/transactions')
    .send({
      title: 'New transaction',
      amount: 5000,
      type: 'credit',
    })
    .expect(201)
})
