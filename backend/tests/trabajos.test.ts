import { buildApp } from "../src/app";
import { FastifyInstance } from "fastify";
import supertest from "supertest";

let app: FastifyInstance;
let createdId: number;

beforeAll(async () => {
    app = await buildApp();
    await app.ready();
});

afterAll(async () => {
    await app.close();
});

describe("CRUD /api/trabajos", () => {

    test("GET /api/trabajos — Listar todos", async () => {
        const res = await supertest(app.server)
            .get("/api/trabajos")
            .expect(200);

        expect(Array.isArray(res.body)).toBe(true);
    });

    test("POST /api/trabajos — Crear trabajo de prueba", async () => {
        const res = await supertest(app.server)
            .post("/api/trabajos")
            .send({
                sitio_web: "https://test-jest.cl",
                nombre_cliente: "Test Jest",
                email_cliente: "test@jest.cl",
                telefono_cliente: "+56900000000",
                origen: "jest",
            })
            .expect(201);

        expect(res.body).toHaveProperty("id");
        expect(res.body.sitio_web).toBe("https://test-jest.cl");
        expect(res.body.ocultar).toBe(true);
        createdId = res.body.id;
    });

    test("GET /api/trabajos/:id — Obtener por ID", async () => {
        const res = await supertest(app.server)
            .get(`/api/trabajos/${createdId}`)
            .expect(200);

        expect(res.body.id).toBe(createdId);
        expect(res.body.nombre_cliente).toBe("Test Jest");
    });

    test("PUT /api/trabajos/:id — Actualizar trabajo", async () => {
        const res = await supertest(app.server)
            .put(`/api/trabajos/${createdId}`)
            .send({ nombre_cliente: "Test Jest Actualizado" })
            .expect(200);

        expect(res.body.nombre_cliente).toBe("Test Jest Actualizado");
    });

    test("DELETE /api/trabajos/:id — Eliminar trabajo", async () => {
        const res = await supertest(app.server)
            .delete(`/api/trabajos/${createdId}`)
            .expect(200);

        expect(res.body.ok).toBe(true);
    });

    test("GET /api/trabajos/:id — 404 después de eliminar", async () => {
        await supertest(app.server)
            .get(`/api/trabajos/${createdId}`)
            .expect(404);
    });
});

describe("GET /health", () => {
    test("Retorna status ok", async () => {
        const res = await supertest(app.server)
            .get("/health")
            .expect(200);

        expect(res.body.status).toBe("ok");
    });
});
