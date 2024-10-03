import { beforeAll, afterAll, describe, it, expect, beforeEach } from 'vitest'
import request from 'supertest'
import { execSync } from 'node:child_process'
import { app } from '../src/app'

// Cria uma categoria para os testes
describe('Transaction routes', () => {
  // Vai aguardar o app estar pronto antes de testar
  beforeAll(async () => {
    await app.ready()
  })

  // Fecha a aplicação após todos os testes
  afterAll(async () => {
    await app.close()
  })

  // Desfaz migrations e as executa novamente para cada teste
  beforeEach(() => {
    execSync('npm run knex migrate:rollback --all')
    execSync('npm run knex migrate:latest')
  })

  /**
   * Testa a criação de uma transação
   */
  it('should be able to create a new transaction', async () => {
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

  /**
   * Testa a listagem de transações
   */
  it('should be able to list all transaction', async () => {
    const createTransactionResponse = await request(app.server)
      .post('/transactions')
      .send({
        title: 'New transaction',
        amount: 5000,
        type: 'credit',
      })

    // Obtém o session id
    const cookies = createTransactionResponse.get('Set-Cookie') ?? []

    // Faz a request enviando o session id
    const listTransactionResponse = await request(app.server)
      .get('/transactions')
      .set('Cookie', cookies)
      .expect(200)

    // Valida se a response contém um objeto que faz match
    expect(listTransactionResponse.body.transactions).toEqual([
      expect.objectContaining({
        title: 'New transaction',
        amount: 5000,
      }),
    ])
  })

  /**
   * Testa a busca de uma transação
   */
  it('should be able to get a specific transaction', async () => {
    const createTransactionResponse = await request(app.server)
      .post('/transactions')
      .send({
        title: 'New transaction',
        amount: 5000,
        type: 'credit',
      })

    // Obtém o session id
    const cookies = createTransactionResponse.get('Set-Cookie') ?? []

    // Faz a request enviando o session id
    const listTransactionResponse = await request(app.server)
      .get('/transactions')
      .set('Cookie', cookies)
      .expect(200)

    // Obtém id da session
    const transactionId = listTransactionResponse.body.transactions[0].id

    // Faz a request através do session id
    const getTransactionResponse = await request(app.server)
      .get(`/transactions/${transactionId}`)
      .set('Cookie', cookies)
      .expect(200)

    // Valida se a response está correta
    expect(getTransactionResponse.body.transaction).toEqual(
      expect.objectContaining({
        title: 'New transaction',
        amount: 5000,
      }),
    )
  })

  /**
   * Testa a o resumo de transações
   */
  it('should be able to get the summary', async () => {
    const createTransactionResponse = await request(app.server)
      .post('/transactions')
      .send({
        title: 'New transaction',
        amount: 5000,
        type: 'credit',
      })

    // Obtém o session id
    const cookies = createTransactionResponse.get('Set-Cookie') ?? []

    await request(app.server)
      .post('/transactions')
      .set('Cookie', cookies)
      .send({
        title: 'Debit transaction',
        amount: 2000,
        type: 'debit',
      })

    // Faz a request enviando o session id
    const summaryResponse = await request(app.server)
      .get('/transactions/summary')
      .set('Cookie', cookies)
      .expect(200)

    // Valida se a response contém um objeto que faz match
    expect(summaryResponse.body.amount).toEqual(3000)
  })
})
