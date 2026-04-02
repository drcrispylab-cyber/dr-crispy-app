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
const DATA_DIR = __dirname;
const PEDIDOS_FILE = path.join(DATA_DIR, "pedidos.json");
const CLIENTES_FILE = path.join(DATA_DIR, "clientes.json");

app.use(
  cors({
    origin: ORIGINS_PERMITIDOS,
    methods: ["GET", "POST", "PATCH", "DELETE"],
  })
);

app.use(express.json());

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

// ===============================
// UTILIDADES ARCHIVOS
// ===============================

function asegurarArchivo(filePath, contenidoInicial = []) {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(
      filePath,
      JSON.stringify(contenidoInicial, null, 2),
      "utf8"
    );
  }
}

function asegurarArchivoPedidos() {
  asegurarArchivo(PEDIDOS_FILE, []);
}

function asegurarArchivoClientes() {
  asegurarArchivo(CLIENTES_FILE, []);
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
    trackingToken: pedido?.trackingToken || "",
    cliente: {
      ...(pedido?.cliente || {}),
      pago: pedido?.cliente?.pago || pedido?.metodoPago || "Llave",
    },
  }));
}

function guardarPedidos(pedidos) {
  fs.writeFileSync(PEDIDOS_FILE, JSON.stringify(pedidos, null, 2), "utf8");
}

function leerClientes() {
  asegurarArchivoClientes();
  const contenido = fs.readFileSync(CLIENTES_FILE, "utf8");
  const clientes = JSON.parse(contenido || "[]");

  return Array.isArray(clientes) ? clientes : [];
}

function guardarClientes(clientes) {
  fs.writeFileSync(CLIENTES_FILE, JSON.stringify(clientes, null, 2), "utf8");
}

// ===============================
// UTILIDADES GENERALES
// ===============================

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

function generarIdCliente() {
  return `CLI-${crypto.randomBytes(6).toString("hex").toUpperCase()}`;
}

function generarIdDireccion() {
  return `DIR-${crypto.randomBytes(5).toString("hex").toUpperCase()}`;
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
    limpio === "llave breve" ||
    limpio === "transferencia" ||
    limpio === "nequi"
  ) {
    return "Llave";
  }

  if (limpio === "qr nequi" || limpio === "nequi qr" || limpio === "qr") {
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

// ===============================
// UTILIDADES CLIENTES
// ===============================

function sanitizarClienteParaRespuesta(cliente) {
  if (!cliente) return null;

  const {
    password,
    ...clienteSeguro
  } = cliente;

  return clienteSeguro;
}

function buscarClientePorTelefono(telefono = "") {
  const telefonoLimpio = limpiarNumeroWhatsApp(telefono);
  const clientes = leerClientes();

  return (
    clientes.find(
      (c) => limpiarNumeroWhatsApp(c.telefono || "") === telefonoLimpio
    ) || null
  );
}

function crearDireccionDesdePedido(clienteBody = {}) {
  const direccion = String(clienteBody.direccion || "").trim();
  const referencia = String(clienteBody.referencia || "").trim();

  if (!direccion) return null;

  return {
    id: generarIdDireccion(),
    alias: "Dirección principal",
    direccion,
    referencia,
    principal: true,
    creadaEn: fechaBonita(),
    actualizadaEn: fechaBonita(),
  };
}

function sincronizarClienteDesdePedido(clienteBody = {}, metodoPago = "Llave") {
  try {
    const nombre = String(clienteBody.nombre || "").trim();
    const telefono = String(clienteBody.telefono || "").trim();
    const direccion = String(clienteBody.direccion || "").trim();
    const referencia = String(clienteBody.referencia || "").trim();
    const pago = normalizarMetodoPago(metodoPago || clienteBody?.pago || "Llave");

    if (!nombre || !telefono) return;

    const clientes = leerClientes();
    const telefonoLimpio = limpiarNumeroWhatsApp(telefono);

    let cliente = clientes.find(
      (c) => limpiarNumeroWhatsApp(c.telefono || "") === telefonoLimpio
    );

    if (!cliente) {
      const direccionPrincipal = direccion
        ? [
            {
              id: generarIdDireccion(),
              alias: "Dirección principal",
              direccion,
              referencia,
              principal: true,
              creadaEn: fechaBonita(),
              actualizadaEn: fechaBonita(),
            },
          ]
        : [];

      cliente = {
        id: generarIdCliente(),
        nombre,
        telefono: telefonoLimpio || telefono,
        password: "",
        pagoPreferido: pago,
        direcciones: direccionPrincipal,
        creadoEn: fechaBonita(),
        actualizadoEn: fechaBonita(),
      };

      clientes.push(cliente);
      guardarClientes(clientes);
      return;
    }

    cliente.nombre = nombre || cliente.nombre;
    cliente.telefono = telefonoLimpio || cliente.telefono;
    cliente.pagoPreferido = pago || cliente.pagoPreferido;
    cliente.actualizadoEn = fechaBonita();

    if (direccion) {
      if (!Array.isArray(cliente.direcciones)) {
        cliente.direcciones = [];
      }

      let principal = cliente.direcciones.find((d) => d.principal);

      if (!principal) {
        cliente.direcciones.push({
          id: generarIdDireccion(),
          alias: "Dirección principal",
          direccion,
          referencia,
          principal: true,
          creadaEn: fechaBonita(),
          actualizadaEn: fechaBonita(),
        });
      } else {
        principal.direccion = direccion;
        principal.referencia = referencia;
        principal.actualizadaEn = fechaBonita();
      }
    }

    guardarClientes(clientes);
  } catch (error) {
    console.error("❌ Error sincronizando cliente desde pedido:", error.message);
  }
}

// ===============================
// NOTIFICACIONES BOT
// ===============================

async function notificarBotPedido(pedido) {
  try {
    const response = await fetch("http://localhost:3002/notify-order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ pedido }),
    });

    const data = await response.json().catch(() => ({}));

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

    const data = await response.json().catch(() => ({}));

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

    const data = await response.json().catch(() => ({}));

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

// ===============================
// SOCKET
// ===============================

io.on("connection", (socket) => {
  console.log("Cliente conectado:", socket.id);
  socket.emit("pedidos:actualizados", leerPedidos());

  socket.on("disconnect", () => {
    console.log("Cliente desconectado:", socket.id);
  });
});

// ===============================
// RUTAS BASE
// ===============================

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

app.get("/test-sheets", async (req, res) => {
  try {
    const pedidoDemo = {
      id: `TEST-${Date.now()}`,
      trackingToken: "TEST123",
      fecha: new Date().toLocaleString("es-CO"),
      estado: "Recibido",
      estadoPago: "Pendiente",
      metodoPago: "Nequi",
      referenciaPago: "",
      soportePago: "",
      fechaPago: "",
      repartidor: "",
      cliente: {
        nombre: "PRUEBA",
        telefono: "3000000000",
        direccion: "Barrancabermeja",
        referencia: "Casa de prueba",
        pago: "Nequi",
      },
      items: [
        {
          nombre: "Alitas x6",
          cantidad: 1,
          precio: 28900,
          salsa: "BBQ Reactor",
        },
      ],
      subtotal: 28900,
      domicilio: 0,
      total: 28900,
    };

    await appendPedidoWebApp(pedidoDemo);

    return res.json({
      ok: true,
      mensaje: "Pedido insertado en Google Sheets",
    });
  } catch (error) {
    console.error("❌ Error en /test-sheets:", error);
    return res.status(500).json({
      ok: false,
      error: error.message,
    });
  }
});

// ===============================
// LOGIN ADMIN / REPARTIDOR
// ===============================

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

// ===============================
// CLIENTES
// ===============================

// Registro cliente
app.post("/clientes/registro", (req, res) => {
  try {
    const {
      nombre,
      telefono,
      password,
      pagoPreferido,
      direccion,
      referencia,
      aliasDireccion,
    } = req.body || {};

    if (!nombre || !telefono || !password) {
      return res.status(400).json({
        error: "Nombre, teléfono y contraseña son obligatorios",
      });
    }

    const telefonoLimpio = limpiarNumeroWhatsApp(telefono);

    if (!telefonoLimpio) {
      return res.status(400).json({
        error: "El teléfono no es válido",
      });
    }

    const clientes = leerClientes();

    const yaExiste = clientes.find(
      (c) => limpiarNumeroWhatsApp(c.telefono || "") === telefonoLimpio
    );

    if (yaExiste) {
      return res.status(409).json({
        error: "Ya existe un cliente registrado con ese teléfono",
      });
    }

    const direcciones = [];
    if (String(direccion || "").trim()) {
      direcciones.push({
        id: generarIdDireccion(),
        alias: String(aliasDireccion || "Dirección principal").trim(),
        direccion: String(direccion).trim(),
        referencia: String(referencia || "").trim(),
        principal: true,
        creadaEn: fechaBonita(),
        actualizadaEn: fechaBonita(),
      });
    }

    const cliente = {
      id: generarIdCliente(),
      nombre: String(nombre).trim(),
      telefono: telefonoLimpio,
      password: String(password).trim(),
      pagoPreferido: normalizarMetodoPago(pagoPreferido || "Llave"),
      direcciones,
      creadoEn: fechaBonita(),
      actualizadoEn: fechaBonita(),
    };

    clientes.push(cliente);
    guardarClientes(clientes);

    return res.status(201).json({
      ok: true,
      cliente: sanitizarClienteParaRespuesta(cliente),
    });
  } catch (error) {
    console.error("❌ Error registrando cliente:", error.message);
    return res.status(500).json({
      error: "Error registrando cliente",
    });
  }
});

// Login cliente
app.post("/clientes/login", (req, res) => {
  try {
    const { telefono, password } = req.body || {};

    if (!telefono || !password) {
      return res.status(400).json({
        error: "Teléfono y contraseña son obligatorios",
      });
    }

    const telefonoLimpio = limpiarNumeroWhatsApp(telefono);
    const clientes = leerClientes();

    const cliente = clientes.find(
      (c) =>
        limpiarNumeroWhatsApp(c.telefono || "") === telefonoLimpio &&
        String(c.password || "") === String(password).trim()
    );

    if (!cliente) {
      return res.status(401).json({
        error: "Credenciales incorrectas",
      });
    }

    return res.json({
      ok: true,
      cliente: sanitizarClienteParaRespuesta(cliente),
    });
  } catch (error) {
    console.error("❌ Error login cliente:", error.message);
    return res.status(500).json({
      error: "Error en login de cliente",
    });
  }
});

// Obtener cliente por ID
app.get("/clientes/:id", (req, res) => {
  try {
    const { id } = req.params;
    const clientes = leerClientes();

    const cliente = clientes.find((c) => String(c.id) === String(id));

    if (!cliente) {
      return res.status(404).json({
        error: "Cliente no encontrado",
      });
    }

    return res.json({
      ok: true,
      cliente: sanitizarClienteParaRespuesta(cliente),
    });
  } catch (error) {
    console.error("❌ Error obteniendo cliente:", error.message);
    return res.status(500).json({
      error: "Error obteniendo cliente",
    });
  }
});

// Buscar cliente por teléfono
app.get("/clientes/telefono/:telefono", (req, res) => {
  try {
    const { telefono } = req.params;
    const cliente = buscarClientePorTelefono(telefono);

    if (!cliente) {
      return res.status(404).json({
        error: "Cliente no encontrado",
      });
    }

    return res.json({
      ok: true,
      cliente: sanitizarClienteParaRespuesta(cliente),
    });
  } catch (error) {
    console.error("❌ Error buscando cliente por teléfono:", error.message);
    return res.status(500).json({
      error: "Error buscando cliente",
    });
  }
});

// Actualizar perfil cliente
app.patch("/clientes/:id", (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, telefono, pagoPreferido, password } = req.body || {};
    const clientes = leerClientes();

    const index = clientes.findIndex((c) => String(c.id) === String(id));

    if (index === -1) {
      return res.status(404).json({
        error: "Cliente no encontrado",
      });
    }

    if (telefono !== undefined) {
      const telefonoLimpio = limpiarNumeroWhatsApp(telefono);

      if (!telefonoLimpio) {
        return res.status(400).json({
          error: "El teléfono no es válido",
        });
      }

      const existeTelefonoEnOtro = clientes.find(
        (c, i) =>
          i !== index &&
          limpiarNumeroWhatsApp(c.telefono || "") === telefonoLimpio
      );

      if (existeTelefonoEnOtro) {
        return res.status(409).json({
          error: "Ya existe otro cliente con ese teléfono",
        });
      }

      clientes[index].telefono = telefonoLimpio;
    }

    if (nombre !== undefined) {
      clientes[index].nombre = String(nombre || "").trim();
    }

    if (pagoPreferido !== undefined) {
      clientes[index].pagoPreferido = normalizarMetodoPago(pagoPreferido);
    }

    if (password !== undefined && String(password).trim()) {
      clientes[index].password = String(password).trim();
    }

    clientes[index].actualizadoEn = fechaBonita();

    guardarClientes(clientes);

    return res.json({
      ok: true,
      cliente: sanitizarClienteParaRespuesta(clientes[index]),
    });
  } catch (error) {
    console.error("❌ Error actualizando cliente:", error.message);
    return res.status(500).json({
      error: "Error actualizando cliente",
    });
  }
});

// ===============================
// DIRECCIONES CLIENTE
// ===============================

// Listar direcciones
app.get("/clientes/:id/direcciones", (req, res) => {
  try {
    const { id } = req.params;
    const clientes = leerClientes();

    const cliente = clientes.find((c) => String(c.id) === String(id));

    if (!cliente) {
      return res.status(404).json({
        error: "Cliente no encontrado",
      });
    }

    return res.json({
      ok: true,
      direcciones: Array.isArray(cliente.direcciones) ? cliente.direcciones : [],
    });
  } catch (error) {
    console.error("❌ Error listando direcciones:", error.message);
    return res.status(500).json({
      error: "Error obteniendo direcciones",
    });
  }
});

// Crear dirección
app.post("/clientes/:id/direcciones", (req, res) => {
  try {
    const { id } = req.params;
    const { alias, direccion, referencia, principal } = req.body || {};

    if (!direccion || !String(direccion).trim()) {
      return res.status(400).json({
        error: "La dirección es obligatoria",
      });
    }

    const clientes = leerClientes();
    const index = clientes.findIndex((c) => String(c.id) === String(id));

    if (index === -1) {
      return res.status(404).json({
        error: "Cliente no encontrado",
      });
    }

    if (!Array.isArray(clientes[index].direcciones)) {
      clientes[index].direcciones = [];
    }

    if (principal) {
      clientes[index].direcciones = clientes[index].direcciones.map((d) => ({
        ...d,
        principal: false,
      }));
    }

    const nuevaDireccion = {
      id: generarIdDireccion(),
      alias: String(alias || `Dirección ${clientes[index].direcciones.length + 1}`).trim(),
      direccion: String(direccion).trim(),
      referencia: String(referencia || "").trim(),
      principal:
        Boolean(principal) || clientes[index].direcciones.length === 0,
      creadaEn: fechaBonita(),
      actualizadaEn: fechaBonita(),
    };

    clientes[index].direcciones.push(nuevaDireccion);
    clientes[index].actualizadoEn = fechaBonita();

    guardarClientes(clientes);

    return res.status(201).json({
      ok: true,
      direcciones: clientes[index].direcciones,
      direccion: nuevaDireccion,
    });
  } catch (error) {
    console.error("❌ Error creando dirección:", error.message);
    return res.status(500).json({
      error: "Error creando dirección",
    });
  }
});

// Actualizar dirección
app.patch("/clientes/:id/direcciones/:direccionId", (req, res) => {
  try {
    const { id, direccionId } = req.params;
    const { alias, direccion, referencia, principal } = req.body || {};

    const clientes = leerClientes();
    const indexCliente = clientes.findIndex((c) => String(c.id) === String(id));

    if (indexCliente === -1) {
      return res.status(404).json({
        error: "Cliente no encontrado",
      });
    }

    if (!Array.isArray(clientes[indexCliente].direcciones)) {
      clientes[indexCliente].direcciones = [];
    }

    const indexDireccion = clientes[indexCliente].direcciones.findIndex(
      (d) => String(d.id) === String(direccionId)
    );

    if (indexDireccion === -1) {
      return res.status(404).json({
        error: "Dirección no encontrada",
      });
    }

    if (principal === true) {
      clientes[indexCliente].direcciones =
        clientes[indexCliente].direcciones.map((d) => ({
          ...d,
          principal: false,
        }));
    }

    if (alias !== undefined) {
      clientes[indexCliente].direcciones[indexDireccion].alias = String(alias || "").trim();
    }

    if (direccion !== undefined) {
      clientes[indexCliente].direcciones[indexDireccion].direccion = String(
        direccion || ""
      ).trim();
    }

    if (referencia !== undefined) {
      clientes[indexCliente].direcciones[indexDireccion].referencia = String(
        referencia || ""
      ).trim();
    }

    if (principal !== undefined) {
      clientes[indexCliente].direcciones[indexDireccion].principal =
        Boolean(principal);
    }

    clientes[indexCliente].direcciones[indexDireccion].actualizadaEn =
      fechaBonita();
    clientes[indexCliente].actualizadoEn = fechaBonita();

    guardarClientes(clientes);

    return res.json({
      ok: true,
      direcciones: clientes[indexCliente].direcciones,
      direccion: clientes[indexCliente].direcciones[indexDireccion],
    });
  } catch (error) {
    console.error("❌ Error actualizando dirección:", error.message);
    return res.status(500).json({
      error: "Error actualizando dirección",
    });
  }
});

// Eliminar dirección
app.delete("/clientes/:id/direcciones/:direccionId", (req, res) => {
  try {
    const { id, direccionId } = req.params;

    const clientes = leerClientes();
    const indexCliente = clientes.findIndex((c) => String(c.id) === String(id));

    if (indexCliente === -1) {
      return res.status(404).json({
        error: "Cliente no encontrado",
      });
    }

    if (!Array.isArray(clientes[indexCliente].direcciones)) {
      clientes[indexCliente].direcciones = [];
    }

    const indexDireccion = clientes[indexCliente].direcciones.findIndex(
      (d) => String(d.id) === String(direccionId)
    );

    if (indexDireccion === -1) {
      return res.status(404).json({
        error: "Dirección no encontrada",
      });
    }

    const direccionEliminada = clientes[indexCliente].direcciones[indexDireccion];
    clientes[indexCliente].direcciones.splice(indexDireccion, 1);

    if (
      direccionEliminada.principal &&
      clientes[indexCliente].direcciones.length > 0
    ) {
      clientes[indexCliente].direcciones[0].principal = true;
      clientes[indexCliente].direcciones[0].actualizadaEn = fechaBonita();
    }

    clientes[indexCliente].actualizadoEn = fechaBonita();

    guardarClientes(clientes);

    return res.json({
      ok: true,
      direcciones: clientes[indexCliente].direcciones,
      direccionEliminada,
    });
  } catch (error) {
    console.error("❌ Error eliminando dirección:", error.message);
    return res.status(500).json({
      error: "Error eliminando dirección",
    });
  }
});

// ===============================
// PEDIDOS
// ===============================

app.post("/pedidos", (req, res) => {
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
      clienteId,
      direccionId,
    } = req.body || {};

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
      fechaPago:
        String(estadoPagoInicial).toLowerCase() === "pagado" ? fechaBonita() : "",
      repartidor: "",
      clienteId: clienteId ? String(clienteId).trim() : "",
      direccionId: direccionId ? String(direccionId).trim() : "",
      cliente: {
        nombre: String(cliente.nombre || "").trim(),
        telefono: String(cliente.telefono || "").trim(),
        direccion: String(cliente.direccion || "").trim(),
        referencia: String(cliente.referencia || "").trim(),
        pago: metodoPagoFinal,
      },
      items: Array.isArray(items) ? items : [],
      subtotal: Number(subtotal) || 0,
      domicilio: Number(domicilio) || 0,
      total: Number(total) || 0,
    };

    pedidos.push(nuevoPedido);
    guardarPedidos(pedidos);

    // sincronizar cliente si existe por teléfono o si viene como nuevo
    sincronizarClienteDesdePedido(nuevoPedido.cliente, metodoPagoFinal);

    emitirActualizacionPedidos();
    io.emit("pedido:nuevo", nuevoPedido);

    // Responder primero para no romper la webapp
    res.status(201).json({
      ok: true,
      pedido: nuevoPedido,
    });

    // Integraciones externas después, sin tumbar el pedido
    Promise.allSettled([
      appendPedidoWebApp(nuevoPedido),
      notificarBotPedido(nuevoPedido),
      notificarBotConfirmacionCliente(nuevoPedido),
    ]).then((resultados) => {
      const [sheetsResult, botResult, clienteResult] = resultados;

      if (sheetsResult.status === "fulfilled") {
        console.log("✅ Pedido guardado en Google Sheets:", nuevoPedido.id);
      } else {
        console.error(
          "❌ Error guardando pedido en Google Sheets:",
          sheetsResult.reason?.message || sheetsResult.reason
        );
      }

      if (botResult.status === "rejected") {
        console.error(
          "❌ Error notificando nuevo pedido al bot:",
          botResult.reason?.message || botResult.reason
        );
      }

      if (clienteResult.status === "rejected") {
        console.error(
          "❌ Error notificando confirmación al cliente:",
          clienteResult.reason?.message || clienteResult.reason
        );
      }
    });
  } catch (error) {
    console.error("❌ Error creando pedido:", error);
    return res.status(500).json({
      error: "Error creando pedido",
      detalle: error.message,
    });
  }
});

app.get("/pedidos", (req, res) => {
  try {
    const pedidos = leerPedidos();
    return res.json(pedidos);
  } catch (error) {
    console.error("❌ Error obteniendo pedidos:", error.message);
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
    console.error("❌ Error obteniendo pedido:", error.message);
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
    console.error("❌ Error consultando seguimiento:", error.message);
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

    pedidos[index].estado = String(estado).trim();
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

    pedidos[index].repartidor = String(repartidor).trim();
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
    console.error("❌ Error eliminando pedido:", error.message);
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
    console.error("❌ Error obteniendo pedidos del repartidor:", error.message);
    return res.status(500).json({
      error: "Error obteniendo pedidos del repartidor",
    });
  }
});

// ===============================
// INICIO
// ===============================

server.listen(PORT, async () => {
  asegurarArchivoPedidos();
  asegurarArchivoClientes();

  try {
    await ensureSheetExists();
    console.log('✅ Hoja "pedidos web app" verificada/creada correctamente');
  } catch (error) {
    console.error("❌ Error inicializando Google Sheets:", error.message);
  }

  console.log(`🚀 Servidor Dr. Crispy Lab corriendo en http://localhost:${PORT}`);
});