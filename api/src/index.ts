import Fastify from "fastify";

const app = Fastify();
const PORT = Number(process.env.PORT ?? 3000);

app.get("/", async () => ({ ok: true, service: "api" }));

app.listen({ port: PORT, host: "0.0.0.0" }).then(() => {
  console.log(`API listening on http://localhost:${PORT}`);
});
