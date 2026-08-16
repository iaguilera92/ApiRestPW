import "./env";

import Fastify from "fastify";
import cors from "@fastify/cors";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import { chatRoutes } from "./routes/chat";
import { whatsappMetaWebhook } from "./webhook-meta";
import { operatorRoutes } from "./routes/operator";
import { conversationRoutes } from "./routes/conversations";
import { resetConversationsRoutes } from "./routes/reset-conversations";
import { trabajosRoutes } from "./routes/trabajos";

export async function buildApp() {
    const app = Fastify({ logger: false });

    await app.register(cors, {
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    });

    const isProduction = !!process.env.RENDER;
    const ambiente = isProduction ? "PRD" : "QAS";

    await app.register(swagger, {
        openapi: {
            info: {
                title: `API REST - Plataformas Web | ${ambiente}`,
                description: `Ambiente: **${ambiente}** — Backend de gestión empresarial`,
                version: "1.0.0",
            },
            tags: [
                { name: "Plataformas Web", description: "Servicios y datos de Plataformas Web" },
                { name: "Chat", description: "Envío de mensajes al bot" },
                { name: "Conversations", description: "Gestión de conversaciones" },
                { name: "Operator", description: "Envío manual de mensajes por operador" },
                { name: "Webhook", description: "Webhooks de WhatsApp Meta" },
                { name: "System", description: "Health y mantenimiento" },
            ],
        },
    });

    await app.register(swaggerUi, {
        routePrefix: "/docs",
        uiConfig: {
            docExpansion: "list",
            deepLinking: true,
        },
    });

    whatsappMetaWebhook(app);
    await chatRoutes(app);
    await operatorRoutes(app);
    await conversationRoutes(app);
    await resetConversationsRoutes(app);
    await trabajosRoutes(app);

    app.get("/", async (_req, reply) => {
        reply.redirect("/docs");
    });

    app.get("/health", {
        schema: {
            tags: ["System"],
            summary: "Health check",
            response: { 200: { type: "object", properties: { status: { type: "string" } } } },
        },
    }, async () => ({ status: "ok" }));

    return app;
}
