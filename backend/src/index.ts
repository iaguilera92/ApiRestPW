import { buildApp } from "./app";

async function startServer() {
    const app = await buildApp();

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
