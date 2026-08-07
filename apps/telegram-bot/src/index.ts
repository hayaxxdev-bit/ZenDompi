import "dotenv/config";
import { bootstrap } from "./bootstrap";

async function main() {
  const bot = await bootstrap();

  // Start bot (long polling untuk development)
  bot.start({
    onStart: (botInfo: { username: any; }) => {
      console.log(`🤖 @${botInfo.username} is running...`);
      console.log("⌨️  Press Ctrl+C to stop\n");
    },
  });
}

main().catch(console.error);