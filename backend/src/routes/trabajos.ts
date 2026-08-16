import { FastifyInstance } from "fastify";
import { supabase } from "../lib/supabase";

export async function trabajosRoutes(app: FastifyInstance) {

    // 1. Listar todos los trabajos
    app.get("/api/trabajos", {
        schema: {
            tags: ["Trabajos"],
            operationId: "Buscar",
            summary: "Trabajos/Buscar",
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
        const { data, error } = await supabase
            .from("trabajos")
            .select("*")
            .order("id", { ascending: true });

        if (error) {
            app.log.error(error);
            return reply.code(500).send({ error: error.message });
        }
        return data;
    });

    // 2. Obtener un trabajo por id
    app.get("/api/trabajos/:id", {
        schema: {
            tags: ["Trabajos"],
            operationId: "Leer",
            summary: "Trabajos/Leer",
            params: {
                type: "object",
                properties: { id: { type: "string" } },
            },
            response: {
                200: { type: "object", additionalProperties: true },
                404: {
                    type: "object",
                    properties: { error: { type: "string" } },
                },
                500: {
                    type: "object",
                    properties: { error: { type: "string" } },
                },
            },
        },
    }, async (req: any, reply) => {
        const { data, error } = await supabase
            .from("trabajos")
            .select("*")
            .eq("id", req.params.id)
            .single();

        if (error) {
            if (error.code === "PGRST116") {
                return reply.code(404).send({ error: "Trabajo no encontrado" });
            }
            app.log.error(error);
            return reply.code(500).send({ error: error.message });
        }
        return data;
    });

    // 3. Crear un trabajo
    app.post("/api/trabajos", {
        schema: {
            tags: ["Trabajos"],
            operationId: "Crear",
            summary: "Trabajos/Crear",
            body: {
                type: "object",
                required: ["sitio_web"],
                properties: {
                    sitio_web: { type: "string" },
                    nombre_cliente: { type: "string" },
                    email_cliente: { type: "string" },
                    telefono_cliente: { type: "string" },
                    logo_cliente: { type: "string" },
                    porcentaje: { type: "integer" },
                    estado: { type: "boolean" },
                    tipo_app: { type: "integer" },
                    origen: { type: "string" },
                    ocultar: { type: "boolean" },
                },
            },
            response: {
                201: { type: "object", additionalProperties: true },
                500: {
                    type: "object",
                    properties: { error: { type: "string" } },
                },
            },
        },
    }, async (req: any, reply) => {
        const body = { ...req.body };
        if (body.origen && body.origen !== "manual") {
            body.ocultar = true;
        }

        const { data, error } = await supabase
            .from("trabajos")
            .insert(body)
            .select()
            .single();

        if (error) {
            app.log.error(error);
            return reply.code(500).send({ error: error.message });
        }
        return reply.code(201).send(data);
    });

    // 4. Actualizar un trabajo
    app.put("/api/trabajos/:id", {
        schema: {
            tags: ["Trabajos"],
            operationId: "Actualizar",
            summary: "Trabajos/Actualizar",
            params: {
                type: "object",
                properties: { id: { type: "string" } },
            },
            body: {
                type: "object",
                properties: {
                    sitio_web: { type: "string" },
                    nombre_cliente: { type: "string" },
                    email_cliente: { type: "string" },
                    telefono_cliente: { type: "string" },
                    logo_cliente: { type: "string" },
                    porcentaje: { type: "integer" },
                    estado: { type: "boolean" },
                    tipo_app: { type: "integer" },
                    origen: { type: "string" },
                    ocultar: { type: "boolean" },
                },
            },
            response: {
                200: { type: "object", additionalProperties: true },
                404: {
                    type: "object",
                    properties: { error: { type: "string" } },
                },
                500: {
                    type: "object",
                    properties: { error: { type: "string" } },
                },
            },
        },
    }, async (req: any, reply) => {
        const { data, error } = await supabase
            .from("trabajos")
            .update(req.body)
            .eq("id", req.params.id)
            .select()
            .single();

        if (error) {
            if (error.code === "PGRST116") {
                return reply.code(404).send({ error: "Trabajo no encontrado" });
            }
            app.log.error(error);
            return reply.code(500).send({ error: error.message });
        }
        return data;
    });

    // 5. Eliminar un trabajo
    app.delete("/api/trabajos/:id", {
        schema: {
            tags: ["Trabajos"],
            operationId: "Eliminar",
            summary: "Trabajos/Eliminar",
            params: {
                type: "object",
                properties: { id: { type: "string" } },
            },
            response: {
                200: {
                    type: "object",
                    properties: { ok: { type: "boolean" } },
                },
                500: {
                    type: "object",
                    properties: { error: { type: "string" } },
                },
            },
        },
    }, async (req: any, reply) => {
        const { error } = await supabase
            .from("trabajos")
            .delete()
            .eq("id", req.params.id);

        if (error) {
            app.log.error(error);
            return reply.code(500).send({ error: error.message });
        }
        return { ok: true };
    });

    // 6. Crear con error (simula error de tipo de dato)
    app.post("/api/trabajos/crear-con-error", {
        schema: {
            tags: ["Trabajos"],
            operationId: "CrearConError",
            summary: "Trabajos/CrearConError",
            body: {
                type: "object",
                required: ["sitio_web"],
                properties: {
                    sitio_web: { type: "string" },
                    porcentaje: { type: "integer" },
                },
            },
            response: {
                400: {
                    type: "object",
                    properties: {
                        error: { type: "string" },
                        archivo: { type: "string" },
                        linea: { type: "integer" },
                    },
                },
            },
        },
    }, async (req: any, reply) => {
        const { sitio_web, porcentaje } = req.body;

        if (typeof sitio_web !== "string" || !sitio_web.startsWith("http")) {
            return reply.code(400).send({
                error: "sitio_web debe ser una URL válida (ej: https://ejemplo.cl)",
                archivo: "src/routes/trabajos.ts",
                linea: 230,
            });
        }

        if (porcentaje !== undefined && (porcentaje < 0 || porcentaje > 100)) {
            return reply.code(400).send({
                error: "porcentaje debe ser entre 0 y 100",
                archivo: "src/routes/trabajos.ts",
                linea: 237,
            });
        }

        return reply.code(400).send({
            error: "Endpoint de prueba — simula error controlado",
            archivo: "src/routes/trabajos.ts",
            linea: 243,
        });
    });
}
