import supertest from "supertest";
import { prisma } from "../src/database";
import app from "../src/app";

beforeAll(async () => {
  await prisma.$executeRaw`TRUNCATE TABLE items`;
});

describe("Testa POST /items ", () => {
  it("Deve retornar 201, se cadastrado um item no formato correto", async () => {
    const item = {
      title: "Title Example",
      url: "http://example.com",
      description: "Description example",
      amount: 3000,
    };
    const result = await supertest(app).post("/items").send(item);
    expect(result.status).toEqual(201);
  });
  it("Deve retornar 409, ao tentar cadastrar um item que exista", async () => {
    const item = {
      title: "Title Example",
      url: "http://example.com",
      description: "Description example",
      amount: 3000,
    };
    const result = await supertest(app).post("/items").send(item);
    expect(result.status).toEqual(409);
  });
});

describe("Testa GET /items ", () => {
  it("Deve retornar status 200 e o body no formato de Array", async () => {
    const result = await supertest(app).get("/items");
    expect(result.status).toEqual(200);
    expect(result.body).toBeInstanceOf(Array);
  });
});

describe("Testa GET /items/:id ", () => {
  it("Deve retornar status 200 e um objeto igual a o item cadastrado", async () => {
    const item = {
      title: "Title Example",
      url: "http://example.com",
      description: "Description example",
      amount: 3000,
    };
    await supertest(app).post("/items").send(item);

    const newItem = await prisma.items.findUnique({
      where: { title: item.title },
    });
    const result = await supertest(app).get(`/items/${newItem.id}`);
    delete result.body.id;
    expect(result.status).toEqual(200);
    expect(item).toEqual(expect.objectContaining(result.body));
  });
  it("Deve retornar status 404 caso não exista um item com esse id", async () => {
    const result = await supertest(app).get("/items/0");
    expect(result.status).toEqual(404);
  });
});

afterAll(async () => {
  await prisma.$executeRaw`TRUNCATE TABLE items`;
  await prisma.$disconnect;
});
