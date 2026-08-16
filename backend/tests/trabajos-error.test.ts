import { buildApp } from "../src/app";
import { FastifyInstance } from "fastify";
import supertest from "supertest";

let app: FastifyInstance;

beforeAll(async () => {
    app = await buildApp();
    await app.ready();
});

afterAll(async () => {
    await app.close();
});

describe("Trabajos", () => {
    test("Trabajos/CrearConError", async () => {
        const res = await supertest(app.server)
            .post("/api/trabajos/crear-con-error")
            .send({
                sitio_web: "no-es-url",
                porcentaje: 50,
            });

        if (res.status !== 200) {
            const b = res.body ?? {};
            const parts: string[] = [b.error ?? `HTTP ${res.status}: ${res.text}`];
            if (b.archivo) parts.push(`archivo: ${b.archivo}`);
            if (b.linea)   parts.push(`linea: ${b.linea}`);
            throw new Error(parts.join(" | "));
        }

        expect(res.body).toHaveProperty("id");
    });
});
