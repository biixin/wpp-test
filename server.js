import express from "express";
import { createClient } from "redis";

const app = express();
const PORT = process.env.PORT || 3000;

// Troca esses números pelos seus reais
const numbers = [
  "5521965701466",
  "5511977877209",
  "16399514882",
  "15795675034",
  "556181711719"
];

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

// Rotator endpoint
app.get("/", async (req, res) => {
  try {
    // INCR é atômico no Redis — incrementa o contador global
    const counter = await redis.incr("whatsapp:counter");

    // calcula o índice circular (counter - 1) % numbers.length
    const index = (Number(counter) - 1) % numbers.length;
    const currentNumber = numbers[index];

    // redireciona pro WhatsApp
    return res.redirect(`https://wa.me/${currentNumber}`);
  } catch (err) {
    console.error("Erro ao acessar Redis:", err);
    // fallback: redireciona para o primeiro número se der ruim
    return res.redirect(`https://wa.me/${numbers[0]}`);
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
