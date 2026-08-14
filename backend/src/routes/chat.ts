import { FastifyInstance, FastifyRequest } from "fastify";
import { handleChat } from "../services/chat.handler";


type UiMessage = {
    from: "user" | "bot";
    text?: string | null;
    image?: string;
    video?: string;
    status?: "sent" | "delivered" | "seen";
    timestamp?: string | Date;
};

type ChatBody = {
    sessionId: string;
    messages: UiMessage[];
    desdeSitioWeb?: boolean;
};


export async function chatRoutes(app: FastifyInstance) {
    app.post(
        "/api/chat",
        {
            schema: {
                tags: ["Chat"],
                summary: "Enviar mensaje al chatbot",
                body: {
                    type: "object",
                    required: ["sessionId", "messages"],
                    properties: {
                        sessionId: { type: "string" },
                        messages: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    from: { type: "string", enum: ["user", "bot"] },
                                    text: { type: "string", nullable: true },
                                    image: { type: "string" },
                                    video: { type: "string" },
                                    status: { type: "string", enum: ["sent", "delivered", "seen"] },
                                    timestamp: { type: "string" },
                                },
                            },
                        },
                        desdeSitioWeb: { type: "boolean" },
                    },
                },
                response: {
                    200: {
                        type: "object",
                        properties: {
                            phase: { type: "string" },
                            replies: {
                                type: "array",
                                items: {
                                    type: "object",
                                    properties: {
                                        text: { type: "string" },
                                        phase: { type: "string" },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
        async (request: FastifyRequest<{ Body: ChatBody }>, reply) => {
            try {
                const { sessionId, messages, desdeSitioWeb } = request.body;

                const result = await handleChat(sessionId, messages, desdeSitioWeb);

                return {
                    phase: result.phase,
                    replies: [{ text: result.text, phase: result.phase }],
                };

            } catch (error) {
                app.log.error(error);
                reply.code(500);
                return {
                    replies: [
                        {
                            text: "⚠️ En este momento no puedo responder. Intenta nuevamente en unos segundos 😊",
                        },
                    ],
                };
            }
        }
    );
}
