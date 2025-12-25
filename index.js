import pkg from "@whiskeysockets/baileys";
const { default: makeWASocket, useMultiFileAuthState } = pkg;

import readline from "readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("auth");

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: false
  });

  sock.ev.on("creds.update", saveCreds);

  if (!state.creds.registered) {
    rl.question("Enter WhatsApp number (with country code): ", async (number) => {
      const code = await sock.requestPairingCode(number.trim());
      console.log("PAIRING CODE:", code);
    });
  }

  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const text =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text;

    if (text === "hi") {
      await sock.sendMessage(msg.key.remoteJid, {
        text: "✅ Bot connected using phone number!"
      });
    }
  });
}

startBot();
