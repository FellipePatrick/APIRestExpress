const request = require('supertest');
const app = require('./app');

describe('Testando a API de animals', () => {
    test("Testar se lista de animais começa vazia", async () => {
        const res = await request(app).get('/animals');
        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual([]);
    });

    test("Adicionar um novo animal", async () => {
        const newAnimal = { name: 'Leão', species: 'Panthera leo' };
        const res = await request(app).post('/animals').send(newAnimal);
        expect(res.statusCode).toEqual(201);
        expect(res.body).toMatchObject(newAnimal);
    });

    test("Verificar se o novo animal foi adicionado", async () => {
        const res = await request(app).get('/animals');
        expect(res.statusCode).toEqual(200);
        expect(res.body.length).toBe(1);
        expect(res.body[0].name).toBe('Leão');
        expect(res.body[0].species).toBe('Panthera leo');
    });

    test("Atualizar um animal existente", async () => {
        const updatedAnimal = { name: 'Leão Africano', species: 'Panthera leo' };
        const res = await request(app).put('/animals/1').send(updatedAnimal);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toMatchObject(updatedAnimal);
    });

    test("Verificar se o animal foi atualizado", async () => {
        const res = await request(app).get('/animals');
        expect(res.statusCode).toEqual(200);
        expect(res.body.length).toBe(1);
        expect(res.body[0].name).toBe('Leão Africano');
        expect(res.body[0].species).toBe('Panthera leo');
    });

    test("Excluir um animal", async () => {
        const res = await request(app).delete('/animals/1');
        expect(res.statusCode).toEqual(204);
    });

    test("Verificar se a lista de animais está vazia após a exclusão", async () => {
        const res = await request(app).get('/animals');
        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual([]);
    });
});
