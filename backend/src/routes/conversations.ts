import { FastifyInstance } from "fastify";
import {
    listConversations,
    getConversation,
    setMode,
    finishConversation,
    deleteConversation
} from "../services/conversations.store";
import { Conversation } from "../models/Conversations";
import { normalizePhone } from "../services/phone.util";

//ESTADOS CONVERSACIONES
function getStatus(convo: Conversation) {
    if (convo.finished) return "EN ESPERA";           // Finalizada → EN ESPERA
    if (convo.mode === "bot" && convo.needsHuman) return "EN ESPERA"; // espera atención
    if (convo.mode === "bot" && !convo.needsHuman) return "CONTROL BOT"; // solo bot
    if (convo.mode === "human") return "ATENDIDA";   // atendido
    return "DESCONOCIDO";
}
export async function conversationRoutes(app: FastifyInstance) {

    // 📋 Listar conversaciones
    app.get("/api/conversations", {
        schema: {
            tags: ["Conversations"],
            summary: "Listar todas las conversaciones",
            response: {
                200: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            phone: { type: "string" },
                            lastMessageAt: { type: "number" },
                            mode: { type: "string" },
                            needsHuman: { type: "boolean" },
                            status: { type: "string" },
                            lastMessage: { type: "object" },
                        },
                    },
                },
            },
        },
    }, async () => {
        try {
            const conversations = await listConversations();

            console.log("📄 Listado de conversaciones (DEBUG):");

            const safeConversations = conversations.filter((c, index) => {
                // 🧹 Phone inválido
                if (!c?.phone || typeof c.phone !== "string" || c.phone.trim() === "") {
                    console.warn(`⚠️ Conversación inválida [index=${index}] → phone vacío`, c);
                    return false;
                }

                // 🧹 Messages corrupto
                if (!Array.isArray(c.messages)) {
                    console.warn(
                        `⚠️ Conversación con messages corrupto [phone=${c.phone}]`,
                        { messages: c.messages }
                    );
                    return false;
                }

                return true;
            });

            safeConversations.forEach((c) => {
                const status = getStatus(c);

                const lastTs =
                    typeof c.lastMessageAt === "number" && c.lastMessageAt > 0
                        ? c.lastMessageAt
                        : c.messages.length > 0
                            ? c.messages[c.messages.length - 1].ts
                            : null;

                const timeStr = lastTs
                    ? new Date(lastTs).toLocaleTimeString("es-CL", {
                        hour: "2-digit",
                        minute: "2-digit",
                    })
                    : "??:??";

                console.log(
                    `- ${c.phone} | mode: ${c.mode} | needsHuman: ${c.needsHuman} | finished: ${c.finished} | status: ${status} | lastMessage: ${timeStr}`
                );
            });

            // 🔁 Respuesta al front (DTO seguro)
            return safeConversations.map((c) => {
                const lastMessage =
                    c.messages.length > 0 ? c.messages[c.messages.length - 1] : null;

                return {
                    phone: c.phone,
                    lastMessageAt:
                        typeof c.lastMessageAt === "number" && c.lastMessageAt > 0
                            ? c.lastMessageAt
                            : lastMessage
                                ? lastMessage.ts
                                : Date.now(),
                    mode: c.mode,
                    needsHuman: c.needsHuman,
                    status: getStatus(c),
                    lastMessage,
                };
            });
        } catch (err) {
            console.error("❌ Error en /api/conversations", err);
            // 🔒 Nunca romper el front
            return [];
        }
    });




    // 💬 Obtener historial completo
    app.get("/api/conversations/:phone", {
        schema: {
            tags: ["Conversations"],
            summary: "Obtener historial de una conversación",
            params: {
                type: "object",
                properties: { phone: { type: "string" } },
            },
        },
    }, async (req: any) => {
        const phone = normalizePhone(req.params.phone);
        const conversation = await getConversation(phone);

        // Extraemos datos del lead si existen
        const leadEmail = conversation.leadEmail ?? null;
        const leadBusiness = conversation.leadBusiness ?? null;
        const leadOffer = conversation.leadOffer ?? null;

        return {
            phone: conversation.phone,
            mode: conversation.mode,
            needsHuman: conversation.needsHuman,
            lastMessageAt: conversation.lastMessageAt,
            messages: conversation.messages.map((msg) => ({
                from: msg.from,
                text: msg.text,
                ts: msg.ts,
            })),
            // Datos del cliente
            leadEmail,
            leadBusiness,
            leadOffer,
        };
    });


    // 🔀 Cambiar modo bot ↔ humano
    app.post("/api/conversations/:phone/mode", {
        schema: {
            tags: ["Conversations"],
            summary: "Cambiar modo bot/humano",
            params: {
                type: "object",
                properties: { phone: { type: "string" } },
            },
            body: {
                type: "object",
                required: ["mode"],
                properties: { mode: { type: "string", enum: ["bot", "human"] } },
            },
        },
    }, async (req: any) => {
        const phone = normalizePhone(req.params.phone);
        const { mode } = req.body;

        if (mode !== "bot" && mode !== "human") {
            return { error: "invalid_mode" };
        }

        await setMode(phone, mode);

        // Devuelve la conversación actualizada para que el front la recargue
        const updated = await getConversation(phone);
        return {
            ok: true,
            mode: updated.mode,
            needsHuman: updated.needsHuman,
            messages: updated.messages,
        };
    });

    app.post("/api/conversations/:phone/finalizar", {
        schema: {
            tags: ["Conversations"],
            summary: "Finalizar conversación",
            params: {
                type: "object",
                properties: { phone: { type: "string" } },
            },
        },
    }, async (req: any) => {
        const phone = normalizePhone(req.params.phone);
        const convo = await finishConversation(phone);

        return { ok: true, conversation: convo };
    });

    // 🗑️ Eliminar conversación completa
    app.delete("/api/conversations/:phone", {
        schema: {
            tags: ["Conversations"],
            summary: "Eliminar conversación",
            params: {
                type: "object",
                properties: { phone: { type: "string" } },
            },
        },
    }, async (req: any) => {
        const phone = normalizePhone(req.params.phone);

        await deleteConversation(phone);

        return { ok: true };
    });

}

