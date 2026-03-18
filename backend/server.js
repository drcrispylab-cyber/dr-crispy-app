const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const http = require("http");
const crypto = require("crypto");
const fetch = require("node-fetch");
const { Server } = require("socket.io");
const {
  appendPedidoWebApp,
  updatePedidoWebApp,
  ensureSheetExists,
} = require("./googleSheets");

const app = express();
const server = http.createServer(app);

const ORIGINS_PERMITIDOS = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://dr-crispy-app.vercel.app",
];

const io = new Server(server, {
  cors: {
    origin: ORIGINS_PERMITIDOS,
    methods: ["GET", "POST", "PATCH", "DELETE"],
  },
});

const PORT = process.env.PORT || 3001;

app.use(
  cors({
    origin: ORIGINS_PERMITIDOS,
    methods: ["GET", "POST", "PATCH", "DELETE"],
  })
);

app.use(express.json());

const DATA_DIR = __dirname;
const PEDIDOS_FILE = path.join(DATA_DIR, "pedidos.json");

const usuarios = [
  {
    id: 1,
    username: "maria",
    password: "244853",
    nombre: "Maria Isabel Mercado Rangel",
    role: "admin",
  },
  {
    id: 2,
    username: "maldo",
    password: "244853",
    nombre: "Luis Ferney Maldonado Bolaños",
    role: "admin",
  },
  {
    id: 3,
    username: "dom1",
    password: "1234",
    nombre: "Domiciliario 1",
    role: "repartidor",
  },
  {
    id: 4,
    username: "dom2",
    password: "1234",
    nombre: "Domiciliario 2",
    role: "repartidor",
  },
];

const METODOS_PAGO_VALIDOS = ["PSE", "Llave", "QR Nequi"];
const ESTADOS_PAGO_VALIDOS = [
  "Pendiente",
  "Pendiente de verificación",
  "Pagado",
  "Rechazado",
];

function asegurarArchivoPedidos() {
  if (!fs.existsSync(PEDIDOS_FILE)) {
    fs.writeFileSync(PEDIDOS_FILE, JSON.stringify([], null, 2), "utf8");
  }
}

function leerPedidos() {
  asegurarArchivoPedidos();
  const contenido = fs.readFileSync(PEDIDOS_FILE, "utf8");
  const pedidos = JSON.parse(contenido || "[]");

  return pedidos.map((pedido) => ({
    ...pedido,
    metodoPago: pedido?.metodoPago || pedido?.cliente?.pago || "Llave",
    estadoPago: pedido?.estadoPago || "Pendiente",
    referenciaPago: pedido?.referenciaPago || "",
    soportePago: pedido?.soportePago || "",
    fechaPago: pedido?.fechaPago || "",
    cliente: {
      ...(pedido?.cliente || {}),
      pago: pedido?.cliente?.pago || pedido?.metodoPago || "Llave",
    },
  }));
}

function guardarPedidos(pedidos) {
  fs.writeFileSync(PEDIDOS_FILE, JSON.stringify(pedidos, null, 2), "utf8");
}

function generarIdPedido(pedidos) {
  const ultimoNumero = pedidos.reduce((max, pedido) => {
    const match = String(pedido.id || "").match(/^PED-(\d+)$/i);
    if (!match) return max;
    const numero = Number(match[1]);
    return numero > max ? numero : max;
  }, 0);

  const siguiente = ultimoNumero + 1;
  return `PED-${String(siguiente).padStart(3, "0")}`;
}

function generarTrackingToken() {
  return crypto.randomBytes(18).toString("hex");
}

function fechaBonita() {
  return new Date().toLocaleString("es-CO", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function emitirActualizacionPedidos() {
  const pedidos = leerPedidos();
  io.emit("pedidos:actualizados", pedidos);
}

function limpiarNumeroWhatsApp(numero = "") {
  const limpio = String(numero).replace(/\D/g, "");

  if (!limpio) return "";
  if (limpio.startsWith("57")) return limpio;
  if (limpio.length === 10) return `57${limpio}`;

  return limpio;
}

function normalizarMetodoPago(valor = "") {
  const limpio = String(valor).trim().toLowerCase();

  if (!limpio) return "Llave";

  if (limpio === "pse" || limpio === "pagar pse" || limpio === "pago pse") {
    return "PSE";
  }

  if (
    limpio === "llave" ||
    limpio === "bre-b" ||
    limpio === "breb" ||
    limpio === "llave bre-b" ||
    limpio === "llave breve"
  ) {
    return "Llave";
  }

  if (
    limpio === "qr nequi" ||
    limpio === "nequi qr" ||
    limpio === "qr" ||
    limpio === "nequi"
  ) {
    return "QR Nequi";
  }

  return "Llave";
}

function obtenerEstadoPagoInicial(metodoPago) {
  if (metodoPago === "PSE") return "Pendiente";
  if (metodoPago === "Llave" || metodoPago === "QR Nequi") {
    return "Pendiente de verificación";
  }
  return "Pendiente";
}

function construirMensajeConfirmacionCliente(pedido) {
  return [
    `Hola ${pedido?.cliente?.nombre || "cliente"} 👋`,
    "",
    `Tu pedido *${pedido?.id || ""}* fue recibido correctamente en *Dr. Crispy Lab* 🧪🍗`,
    "",
    `💵 Total: *$${Number(pedido?.total || 0).toLocaleString("es-CO")}*`,
    `📍 Dirección: ${pedido?.cliente?.direccion || "-"}`,
    `📦 Estado del pedido: ${pedido?.estado || "Recibido"}`,
    `💳 Método de pago: ${pedido?.metodoPago || pedido?.cliente?.pago || "-"}`,
    `🧾 Estado del pago: ${pedido?.estadoPago || "Pendiente"}`,
    "",
    "Muy pronto continuaremos contigo por este medio.",
  ].join("\n");
}

async function notificarBotPedido(pedido) {
  try {
    const response = await fetch("http://localhost:3002/notify-order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ pedido }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Error notificando al bot");
    }

    console.log(`📲 Bot notificado de nuevo pedido ${pedido.id}`);
  } catch (error) {
    console.error("❌ Error notificando nuevo pedido al bot:", error.message);
  }
}

async function notificarBotEstado(pedido) {
  try {
    const response = await fetch("http://localhost:3002/notify-status", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ pedido }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Error notificando cambio de estado al bot");
    }

    console.log(
      `📲 Bot notificado de cambio de estado ${pedido.id} -> ${pedido.estado}`
    );
  } catch (error) {
    console.error("❌ Error notificando estado al bot:", error.message);
  }
}

async function notificarBotConfirmacionCliente(pedido) {
  try {
    const telefonoLimpio = limpiarNumeroWhatsApp(pedido?.cliente?.telefono);

    if (!telefonoLimpio) {
      console.log(
        `⚠️ No se envió confirmación al cliente del pedido ${pedido?.id}: teléfono vacío o inválido`
      );
      return;
    }

    const mensaje = construirMensajeConfirmacionCliente({
      ...pedido,
      cliente: {
        ...pedido.cliente,
        telefono: telefonoLimpio,
      },
    });

    const response = await fetch("http://localhost:3002/notify-customer-order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        pedido: {
          ...pedido,
          cliente: {
            ...pedido.cliente,
            telefono: telefonoLimpio,
          },
        },
        telefono: telefonoLimpio,
        mensaje,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Error notificando confirmación al cliente");
    }

    console.log(
      `📲 Confirmación enviada al cliente ${telefonoLimpio} para pedido ${pedido.id}`
    );
  } catch (error) {
    console.error("❌ Error enviando confirmación al cliente:", error.message);
  }
}

async function sincronizarPedidoConSheets(pedido, accion = "actualizar") {
  try {
    const actualizado = await updatePedidoWebApp(pedido);

    if (!actualizado) {
      console.log(
        `⚠️ Pedido ${pedido.id} no encontrado en Sheets para ${accion}, intentando agregarlo`
      );
      await appendPedidoWebApp(pedido);
    }

    console.log(`✅ Pedido ${pedido.id} sincronizado con Google Sheets`);
  } catch (sheetError) {
    console.error(
      `❌ Error sincronizando pedido ${pedido.id} en Google Sheets:`,
      sheetError.message
    );
  }
}

io.on("connection", (socket) => {
  console.log("Cliente conectado:", socket.id);
  socket.emit("pedidos:actualizados", leerPedidos());

  socket.on("disconnect", () => {
    console.log("Cliente desconectado:", socket.id);
  });
});

app.get("/", (req, res) => {
  res.json({
    ok: true,
    mensaje: "Backend Dr. Crispy Lab activo",
  });
});

app.get("/health", (req, res) => {
  res.json({
    ok: true,
    servicio: "backend-webapp",
  });
});

app.post("/login", (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        error: "Usuario y contraseña son obligatorios",
      });
    }

    const user = usuarios.find(
      (u) =>
        String(u.username).trim().toLowerCase() ===
          String(username).trim().toLowerCase() &&
        String(u.password).trim() === String(password).trim()
    );

    if (!user) {
      return res.status(401).json({
        error: "Credenciales incorrectas",
      });
    }

    return res.json({
      ok: true,
      user: {
        id: user.id,
        username: user.username,
        nombre: user.nombre,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("❌ Error en login:", error);
    return res.status(500).json({
      error: "Error interno en login",
    });
  }
});

app.post("/pedidos", async (req, res) => {
  try {
    const {
      cliente,
      items,
      subtotal,
      domicilio,
      total,
      metodoPago,
      referenciaPago,
      soportePago,
    } = req.body;

    if (!cliente || !cliente.nombre || !cliente.telefono || !cliente.direccion) {
      return res.status(400).json({
        error: "Datos del cliente incompletos",
      });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        error: "El pedido debe tener al menos un producto",
      });
    }

    const pedidos = leerPedidos();
    const metodoPagoFinal = normalizarMetodoPago(
      metodoPago || cliente?.pago || ""
    );
    const estadoPagoInicial = obtenerEstadoPagoInicial(metodoPagoFinal);

    const nuevoPedido = {
      id: generarIdPedido(pedidos),
      trackingToken: generarTrackingToken(),
      fecha: fechaBonita(),
      estado: "Recibido",
      estadoPago: estadoPagoInicial,
      metodoPago: metodoPagoFinal,
      referenciaPago: String(referenciaPago || "").trim(),
      soportePago: String(soportePago || "").trim(),
      fechaPago: "",
      repartidor: "",
      cliente: {
        nombre: String(cliente.nombre || "").trim(),
        telefono: String(cliente.telefono || "").trim(),
        direccion: String(cliente.direccion || "").trim(),
        referencia: String(cliente.referencia || "").trim(),
        pago: metodoPagoFinal,
      },
      items,
      subtotal: Number(subtotal) || 0,
      domicilio: Number(domicilio) || 0,
      total: Number(total) || 0,
    };

    if (String(estadoPagoInicial).toLowerCase() === "pagado") {
      nuevoPedido.fechaPago = fechaBonita();
    }

    pedidos.push(nuevoPedido);
    guardarPedidos(pedidos);

    try {
      await appendPedidoWebApp(nuevoPedido);
      console.log("✅ Pedido guardado en Google Sheets:", nuevoPedido.id);
    } catch (error) {
      console.error(
        "❌ Error guardando pedido en Google Sheets:",
        error.message
      );
    }

    return res.status(201).json({
      ok: true,
      pedido: nuevoPedido,
    });
  } catch (error) {
    console.error("❌ Error creando pedido:", error.message);
    return res.status(500).json({
      error: "Error creando pedido",
    });
  }
});

app.get("/pedidos", (req, res) => {
  try {
    const pedidos = leerPedidos();
    return res.json(pedidos);
  } catch (error) {
    return res.status(500).json({
      error: "Error obteniendo pedidos",
    });
  }
});

app.get("/pedidos/:id", (req, res) => {
  try {
    const { id } = req.params;
    const pedidos = leerPedidos();

    const pedido = pedidos.find(
      (p) =>
        String(p.id).trim().toLowerCase() ===
        String(id).trim().toLowerCase()
    );

    if (!pedido) {
      return res.status(404).json({
        error: "Pedido no encontrado",
      });
    }

    return res.json({
      ok: true,
      pedido,
    });
  } catch (error) {
    return res.status(500).json({
      error: "Error obteniendo el pedido",
    });
  }
});

app.get("/seguimiento/:token", (req, res) => {
  try {
    const { token } = req.params;
    const pedidos = leerPedidos();

    const pedido = pedidos.find(
      (p) => String(p.trackingToken || "") === String(token)
    );

    if (!pedido) {
      return res.status(404).json({
        error: "Seguimiento no encontrado",
      });
    }

    return res.json({
      ok: true,
      pedido,
    });
  } catch (error) {
    return res.status(500).json({
      error: "Error consultando seguimiento",
    });
  }
});

app.patch("/pedidos/:id/estado", async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    if (!estado) {
      return res.status(400).json({
        error: "Debes enviar un estado",
      });
    }

    const pedidos = leerPedidos();
    const index = pedidos.findIndex((p) => String(p.id) === String(id));

    if (index === -1) {
      return res.status(404).json({
        error: "Pedido no encontrado",
      });
    }

    pedidos[index].estado = estado;
    guardarPedidos(pedidos);

    await sincronizarPedidoConSheets(pedidos[index], "actualizar estado");
    await notificarBotEstado(pedidos[index]);

    emitirActualizacionPedidos();
    io.emit("pedido:estado", pedidos[index]);

    return res.json({
      ok: true,
      pedido: pedidos[index],
    });
  } catch (error) {
    console.error("❌ Error actualizando estado:", error.message);
    return res.status(500).json({
      error: "Error actualizando estado",
    });
  }
});

app.patch("/pedidos/:id/repartidor", async (req, res) => {
  try {
    const { id } = req.params;
    const { repartidor } = req.body;

    if (!repartidor) {
      return res.status(400).json({
        error: "Debes enviar el nombre del repartidor",
      });
    }

    const pedidos = leerPedidos();
    const index = pedidos.findIndex((p) => String(p.id) === String(id));

    if (index === -1) {
      return res.status(404).json({
        error: "Pedido no encontrado",
      });
    }

    pedidos[index].repartidor = repartidor;
    guardarPedidos(pedidos);

    await sincronizarPedidoConSheets(pedidos[index], "actualizar repartidor");
    await notificarBotEstado(pedidos[index]);

    emitirActualizacionPedidos();
    io.emit("pedido:repartidor", pedidos[index]);

    return res.json({
      ok: true,
      pedido: pedidos[index],
    });
  } catch (error) {
    console.error("❌ Error asignando repartidor:", error.message);
    return res.status(500).json({
      error: "Error asignando repartidor",
    });
  }
});

app.patch("/pedidos/:id/pago", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      estadoPago,
      metodoPago,
      referenciaPago,
      soportePago,
      fechaPago,
    } = req.body;

    const pedidos = leerPedidos();
    const index = pedidos.findIndex((p) => String(p.id) === String(id));

    if (index === -1) {
      return res.status(404).json({
        error: "Pedido no encontrado",
      });
    }

    if (estadoPago !== undefined) {
      if (!ESTADOS_PAGO_VALIDOS.includes(estadoPago)) {
        return res.status(400).json({
          error: `Estado de pago inválido. Usa: ${ESTADOS_PAGO_VALIDOS.join(", ")}`,
        });
      }
      pedidos[index].estadoPago = estadoPago;
    }

    if (metodoPago !== undefined) {
      const metodoPagoFinal = normalizarMetodoPago(metodoPago);

      if (!METODOS_PAGO_VALIDOS.includes(metodoPagoFinal)) {
        return res.status(400).json({
          error: `Método de pago inválido. Usa: ${METODOS_PAGO_VALIDOS.join(", ")}`,
        });
      }

      pedidos[index].metodoPago = metodoPagoFinal;
      pedidos[index].cliente = {
        ...(pedidos[index].cliente || {}),
        pago: metodoPagoFinal,
      };
    }

    if (referenciaPago !== undefined) {
      pedidos[index].referenciaPago = String(referenciaPago || "").trim();
    }

    if (soportePago !== undefined) {
      pedidos[index].soportePago = String(soportePago || "").trim();
    }

    if (fechaPago !== undefined) {
      pedidos[index].fechaPago = String(fechaPago || "").trim();
    }

    if (pedidos[index].estadoPago === "Pagado" && !pedidos[index].fechaPago) {
      pedidos[index].fechaPago = fechaBonita();
    }

    guardarPedidos(pedidos);

    await sincronizarPedidoConSheets(pedidos[index], "actualizar pago");
    await notificarBotConfirmacionCliente(pedidos[index]);

    if (pedidos[index].estadoPago === "Pagado") {
      try {
        const response = await fetch(
          "http://localhost:3002/notify-payment-confirmed",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              pedido: pedidos[index],
            }),
          }
        );

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.error || "No se pudo notificar pago confirmado");
        }

        console.log(
          `💰 Bot notificado de pago confirmado ${pedidos[index].id}`
        );
      } catch (error) {
        console.error("❌ Error notificando pago confirmado:", error.message);
      }
    }

    emitirActualizacionPedidos();
    io.emit("pedido:pago", pedidos[index]);

    return res.json({
      ok: true,
      pedido: pedidos[index],
    });
  } catch (error) {
    console.error("❌ Error actualizando pago:", error.message);
    return res.status(500).json({
      error: "Error actualizando pago",
    });
  }
});

app.delete("/pedidos/:id", (req, res) => {
  try {
    const { id } = req.params;
    const pedidos = leerPedidos();

    const index = pedidos.findIndex((p) => String(p.id) === String(id));

    if (index === -1) {
      return res.status(404).json({
        error: "Pedido no encontrado",
      });
    }

    const pedidoEliminado = pedidos[index];
    pedidos.splice(index, 1);

    guardarPedidos(pedidos);
    emitirActualizacionPedidos();
    io.emit("pedido:eliminado", pedidoEliminado);

    return res.json({
      ok: true,
      pedido: pedidoEliminado,
    });
  } catch (error) {
    return res.status(500).json({
      error: "Error eliminando pedido",
    });
  }
});

app.get("/pedidos-repartidor/:nombre", (req, res) => {
  try {
    const { nombre } = req.params;
    const pedidos = leerPedidos();

    const pedidosDelRepartidor = pedidos.filter(
      (p) =>
        String(p.repartidor).trim().toLowerCase() ===
        String(nombre).trim().toLowerCase()
    );

    return res.json(pedidosDelRepartidor);
  } catch (error) {
    return res.status(500).json({
      error: "Error obteniendo pedidos del repartidor",
    });
  }
});

server.listen(PORT, async () => {
  asegurarArchivoPedidos();

  try {
    await ensureSheetExists();
    console.log('✅ Hoja "pedidos web app" verificada/creada correctamente');
  } catch (error) {
    console.error("❌ Error inicializando Google Sheets:", error.message);
  }

  console.log(`🚀 Servidor Dr. Crispy Lab corriendo en http://localhost:${PORT}`);
});