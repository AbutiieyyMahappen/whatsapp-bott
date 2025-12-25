import pkg from "@whiskeysockets/baileys";
const { default: makeWASocket, useMultiFileAuthState } = pkg;

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("auth");

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: false
  });

  sock.ev.on("creds.update", saveCreds);

  // Pairing using ENV variable
  if (!state.creds.registered) {
    const phone = process.env.PHONE_NUMBER;
    if (!phone) {
      console.log("❌ PHONE_NUMBER env variable missing");
      process.exit(1);
    }

    const code = await sock.requestPairingCode(phone);
    console.log("✅ PAIRING CODE:", code);
  }

  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const text =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text;

    if (text?.toLowerCase() === "hi") {
      await sock.sendMessage(msg.key.remoteJid, {
        text: "🤖 Bot is alive on Render!"
      });
    }
  });
}

startBot();
