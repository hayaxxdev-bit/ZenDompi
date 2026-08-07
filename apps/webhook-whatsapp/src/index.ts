import { config } from "./config/env";
import { initBaileysSocket } from "./baileys/connection";

async function bootstrap() {
  console.log(`WhatsApp Service initializing on port ${config.port}...`);
  await initBaileysSocket();
}

bootstrap();
