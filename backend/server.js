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

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PATCH", "DELETE"],
  },
});

const PORT = 3001;

app.use(cors());
app.use(express.json());

const DATA_DIR = __dirname;
const PEDIDOS_FILE = path.join(DATA_DIR, "pedidos.json");

const usuarios = [
  {
    id: 1,
    username: "admin",
    password: "1234",
    nombre: "Administrador",
    role: "admin",
  },
  {
    id: 2,
    username: "dom1",
    password: "1234",
    nombre: "Domiciliario 1",
    role: "repartidor",
  },
  {
    id: 3,
    username: "dom2",
    password: "1234",
    nombre: "Domiciliario 2",
    role: "repartidor",
  },
];

function asegurarArchivoPedidos() {
  if (!fs.existsSync(PEDIDOS_FILE)) {
    fs.writeFileSync(PEDIDOS_FILE, JSON.stringify([], null, 2), "utf8");
  }
}

function leerPedidos() {
  asegurarArchivoPedidos();
  const contenido = fs.readFileSync(PEDIDOS_FILE, "utf8");
  return JSON.parse(contenido || "[]");
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

    console.log(`📲 Bot notificado de cambio de estado ${pedido.id} -> ${pedido.estado}`);
  } catch (error) {
    console.error("❌ Error notificando estado al bot:", error.message);
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
      (u) => u.username === username && u.password === password
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
    return res.status(500).json({
      error: "Error interno en login",
    });
  }
});

app.post("/pedidos", async (req, res) => {
  try {
    const { cliente, items, subtotal, domicilio, total } = req.body;

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

    const nuevoPedido = {
      id: generarIdPedido(pedidos),
      trackingToken: generarTrackingToken(),
      fecha: fechaBonita(),
      estado: "Recibido",
      repartidor: "",
      cliente: {
        nombre: cliente.nombre,
        telefono: cliente.telefono,
        direccion: cliente.direccion,
        referencia: cliente.referencia || "",
        pago: cliente.pago || "Efectivo",
      },
      items,
      subtotal: Number(subtotal) || 0,
      domicilio: Number(domicilio) || 0,
      total: Number(total) || 0,
    };

    pedidos.push(nuevoPedido);
    guardarPedidos(pedidos);

    try {
      await appendPedidoWebApp(nuevoPedido);
      console.log(`✅ Pedido ${nuevoPedido.id} guardado en Google Sheets`);
    } catch (sheetError) {
      console.error(
        `❌ Error guardando pedido ${nuevoPedido.id} en Google Sheets:`,
        sheetError.message
      );
    }

    await notificarBotPedido(nuevoPedido);

    emitirActualizacionPedidos();
    io.emit("pedido:nuevo", nuevoPedido);

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
      (p) => String(p.id).trim().toLowerCase() === String(id).trim().toLowerCase()
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

    try {
      const actualizado = await updatePedidoWebApp(pedidos[index]);

      if (!actualizado) {
        console.log(
          `⚠️ Pedido ${pedidos[index].id} no encontrado en Sheets para actualizar, intentando agregarlo`
        );
        await appendPedidoWebApp(pedidos[index]);
      }

      console.log(`✅ Estado del pedido ${pedidos[index].id} sincronizado con Google Sheets`);
    } catch (sheetError) {
      console.error(
        `❌ Error sincronizando estado del pedido ${pedidos[index].id} en Google Sheets:`,
        sheetError.message
      );
    }

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

    try {
      const actualizado = await updatePedidoWebApp(pedidos[index]);

      if (!actualizado) {
        console.log(
          `⚠️ Pedido ${pedidos[index].id} no encontrado en Sheets para actualizar repartidor, intentando agregarlo`
        );
        await appendPedidoWebApp(pedidos[index]);
      }

      console.log(`✅ Repartidor del pedido ${pedidos[index].id} sincronizado con Google Sheets`);
    } catch (sheetError) {
      console.error(
        `❌ Error sincronizando repartidor del pedido ${pedidos[index].id} en Google Sheets:`,
        sheetError.message
      );
    }

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