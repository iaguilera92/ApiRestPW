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
import { serviciosRoutes } from "./routes/servicios";

async function startServer() {
    const app = Fastify({ logger: true });

    // ✅ CORS
    await app.register(cors, {
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    });

    // 📖 Swagger
    const isProduction = !!process.env.RENDER;
    const ambiente = isProduction ? "PRD" : "QAS";

    await app.register(swagger, {
        openapi: {
            info: {
                title: `API REST - Plataformas Web | ${ambiente}`,
                description: `Ambiente: **${ambiente}** — API REST del chatbot WhatsApp`,
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

    // 🔗 Rutas API
    whatsappMetaWebhook(app);        // /webhook/whatsapp/meta
    await chatRoutes(app);           // POST /api/chat
    await operatorRoutes(app);       // /api/operator/*
    await conversationRoutes(app);   // /api/conversations/*
    await resetConversationsRoutes(app);
    await serviciosRoutes(app);          // /api/servicios

    // 🔀 Raíz redirige a Swagger
    app.get("/", async (_req, reply) => {
        reply.redirect("/docs");
    });

    // ❤️ Healthcheck
    app.get("/health", {
        schema: {
            tags: ["System"],
            summary: "Health check",
            response: { 200: { type: "object", properties: { status: { type: "string" } } } },
        },
    }, async () => ({ status: "ok" }));

    const port = Number(process.env.PORT) || 3000;

    await app.listen({ port, host: "0.0.0.0" });

    console.log("\n🚀 Backend running");
    console.log(`👉 http://localhost:${port}/health`);
    console.log(`📖 http://localhost:${port}/docs\n`);
}

startServer().catch((err) => {
    console.error("❌ Error starting server:", err);
    process.exit(1);
});
