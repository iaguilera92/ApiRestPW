import { FastifyInstance } from "fastify";
import { supabase } from "../lib/supabase";

export async function pruebasQasRoutes(app: FastifyInstance) {

    app.post("/api/pruebas-qas", {
        schema: {
            tags: ["Pruebas Automatizadas"],
            summary: "Registrar resultado de pruebas QAS",
            body: {
                type: "object",
                required: ["pipeline_id", "estado", "total_tests", "tests_passed", "tests_failed"],
                properties: {
                    pipeline_id: { type: "string" },
                    estado: { type: "string" },
                    total_tests: { type: "integer" },
                    tests_passed: { type: "integer" },
                    tests_failed: { type: "integer" },
                    duracion_ms: { type: "integer" },
                    detalle: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                nombre: { type: "string" },
                                estado: { type: "string" },
                                duracion_ms: { type: "number" },
                                error: { type: "string" },
                            },
                        },
                    },
                    origen: { type: "string" },
                },
            },
            response: {
                201: { type: "object", additionalProperties: true },
                500: { type: "object", properties: { error: { type: "string" } } },
            },
        },
    }, async (req: any, reply) => {
        const { data, error } = await supabase
            .from("pruebas_qas")
            .insert(req.body)
            .select()
            .single();

        if (error) {
            app.log.error(error);
            return reply.code(500).send({ error: error.message });
        }
        return reply.code(201).send(data);
    });

    app.get("/api/pruebas-qas", {
        schema: {
            tags: ["Pruebas Automatizadas"],
            summary: "Historial de pruebas QAS (últimas 10)",
            response: {
                200: { type: "array", items: { type: "object", additionalProperties: true } },
                500: { type: "object", properties: { error: { type: "string" } } },
            },
        },
    }, async (_req, reply) => {
        const { data, error } = await supabase
            .from("pruebas_qas")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(10);

        if (error) {
            app.log.error(error);
            return reply.code(500).send({ error: error.message });
        }
        return data;
    });

    app.get("/api/pruebas-qas/ultimo", {
        schema: {
            tags: ["Pruebas Automatizadas"],
            summary: "Última ejecución de pruebas QAS",
            response: {
                200: { type: "object", additionalProperties: true },
                404: { type: "object", properties: { error: { type: "string" } } },
                500: { type: "object", properties: { error: { type: "string" } } },
            },
        },
    }, async (_req, reply) => {
        const { data, error } = await supabase
            .from("pruebas_qas")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

        if (error) {
            if (error.code === "PGRST116") {
                return reply.code(404).send({ error: "No hay pruebas registradas" });
            }
            app.log.error(error);
            return reply.code(500).send({ error: error.message });
        }
        return data;
    });
}
