/* Manutenção do erro 405 da Evolution (CONFIG_SESSION_PHONE_VERSION desatualizada).
   Busca a versão atual do WhatsApp Web (mesma fonte que o fetchLatestBaileysVersion usa)
   e imprime o valor pronto p/ colar no env do serviço `evolution` na Railway.
   Sem dependências — só fetch nativo. Uso: npm run wa:version */

const SOURCES = [
  "https://raw.githubusercontent.com/WhiskeySockets/Baileys/master/src/Defaults/baileys-version.json",
  "https://web.whatsapp.com/check-update?version=1&platform=web", // fallback (formato diferente)
];

async function fromGithub(url) {
  const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
  if (!res.ok) throw new Error("HTTP " + res.status);
  const json = await res.json();
  if (Array.isArray(json.version)) return json.version;
  throw new Error("formato inesperado");
}

async function main() {
  let version = null;
  try {
    version = await fromGithub(SOURCES[0]);
  } catch (e) {
    console.error("falha na fonte primária:", e.message);
  }
  if (!version) {
    console.error("não consegui obter a versão automaticamente.");
    console.error("rode localmente o teste Baileys (fetchLatestBaileysVersion) p/ pegar o valor.");
    process.exit(1);
  }
  const dotted = version.join(".");
  console.log("Versão atual do WhatsApp Web:", JSON.stringify(version));
  console.log("");
  console.log("Cole no serviço `evolution` (Railway → Variables) e faça redeploy:");
  console.log("  CONFIG_SESSION_PHONE_VERSION = " + dotted);
}

main();
