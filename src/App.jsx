import { useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";
import alertaSound from "./assets/alerta.mp3";
import heroImage from "./assets/hero.png";
import drCrispyFull from "./assets/drcrispy.png";
import drCrispyIcon from "./assets/icono.jpg";
import alitasBg from "./assets/alitas-bg.png";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
const WHATSAPP_NUMBER = "573152487938";

const socket = io(API_URL, {
  transports: ["websocket", "polling"],
});

const FORMULAS = [
  {
    id: 1,
    nombre: "Alitas x6",
    descripcion: "6 alitas crispy del laboratorio",
    precio: 28900,
    emoji: "🍗",
    categoria: "formulas",
  },
  {
    id: 2,
    nombre: "Alitas x12",
    descripcion: "12 alitas crispy del laboratorio",
    precio: 48900,
    emoji: "🔥",
    categoria: "formulas",
  },
  {
    id: 3,
    nombre: "Alitas x18",
    descripcion: "18 alitas crispy del laboratorio",
    precio: 71900,
    emoji: "🧪",
    categoria: "formulas",
  },
  {
    id: 4,
    nombre: "Alitas x24",
    descripcion: "24 alitas crispy del laboratorio",
    precio: 92900,
    emoji: "💥",
    categoria: "formulas",
  },
];

const BEBIDAS = [
  {
    id: 5,
    nombre: "Coca-Cola PET 400",
    descripcion: "Bebida fría",
    precio: 4500,
    emoji: "🥤",
    categoria: "bebidas",
  },
  {
    id: 6,
    nombre: "Coca-Cola 1½",
    descripcion: "Bebida fría",
    precio: 8000,
    emoji: "🥤",
    categoria: "bebidas",
  },
  {
    id: 7,
    nombre: "Coca-Cola 2.25 L",
    descripcion: "Bebida fría",
    precio: 10000,
    emoji: "🥤",
    categoria: "bebidas",
  },
  {
    id: 8,
    nombre: "Soda PET 400",
    descripcion: "Bebida fría",
    precio: 4000,
    emoji: "🥤",
    categoria: "bebidas",
  },
];

const ADICIONALES = [
  {
    id: 9,
    nombre: "Papas fritas",
    descripcion: "Adicional del laboratorio",
    precio: 5000,
    emoji: "🍟",
    categoria: "adicionales",
  },
];

const SALSAS = [
  {
    nombre: "BBQ Reactor",
    descripcion: "Salsa BBQ ahumada",
    emoji: "🍖",
  },
  {
    nombre: "Honey Mutante",
    descripcion: "Miel mostaza",
    emoji: "🍯",
  },
  {
    nombre: "Fuego Atómico",
    descripcion: "Aceite picante Nashville",
    emoji: "🌶️",
  },
];

const EXPERIMENTOS = [
  {
    id: "exp1",
    titulo: "Experimento 01",
    subtitulo: "Alitas Crispy",
    descripcion: "Fuego Atómico, Honey Mutante y BBQ Reactor",
    estado: "activo",
    imagen: alitasBg,
    badge: "ACTIVO",
  },
  {
    id: "exp2",
    titulo: "Experimento 02",
    subtitulo: "Experimento en incubación",
    descripcion: "Próximamente una nueva creación del laboratorio.",
    estado: "proximamente",
    imagen: heroImage,
    badge: "PRÓXIMAMENTE",
  },
  {
    id: "exp3",
    titulo: "Experimento 03",
    subtitulo: "Experimento en incubación",
    descripcion: "Seguimos cocinando una nueva mutación del sabor.",
    estado: "proximamente",
    imagen: heroImage,
    badge: "PRÓXIMAMENTE",
  },
];

const ESTADOS = ["Recibido", "En cocina", "En camino", "Entregado"];
const FILTROS_ESTADO = ["Todos", ...ESTADOS];

function App() {
  const [vista, setVista] = useState("cliente");
  const [rutaPrivada, setRutaPrivada] = useState("");
  const [ancho, setAncho] = useState(window.innerWidth);
  const [seccionCliente, setSeccionCliente] = useState("inicio");
  const [cardHover, setCardHover] = useState("");

  const [carrito, setCarrito] = useState([]);
  const [cliente, setCliente] = useState({
    nombre: "",
    telefono: "",
    direccion: "",
    referencia: "",
    pago: "Nequi",
  });

  const [pedidos, setPedidos] = useState([]);
  const [pedidosRepartidor, setPedidosRepartidor] = useState([]);

  const [adminLogueado, setAdminLogueado] = useState(false);
  const [repartidorLogueado, setRepartidorLogueado] = useState(false);

  const [adminUser, setAdminUser] = useState(null);
  const [repartidorUser, setRepartidorUser] = useState(null);

  const [loginAdmin, setLoginAdmin] = useState({
    username: "",
    password: "",
  });

  const [loginRepartidor, setLoginRepartidor] = useState({
    username: "Repartidor",
    password: "",
  });

  const [cargandoPedido, setCargandoPedido] = useState(false);
  const [cargandoAdmin, setCargandoAdmin] = useState(false);
  const [cargandoRepartidor, setCargandoRepartidor] = useState(false);
  const [eliminandoPedidoId, setEliminandoPedidoId] = useState("");

  const [mensaje, setMensaje] = useState({ tipo: "", texto: "" });

  const [pedidoCreadoId, setPedidoCreadoId] = useState("");
  const [trackingToken, setTrackingToken] = useState(
    localStorage.getItem("dr_tracking_token") || ""
  );
  const [pedidoConsultado, setPedidoConsultado] = useState(null);
  const [cargandoSeguimiento, setCargandoSeguimiento] = useState(false);

  const [socketConectado, setSocketConectado] = useState(false);

  const [filtroEstadoAdmin, setFiltroEstadoAdmin] = useState("Todos");
  const [busquedaAdmin, setBusquedaAdmin] = useState("");
  const [modoCocina, setModoCocina] = useState(false);

  const [formulaSeleccionada, setFormulaSeleccionada] = useState(null);
  const [salsaPendiente, setSalsaPendiente] = useState(null);
  const [nivelAtomico, setNivelAtomico] = useState("");

  const audioRef = useRef(null);
  const pedidosInicialesCargadosRef = useRef(false);

  const esMovil = ancho < 900;
  const puedeVerAdmin = rutaPrivada === "admin";
  const puedeVerRepartidor = rutaPrivada === "repartidor";

  useEffect(() => {
    function handleResize() {
      setAncho(window.innerWidth);
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  function mostrarMensaje(tipo, texto) {
    setMensaje({ tipo, texto });
    setTimeout(() => setMensaje({ tipo: "", texto: "" }), 3500);
  }

  function limpiarCliente() {
    setCliente({
      nombre: "",
      telefono: "",
      direccion: "",
      referencia: "",
      pago: "Nequi",
    });
  }

  function getCartKey(producto) {
    return `${producto.id}-${producto.salsa || "sin-salsa"}`;
  }

  function agregarProducto(producto) {
    const key = getCartKey(producto);
    const existente = carrito.find((item) => item.cartKey === key);

    if (existente) {
      setCarrito((prev) =>
        prev.map((item) =>
          item.cartKey === key
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        )
      );
      return;
    }

    setCarrito((prev) => [
      ...prev,
      {
        ...producto,
        cantidad: 1,
        cartKey: key,
        experimento: "Experimento 1",
        categoriaExperimento: "Alitas Crispy",
      },
    ]);
  }

  function seleccionarSalsa(producto, salsa) {
    if (salsa.nombre === "Fuego Atómico") {
      setSalsaPendiente({ producto, salsa });
      setNivelAtomico("");
      return;
    }

    agregarProducto({
      ...producto,
      salsa: salsa.nombre,
    });

    setFormulaSeleccionada(null);
    mostrarMensaje("ok", `${producto.nombre} agregado con ${salsa.nombre}.`);
  }

  function confirmarFuegoAtomico() {
    if (!salsaPendiente || !nivelAtomico) {
      mostrarMensaje("error", "Selecciona nivel bajo, medio o alto.");
      return;
    }

    agregarProducto({
      ...salsaPendiente.producto,
      salsa: `${salsaPendiente.salsa.nombre} - ${nivelAtomico}`,
    });

    mostrarMensaje(
      "ok",
      `${salsaPendiente.producto.nombre} agregado con Fuego Atómico ${nivelAtomico}.`
    );

    setSalsaPendiente(null);
    setNivelAtomico("");
    setFormulaSeleccionada(null);
  }

  function cambiarCantidad(cartKey, cambio) {
    setCarrito((prev) =>
      prev
        .map((item) =>
          item.cartKey === cartKey
            ? { ...item, cantidad: item.cantidad + cambio }
            : item
        )
        .filter((item) => item.cantidad > 0)
    );
  }

  function actualizarCliente(campo, valor) {
    setCliente((prev) => ({ ...prev, [campo]: valor }));
  }

  function validarCliente() {
    if (!cliente.nombre.trim()) return "Completa el nombre.";
    if (!cliente.telefono.trim()) return "Completa el teléfono.";
    if (!/^[0-9+\-\s]{7,20}$/.test(cliente.telefono.trim())) {
      return "El teléfono no parece válido.";
    }
    if (!cliente.direccion.trim()) return "Completa la dirección.";
    if (carrito.length === 0) return "Agrega al menos un producto.";
    return null;
  }

  const subtotal = useMemo(() => {
    return carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
  }, [carrito]);

  const domicilio = 0;
  const total = subtotal;

  const pedidosDelDia = useMemo(() => {
    const hoy = new Date().toLocaleDateString("es-CO");
    return pedidos.filter((pedido) => {
      const fechaPedido = new Date(pedido.fecha);
      if (isNaN(fechaPedido.getTime())) return String(pedido.fecha).includes(hoy);
      return fechaPedido.toLocaleDateString("es-CO") === hoy;
    }).length;
  }, [pedidos]);

  const pedidosAdminFiltrados = useMemo(() => {
    const texto = busquedaAdmin.trim().toLowerCase();

    return pedidos.filter((pedido) => {
      const coincideEstado =
        filtroEstadoAdmin === "Todos" || pedido.estado === filtroEstadoAdmin;

      const coincideBusqueda =
        !texto ||
        String(pedido.id).toLowerCase().includes(texto) ||
        String(pedido?.cliente?.nombre || "").toLowerCase().includes(texto) ||
        String(pedido?.cliente?.telefono || "").toLowerCase().includes(texto);

      return coincideEstado && coincideBusqueda;
    });
  }, [pedidos, filtroEstadoAdmin, busquedaAdmin]);

  const pedidosCocina = useMemo(() => {
    return pedidos
      .filter((p) => p.estado !== "Entregado")
      .sort((a, b) => {
        const orden = {
          Recibido: 1,
          "En cocina": 2,
          "En camino": 3,
          Entregado: 4,
        };
        return orden[a.estado] - orden[b.estado];
      });
  }, [pedidos]);

  function construirTextoWhatsApp() {
    const lineas = [
      "🧪 *Pedido Dr. Crispy Lab*",
      "",
      `👤 Cliente: ${cliente.nombre || "-"}`,
      `📞 Teléfono: ${cliente.telefono || "-"}`,
      `📍 Dirección: ${cliente.direccion || "-"}`,
      `📝 Referencia: ${cliente.referencia || "-"}`,
      `💳 Pago: ${cliente.pago || "-"}`,
      "",
      "*Productos:*",
      ...carrito.map(
        (item) =>
          `- ${item.experimento || "Experimento 1"} | ${item.nombre} x${item.cantidad}${
            item.salsa ? ` | ${item.salsa}` : ""
          } | $${(item.precio * item.cantidad).toLocaleString("es-CO")}`
      ),
      "",
      `Subtotal: $${subtotal.toLocaleString("es-CO")}`,
      "Domicilio: Incluido",
      `Total: *$${total.toLocaleString("es-CO")}*`,
    ];

    return lineas.join("\n");
  }

  function abrirWhatsAppPedido() {
    const errorValidacion = validarCliente();
    if (errorValidacion) {
      mostrarMensaje("error", errorValidacion);
      return;
    }

    const texto = construirTextoWhatsApp();
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(texto)}`;
    window.open(url, "_blank");
  }

  function imprimirTicketPedido(pedido) {
    const contenido = `
      <html>
        <head>
          <title>Ticket ${pedido.id}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              color: #000;
            }
            h1, h2, h3, p { margin: 0 0 10px 0; }
            .linea { border-top: 1px dashed #000; margin: 12px 0; }
            ul { padding-left: 18px; }
            .big { font-size: 22px; font-weight: bold; }
          </style>
        </head>
        <body>
          <h2>Dr. Crispy Lab</h2>
          <p><strong>Pedido:</strong> ${pedido.id}</p>
          <p><strong>Fecha:</strong> ${pedido.fecha}</p>
          <div class="linea"></div>
          <p><strong>Cliente:</strong> ${pedido.cliente.nombre}</p>
          <p><strong>Teléfono:</strong> ${pedido.cliente.telefono}</p>
          <p><strong>Dirección:</strong> ${pedido.cliente.direccion}</p>
          <p><strong>Referencia:</strong> ${pedido.cliente.referencia || "N/A"}</p>
          <p><strong>Pago:</strong> ${pedido.cliente.pago}</p>
          <div class="linea"></div>
          <h3>Productos</h3>
          <ul>
            ${pedido.items
              .map(
                (item) =>
                  `<li>${item.experimento || "Experimento 1"} | ${item.nombre} x${item.cantidad}${
                    item.salsa ? ` - ${item.salsa}` : ""
                  } - $${(item.precio * item.cantidad).toLocaleString("es-CO")}</li>`
              )
              .join("")}
          </ul>
          <div class="linea"></div>
          <p>Subtotal: $${pedido.subtotal.toLocaleString("es-CO")}</p>
          <p>Domicilio: Incluido</p>
          <p class="big">Total: $${pedido.total.toLocaleString("es-CO")}</p>
        </body>
      </html>
    `;

    const ventana = window.open("", "_blank", "width=500,height=700");
    if (!ventana) return;

    ventana.document.write(contenido);
    ventana.document.close();
    ventana.focus();
    ventana.print();
  }

  async function confirmarPedido() {
    const errorValidacion = validarCliente();

    if (errorValidacion) {
      mostrarMensaje("error", errorValidacion);
      return;
    }

    try {
      setCargandoPedido(true);

      const response = await fetch(`${API_URL}/pedidos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cliente: {
            ...cliente,
            nombre: cliente.nombre.trim(),
            telefono: cliente.telefono.trim(),
            direccion: cliente.direccion.trim(),
            referencia: cliente.referencia.trim(),
          },
          items: carrito,
          subtotal,
          domicilio,
          total,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error guardando pedido");
      }

      const nuevoId = data?.pedido?.id || "";
      const nuevoTrackingToken = data?.pedido?.trackingToken || "";

      setPedidoCreadoId(nuevoId);
      setTrackingToken(nuevoTrackingToken);
      setPedidoConsultado(data?.pedido || null);

      localStorage.setItem("dr_tracking_token", nuevoTrackingToken);

      mostrarMensaje("ok", `Pedido creado correctamente: ${nuevoId}`);
      setCarrito([]);
      limpiarCliente();

      setVista("seguimiento");
      consultarMiSeguimiento(nuevoTrackingToken);
    } catch (error) {
      mostrarMensaje("error", error.message);
    } finally {
      setCargandoPedido(false);
    }
  }

  async function consultarMiSeguimiento(tokenManual) {
    const token = (tokenManual ?? trackingToken).trim();

    if (!token) {
      mostrarMensaje("error", "Aún no tienes un pedido asociado en este dispositivo.");
      return;
    }

    try {
      setCargandoSeguimiento(true);

      const response = await fetch(
        `${API_URL}/seguimiento/${encodeURIComponent(token)}`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "No se pudo consultar el seguimiento");
      }

      setPedidoConsultado(data.pedido);
      mostrarMensaje("ok", `Seguimiento actualizado: ${data.pedido.id}`);
    } catch (error) {
      setPedidoConsultado(null);
      mostrarMensaje("error", error.message);
    } finally {
      setCargandoSeguimiento(false);
    }
  }

  async function cargarPedidosAdmin() {
    try {
      const response = await fetch(`${API_URL}/pedidos`);
      const data = await response.json();
      const ordenados = Array.isArray(data) ? [...data].reverse() : [];
      setPedidos(ordenados);
    } catch (error) {
      console.error("Error cargando pedidos admin", error);
      mostrarMensaje("error", "No se pudieron cargar los pedidos del admin.");
    }
  }

  async function entrarAdmin() {
    if (!loginAdmin.username || !loginAdmin.password) {
      mostrarMensaje("error", "Completa usuario y contraseña de admin.");
      return;
    }

    try {
      setCargandoAdmin(true);

      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginAdmin),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login incorrecto");
      }

      if (data.user.role !== "admin") {
        throw new Error("Este usuario no es admin");
      }

      setAdminUser(data.user);
      setAdminLogueado(true);
      mostrarMensaje("ok", `Bienvenido ${data.user.nombre}`);
      await cargarPedidosAdmin();
    } catch (error) {
      mostrarMensaje("error", error.message);
    } finally {
      setCargandoAdmin(false);
    }
  }

  async function entrarRepartidor() {
    if (!loginRepartidor.username || !loginRepartidor.password) {
      mostrarMensaje("error", "Completa usuario y contraseña de repartidor.");
      return;
    }

    try {
      setCargandoRepartidor(true);

      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginRepartidor),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login incorrecto");
      }

      if (data.user.role !== "repartidor") {
        throw new Error("Este usuario no es repartidor");
      }

      setRepartidorUser(data.user);
      setRepartidorLogueado(true);
      mostrarMensaje("ok", `Bienvenido ${data.user.nombre}`);
    } catch (error) {
      mostrarMensaje("error", error.message);
    } finally {
      setCargandoRepartidor(false);
    }
  }

  async function cambiarEstado(id, nuevoEstado) {
    try {
      const response = await fetch(`${API_URL}/pedidos/${id}/estado`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ estado: nuevoEstado }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "No se pudo cambiar el estado");
      }

      mostrarMensaje("ok", `Pedido ${id} actualizado a "${nuevoEstado}"`);

      if (pedidoConsultado?.id === id) {
        await consultarMiSeguimiento();
      }
    } catch (error) {
      mostrarMensaje("error", error.message);
    }
  }

  async function asignarRepartidor(id, nombre) {
    try {
      const response = await fetch(`${API_URL}/pedidos/${id}/repartidor`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ repartidor: nombre }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "No se pudo asignar repartidor");
      }

      mostrarMensaje("ok", `Pedido ${id} asignado a ${nombre}`);

      if (pedidoConsultado?.id === id) {
        await consultarMiSeguimiento();
      }
    } catch (error) {
      mostrarMensaje("error", error.message);
    }
  }

  async function eliminarPedido(id) {
    const confirmar = window.confirm(`¿Seguro que deseas eliminar el pedido ${id}?`);
    if (!confirmar) return;

    try {
      setEliminandoPedidoId(id);

      const response = await fetch(`${API_URL}/pedidos/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "No se pudo eliminar el pedido");
      }

      if (pedidoConsultado?.id === id) {
        setPedidoConsultado(null);
      }

      mostrarMensaje("ok", `Pedido ${id} eliminado correctamente.`);
    } catch (error) {
      mostrarMensaje("error", error.message);
    } finally {
      setEliminandoPedidoId("");
    }
  }

  function colorEstado(estado) {
    switch (estado) {
      case "Recibido":
        return {
          background: "#332200",
          border: "1px solid #8a5a00",
          color: "#ffd27d",
        };
      case "En cocina":
        return {
          background: "#2b1200",
          border: "1px solid #b84d00",
          color: "#ffb17d",
        };
      case "En camino":
        return {
          background: "#0f2134",
          border: "1px solid #245f9e",
          color: "#8ec5ff",
        };
      case "Entregado":
        return {
          background: "#102917",
          border: "1px solid #2d8c4b",
          color: "#9ef0b8",
        };
      default:
        return {
          background: "#2a2a2a",
          border: "1px solid #444",
          color: "#fff",
        };
    }
  }

  useEffect(() => {
    function manejarConnect() {
      setSocketConectado(true);
    }

    function manejarDisconnect() {
      setSocketConectado(false);
    }

    function manejarPedidosActualizados(todosLosPedidos) {
      const ordenados = Array.isArray(todosLosPedidos)
        ? [...todosLosPedidos].reverse()
        : [];

      const cantidadAnterior = pedidos.length;
      const cantidadNueva = Array.isArray(todosLosPedidos)
        ? todosLosPedidos.length
        : 0;

      if (
        adminLogueado &&
        pedidosInicialesCargadosRef.current &&
        cantidadNueva > cantidadAnterior
      ) {
        audioRef.current?.play().catch(() => {});
        mostrarMensaje("ok", "🚨 Nuevo pedido recibido en el laboratorio.");
      }

      setPedidos(ordenados);

      if (repartidorLogueado && repartidorUser?.nombre) {
        const filtrados = ordenados.filter(
          (pedido) =>
            String(pedido.repartidor).trim().toLowerCase() ===
            String(repartidorUser.nombre).trim().toLowerCase()
        );
        setPedidosRepartidor(filtrados);
      }

      if (trackingToken) {
        const actualizado = ordenados.find(
          (p) => p.trackingToken === trackingToken
        );
        if (actualizado) {
          setPedidoConsultado(actualizado);
        }
      }

      pedidosInicialesCargadosRef.current = true;
    }

    socket.on("connect", manejarConnect);
    socket.on("disconnect", manejarDisconnect);
    socket.on("pedidos:actualizados", manejarPedidosActualizados);

    return () => {
      socket.off("connect", manejarConnect);
      socket.off("disconnect", manejarDisconnect);
      socket.off("pedidos:actualizados", manejarPedidosActualizados);
    };
  }, [
    adminLogueado,
    repartidorLogueado,
    repartidorUser,
    pedidos.length,
    trackingToken,
  ]);

  useEffect(() => {
    if (adminLogueado) {
      cargarPedidosAdmin();
    }
  }, [adminLogueado]);

  useEffect(() => {
    setAdminLogueado(false);
    setRepartidorLogueado(false);
    setAdminUser(null);
    setRepartidorUser(null);
    setVista("cliente");
  }, []);

  useEffect(() => {
    const aplicarVistaSegunHash = () => {
      const hash = window.location.hash.toLowerCase();

      if (hash === "#admin") {
        setRutaPrivada("admin");
        setVista("admin");
        return;
      }

      if (hash === "#repartidor") {
        setRutaPrivada("repartidor");
        setVista("repartidor");
        return;
      }

      setRutaPrivada("");
      setVista("cliente");
    };

    aplicarVistaSegunHash();
    window.addEventListener("hashchange", aplicarVistaSegunHash);

    return () => {
      window.removeEventListener("hashchange", aplicarVistaSegunHash);
    };
  }, []);

  useEffect(() => {
    if (!puedeVerAdmin && vista === "admin") {
      setVista("cliente");
    }

    if (!puedeVerRepartidor && vista === "repartidor") {
      setVista("cliente");
    }
  }, [vista, puedeVerAdmin, puedeVerRepartidor]);

  function irASeccionCliente(seccion) {
    setVista("cliente");
    setSeccionCliente(seccion);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function entrarExperimento1() {
    setSeccionCliente("experimento1");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function notificarProximamente(experimento) {
    const texto = `Hola Dr. Crispy Lab, quiero que me avisen cuando esté disponible ${experimento.titulo} - ${experimento.subtitulo}.`;
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(texto)}`;
    window.open(url, "_blank");
  }

  function renderFormulaCard(producto) {
    return (
      <div key={producto.id} style={styles.posterProductCard}>
        <div style={styles.posterProductTop}>
          <div style={styles.posterEmoji}>{producto.emoji}</div>
          <div style={styles.posterChip}>EXPERIMENTO ACTIVO</div>
        </div>

        <h3 style={styles.posterProductTitle}>{producto.nombre}</h3>
        <p style={styles.posterProductDesc}>{producto.descripcion}</p>
        <div style={styles.posterProductPrice}>
          ${producto.precio.toLocaleString("es-CO")}
        </div>

        <button
          style={styles.selectSauceBigBtn}
          onClick={() => setFormulaSeleccionada(producto)}
        >
          Elegir fórmula
        </button>
      </div>
    );
  }

  function renderSimpleCard(producto) {
    return (
      <div key={producto.id} style={styles.simpleMenuCard}>
        <div style={styles.simpleEmoji}>{producto.emoji}</div>
        <h3 style={styles.simpleTitle}>{producto.nombre}</h3>
        <p style={styles.simpleDesc}>{producto.descripcion}</p>
        <div style={styles.simplePrice}>
          ${producto.precio.toLocaleString("es-CO")}
        </div>
        <button style={styles.addBtnPro} onClick={() => agregarProducto(producto)}>
          Agregar al experimento
        </button>
      </div>
    );
  }

  function renderHeroInicio() {
  return (
    <section
      style={{
        ...styles.labHero,
        gridTemplateColumns: esMovil ? "1fr" : "1.1fr 0.9fr",
      }}
    >
      <div style={styles.labHeroContent}>
        <div style={styles.heroMini}>🧪 LABORATORIO ACTIVO</div>

        <h2 style={styles.labHeroTitle}>
          BIENVENIDO AL LABORATORIO DEL DR. CRISPY
        </h2>

        <p style={styles.labHeroText}>
          Aquí no vendemos solo comida. Creamos experimentos crujientes con
          salsa, fuego y sabor. No es pollo. Es un experimento.
        </p>

        <div style={styles.heroActionRow}>
          <button
            style={styles.heroPrimaryBtn}
            onClick={() => irASeccionCliente("catalogo")}
          >
            Ver experimentos
          </button>

          <button
            style={styles.heroSecondaryBtn}
            onClick={() => setVista("seguimiento")}
          >
            Ver mi seguimiento
          </button>
        </div>
      </div>

      <div style={styles.labHeroVisual}>
        <div style={styles.heroVisualCard}>
          <div style={styles.reactorGlow}></div>
          <div style={styles.smokeGlow}></div>

          <span style={{ ...styles.labParticle, ...styles.labParticle1 }}></span>
          <span style={{ ...styles.labParticle, ...styles.labParticle2 }}></span>
          <span style={{ ...styles.labParticle, ...styles.labParticle3 }}></span>
          <span style={{ ...styles.labParticle, ...styles.labParticle4 }}></span>
          <span style={{ ...styles.labParticle, ...styles.labParticle5 }}></span>

          <div
            style={{
              ...styles.heroLogoWrap,
              animation:
                "crispyGlow 1.8s ease-in-out infinite, crispyFloat 2.2s ease-in-out infinite",
            }}
          >
            <img
              src={drCrispyIcon}
              alt="Dr. Crispy Lab"
              style={{
                width: "120%",
                height: "120%",
                objectFit: "cover",
                transform: "scale(1.1)",
              }}
            />
          </div>

          <div style={styles.heroVisualTag}>DR. CRISPY LAB</div>

          <img
            src={drCrispyFull}
            alt="Dr. Crispy"
            style={{
              ...styles.heroFullImage,
              animation: "crispyFloat 3.5s ease-in-out infinite",
            }}
          />
        </div>
      </div>
    </section>
  );
}

function renderCatalogoExperimentos() {
  return (
    <section style={styles.panel}>
      <div style={styles.catalogHeader}>
        <div style={styles.menuInteractiveBadge}>🧬 CATÁLOGO DEL LAB</div>
        <h2 style={styles.catalogTitle}>ELIGE TU EXPERIMENTO</h2>
        <p style={styles.catalogText}>
          El Experimento 1 ya está activo. Los siguientes se están preparando
          en el laboratorio.
        </p>
      </div>

      <div
        style={{
          ...styles.experimentosGrid,
          gridTemplateColumns: esMovil ? "1fr" : "repeat(3, minmax(0, 1fr))",
        }}
      >
        {EXPERIMENTOS.map((experimento) => (
          <div
              key={experimento.id}
              style={{
                ...styles.experimentCard,
                ...(experimento.id === "exp1" ? styles.experimentCardActive : {}),
                ...(cardHover === experimento.id ? styles.experimentCardHover : {}),
              }}
              onMouseEnter={() => setCardHover(experimento.id)}
              onMouseLeave={() => setCardHover("")}
            >
            <div
              style={{
                ...styles.experimentImage,
                backgroundImage:
                  experimento.id === "exp1"
                    ? `linear-gradient(rgba(0,0,0,0.48), rgba(0,0,0,0.72)), url(${experimento.imagen})`
                    : `linear-gradient(rgba(0,0,0,0.40), rgba(0,0,0,0.65)), url(${experimento.imagen})`,
                              }}
            >
              {experimento.id === "exp1" && (
                <>
                  <div style={styles.exp1Glow}></div>
                  <div style={styles.exp1BlurWing}></div>
                  <div style={styles.exp1BlurWing2}></div>

                  <span style={{ ...styles.salsaDot, ...styles.salsaDot1 }}></span>
                  <span style={{ ...styles.salsaDot, ...styles.salsaDot2 }}></span>
                  <span style={{ ...styles.salsaDot, ...styles.salsaDot3 }}></span>
                  <span style={{ ...styles.salsaDot, ...styles.salsaDot4 }}></span>
                </>
              )}

              <div
                style={{
                  ...styles.experimentBadge,
                  ...(experimento.estado === "activo"
                    ? styles.experimentBadgeActive
                    : styles.experimentBadgeSoon),
                }}
              >
                {experimento.badge}
              </div>
            </div>

            <div style={styles.experimentBody}>
              <h3 style={styles.experimentTitle}>{experimento.titulo}</h3>
              <div style={styles.experimentSubtitle}>{experimento.subtitulo}</div>
              <p style={styles.experimentDescription}>
                {experimento.descripcion}
              </p>

              {experimento.estado === "activo" ? (
                <button
                  style={styles.experimentBtn}
                  onClick={entrarExperimento1}
                >
                  Entrar al experimento
                </button>
              ) : (
                <button
                  style={styles.experimentGhostBtn}
                  onClick={() => notificarProximamente(experimento)}
                >
                  Notificarme por WhatsApp
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

  function renderExperimento1() {
  return (
    <section
      style={{
        ...styles.mainGrid,
        gridTemplateColumns: esMovil ? "1fr" : "1.35fr 0.85fr",
      }}
    >
      <div>
        <div style={styles.panel}>
          <div style={styles.experimentoHeaderRow}>
            <div>
              <div style={styles.menuInteractiveBadge}>🔥 EXPERIMENTO 1 ACTIVO</div>
              <h2 style={styles.experimentScreenTitle}>ALITAS CRISPY</h2>
              <p style={styles.experimentScreenText}>
                Fuego Atómico, Honey Mutante y BBQ Reactor.
              </p>
            </div>

            <button
              style={styles.backCatalogBtn}
              onClick={() => irASeccionCliente("catalogo")}
            >
              ← Volver a experimentos
            </button>
          </div>
        </div>

        <div style={styles.posterMenuWrap}>
          <div
            style={{
              ...styles.posterHero,
              backgroundImage: `linear-gradient(rgba(0,0,0,0.58), rgba(0,0,0,0.82)), url(${alitasBg})`,
            }}
          >
            <div style={styles.posterHeroGlow}></div>
            <span style={{ ...styles.posterSauceDot, ...styles.posterSauceDot1 }}></span>
            <span style={{ ...styles.posterSauceDot, ...styles.posterSauceDot2 }}></span>
            <span style={{ ...styles.posterSauceDot, ...styles.posterSauceDot3 }}></span>

            <div style={styles.posterOverlayContent}>
              <div style={styles.posterBrand}>DR. CRISPY LAB</div>
              <h2 style={styles.posterMainTitle}>CRISPY ALITAS DEL LAB</h2>
              <div style={styles.posterExperiment}>EXPERIMENTO 01</div>
            </div>
          </div>

          <div
            style={{
              ...styles.posterSections,
              gridTemplateColumns: esMovil ? "1fr" : "1.2fr 0.8fr",
            }}
          >
            <div style={styles.posterLeftCol}>
              <div style={styles.posterBlock}>
                <h3 style={styles.posterSectionTitle}>FORMULAS ACTIVADAS</h3>

                <div style={styles.posterInfoList}>
                  <div style={styles.posterInfoItem}>
                    <strong>BBQ REACTOR</strong>{" "}
                    <span>(SALSA BBQ AHUMADA)</span>
                  </div>
                  <div style={styles.posterInfoItem}>
                    <strong>HONEY MUTANTE</strong>{" "}
                    <span>(MIEL MOSTAZA)</span>
                  </div>
                  <div style={styles.posterInfoItem}>
                    <strong>FUEGO ATÓMICO</strong>{" "}
                    <span>(ACEITE PICANTE NASHVILLE)</span>
                  </div>
                </div>
              </div>

              <div style={styles.posterBlock}>
                <h3 style={styles.posterSectionTitle}>PICANTE ESPECIAL</h3>
                <div style={styles.reactionScale}>
                  <div style={styles.reactionItem}>
                    Fuego Atómico permite nivel bajo, medio o alto.
                  </div>
                </div>
              </div>
            </div>

            <div style={styles.posterRightCol}>
              <div style={styles.posterBlock}>
                <h3 style={styles.posterSectionTitle}>EXPERIMENTOS</h3>
                <div style={styles.posterPriceList}>
                  {FORMULAS.map((item) => (
                    <div key={item.id} style={styles.posterPriceRow}>
                      <span>{item.nombre.toUpperCase()}</span>
                      <span>${item.precio.toLocaleString("es-CO")}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={styles.posterBlock}>
                <h3 style={styles.posterSectionTitle}>BEBIDAS</h3>
                <div style={styles.posterPriceList}>
                  {BEBIDAS.map((item) => (
                    <div key={item.id} style={styles.posterPriceRow}>
                      <span>{item.nombre.toUpperCase()}</span>
                      <span>${item.precio.toLocaleString("es-CO")}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={styles.posterBlock}>
                <h3 style={styles.posterSectionTitle}>ADICIONALES</h3>
                <div style={styles.posterPriceList}>
                  {ADICIONALES.map((item) => (
                    <div key={item.id} style={styles.posterPriceRow}>
                      <span>{item.nombre.toUpperCase()}</span>
                      <span>${item.precio.toLocaleString("es-CO")}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div style={styles.menuInteractiveSection}>
            <div style={styles.menuInteractiveHeader}>
              <div style={styles.menuInteractiveBadge}>🍗 MENÚ INTERACTIVO</div>
              <h2 style={styles.menuInteractiveTitle}>
                SELECCIONA TU EXPERIMENTO
              </h2>
            </div>

            <div
              style={{
                ...styles.posterFormulaGrid,
                gridTemplateColumns: esMovil
                  ? "1fr"
                  : "repeat(2, minmax(0, 1fr))",
              }}
            >
              {FORMULAS.map(renderFormulaCard)}
            </div>

            <div style={styles.subSectionTitleWrap}>
              <h3 style={styles.subSectionTitle}>🥤 BEBIDAS</h3>
            </div>

            <div
              style={{
                ...styles.simpleGrid,
                gridTemplateColumns: esMovil
                  ? "1fr"
                  : "repeat(2, minmax(0, 1fr))",
              }}
            >
              {BEBIDAS.map(renderSimpleCard)}
            </div>

            <div style={styles.subSectionTitleWrap}>
              <h3 style={styles.subSectionTitle}>🍟 ADICIONALES</h3>
            </div>

            <div
              style={{
                ...styles.simpleGrid,
                gridTemplateColumns: esMovil
                  ? "1fr"
                  : "repeat(2, minmax(0, 1fr))",
              }}
            >
              {ADICIONALES.map(renderSimpleCard)}
            </div>
          </div>
        </div>

        <div style={styles.panel}>
          <h2 style={styles.panelTitle}>📋 CHECKOUT DEL EXPERIMENTO</h2>

          <Input
            label="Nombre"
            value={cliente.nombre}
            onChange={(e) => actualizarCliente("nombre", e.target.value)}
          />
          <Input
            label="Teléfono"
            value={cliente.telefono}
            onChange={(e) => actualizarCliente("telefono", e.target.value)}
          />
          <Input
            label="Dirección"
            value={cliente.direccion}
            onChange={(e) => actualizarCliente("direccion", e.target.value)}
          />
          <Input
            label="Referencia"
            value={cliente.referencia}
            onChange={(e) => actualizarCliente("referencia", e.target.value)}
          />

          <div style={{ marginBottom: 14 }}>
            <label style={styles.label}>Método de pago</label>
            <select
              style={styles.input}
              value={cliente.pago}
              onChange={(e) => actualizarCliente("pago", e.target.value)}
            >
              <option>Nequi</option>
              <option>Llave Breve</option>
            </select>
          </div>

          <div style={styles.paymentInfoBox}>
            <div style={styles.paymentInfoTitle}>💳 Datos de pago</div>
            <div style={styles.paymentInfoText}>Nequi: 3152487938</div>
            <div style={styles.paymentInfoText}>Llave Breve: 3152487938</div>
          </div>
        </div>
      </div>

      <div>
        <div
          style={{
            ...styles.panelSticky,
            position: esMovil ? "static" : "sticky",
          }}
        >
          <h2 style={styles.panelTitle}>🛒 TU PEDIDO</h2>

          {carrito.length === 0 ? (
            <div style={styles.emptyBox}>
              No has agregado productos todavía.
            </div>
          ) : (
            carrito.map((item) => (
              <div key={item.cartKey} style={styles.cartItem}>
                <div>
                  <strong>{item.nombre}</strong>
                  <div style={styles.cartSub}>
                    {item.experimento || "Experimento 1"}
                  </div>
                  {item.salsa && (
                    <div style={styles.cartSub}>Fórmula: {item.salsa}</div>
                  )}
                  <div style={styles.cartSub}>
                    ${item.precio.toLocaleString("es-CO")} x {item.cantidad}
                  </div>
                </div>

                <div style={styles.qtyBox}>
                  <button
                    style={styles.qtyBtn}
                    onClick={() => cambiarCantidad(item.cartKey, -1)}
                  >
                    -
                  </button>
                  <span>{item.cantidad}</span>
                  <button
                    style={styles.qtyBtn}
                    onClick={() => cambiarCantidad(item.cartKey, 1)}
                  >
                    +
                  </button>
                </div>
              </div>
            ))
          )}

          <div style={styles.summaryBox}>
            <div style={styles.summaryRow}>
              <span>Subtotal</span>
              <span>${subtotal.toLocaleString("es-CO")}</span>
            </div>
            <div style={styles.summaryRow}>
              <span>Domicilio</span>
              <span style={{ color: "#ffd166", fontWeight: "bold" }}>
                Incluido
              </span>
            </div>
            <div style={styles.summaryTotal}>
              <span>Total</span>
              <span>${total.toLocaleString("es-CO")}</span>
            </div>
          </div>

          <button
            style={{
              ...styles.confirmBtn,
              ...(cargandoPedido ? styles.disabledBtn : {}),
            }}
            onClick={confirmarPedido}
            disabled={cargandoPedido}
          >
            {cargandoPedido ? "Guardando pedido..." : "Confirmar pedido"}
          </button>

          <button style={styles.whatsappBtn} onClick={abrirWhatsAppPedido}>
            Enviar pedido por WhatsApp
          </button>

          <div style={styles.drCrispyFullWrap}>
            <img
              src={drCrispyFull}
              alt="Dr. Crispy completo"
              style={styles.drCrispyFullImage}
            />
          </div>

          {pedidoCreadoId && (
            <div style={styles.lastOrderBox}>
              <p style={{ margin: "12px 0 6px 0", color: "#ffd2d2" }}>
                Último pedido creado:
              </p>
              <strong style={{ fontSize: 18 }}>{pedidoCreadoId}</strong>
              <button
                style={styles.secondaryBtn}
                onClick={() => {
                  setVista("seguimiento");
                  consultarMiSeguimiento();
                }}
              >
                Ver mi seguimiento
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

  function renderCliente() {
    return (
      <>
        <section style={styles.clientNavWrap}>
          <button
            style={{
              ...styles.clientNavBtn,
              ...(seccionCliente === "inicio" ? styles.clientNavBtnActive : {}),
            }}
            onClick={() => irASeccionCliente("inicio")}
          >
            Inicio
          </button>

          <button
            style={{
              ...styles.clientNavBtn,
              ...(seccionCliente === "catalogo" ? styles.clientNavBtnActive : {}),
            }}
            onClick={() => irASeccionCliente("catalogo")}
          >
            Experimentos
          </button>

          <button
            style={{
              ...styles.clientNavBtn,
              ...(seccionCliente === "experimento1"
                ? styles.clientNavBtnActive
                : {}),
            }}
            onClick={entrarExperimento1}
          >
            Experimento 1
          </button>
        </section>

        {seccionCliente === "inicio" && (
          <>
            {renderHeroInicio()}
            {renderCatalogoExperimentos()}
          </>
        )}

        {seccionCliente === "catalogo" && renderCatalogoExperimentos()}

        {seccionCliente === "experimento1" && renderExperimento1()}
      </>
    );
  }

  return (
    <div style={styles.page}>
      <audio ref={audioRef} src={alertaSound} preload="auto" />
      <div style={styles.overlay}></div>

      {formulaSeleccionada && (
        <div
          style={styles.modalBackdrop}
          onClick={() => setFormulaSeleccionada(null)}
        >
          <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalTop}>
              <div>
                <div style={styles.menuInteractiveBadge}>🧪 SELECCIÓN DE FÓRMULA</div>
                <h2 style={styles.modalTitle}>{formulaSeleccionada.nombre}</h2>
                <p style={styles.modalSubtitle}>
                  Elige la salsa base del experimento
                </p>
              </div>

              <button
                style={styles.modalCloseBtn}
                onClick={() => setFormulaSeleccionada(null)}
              >
                ✕
              </button>
            </div>

            <div
              style={{
                ...styles.sauceVisualGrid,
                gridTemplateColumns: esMovil
                  ? "1fr"
                  : "repeat(3, minmax(0, 1fr))",
              }}
            >
              {SALSAS.map((salsa) => (
                <button
                  key={salsa.nombre}
                  style={styles.sauceVisualCard}
                  onClick={() => seleccionarSalsa(formulaSeleccionada, salsa)}
                >
                  <div style={styles.sauceVisualEmoji}>{salsa.emoji}</div>
                  <div style={styles.sauceVisualName}>{salsa.nombre}</div>
                  <div style={styles.sauceVisualDesc}>{salsa.descripcion}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {salsaPendiente && (
        <div style={styles.modalBackdrop}>
          <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalTop}>
              <div>
                <div style={styles.menuInteractiveBadge}>🌶️ FUEGO ATÓMICO</div>
                <h2 style={styles.modalTitle}>Selecciona nivel de picante</h2>
                <p style={styles.modalSubtitle}>
                  Esta opción solo aplica para Fuego Atómico.
                </p>
              </div>

              <button
                style={styles.modalCloseBtn}
                onClick={() => {
                  setSalsaPendiente(null);
                  setNivelAtomico("");
                }}
              >
                ✕
              </button>
            </div>

            <div
              style={{
                ...styles.sauceVisualGrid,
                gridTemplateColumns: esMovil
                  ? "1fr"
                  : "repeat(3, minmax(0, 1fr))",
              }}
            >
              {["Bajo", "Medio", "Alto"].map((nivel) => (
                <button
                  key={nivel}
                  style={{
                    ...styles.sauceVisualCard,
                    ...(nivelAtomico === nivel ? styles.sauceVisualCardActive : {}),
                  }}
                  onClick={() => setNivelAtomico(nivel)}
                >
                  <div style={styles.sauceVisualEmoji}>🌶️</div>
                  <div style={styles.sauceVisualName}>{nivel}</div>
                  <div style={styles.sauceVisualDesc}>
                    Nivel de intensidad {nivel.toLowerCase()}
                  </div>
                </button>
              ))}
            </div>

            <button
              style={{ ...styles.confirmBtn, marginTop: 18 }}
              onClick={confirmarFuegoAtomico}
            >
              Confirmar nivel
            </button>
          </div>
        </div>
      )}

      <div style={styles.container}>
        <header
          style={{
            ...styles.header,
            flexDirection: esMovil ? "column" : "row",
            alignItems: esMovil ? "flex-start" : "center",
          }}
        >
          <div>
            <div style={styles.badge}>🧪 DR. CRISPY LAB ACTIVO</div>
            <h1 style={styles.title}>Dr. Crispy Lab</h1>
            <p style={styles.subtitle}>Sistema real conectado con backend</p>
            <p
              style={{
                marginTop: 8,
                color: socketConectado ? "#9ef0b8" : "#ffc1c1",
              }}
            >
              {socketConectado
                ? "🟢 Tiempo real conectado"
                : "🔴 Tiempo real desconectado"}
            </p>
          </div>

          <div style={styles.navButtons}>
            <button
              style={{
                ...styles.navBtn,
                ...(vista === "cliente" ? styles.navBtnActive : {}),
              }}
              onClick={() => setVista("cliente")}
            >
              Cliente
            </button>

            <button
              style={{
                ...styles.navBtn,
                ...(vista === "seguimiento" ? styles.navBtnActive : {}),
              }}
              onClick={() => setVista("seguimiento")}
            >
              Seguimiento
            </button>
          </div>
        </header>

        {mensaje.texto && (
          <div
            style={{
              ...styles.messageBox,
              ...(mensaje.tipo === "ok" ? styles.messageOk : styles.messageError),
            }}
          >
            {mensaje.texto}
          </div>
        )}

        {vista === "cliente" && renderCliente()}

        {vista === "seguimiento" && (
          <section style={styles.panel}>
            <div style={styles.adminTop}>
              <div>
                <h2 style={styles.panelTitle}>📦 MI SEGUIMIENTO</h2>
                <p style={{ color: "#cfcfcf", margin: 0 }}>
                  Aquí solo puedes ver el seguimiento del pedido creado en este
                  dispositivo
                </p>
              </div>
            </div>

            <div style={styles.trackingBox}>
              <p style={{ color: "#cfcfcf", marginTop: 0 }}>
                Tu seguimiento es privado y está asociado a este dispositivo.
              </p>

              <div style={styles.statusButtons}>
                <button
                  style={{
                    ...styles.confirmBtn,
                    marginTop: 0,
                    ...(cargandoSeguimiento ? styles.disabledBtn : {}),
                  }}
                  onClick={() => consultarMiSeguimiento()}
                  disabled={cargandoSeguimiento}
                >
                  {cargandoSeguimiento ? "Consultando..." : "Ver mi seguimiento"}
                </button>
              </div>
            </div>

            {!pedidoConsultado ? (
              <div style={styles.emptyBox}>
                Aún no tienes un pedido consultado en este dispositivo.
              </div>
            ) : (
              <div style={styles.orderCard}>
                <div style={styles.orderHeader}>
                  <div>
                    <h3 style={{ margin: 0 }}>{pedidoConsultado.id}</h3>
                    <p style={styles.orderMeta}>
                      {pedidoConsultado?.cliente?.nombre} •{" "}
                      {pedidoConsultado?.cliente?.telefono}
                    </p>
                    <p style={styles.orderMeta}>{pedidoConsultado?.fecha}</p>
                  </div>

                  <div
                    style={{
                      ...styles.statusBadge,
                      ...colorEstado(pedidoConsultado.estado),
                    }}
                  >
                    {pedidoConsultado.estado}
                  </div>
                </div>

                <p>
                  <strong>Dirección:</strong>{" "}
                  {pedidoConsultado?.cliente?.direccion}
                </p>
                <p>
                  <strong>Referencia:</strong>{" "}
                  {pedidoConsultado?.cliente?.referencia || "N/A"}
                </p>
                <p>
                  <strong>Pago:</strong> {pedidoConsultado?.cliente?.pago}
                </p>
                <p>
                  <strong>Repartidor:</strong>{" "}
                  {pedidoConsultado?.repartidor || "Aún no asignado"}
                </p>

                <div style={{ marginTop: 12 }}>
                  <strong>Productos:</strong>
                  <ul>
                    {pedidoConsultado.items.map((item, idx) => (
                      <li key={idx}>
                        {item.experimento ? `${item.experimento} | ` : ""}
                        {item.nombre} x{item.cantidad}
                        {item.salsa ? ` - ${item.salsa}` : ""} - $
                        {(item.precio * item.cantidad).toLocaleString("es-CO")}
                      </li>
                    ))}
                  </ul>
                </div>

                <h3 style={{ color: "#ff4b4b" }}>
                  Total: ${pedidoConsultado.total.toLocaleString("es-CO")}
                </h3>

                <div style={styles.timelineWrap}>
                  {ESTADOS.map((estado, index) => {
                    const actualIndex = ESTADOS.indexOf(pedidoConsultado.estado);
                    const completado = index <= actualIndex;

                    return (
                      <div key={estado} style={styles.timelineItem}>
                        <div
                          style={{
                            ...styles.timelineDot,
                            ...(completado ? styles.timelineDotActive : {}),
                          }}
                        />
                        <div
                          style={{
                            ...styles.timelineText,
                            ...(completado ? styles.timelineTextActive : {}),
                          }}
                        >
                          {estado}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </section>
        )}

        {puedeVerAdmin && vista === "admin" && !adminLogueado && (
          <section style={styles.loginWrap}>
            <div style={styles.loginCard}>
              <h2 style={styles.panelTitle}>🔐 ACCESO ADMIN</h2>
              <p style={styles.loginText}>
                Ingresa tus credenciales reales del backend.
              </p>

              <Input
                label="Usuario"
                value={loginAdmin.username}
                onChange={(e) =>
                  setLoginAdmin({ ...loginAdmin, username: e.target.value })
                }
              />

              <div style={{ marginBottom: 14 }}>
                <label style={styles.label}>Contraseña</label>
                <input
                  type="password"
                  style={styles.input}
                  value={loginAdmin.password}
                  onChange={(e) =>
                    setLoginAdmin({ ...loginAdmin, password: e.target.value })
                  }
                />
              </div>

              <button
                style={{
                  ...styles.confirmBtn,
                  ...(cargandoAdmin ? styles.disabledBtn : {}),
                }}
                onClick={entrarAdmin}
                disabled={cargandoAdmin}
              >
                {cargandoAdmin ? "Entrando..." : "Entrar como admin"}
              </button>
            </div>
          </section>
        )}

        {puedeVerAdmin && vista === "admin" && adminLogueado && (
          <section style={styles.panel}>
            <div style={styles.adminTop}>
              <div>
                <h2 style={styles.panelTitle}>🧾 PANEL ADMIN PRO</h2>
                <p style={{ color: "#cfcfcf", margin: 0 }}>
                  Sesión: {adminUser?.nombre}
                </p>
              </div>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button
                  style={{
                    ...styles.logoutBtn,
                    ...(modoCocina ? styles.navBtnActive : {}),
                  }}
                  onClick={() => setModoCocina((prev) => !prev)}
                >
                  {modoCocina ? "Salir modo cocina" : "Modo cocina"}
                </button>

                <button style={styles.logoutBtn} onClick={cargarPedidosAdmin}>
                  Recargar
                </button>

                <button
                  style={styles.logoutBtn}
                  onClick={() => {
                    setAdminLogueado(false);
                    setAdminUser(null);
                    setLoginAdmin({ username: "", password: "" });
                    setPedidos([]);
                    setFiltroEstadoAdmin("Todos");
                    setBusquedaAdmin("");
                    setModoCocina(false);
                    pedidosInicialesCargadosRef.current = false;
                    window.location.hash = "";
                    setRutaPrivada("");
                    setVista("cliente");
                    setSeccionCliente("inicio");
                  }}
                >
                  Cerrar sesión
                </button>
              </div>
            </div>

            {modoCocina ? (
              <div>
                <div style={styles.kpiGrid}>
                  <div style={styles.kpiCard}>
                    <div style={styles.kpiLabel}>Pendientes</div>
                    <div style={styles.kpiValue}>{pedidosCocina.length}</div>
                  </div>
                  <div style={styles.kpiCard}>
                    <div style={styles.kpiLabel}>Recibidos</div>
                    <div style={styles.kpiValue}>
                      {pedidosCocina.filter((p) => p.estado === "Recibido").length}
                    </div>
                  </div>
                  <div style={styles.kpiCard}>
                    <div style={styles.kpiLabel}>En cocina</div>
                    <div style={styles.kpiValue}>
                      {pedidosCocina.filter((p) => p.estado === "En cocina").length}
                    </div>
                  </div>
                  <div style={styles.kpiCard}>
                    <div style={styles.kpiLabel}>En camino</div>
                    <div style={styles.kpiValue}>
                      {pedidosCocina.filter((p) => p.estado === "En camino").length}
                    </div>
                  </div>
                </div>

                {pedidosCocina.length === 0 ? (
                  <div style={styles.emptyBox}>No hay pedidos pendientes.</div>
                ) : (
                  <div
                    style={{
                      ...styles.cocinaGrid,
                      gridTemplateColumns: esMovil
                        ? "1fr"
                        : "repeat(2, minmax(0, 1fr))",
                    }}
                  >
                    {pedidosCocina.map((pedido) => (
                      <div key={pedido.id} style={styles.cocinaCard}>
                        <div style={styles.cocinaTop}>
                          <div>
                            <div style={styles.cocinaId}>{pedido.id}</div>
                            <div style={styles.cocinaCliente}>
                              {pedido.cliente.nombre}
                            </div>
                          </div>

                          <div
                            style={{
                              ...styles.statusBadge,
                              ...colorEstado(pedido.estado),
                            }}
                          >
                            {pedido.estado}
                          </div>
                        </div>

                        <div style={styles.cocinaDireccion}>
                          📍 {pedido.cliente.direccion}
                        </div>

                        <div style={{ marginTop: 12 }}>
                          {pedido.items.map((item, idx) => (
                            <div key={idx} style={styles.cocinaItem}>
                              <strong>{item.experimento || "Experimento 1"}</strong>
                              {" • "}
                              {item.nombre} x{item.cantidad}
                              {item.salsa ? ` • ${item.salsa}` : ""}
                            </div>
                          ))}
                        </div>

                        <div style={styles.cocinaActions}>
                          <button
                            style={styles.cocinaBtn}
                            onClick={() => cambiarEstado(pedido.id, "Recibido")}
                          >
                            Recibido
                          </button>
                          <button
                            style={styles.cocinaBtn}
                            onClick={() => cambiarEstado(pedido.id, "En cocina")}
                          >
                            En cocina
                          </button>
                          <button
                            style={styles.cocinaBtn}
                            onClick={() => cambiarEstado(pedido.id, "En camino")}
                          >
                            En camino
                          </button>
                          <button
                            style={styles.printBtn}
                            onClick={() => imprimirTicketPedido(pedido)}
                          >
                            Imprimir
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <>
                <div style={styles.kpiGrid}>
                  <div style={styles.kpiCard}>
                    <div style={styles.kpiLabel}>Pedidos totales</div>
                    <div style={styles.kpiValue}>{pedidos.length}</div>
                  </div>

                  <div style={styles.kpiCard}>
                    <div style={styles.kpiLabel}>Pedidos de hoy</div>
                    <div style={styles.kpiValue}>{pedidosDelDia}</div>
                  </div>

                  <div style={styles.kpiCard}>
                    <div style={styles.kpiLabel}>En cocina</div>
                    <div style={styles.kpiValue}>
                      {pedidos.filter((p) => p.estado === "En cocina").length}
                    </div>
                  </div>

                  <div style={styles.kpiCard}>
                    <div style={styles.kpiLabel}>En camino</div>
                    <div style={styles.kpiValue}>
                      {pedidos.filter((p) => p.estado === "En camino").length}
                    </div>
                  </div>
                </div>

                <div style={styles.filtersBox}>
                  <div style={styles.filterItem}>
                    <label style={styles.label}>Filtrar por estado</label>
                    <select
                      style={styles.input}
                      value={filtroEstadoAdmin}
                      onChange={(e) => setFiltroEstadoAdmin(e.target.value)}
                    >
                      {FILTROS_ESTADO.map((estado) => (
                        <option key={estado}>{estado}</option>
                      ))}
                    </select>
                  </div>

                  <div style={styles.filterItem}>
                    <label style={styles.label}>
                      Buscar por ID, nombre o teléfono
                    </label>
                    <input
                      style={styles.input}
                      value={busquedaAdmin}
                      onChange={(e) => setBusquedaAdmin(e.target.value)}
                      placeholder="Ej: PED-001 / Luis / 315..."
                    />
                  </div>
                </div>

                {pedidosAdminFiltrados.length === 0 ? (
                  <div style={styles.emptyBox}>No hay pedidos para mostrar.</div>
                ) : (
                  pedidosAdminFiltrados.map((pedido) => (
                    <div key={pedido.id} style={styles.orderCard}>
                      <div style={styles.orderHeader}>
                        <div>
                          <h3 style={{ margin: 0 }}>{pedido.id}</h3>
                          <p style={styles.orderMeta}>
                            {pedido.cliente.nombre} • {pedido.cliente.telefono}
                          </p>
                          <p style={styles.orderMeta}>{pedido.fecha}</p>
                        </div>

                        <div
                          style={{
                            ...styles.statusBadge,
                            ...colorEstado(pedido.estado),
                          }}
                        >
                          {pedido.estado}
                        </div>
                      </div>

                      <p>
                        <strong>Dirección:</strong> {pedido.cliente.direccion}
                      </p>
                      <p>
                        <strong>Referencia:</strong>{" "}
                        {pedido.cliente.referencia || "N/A"}
                      </p>
                      <p>
                        <strong>Pago:</strong> {pedido.cliente.pago}
                      </p>
                      <p>
                        <strong>Repartidor:</strong>{" "}
                        {pedido.repartidor || "Sin asignar"}
                      </p>

                      <div style={{ marginTop: 12 }}>
                        <strong>Productos:</strong>
                        <ul>
                          {pedido.items.map((item, idx) => (
                            <li key={idx}>
                              {item.experimento ? `${item.experimento} | ` : ""}
                              {item.nombre} x{item.cantidad}
                              {item.salsa ? ` - ${item.salsa}` : ""} - $
                              {(item.precio * item.cantidad).toLocaleString("es-CO")}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <h3 style={{ color: "#ff4b4b" }}>
                        Total: ${pedido.total.toLocaleString("es-CO")}
                      </h3>

                      <div style={styles.statusButtons}>
                        {ESTADOS.map((estado) => (
                          <button
                            key={estado}
                            style={styles.statusBtn}
                            onClick={() => cambiarEstado(pedido.id, estado)}
                          >
                            {estado}
                          </button>
                        ))}
                      </div>

                      <div style={{ marginTop: 12 }}>
                        <p style={styles.label}>Asignar repartidor:</p>
                        <div style={styles.statusButtons}>
                          <button
                            style={styles.statusBtn}
                            onClick={() =>
                              asignarRepartidor(pedido.id, "Domiciliario 1")
                            }
                          >
                            Domiciliario 1
                          </button>
                          <button
                            style={styles.statusBtn}
                            onClick={() =>
                              asignarRepartidor(pedido.id, "Domiciliario 2")
                            }
                          >
                            Domiciliario 2
                          </button>
                        </div>
                      </div>

                      <div
                        style={{
                          marginTop: 12,
                          display: "flex",
                          gap: 10,
                          flexWrap: "wrap",
                        }}
                      >
                        <button
                          style={styles.printBtn}
                          onClick={() => imprimirTicketPedido(pedido)}
                        >
                          Imprimir ticket
                        </button>

                        <button
                          style={{
                            ...styles.deleteBtn,
                            ...(eliminandoPedidoId === pedido.id
                              ? styles.disabledBtn
                              : {}),
                          }}
                          onClick={() => eliminarPedido(pedido.id)}
                          disabled={eliminandoPedidoId === pedido.id}
                        >
                          {eliminandoPedidoId === pedido.id
                            ? "Eliminando..."
                            : "Eliminar pedido"}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </>
            )}
          </section>
        )}

        {puedeVerRepartidor && vista === "repartidor" && !repartidorLogueado && (
          <section style={styles.loginWrap}>
            <div style={styles.loginCard}>
              <h2 style={styles.panelTitle}>🚚 ACCESO REPARTIDOR</h2>
              <p style={styles.loginText}>
                Ingresa tus credenciales reales del backend.
              </p>

              <Input
                label="Usuario"
                value={loginRepartidor.username}
                onChange={(e) =>
                  setLoginRepartidor({
                    ...loginRepartidor,
                    username: e.target.value,
                  })
                }
              />

              <div style={{ marginBottom: 14 }}>
                <label style={styles.label}>Contraseña</label>
                <input
                  type="password"
                  style={styles.input}
                  value={loginRepartidor.password}
                  onChange={(e) =>
                    setLoginRepartidor({
                      ...loginRepartidor,
                      password: e.target.value,
                    })
                  }
                />
              </div>

              <button
                style={{
                  ...styles.confirmBtn,
                  ...(cargandoRepartidor ? styles.disabledBtn : {}),
                }}
                onClick={entrarRepartidor}
                disabled={cargandoRepartidor}
              >
                {cargandoRepartidor ? "Entrando..." : "Entrar como repartidor"}
              </button>
            </div>
          </section>
        )}

        {puedeVerRepartidor && vista === "repartidor" && repartidorLogueado && (
          <section style={styles.panel}>
            <div style={styles.adminTop}>
              <div>
                <h2 style={styles.panelTitle}>🚚 VISTA REPARTIDOR</h2>
                <p style={{ color: "#cfcfcf", margin: 0 }}>
                  Sesión: {repartidorUser?.nombre}
                </p>
              </div>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button
                  style={styles.logoutBtn}
                  onClick={() => {
                    const filtrados = pedidos.filter(
                      (pedido) =>
                        String(pedido.repartidor).trim().toLowerCase() ===
                        String(repartidorUser?.nombre).trim().toLowerCase()
                    );
                    setPedidosRepartidor(filtrados);
                  }}
                >
                  Recargar
                </button>

                <button
                  style={styles.logoutBtn}
                  onClick={() => {
                    setRepartidorLogueado(false);
                    setRepartidorUser(null);
                    setLoginRepartidor({ username: "", password: "" });
                    setPedidosRepartidor([]);
                    window.location.hash = "";
                    setRutaPrivada("");
                    setVista("cliente");
                    setSeccionCliente("inicio");
                  }}
                >
                  Cerrar sesión
                </button>
              </div>
            </div>

            {pedidosRepartidor.length === 0 ? (
              <div style={styles.emptyBox}>
                No hay pedidos asignados a este repartidor.
              </div>
            ) : (
              pedidosRepartidor.map((pedido) => (
                <div key={pedido.id} style={styles.orderCard}>
                  <div style={styles.orderHeader}>
                    <div>
                      <h3 style={{ margin: 0 }}>{pedido.id}</h3>
                      <p style={styles.orderMeta}>{pedido.cliente.nombre}</p>
                      <p style={styles.orderMeta}>{pedido.cliente.telefono}</p>
                    </div>

                    <div
                      style={{
                        ...styles.statusBadge,
                        ...colorEstado(pedido.estado),
                      }}
                    >
                      {pedido.estado}
                    </div>
                  </div>

                  <p>
                    <strong>Dirección:</strong> {pedido.cliente.direccion}
                  </p>
                  <p>
                    <strong>Referencia:</strong>{" "}
                    {pedido.cliente.referencia || "N/A"}
                  </p>
                  <p>
                    <strong>Pago:</strong> {pedido.cliente.pago}
                  </p>
                  <p>
                    <strong>Asignado a:</strong>{" "}
                    {pedido.repartidor || "Sin asignar"}
                  </p>

                  <button
                    style={styles.confirmBtn}
                    onClick={() => cambiarEstado(pedido.id, "Entregado")}
                    disabled={pedido.estado === "Entregado"}
                  >
                    {pedido.estado === "Entregado"
                      ? "Pedido entregado"
                      : "Marcar como entregado"}
                  </button>
                </div>
              ))
            )}
          </section>
        )}
      </div>
    </div>
  );
}

function Input({ label, value, onChange }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={styles.label}>{label}</label>
      <input style={styles.input} value={value} onChange={onChange} />
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at top right, rgba(255,0,0,0.18), transparent 20%), radial-gradient(circle at bottom left, rgba(255,80,80,0.10), transparent 20%), linear-gradient(135deg, #040404 0%, #0b0b0b 40%, #160606 100%)",
    color: "#fff",
    fontFamily: '"Inter", sans-serif',
    position: "relative",
  },
  overlay: {
    position: "fixed",
    inset: 0,
    pointerEvents: "none",
    opacity: 0.18,
    backgroundImage:
      "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
    backgroundSize: "30px 30px",
  },
  container: {
    maxWidth: 1360,
    margin: "0 auto",
    padding: 24,
    position: "relative",
    zIndex: 2,
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    gap: 20,
    alignItems: "center",
    flexWrap: "wrap",
    marginBottom: 24,
  },
  badge: {
    display: "inline-block",
    background: "rgba(255,0,0,0.14)",
    border: "1px solid rgba(255,0,0,0.28)",
    color: "#ff9c9c",
    padding: "8px 12px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: "bold",
    letterSpacing: 1.1,
    marginBottom: 10,
  },
  title: {
    margin: 0,
    fontSize: 52,
    color: "#ff2727",
    textShadow: "0 0 20px rgba(255,0,0,0.25)",
    fontFamily: '"Bebas Neue", sans-serif',
    letterSpacing: 1.4,
    lineHeight: 1,
  },
  subtitle: {
    color: "#cfcfcf",
    marginTop: 8,
    marginBottom: 0,
    fontSize: 15,
  },
  navButtons: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
  },
  navBtn: {
    background: "#151515",
    border: "1px solid #2d2d2d",
    color: "#fff",
    padding: "12px 16px",
    borderRadius: 12,
    cursor: "pointer",
    fontWeight: "bold",
  },
  navBtnActive: {
    background: "#ff0000",
    border: "1px solid #ff0000",
  },
  clientNavWrap: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
    marginBottom: 20,
  },
  clientNavBtn: {
    background: "rgba(17,17,17,0.9)",
    border: "1px solid rgba(255,255,255,0.08)",
    color: "#fff",
    padding: "10px 14px",
    borderRadius: 12,
    cursor: "pointer",
    fontWeight: "bold",
  },
  clientNavBtnActive: {
    background: "linear-gradient(135deg, #ff0000, #b30000)",
    border: "1px solid #ff0000",
  },
  labHero: {
    display: "grid",
    gap: 32,
    marginBottom: 24,
    background:
      "radial-gradient(circle at top right, rgba(255,0,0,0.12), transparent 28%), linear-gradient(180deg, rgba(17,17,17,0.96), rgba(10,10,10,0.98))",
    border: "1px solid rgba(255,255,255,0.05)",
    borderRadius: 24,
    padding: 36,
    boxShadow: "0 18px 40px rgba(255,0,0,0.08)",
    overflow: "hidden",
  },
  labHeroContent: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
  heroMini: {
    color: "#ff9b9b",
    fontWeight: "bold",
    letterSpacing: 1.2,
    marginBottom: 12,
    fontSize: 15,
  },
  labHeroTitle: {
   margin: 0,
   fontSize: 74,
   lineHeight: 0.9,
   color: "#fff",
   textTransform: "uppercase",
   fontFamily: '"Bebas Neue", sans-serif',
   letterSpacing: 1.2,
   textShadow: "0 8px 24px rgba(0,0,0,0.35)",
   maxWidth: 760,
  },
  labHeroText: {
    color: "#d2d2d2",
    lineHeight: 1.85,
    maxWidth: 620,
    fontSize: 17,
    marginTop: 18,
  },
  heroActionRow: {
    display: "flex",
    gap: 14,
    flexWrap: "wrap",
    marginTop: 26,
  },
  heroPrimaryBtn: {
    background: "linear-gradient(135deg, #ff0000, #b30000)",
    color: "#fff",
    border: "none",
    padding: "15px 20px",
    borderRadius: 12,
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: 15,
    boxShadow: "0 12px 24px rgba(255,0,0,0.18)",
  },
  heroSecondaryBtn: {
    background: "#151515",
    color: "#fff",
    border: "1px solid #2f2f2f",
    padding: "15px 22px",
    borderRadius: 12,
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: 15,
  },
  labHeroVisual: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  heroVisualCard: {
    width: "100%",
    maxWidth: 430,
    minHeight: 460,
    borderRadius: 24,
    background:
      "radial-gradient(circle at 50% 28%, rgba(255,0,0,0.18), transparent 26%), radial-gradient(circle at top right, rgba(255,0,0,0.12), transparent 30%), linear-gradient(180deg, rgba(24,24,24,0.98), rgba(10,10,10,1))",
    border: "1px solid rgba(255,255,255,0.06)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 24,
    boxShadow: "0 18px 36px rgba(0,0,0,0.28)",
    position: "relative",
    overflow: "hidden",
  },
  reactorGlow: {
    position: "absolute",
    width: 240,
    height: 240,
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(255,0,0,0.34) 0%, rgba(255,0,0,0.14) 38%, rgba(255,0,0,0.02) 72%, transparent 100%)",
    top: 90,
    left: "50%",
    transform: "translateX(-50%)",
    filter: "blur(10px)",
    animation: "reactorPulse 3s ease-in-out infinite",
    zIndex: 1,
  },
  smokeGlow: {
    position: "absolute",
    width: 280,
    height: 180,
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(255,255,255,0.08) 0%, rgba(255,60,60,0.08) 36%, rgba(255,0,0,0.03) 60%, transparent 100%)",
    bottom: 85,
    left: "50%",
    transform: "translateX(-50%)",
    filter: "blur(22px)",
    animation: "labSmoke 4s ease-in-out infinite",
    zIndex: 1,
  },
  labParticle: {
    position: "absolute",
    display: "block",
    borderRadius: "50%",
    background: "rgba(255, 60, 60, 0.9)",
    boxShadow: "0 0 12px rgba(255,0,0,0.35)",
    zIndex: 2,
  },
  labParticle1: {
    width: 8,
    height: 8,
    top: 72,
    right: 72,
    animation: "particleFloat1 2.6s ease-in-out infinite",
  },
  labParticle2: {
    width: 6,
    height: 6,
    top: 130,
    left: 58,
    animation: "particleFloat2 3.4s ease-in-out infinite",
  },
  labParticle3: {
    width: 10,
    height: 10,
    top: 180,
    right: 52,
    animation: "particleFloat3 2.9s ease-in-out infinite",
  },
  labParticle4: {
    width: 7,
    height: 7,
    bottom: 120,
    left: 72,
    animation: "particleFloat1 3.2s ease-in-out infinite",
  },
  labParticle5: {
    width: 9,
    height: 9,
    bottom: 160,
    right: 88,
    animation: "particleFloat2 2.8s ease-in-out infinite",
  },
  heroLogoWrap: {
    width: 96,
    height: 96,
    borderRadius: "50%",
    overflow: "hidden",
    border: "3px solid #ff1a1a",
    boxShadow: "0 0 18px rgba(255,0,0,0.45)",
    background: "#ff0000",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    zIndex: 3,
    animation: "crispyGlow 2s ease-in-out infinite, crispyFloat 2.4s ease-in-out infinite",
  },
  heroFullImage: {
    width: "100%",
    maxWidth: 300,
    height: "auto",
    objectFit: "contain",
    display: "block",
    filter: "drop-shadow(0 18px 34px rgba(255,0,0,0.22))",
    animation: "crispyFloat 3.5s ease-in-out infinite",
    position: "relative",
    zIndex: 3,
  },
  heroVisualTag: {
    display: "inline-block",
    background: "rgba(255,0,0,0.14)",
    border: "1px solid rgba(255,0,0,0.30)",
    color: "#ffb0b0",
    padding: "8px 14px",
    borderRadius: 999,
    fontWeight: "bold",
    fontSize: 12,
    letterSpacing: 1,
    marginTop: 8,
    position: "relative",
    zIndex: 3,
  },
  heroFullImage: {
    width: "100%",
    maxWidth: 300,
    height: "auto",
    objectFit: "contain",
    display: "block",
    filter: "drop-shadow(0 14px 34px rgba(255,0,0,0.16))",
    position: "relative",
    zIndex: 3,
  },
  mainGrid: {
    display: "grid",
    gap: 24,
  },
  posterHeroGlow: {
  position: "absolute",
  inset: 0,
  background:
    "radial-gradient(circle at 75% 30%, rgba(255,0,0,0.22), transparent 28%), radial-gradient(circle at 20% 75%, rgba(255,120,0,0.10), transparent 24%)",
  pointerEvents: "none",
},

posterSauceDot: {
  position: "absolute",
  display: "block",
  borderRadius: "50%",
  background: "radial-gradient(circle, #ff6a1f 0%, #ff0000 58%, #9e0000 100%)",
  boxShadow: "0 0 10px rgba(255,0,0,0.30)",
  pointerEvents: "none",
},

posterSauceDot1: {
  width: 10,
  height: 10,
  right: 34,
  top: 30,
  animation: "sauceParticleFloat 3.2s ease-in-out infinite",
},

posterSauceDot2: {
  width: 7,
  height: 7,
  left: 26,
  bottom: 26,
  animation: "sauceParticleFloat 2.7s ease-in-out infinite",
},

posterSauceDot3: {
  width: 12,
  height: 12,
  right: 90,
  bottom: 38,
  animation: "sauceParticleFloat 3.6s ease-in-out infinite",
},
  panel: {
    background: "rgba(17,17,17,0.94)",
    border: "1px solid rgba(255,255,255,0.05)",
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    boxShadow: "0 12px 28px rgba(0,0,0,0.18)",
  },
  panelSticky: {
    background: "rgba(17,17,17,0.96)",
    border: "1px solid rgba(255,255,255,0.05)",
    borderRadius: 20,
    padding: 24,
    top: 20,
    boxShadow: "0 12px 28px rgba(0,0,0,0.18)",
  },
  panelTitle: {
    marginTop: 0,
    marginBottom: 18,
    fontFamily: '"Bebas Neue", sans-serif',
    fontSize: 42,
    letterSpacing: 1,
    lineHeight: 1,
    textTransform: "uppercase",
  },
  catalogHeader: {
    marginBottom: 22,
  },
  catalogTitle: {
    margin: "0 0 10px 0",
    fontSize: 64,
    textTransform: "uppercase",
    fontFamily: '"Bebas Neue", sans-serif',
    letterSpacing: 1.2,
    lineHeight: 0.95,
  },
  catalogText: {
    margin: 0,
    color: "#cfcfcf",
    lineHeight: 1.7,
    fontSize: 16,
  },
  experimentScreenTitle: {
    margin: "0 0 8px 0",
    fontSize: 54,
    textTransform: "uppercase",
    fontFamily: '"Bebas Neue", sans-serif',
    letterSpacing: 1,
    lineHeight: 0.95,
  },
  experimentScreenText: {
    margin: 0,
    color: "#cfcfcf",
    lineHeight: 1.6,
  },
  experimentoHeaderRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "center",
    flexWrap: "wrap",
  },
  backCatalogBtn: {
    background: "#151515",
    border: "1px solid #333",
    color: "#fff",
    padding: "12px 14px",
    borderRadius: 12,
    cursor: "pointer",
    fontWeight: "bold",
  },
  experimentosGrid: {
    display: "grid",
    gap: 18,
  },
  experimentCard: {
    background:
      "linear-gradient(180deg, rgba(24,24,24,0.98), rgba(10,10,10,1))",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 20,
    overflow: "hidden",
    boxShadow: "0 14px 30px rgba(255,0,0,0.06)",
    transition: "transform 0.25s ease, box-shadow 0.25s ease, border 0.25s ease",
  },
  experimentCardActive: {
    border: "1px solid rgba(255,0,0,0.22)",
    boxShadow: "0 18px 36px rgba(255,0,0,0.12)",
  },
  experimentCardHover: {
    transform: "translateY(-6px)",
    boxShadow: "0 22px 42px rgba(255,0,0,0.18)",
    border: "1px solid rgba(255,0,0,0.28)",
  },
  experimentImage: {
    height: 190,
    backgroundSize: "cover",
    backgroundPosition: "center",
    position: "relative",
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "flex-end",
    padding: 14,
    overflow: "hidden",
    transition: "transform 0.35s ease, filter 0.35s ease",
  },
  experimentBadge: {
    padding: "8px 12px",
    borderRadius: 999,
    fontWeight: "bold",
    fontSize: 12,
    letterSpacing: 1,
  },
  experimentBadgeActive: {
    background: "linear-gradient(135deg, #ff0000, #b30000)",
    color: "#fff",
    boxShadow: "0 8px 18px rgba(255,0,0,0.22)",
  },
  experimentBadgeSoon: {
    background: "rgba(255,196,0,0.16)",
    color: "#ffd76b",
    border: "1px solid rgba(255,196,0,0.28)",
    boxShadow: "0 6px 14px rgba(255,196,0,0.08)",
  },
  experimentBody: {
    padding: 20,
  },
  experimentTitle: {
    margin: 0,
    fontSize: 48,
    textTransform: "uppercase",
    color: "#fff",
    fontFamily: '"Bebas Neue", sans-serif',
    letterSpacing: 1,
    lineHeight: 0.95,
  },
  experimentSubtitle: {
    marginTop: 8,
    color: "#ff9b9b",
    fontWeight: "bold",
    textTransform: "uppercase",
    fontSize: 14,
    letterSpacing: 1.3,
  },
  experimentDescription: {
    color: "#cfcfcf",
    lineHeight: 1.6,
    minHeight: 72,
  },
  experimentBtn: {
    width: "100%",
    background: "linear-gradient(135deg, #ff0000, #b30000)",
    color: "#fff",
    border: "none",
    padding: "14px 16px",
    borderRadius: 14,
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: 15,
    boxShadow: "0 10px 20px rgba(255,0,0,0.18)",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
  },
  experimentGhostBtn: {
    width: "100%",
    background: "#171717",
    color: "#fff",
    border: "1px solid #3a3a3a",
    padding: "14px 16px",
    borderRadius: 14,
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: 15,
  },
  exp1Glow: {
    position: "absolute",
    inset: 0,
    background:
      "radial-gradient(circle at 70% 35%, rgba(255,0,0,0.22), transparent 28%), radial-gradient(circle at 28% 72%, rgba(255,80,0,0.12), transparent 22%)",
    mixBlendMode: "screen",
    pointerEvents: "none",
  },

  exp1BlurWing: {
    position: "absolute",
    width: 180,
    height: 180,
    right: -24,
    bottom: -14,
    backgroundImage: `url(${alitasBg})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    opacity: 0.24,
    filter: "blur(7px)",
    transform: "rotate(-10deg) scale(1.06)",
    animation: "wingDrift 5.5s ease-in-out infinite",
    pointerEvents: "none",
  },

  exp1BlurWing2: {
    position: "absolute",
    width: 150,
    height: 150,
    left: -22,
    top: -10,
    backgroundImage: `url(${alitasBg})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    opacity: 0.18,
    filter: "blur(8px)",
    transform: "rotate(12deg) scale(1.03)",
    animation: "wingDrift2 6s ease-in-out infinite",
    pointerEvents: "none",
  },

  salsaDot: {
    position: "absolute",
    display: "block",
    borderRadius: "50%",
    background: "radial-gradient(circle, #ff5a1f 0%, #ff0000 60%, #a80000 100%)",
    boxShadow: "0 0 10px rgba(255,0,0,0.32)",
    pointerEvents: "none",
  },

  salsaDot1: {
    width: 10,
    height: 10,
    left: 18,
    top: 18,
    animation: "salsaFloat1 3s ease-in-out infinite",
  },

  salsaDot2: {
    width: 7,
    height: 7,
    left: 42,
    bottom: 28,
    animation: "salsaFloat2 2.7s ease-in-out infinite",
  },

  salsaDot3: {
    width: 12,
    height: 12,
    right: 52,
    top: 42,
    animation: "salsaFloat1 3.2s ease-in-out infinite",
  },

  salsaDot4: {
    width: 8,
    height: 8,
    right: 26,
    bottom: 18,
    animation: "salsaFloat2 2.9s ease-in-out infinite",
  },
  label: {
    display: "block",
    marginBottom: 8,
    color: "#ddd",
    fontWeight: "bold",
  },
  input: {
    width: "100%",
    boxSizing: "border-box",
    background: "#191919",
    color: "#fff",
    border: "1px solid #303030",
    borderRadius: 12,
    padding: "12px 14px",
  },
  emptyBox: {
    background: "#191919",
    border: "1px solid #2b2b2b",
    borderRadius: 14,
    padding: 16,
    color: "#bbb",
  },
  cartItem: {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
  background: "#191919",
  border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: 14,
  padding: 14,
  marginBottom: 12,
  flexWrap: "wrap",
},
  cartSub: {
    color: "#bdbdbd",
    marginTop: 4,
    fontSize: 14,
  },
  qtyBox: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  qtyBtn: {
    width: 32,
    height: 32,
    background: "#ff0000",
    border: "none",
    color: "#fff",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: "bold",
  },
  summaryBox: {
    borderTop: "1px solid rgba(255,255,255,0.08)",
    marginTop: 20,
    paddingTop: 18,
  },
  summaryRow: {
    display: "flex",
    justifyContent: "space-between",
    color: "#cfcfcf",
    marginBottom: 8,
  },
  summaryTotal: {
    display: "flex",
    justifyContent: "space-between",
    color: "#ff4a4a",
    fontWeight: "bold",
    fontSize: 24,
    marginTop: 14,
  },
  confirmBtn: {
    width: "100%",
    marginTop: 18,
    background: "linear-gradient(135deg, #ff0000, #b30000)",
    color: "#fff",
    border: "none",
    padding: "14px 16px",
    borderRadius: 14,
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: 16,
    boxShadow: "0 10px 24px rgba(255,0,0,0.22)",
    animation: "confirmGlow 2.4s ease-in-out infinite",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
  },
  secondaryBtn: {
    background: "#1c1c1c",
    color: "#fff",
    border: "1px solid #444",
    padding: "12px 14px",
    borderRadius: 12,
    cursor: "pointer",
    fontWeight: "bold",
  },
  deleteBtn: {
    background: "#3a1010",
    color: "#fff",
    border: "1px solid #7a2020",
    padding: "12px 14px",
    borderRadius: 12,
    cursor: "pointer",
    fontWeight: "bold",
  },
  whatsappBtn: {
    width: "100%",
    marginTop: 12,
    background: "linear-gradient(135deg, #1faa59, #128c7e)",
    color: "#fff",
    border: "none",
    padding: "14px 16px",
    borderRadius: 14,
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: 15,
  },
  printBtn: {
    background: "#222",
    color: "#fff",
    border: "1px solid #444",
    padding: "12px 14px",
    borderRadius: 12,
    cursor: "pointer",
    fontWeight: "bold",
  },
  disabledBtn: {
    opacity: 0.7,
    cursor: "not-allowed",
  },
  loginWrap: {
    display: "flex",
    justifyContent: "center",
    padding: "40px 0",
  },
  loginCard: {
    width: "100%",
    maxWidth: 420,
    background: "rgba(17,17,17,0.95)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 22,
    padding: 22,
  },
  loginText: {
    color: "#cfcfcf",
    marginBottom: 16,
  },
  adminTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "center",
    flexWrap: "wrap",
    marginBottom: 18,
  },
  logoutBtn: {
    background: "#1b1b1b",
    color: "#fff",
    border: "1px solid #333",
    padding: "10px 14px",
    borderRadius: 10,
    cursor: "pointer",
  },
  orderCard: {
    background: "#181818",
    border: "1px solid #2a2a2a",
    borderRadius: 18,
    padding: 18,
    marginBottom: 18,
  },
  orderHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
    alignItems: "center",
    marginBottom: 14,
  },
  orderMeta: {
    color: "#bbb",
    margin: "6px 0 0 0",
  },
  statusBadge: {
    borderRadius: 999,
    padding: "10px 14px",
    fontWeight: "bold",
  },
  statusButtons: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
    marginTop: 10,
  },
  statusBtn: {
    background: "#1d1d1d",
    color: "#fff",
    border: "1px solid #333",
    padding: "10px 12px",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: "bold",
  },
  messageBox: {
    padding: "14px 16px",
    borderRadius: 14,
    marginBottom: 18,
    fontWeight: "bold",
  },
  messageOk: {
    background: "rgba(20, 90, 40, 0.35)",
    border: "1px solid rgba(80, 220, 120, 0.4)",
    color: "#b9ffc9",
  },
  messageError: {
    background: "rgba(120, 20, 20, 0.35)",
    border: "1px solid rgba(255, 90, 90, 0.35)",
    color: "#ffc1c1",
  },
  trackingBox: {
    background: "#181818",
    border: "1px solid #2a2a2a",
    borderRadius: 18,
    padding: 18,
    marginBottom: 18,
  },
  timelineWrap: {
    display: "grid",
    gap: 12,
    marginTop: 22,
    paddingTop: 18,
    borderTop: "1px solid #2d2d2d",
  },
  timelineItem: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  timelineDot: {
    width: 14,
    height: 14,
    borderRadius: "50%",
    background: "#333",
    border: "2px solid #555",
    flexShrink: 0,
  },
  timelineDotActive: {
    background: "#ff0000",
    border: "2px solid #ff6b6b",
    boxShadow: "0 0 12px rgba(255,0,0,0.35)",
  },
  timelineText: {
    color: "#8f8f8f",
    fontWeight: "bold",
  },
  timelineTextActive: {
    color: "#fff",
  },
  lastOrderBox: {
    marginTop: 16,
    padding: 14,
    background: "rgba(255,0,0,0.08)",
    border: "1px solid rgba(255,0,0,0.2)",
    borderRadius: 14,
    display: "grid",
    gap: 10,
  },
  paymentInfoBox: {
    marginTop: 10,
    background: "rgba(255,0,0,0.08)",
    border: "1px solid rgba(255,0,0,0.18)",
    borderRadius: 14,
    padding: 14,
  },
  paymentInfoTitle: {
    fontWeight: "bold",
    color: "#ffb2b2",
    marginBottom: 8,
  },
  paymentInfoText: {
    color: "#f0f0f0",
    marginBottom: 4,
  },
  drCrispyFullWrap: {
    marginTop: 24,
    width: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 10,
  },
  drCrispyFullImage: {
    width: "100%",
    maxWidth: 230,
    height: "auto",
    display: "block",
    objectFit: "contain",
    filter: "drop-shadow(0 14px 28px rgba(255,0,0,0.10))",
  },
  kpiGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 14,
    marginBottom: 18,
  },
  kpiCard: {
    background: "#181818",
    border: "1px solid #2a2a2a",
    borderRadius: 18,
    padding: 16,
  },
  kpiLabel: {
    color: "#bdbdbd",
    fontSize: 14,
    marginBottom: 8,
  },
  kpiValue: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#ff4a4a",
  },
  filtersBox: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: 14,
    marginBottom: 18,
  },
  filterItem: {
    background: "#181818",
    border: "1px solid #2a2a2a",
    borderRadius: 18,
    padding: 16,
  },
  posterMenuWrap: {
    background:
      "linear-gradient(180deg, rgba(20,20,20,0.98) 0%, rgba(8,8,8,0.98) 100%)",
    border: "1px solid rgba(255,255,255,0.05)",
    borderRadius: 22,
    overflow: "hidden",
    marginBottom: 24,
    boxShadow: "0 18px 40px rgba(255,0,0,0.08)",
  },
  posterHero: {
    minHeight: 340,
    backgroundImage: `
      linear-gradient(rgba(0,0,0,0.88), rgba(0,0,0,0.95)),
      url(${alitasBg})
    `,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    padding: 24,
    overflow: "hidden",
    animation: "posterDrift 12s ease-in-out infinite",
  },
  posterOverlayContent: {
    maxWidth: 420,
  },
  posterBrand: {
    display: "inline-block",
    background: "rgba(0,0,0,0.45)",
    border: "1px solid rgba(255,255,255,0.12)",
    padding: "8px 12px",
    borderRadius: 999,
    color: "#fff",
    fontWeight: "bold",
    letterSpacing: 1,
    marginBottom: 16,
  },
  posterMainTitle: {
    margin: 0,
    fontSize: 72,
    lineHeight: 0.88,
    color: "#fff",
    textTransform: "uppercase",
    textShadow: "0 0 18px rgba(255,0,0,0.35)",
    fontFamily: '"Bebas Neue", sans-serif',
    letterSpacing: 1.2,
    
  },
  posterExperiment: {
    display: "inline-block",
    marginTop: 16,
    background: "linear-gradient(135deg, #ff0000, #b30000)",
    color: "#fff",
    padding: "12px 16px",
    borderRadius: 14,
    fontWeight: "bold",
    fontSize: 24,
    textTransform: "uppercase",
    boxShadow: "0 12px 28px rgba(255,0,0,0.20)",
    fontFamily: '"Bebas Neue", sans-serif',
    letterSpacing: 1,
  },
  posterSections: {
    display: "grid",
    gap: 20,
    padding: 26,
    background:
      "radial-gradient(circle at top right, rgba(255,0,0,0.07), transparent 24%), linear-gradient(180deg, rgba(18,18,18,0.98) 0%, rgba(10,10,10,0.98) 100%)",
  },
  posterLeftCol: {
    display: "grid",
    gap: 18,
  },
  posterRightCol: {
    display: "grid",
    gap: 18,
  },
  posterBlock: {
    background: "rgba(255,255,255,0.025)",
    border: "1px solid rgba(255,255,255,0.05)",
    borderRadius: 16,
    padding: 18,
  },
  posterSectionTitle: {
    marginTop: 0,
    marginBottom: 14,
    fontSize: 38,
    color: "#ffc400",
    textTransform: "uppercase",
    textShadow: "0 0 12px rgba(255,196,0,0.15)",
    fontFamily: '"Bebas Neue", sans-serif',
    letterSpacing: 1,
    lineHeight: 0.95,
  },
  posterInfoList: {
    display: "grid",
    gap: 12,
  },
  posterInfoItem: {
    color: "#fff",
    fontSize: 16,
    lineHeight: 1.4,
  },
  reactionScale: {
    display: "grid",
    gap: 10,
  },
  reactionItem: {
    background: "rgba(0,0,0,0.30)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 12,
    padding: "12px 14px",
    fontWeight: "bold",
    color: "#f1f1f1",
    textAlign: "center",
  },
  posterPriceList: {
    display: "grid",
    gap: 10,
  },
  posterPriceRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    color: "#fff",
    fontWeight: "bold",
    borderBottom: "1px dashed rgba(255,255,255,0.10)",
    paddingBottom: 8,
  },
  menuInteractiveSection: {
    padding: 24,
    background: "rgba(8,8,8,0.98)",
    borderTop: "1px solid rgba(255,255,255,0.06)",
  },
  menuInteractiveHeader: {
    marginBottom: 22,
  },
  menuInteractiveBadge: {
    display: "inline-block",
    background: "rgba(255,0,0,0.14)",
    border: "1px solid rgba(255,0,0,0.30)",
    color: "#ffb0b0",
    padding: "8px 14px",
    borderRadius: 999,
    fontWeight: "bold",
    fontSize: 12,
    letterSpacing: 1,
    marginBottom: 12,
  },
  menuInteractiveTitle: {
    margin: 0,
    fontSize: 56,
    color: "#fff",
    textTransform: "uppercase",
    fontFamily: '"Bebas Neue", sans-serif',
    letterSpacing: 1.1,
    lineHeight: 0.95,
  },
  posterFormulaGrid: {
    display: "grid",
    gap: 18,
  },
  posterProductCard: {
  background:
    "radial-gradient(circle at top right, rgba(255,0,0,0.10), transparent 26%), linear-gradient(180deg, rgba(28,28,28,0.96) 0%, rgba(12,12,12,0.98) 100%)",
  border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: 18,
  padding: 22,
  boxShadow: "0 14px 28px rgba(255,0,0,0.05)",
},
  posterProductTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: 10,
    alignItems: "center",
    marginBottom: 10,
  },
  posterEmoji: {
    fontSize: 36,
  },
  posterChip: {
    background: "#ff0000",
    color: "#fff",
    fontWeight: "bold",
    fontSize: 11,
    padding: "8px 10px",
    borderRadius: 999,
  },
  posterProductTitle: {
    margin: "6px 0 8px 0",
    fontSize: 48,
    color: "#fff",
    textTransform: "uppercase",
    fontFamily: '"Bebas Neue", sans-serif',
    letterSpacing: 1,
    lineHeight: 0.95,
  },
  posterProductDesc: {
    margin: 0,
    color: "#cfcfcf",
    fontSize: 15,
  },
  posterProductPrice: {
    marginTop: 14,
    fontSize: 34,
    fontWeight: "bold",
    color: "#ff2c2c",
    textShadow: "0 0 16px rgba(255,0,0,0.20)",
  },
  selectSauceBigBtn: {
    width: "100%",
    marginTop: 16,
    background: "linear-gradient(135deg, #ff0000, #b30000)",
    color: "#fff",
    border: "none",
    padding: "14px 16px",
    borderRadius: 14,
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: 15,
  },
  subSectionTitleWrap: {
    marginTop: 26,
    marginBottom: 14,
  },
  subSectionTitle: {
    margin: 0,
    fontSize: 40,
    color: "#ffc400",
    textTransform: "uppercase",
    fontFamily: '"Bebas Neue", sans-serif',
    letterSpacing: 1,
    lineHeight: 0.95,
  },
  simpleGrid: {
    display: "grid",
    gap: 18,
  },
  simpleMenuCard: {
    background:
      "linear-gradient(180deg, rgba(25,25,25,0.96), rgba(10,10,10,0.98))",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 18,
    padding: 18,
    boxShadow: "0 10px 24px rgba(0,0,0,0.16)",
  },
  simpleEmoji: {
    fontSize: 30,
    marginBottom: 8,
  },
  simpleTitle: {
    margin: "0 0 8px 0",
    fontSize: 38,
    color: "#fff",
    textTransform: "uppercase",
    fontFamily: '"Bebas Neue", sans-serif',
    letterSpacing: 1,
    lineHeight: 0.95,
  },
  simpleDesc: {
    color: "#cfcfcf",
    marginBottom: 12,
  },
  simplePrice: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#ff2c2c",
    marginBottom: 14,
  },
  addBtnPro: {
    width: "100%",
    background: "linear-gradient(135deg, #ff0000, #b30000)",
    color: "#fff",
    border: "none",
    padding: "14px 16px",
    borderRadius: 14,
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: 15,
    boxShadow: "0 12px 24px rgba(255,0,0,0.16)",
  },
  modalBackdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.72)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    zIndex: 50,
  },
  modalCard: {
    width: "100%",
    maxWidth: 1100,
    background: "linear-gradient(180deg, #171717, #0d0d0d)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 24,
    padding: 24,
    boxShadow: "0 30px 80px rgba(0,0,0,0.45)",
  },
  modalTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: 16,
    alignItems: "flex-start",
    marginBottom: 20,
  },
  modalTitle: {
    margin: 0,
    fontSize: 56,
    color: "#fff",
    textTransform: "uppercase",
    fontFamily: '"Bebas Neue", sans-serif',
    letterSpacing: 1,
    lineHeight: 0.95,
  },
  modalSubtitle: {
    marginTop: 8,
    color: "#cfcfcf",
    marginBottom: 0,
  },
  modalCloseBtn: {
    background: "#1e1e1e",
    color: "#fff",
    border: "1px solid #444",
    borderRadius: 12,
    width: 42,
    height: 42,
    cursor: "pointer",
    fontSize: 18,
    fontWeight: "bold",
  },
  sauceVisualGrid: {
    display: "grid",
    gap: 16,
  },
  sauceVisualCard: {
    background:
      "radial-gradient(circle at top right, rgba(255,0,0,0.12), transparent 28%), linear-gradient(180deg, rgba(28,28,28,0.98), rgba(12,12,12,1))",
    border: "1px solid rgba(255,0,0,0.18)",
    borderRadius: 22,
    padding: 22,
    cursor: "pointer",
    textAlign: "left",
    color: "#fff",
  },
  sauceVisualCardActive: {
    border: "1px solid #ff2d2d",
    boxShadow: "0 0 0 2px rgba(255,45,45,0.18)",
  },
  sauceVisualEmoji: {
    fontSize: 34,
    marginBottom: 10,
  },
  sauceVisualName: {
    fontSize: 42,
    fontWeight: "bold",
    marginBottom: 8,
    textTransform: "uppercase",
    fontFamily: '"Bebas Neue", sans-serif',
    letterSpacing: 1,
    lineHeight: 0.95,
  },
  sauceVisualDesc: {
    color: "#d0d0d0",
    marginBottom: 12,
  },
  cocinaGrid: {
    display: "grid",
    gap: 18,
  },
  cocinaCard: {
    background:
      "linear-gradient(180deg, rgba(25,25,25,0.98), rgba(10,10,10,1))",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 24,
    padding: 20,
  },
  cocinaTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "center",
    marginBottom: 14,
    flexWrap: "wrap",
  },
  cocinaId: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#ff2c2c",
  },
  cocinaCliente: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
  cocinaDireccion: {
    color: "#d0d0d0",
    fontSize: 15,
  },
  cocinaItem: {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 12,
    padding: "10px 12px",
    marginBottom: 8,
    color: "#fff",
    fontSize: 16,
  },
  cocinaActions: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
    marginTop: 14,
  },
  cocinaBtn: {
    background: "#1d1d1d",
    color: "#fff",
    border: "1px solid #333",
    padding: "12px 14px",
    borderRadius: 12,
    cursor: "pointer",
    fontWeight: "bold",
  },
};

export default App;