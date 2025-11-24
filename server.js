import express from "express";
import { createClient } from "redis";

const app = express();
const PORT = process.env.PORT || 3000;

// Lista de números
const numbers = [
  "12367616313",
  "12497559924",
  "13653674947"
];

// Lista de mensagens
const messages = [
  "Oi quero ver seus conteúdos",
  "Oi gata quero ver seus conteúdos",
  "Oi gatinha quero ver seus conteúdos",
  "Oi anjo quero ver seus conteúdos",
  "Oi me mostra seus conteúdos",
  "Oi tudo bem?",
  "Oi vamos conversar?",
  "Oi tudo joia?",
  "Oi tudo bom?",
  "Oi quero comprar seus conteúdos",
  "Oi podemos conversar?",
  "Oi quero te conhecer"
];

// Conexão com Redis
const REDIS_URL = process.env.REDIS_URL;
if (!REDIS_URL) {
  console.error("ERRO: variável REDIS_URL não definida.");
  process.exit(1);
}

const redis = createClient({ url: REDIS_URL });

redis.on("error", (err) => console.error("Redis Client Error", err));

await redis.connect();

// Health check
app.get("/health", (req, res) => res.send("ok"));

// Endpoint principal
app.get("/", async (req, res) => {
  try {
    // Incrementa contador no Redis
    const counter = await redis.incr("whatsapp:counter");

    // Seleciona número de forma circular
    const index = (Number(counter) - 1) % numbers.length;
    const currentNumber = numbers[index];

    // Escolhe mensagem aleatória
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    const text = encodeURIComponent(randomMessage);

    // Redireciona pro WhatsApp com mensagem
    return res.redirect(`https://wa.me/${currentNumber}?text=${text}`);
  } catch (err) {
    console.error("Erro ao acessar Redis:", err);

    // Fallback — usa primeiro número
    const fallbackMsg = encodeURIComponent(messages[Math.floor(Math.random() * messages.length)]);
    return res.redirect(`https://wa.me/${numbers[0]}?text=${fallbackMsg}`);
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
