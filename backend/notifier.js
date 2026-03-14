const BOT_API_URL = "http://localhost:3002";

async function notifyBotNewOrder(pedido) {
  try {
    await fetch(`${BOT_API_URL}/notify-order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ pedido }),
    });
  } catch (error) {
    console.error("No se pudo notificar al bot sobre nuevo pedido:", error.message);
  }
}

async function notifyBotStatusChange(pedido) {
  try {
    await fetch(`${BOT_API_URL}/notify-status`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ pedido }),
    });
  } catch (error) {
    console.error("No se pudo notificar al bot sobre cambio de estado:", error.message);
  }
}

module.exports = { notifyBotNewOrder, notifyBotStatusChange };