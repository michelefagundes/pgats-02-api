// Bibliotecas
const request = require('supertest');
const { expect } = require('chai');

// Testes
describe('Transfer', () => {
    describe('POST /transfers', () => {
        beforeEach(async () => {
            const respostaLogin = await request('http://localhost:3000')
                .post('/users/login')
                .send({
                    username: 'julio',
                    password: '123456'
                });

            token = respostaLogin.body.token;
        });

        it('Quando informo remetente e destinatario inexistentes recebo 400', async () => {
            const resposta = await request('http://localhost:3000')
                .post('/transfers')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    from: "julio",
                    to: "isabelle",
                    value: 100
                });
            
            expect(resposta.status).to.equal(400);
            expect(resposta.body).to.have.property('error', 'Usuário remetente ou destinatário não encontrado')
        });

        it('Usando Mocks: Quando informo remetente e destinatario inexistentes recebo 400', async () => {
            const resposta = await request("http://localhost:3000")
                .post('/transfers')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    from: "jose",
                    to: "isabelle",
                    value: 100
                });
            
            expect(resposta.status).to.equal(400);
            expect(resposta.body).to.have.property('error', 'Usuário remetente ou destinatário não encontrado');
        });

        it('Usando Mocks: Quando informo valores válidos eu tenho sucesso com 201 CREATED', async () => {
            const resposta = await request('http://localhost:3000')
                .post('/transfers')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    from: "julio",
                    to: "priscila",
                    value: 100
                });

            expect(resposta.status).to.equal(201);
            
            // Validação com um Fixture
            const respostaEsperada = require('../fixture/respostas/quandoInformoValoresValidosEuTenhoSucessoCom201Created.json')
            delete resposta.body.date;
            delete respostaEsperada.date; 
            expect(resposta.body).to.deep.equal(respostaEsperada);
        });

        it('Transferência com sucesso', async () => {
            const resposta = await request('http://localhost:3000')
                .post('/transfers')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    from: "julio",
                    to: "priscila",
                    value: 50
                });

            expect(resposta.status).to.equal(201);
            expect(resposta.body).to.have.property('from', 'julio');
            expect(resposta.body).to.have.property('to', 'priscila');
            expect(resposta.body).to.have.property('value', 50);
        });

        it('Sem saldo disponível para transferência', async () => {
            const resposta = await request('http://localhost:3000')
                .post('/transfers')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    from: "julio",
                    to: "priscila",
                    value: 85000000000
                });
            
            expect(resposta.status).to.equal(400);
            expect(resposta.body).to.have.property('error', 'Saldo insuficiente');
        });

        it('Token de autenticação não informado', async () => {
            const resposta = await request('http://localhost:3000')
                .post('/transfers')
                .send({
                    from: "julio",
                    to: "priscila",
                    value: 50
                });
            
            expect(resposta.status).to.equal(401);
            expect(resposta.body).to.have.property('message', 'Token não fornecido.');
        });
    });
});