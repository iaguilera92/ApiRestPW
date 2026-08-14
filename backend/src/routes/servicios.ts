import { FastifyInstance } from "fastify";
import { supabase } from "../lib/supabase";

export async function serviciosRoutes(app: FastifyInstance) {
    app.get("/api/servicios", {
        schema: {
            tags: ["Plataformas Web"],
            summary: "Listar todos los servicios",
            response: {
                200: {
                    type: "array",
                    items: { type: "object", additionalProperties: true },
                },
                500: {
                    type: "object",
                    properties: { error: { type: "string" } },
                },
            },
        },
    }, async (_req, reply) => {
        const { data, error } = await supabase.from("servicios").select("*");

        if (error) {
            app.log.error(error);
            return reply.code(500).send({ error: error.message });
        }

        return data;
    });
}
