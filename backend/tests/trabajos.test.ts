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

describe("Trabajos", () => {

    test("Trabajos/Buscar", async () => {
        const res = await supertest(app.server)
            .get("/api/trabajos")
            .expect(200);

        expect(Array.isArray(res.body)).toBe(true);
    });

    test("Trabajos/Crear", async () => {
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

    test("Trabajos/Leer", async () => {
        const res = await supertest(app.server)
            .get(`/api/trabajos/${createdId}`)
            .expect(200);

        expect(res.body.id).toBe(createdId);
        expect(res.body.nombre_cliente).toBe("Test Jest");
    });

    test("Trabajos/Actualizar", async () => {
        const res = await supertest(app.server)
            .put(`/api/trabajos/${createdId}`)
            .send({ nombre_cliente: "Test Jest Actualizado" })
            .expect(200);

        expect(res.body.nombre_cliente).toBe("Test Jest Actualizado");
    });

    test("Trabajos/Eliminar", async () => {
        const res = await supertest(app.server)
            .delete(`/api/trabajos/${createdId}`)
            .expect(200);

        expect(res.body.ok).toBe(true);
    });

    test("Trabajos/Verificar eliminación", async () => {
        await supertest(app.server)
            .get(`/api/trabajos/${createdId}`)
            .expect(404);
    });
});

describe("Sistema", () => {
    test("Sistema/Health check", async () => {
        const res = await supertest(app.server)
            .get("/health")
            .expect(200);

        expect(res.body.status).toBe("ok");
    });
});
