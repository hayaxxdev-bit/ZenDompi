import { webhookCallback } from "grammy";
import { bot } from "../src/bot";

// Mode "http" digunakan untuk Vercel Node.js Serverless Function (req, res)
export default webhookCallback(bot, "http");