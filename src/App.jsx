import { useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";
import alertaSound from "./assets/alerta.mp3";
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
    imagen: "/images/alitas-x6.png",
  },
  {
    id: 2,
    nombre: "Alitas x12",
    descripcion: "12 alitas crispy del laboratorio",
    precio: 48900,
    emoji: "🔥",
    categoria: "formulas",
    imagen: "/images/alitas-x12.png",
  },
  {
    id: 3,
    nombre: "Alitas x18",
    descripcion: "18 alitas crispy del laboratorio",
    precio: 71900,
    emoji: "🧪",
    categoria: "formulas",
    imagen: "/images/alitas-x18.png",
  },
  {
    id: 4,
    nombre: "Alitas x24",
    descripcion: "24 alitas crispy del laboratorio",
    precio: 92900,
    emoji: "💥",
    categoria: "formulas",
    imagen: "/images/alitas-x24.png",
  },
];

const COMBOS = [
  {
    id: "combo1",
    nombre: "Combo Individual",
    descripcion: "6 alitas + 1 porción de papas + 1 Coca-Cola 400 ml",
    precio: 31900,
    emoji: "🧪",
    badge: "RÁPIDO",
    imagen: "/images/combo-individual.png",
    itemsInternos: [
      {
        id: "combo1-alitas",
        nombre: "Alitas x6",
        precio: 28900,
        cantidad: 1,
        salsa: "BBQ Reactor",
      },
      {
        id: "combo1-papas",
        nombre: "Papas fritas",
        precio: 5000,
        cantidad: 1,
      },
      {
        id: "combo1-bebida",
        nombre: "Coca-Cola PET 400",
        precio: 4500,
        cantidad: 1,
      },
    ],
  },
  {
    id: "combo2",
    nombre: "Combo Pareja",
    descripcion: "12 alitas + 2 porciones de papas + 2 Coca-Cola 400 ml",
    precio: 55900,
    emoji: "⭐",
    badge: "MÁS PEDIDO",
    imagen: "/images/combo-pareja.png",
    itemsInternos: [
      {
        id: "combo2-alitas",
        nombre: "Alitas x12",
        precio: 48900,
        cantidad: 1,
        salsa: "BBQ Reactor",
      },
      {
        id: "combo2-papas",
        nombre: "Papas fritas",
        precio: 5000,
        cantidad: 2,
      },
      {
        id: "combo2-bebida",
        nombre: "Coca-Cola PET 400",
        precio: 4500,
        cantidad: 2,
      },
    ],
  },
  {
    id: "combo3",
    nombre: "Combo Pro",
    descripcion: "18 alitas + 3 porciones de papas + 1 Coca-Cola 1.5 L",
    precio: 79900,
    emoji: "🔥",
    badge: "MEJOR VALOR",
    imagen: "/images/combo-pro.png",
    itemsInternos: [
      {
        id: "combo3-alitas",
        nombre: "Alitas x18",
        precio: 71900,
        cantidad: 1,
        salsa: "BBQ Reactor",
      },
      {
        id: "combo3-papas",
        nombre: "Papas fritas",
        precio: 5000,
        cantidad: 3,
      },
      {
        id: "combo3-bebida",
        nombre: "Coca-Cola 1.5 L",
        precio: 8000,
        cantidad: 1,
      },
    ],
  },
  {
    id: "combo4",
    nombre: "Combo Familia",
    descripcion: "24 alitas + 4 porciones de papas + 1 Coca-Cola 2.25 L",
    precio: 100900,
    emoji: "🚀",
    badge: "FAMILIAR",
    imagen: "/images/combo-familia.png",
    itemsInternos: [
      {
        id: "combo4-alitas",
        nombre: "Alitas x24",
        precio: 92900,
        cantidad: 1,
        salsa: "BBQ Reactor",
      },
      {
        id: "combo4-papas",
        nombre: "Papas fritas",
        precio: 5000,
        cantidad: 4,
      },
      {
        id: "combo4-bebida",
        nombre: "Coca-Cola 2.25 L",
        precio: 10000,
        cantidad: 1,
      },
    ],
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
    imagen: "/images/coca-400.png",
  },
  {
    id: 6,
    nombre: "Coca-Cola 1½",
    descripcion: "Bebida fría",
    precio: 8000,
    emoji: "🥤",
    categoria: "bebidas",
    imagen: "/images/coca-15l.png",
  },
  {
    id: 7,
    nombre: "Coca-Cola 2.25 L",
    descripcion: "Bebida fría",
    precio: 10000,
    emoji: "🥤",
    categoria: "bebidas",
    imagen: "/images/coca-225l.png",
  },
  {
    id: 8,
    nombre: "Soda PET 400",
    descripcion: "Bebida fría",
    precio: 4000,
    emoji: "🥤",
    categoria: "bebidas",
    imagen: "/images/soda-400.png",
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
    imagen: "/images/papas-fritas.png",
  },
];

const PROMOS_MIERCOLES = [
  {
    id: "miercoles-x6",
    nombre: "Miércoles x6",
    descripcion: "6 alitas + 1 porción de papas",
    precio: 25900,
    emoji: "🔥",
    categoria: "promociones",
    imagen: "/images/combo-individual.png",
    badge: "SOLO MIÉRCOLES",
    esPromo: true,
  },
  {
    id: "miercoles-x12",
    nombre: "Miércoles x12",
    descripcion: "12 alitas + 2 porciones de papas",
    precio: 44900,
    emoji: "🚀",
    categoria: "promociones",
    imagen: "/images/combo-pareja.png",
    badge: "SOLO MIÉRCOLES",
    esPromo: true,
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
    titulo: "EXPERIMENTO 02",
    subtitulo: "PROYECTO DEL LABORATORIO",
    descripcion:
      "Otro experimento del laboratorio sigue en fase de pruebas. Muy pronto mostraremos más información.",
    imagen: "/clasificado.png",
    estado: "proximamente",
    badge: "🔒 CLASIFICADO",
  },
  {
    id: "exp3",
    titulo: "EXPERIMENTO 03",
    subtitulo: "PROYECTO CLASIFICADO",
    descripcion:
      "Otro experimento del laboratorio sigue en fase de pruebas. Muy pronto mostraremos más información.",
    imagen: "/clasificado.png",
    estado: "proximamente",
    badge: "🔒 CLASIFICADO",
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
    pago: "Llave",
  });
  const [tipoPedido, setTipoPedido] = useState("domicilio");
  const [horaRecogida, setHoraRecogida] = useState("");

  const [clienteSesion, setClienteSesion] = useState(() => {
    try {
      const guardado = localStorage.getItem("dr_cliente_sesion");
      return guardado ? JSON.parse(guardado) : null;
    } catch (error) {
      return null;
    }
  });
  const [clienteAuthModo, setClienteAuthModo] = useState("login");
  const [clienteLoginData, setClienteLoginData] = useState({
    telefono: "",
    password: "",
  });
  const [clienteRegistroData, setClienteRegistroData] = useState({
    nombre: "",
    telefono: "",
    password: "",
    direccion: "",
    referencia: "",
    aliasDireccion: "Casa",
    pagoPreferido: "Llave",
  });
  const [direccionesCliente, setDireccionesCliente] = useState([]);
  const [direccionSeleccionadaId, setDireccionSeleccionadaId] = useState("");
  const [usarOtraDireccion, setUsarOtraDireccion] = useState(false);
  const [cargandoClienteAuth, setCargandoClienteAuth] = useState(false);
  const [guardandoDireccionCliente, setGuardandoDireccionCliente] = useState(false);

  const [checkoutMovilAbierto, setCheckoutMovilAbierto] = useState(false);

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
  const [toast, setToast] = useState({
    visible: false,
    texto: "",
    x: 0,
    y: 0,
  });
  const [modalPedidoAbierto, setModalPedidoAbierto] = useState(false);
  const [pedidoConfirmadoInfo, setPedidoConfirmadoInfo] = useState(null);

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
  const [comboPendiente, setComboPendiente] = useState(null);
  const audioRef = useRef(null);
  const pedidosInicialesCargadosRef = useRef(false);
  const toastTimerRef = useRef(null);
  const expressSectionRef = useRef(null);
  
  const LAB_DIRECCION = "Calle 52B # 24-95, Barrio Galan, Barrancabermeja";
  const LAB_REFERENCIA = "Recogida en Dr. Crispy Lab";

  const [headerCartAnimando, setHeaderCartAnimando] = useState(false);
  
  const [panelCarritoAbierto, setPanelCarritoAbierto] = useState(false);
  const [panelCarritoVista, setPanelCarritoVista] = useState("carrito");
  const [mostrarPromptPerfil, setMostrarPromptPerfil] = useState(false);
 
  const [botonAnimando, setBotonAnimando] = useState(null);

  const [drawerCarritoAbierto, setDrawerCarritoAbierto] = useState(false);

  const [salsaSeleccionAnimando, setSalsaSeleccionAnimando] = useState("");
  const [carritoAnimando, setCarritoAnimando] = useState(false);

  const esMovil = ancho < 900;

  const totalItemsCarrito = useMemo(() => {
    return carrito.reduce((acc, item) => acc + item.cantidad, 0);
  }, [carrito]);

  const puedeVerAdmin = rutaPrivada === "admin";
  const puedeVerRepartidor = rutaPrivada === "repartidor";

  useEffect(() => {
  if (panelCarritoAbierto) {
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "";
  }

  return () => {
    document.body.style.overflow = "";
  };
}, [panelCarritoAbierto]);

  useEffect(() => {
    function handleResize() {
      setAncho(window.innerWidth);
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
   
  useEffect(() => {
  if (clienteSesion?.id) {
    cargarPerfilCliente(clienteSesion.id);
  }
}, [clienteSesion?.id]);

  function mostrarMensaje(tipo, texto) {
    setMensaje({ tipo, texto });
    setTimeout(() => setMensaje({ tipo: "", texto: "" }), 3500);
  }

  function mostrarToast(texto, target) {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }

    let x = window.innerWidth / 2;
    let y = 110;

    if (target) {
      const rect = target.getBoundingClientRect();
      x = rect.left + rect.width / 2;
      y = rect.top - 16;

      if (y < 110) {
        y = rect.bottom + 16;
      }
    }

    const anchoToast = Math.min(420, window.innerWidth - 32);
    const mitad = anchoToast / 2;

    if (x < mitad + 16) x = mitad + 16;
    if (x > window.innerWidth - mitad - 16) {
      x = window.innerWidth - mitad - 16;
    }

    setToast({
      visible: true,
      texto,
      x,
      y,
    });

    toastTimerRef.current = setTimeout(() => {
      setToast((prev) => ({
        ...prev,
        visible: false,
        texto: "",
      }));
    }, 2200);
  }

  function limpiarCliente() {
    setCliente({
      nombre: "",
      telefono: "",
      direccion: "",
      referencia: "",
      pago: "Llave",
    });
  }

  function cerrarPanelCarrito() {
  setPanelCarritoAbierto(false);
  setPanelCarritoVista("carrito");
}
  function abrirPanelAuth(modo = "login") {
    setVista("cliente");
    setSeccionCliente("inicio");
    setClienteAuthModo(modo);
    setMostrarPromptPerfil(false);
    setPanelCarritoAbierto(true);
    setPanelCarritoVista(modo === "registro" ? "auth_registro" : "auth_login");
  }

function irAlCheckoutDesdePanel() {
  if (!clienteSesion?.id) {
    setMostrarPromptPerfil(true);
  } else {
    setMostrarPromptPerfil(false);
  }

  setPanelCarritoVista("checkout");
}


  function guardarSesionCliente(clienteData) {
    setClienteSesion(clienteData);
    localStorage.setItem("dr_cliente_sesion", JSON.stringify(clienteData));
  }

  function limpiarSesionCliente() {
    setClienteSesion(null);
    setDireccionesCliente([]);
    setDireccionSeleccionadaId("");
    setUsarOtraDireccion(false);
    localStorage.removeItem("dr_cliente_sesion");
  }

  function obtenerDireccionPrincipalLocal(clienteData) {
    const direcciones = Array.isArray(clienteData?.direcciones)
      ? clienteData.direcciones
      : [];
    return direcciones.find((item) => item.principal) || direcciones[0] || null;
  }

  function aplicarClienteAlFormulario(clienteData, opciones = {}) {
    const { mantenerDireccionManual = false } = opciones;
    const direccionPrincipal = obtenerDireccionPrincipalLocal(clienteData);

    setDireccionesCliente(Array.isArray(clienteData?.direcciones) ? clienteData.direcciones : []);
    setDireccionSeleccionadaId(direccionPrincipal?.id || "");

    setCliente((prev) => ({
      ...prev,
      nombre: clienteData?.nombre || prev.nombre,
      telefono: clienteData?.telefono || prev.telefono,
      direccion:
        mantenerDireccionManual || usarOtraDireccion
          ? prev.direccion
          : direccionPrincipal?.direccion || prev.direccion,
      referencia:
        mantenerDireccionManual || usarOtraDireccion
          ? prev.referencia
          : direccionPrincipal?.referencia || prev.referencia,
      pago: clienteData?.pagoPreferido || prev.pago || "Llave",
    }));
  }

  async function cargarPerfilCliente(clienteId, direccionPreferidaId = "") {
  try {
    const response = await fetch(`${API_URL}/clientes/${clienteId}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "No se pudo cargar el perfil");
    }

    const clienteApi = data.cliente || null;
    if (!clienteApi) return;

    setClienteSesion(clienteApi);
    localStorage.setItem("dr_cliente_sesion", JSON.stringify(clienteApi));

    const direcciones = Array.isArray(clienteApi.direcciones)
      ? clienteApi.direcciones
      : [];

    setDireccionesCliente(direcciones);

    if (direcciones.length > 0) {
      const principal =
        direcciones.find((d) => d.id === direccionPreferidaId) ||
        direcciones.find((d) => d.principal) ||
        direcciones[0];

      setDireccionSeleccionadaId(principal?.id || "");

      if (!usarOtraDireccion && principal) {
        setCliente((prev) => ({
          ...prev,
          nombre: clienteApi.nombre || "",
          telefono: clienteApi.telefono || "",
          direccion: principal.direccion || "",
          referencia: principal.referencia || "",
          pago: clienteApi.pagoPreferido || prev.pago || "Llave",
        }));
      } else {
        setCliente((prev) => ({
          ...prev,
          nombre: clienteApi.nombre || "",
          telefono: clienteApi.telefono || "",
          pago: clienteApi.pagoPreferido || prev.pago || "Llave",
        }));
      }
    } else {
      setDireccionSeleccionadaId("");
      setCliente((prev) => ({
        ...prev,
        nombre: clienteApi.nombre || "",
        telefono: clienteApi.telefono || "",
        pago: clienteApi.pagoPreferido || prev.pago || "Llave",
      }));
    }
  } catch (error) {
    mostrarMensaje("error", error.message);
  }
}

  async function iniciarSesionCliente() {
  try {
    if (!clienteLoginData.telefono.trim() || !clienteLoginData.password.trim()) {
      mostrarMensaje("error", "Completa teléfono y contraseña.");
      return;
    }

    setCargandoClienteAuth(true);

    const response = await fetch(`${API_URL}/clientes/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        telefono: clienteLoginData.telefono.trim(),
        password: clienteLoginData.password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "No se pudo iniciar sesión");
    }

    const clienteApi = data.cliente;
    setClienteSesion(clienteApi);
    localStorage.setItem("dr_cliente_sesion", JSON.stringify(clienteApi));
    setClienteAuthModo("");
    setClienteLoginData({
      telefono: "",
      password: "",
    });
    setUsarOtraDireccion(false);

    await cargarPerfilCliente(clienteApi.id);

    mostrarMensaje("ok", `Bienvenido ${clienteApi.nombre}`);
  } catch (error) {
    mostrarMensaje("error", error.message);
  } finally {
    setCargandoClienteAuth(false);
  }
}

  async function registrarCliente() {
  
  try {
    if (
      !clienteRegistroData.nombre.trim() ||
      !clienteRegistroData.telefono.trim() ||
      !clienteRegistroData.password.trim()
    ) {
      mostrarMensaje("error", "Completa nombre, teléfono y contraseña.");
      return;
    }

    setCargandoClienteAuth(true);

    const response = await fetch(`${API_URL}/clientes/registro`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nombre: clienteRegistroData.nombre.trim(),
        telefono: clienteRegistroData.telefono.trim(),
        password: clienteRegistroData.password,
        pagoPreferido: clienteRegistroData.pagoPreferido || "Llave",
        direccion: clienteRegistroData.direccion.trim(),
        referencia: clienteRegistroData.referencia.trim(),
        aliasDireccion: clienteRegistroData.aliasDireccion.trim() || "Casa",
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "No se pudo registrar el cliente");
    }

    const clienteApi = data.cliente;
    setClienteSesion(clienteApi);
    localStorage.setItem("dr_cliente_sesion", JSON.stringify(clienteApi));
    setClienteAuthModo("");
    setUsarOtraDireccion(false);

    setClienteRegistroData({
      nombre: "",
      telefono: "",
      password: "",
      direccion: "",
      referencia: "",
      aliasDireccion: "Casa",
      pagoPreferido: "Llave",
    });

    await cargarPerfilCliente(clienteApi.id);

    mostrarMensaje("ok", "Perfil creado correctamente.");
  } catch (error) {
    mostrarMensaje("error", error.message);
  } finally {
    setCargandoClienteAuth(false);
  }
}

function usarDireccionGuardada(direccionId) {
  setDireccionSeleccionadaId(direccionId);

  const direccion = direccionesCliente.find((d) => d.id === direccionId);
  if (!direccion) return;

  setUsarOtraDireccion(false);
  setCliente((prev) => ({
    ...prev,
    direccion: direccion.direccion || "",
    referencia: direccion.referencia || "",
  }));
}

  async function guardarDireccionActualCliente() {
  try {
    if (!clienteSesion?.id) {
      mostrarMensaje("error", "Debes iniciar sesión primero.");
      return;
    }

    if (!cliente.direccion.trim()) {
      mostrarMensaje("error", "Escribe una dirección antes de guardarla.");
      return;
    }

    setGuardandoDireccionCliente(true);

    const response = await fetch(
      `${API_URL}/clientes/${clienteSesion.id}/direcciones`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          alias: `Dirección ${direccionesCliente.length + 1}`,
          direccion: cliente.direccion.trim(),
          referencia: cliente.referencia.trim(),
          principal: direccionesCliente.length === 0,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "No se pudo guardar la dirección");
    }

    const nuevasDirecciones = Array.isArray(data.direcciones)
      ? data.direcciones
      : [];

    setDireccionesCliente(nuevasDirecciones);

    const principal =
      nuevasDirecciones.find((d) => d.direccion === cliente.direccion.trim()) ||
      nuevasDirecciones.find((d) => d.principal) ||
      nuevasDirecciones[0];

    setDireccionSeleccionadaId(principal?.id || "");
    setUsarOtraDireccion(false);

    await cargarPerfilCliente(clienteSesion.id, principal?.id || "");

    mostrarMensaje("ok", "Dirección guardada correctamente.");
  } catch (error) {
    mostrarMensaje("error", error.message);
  } finally {
    setGuardandoDireccionCliente(false);
  }
}

  function cerrarSesionCliente() {
  localStorage.removeItem("dr_cliente_sesion");
  setClienteSesion(null);
  setDireccionesCliente([]);
  setDireccionSeleccionadaId("");
  setUsarOtraDireccion(false);
  setClienteAuthModo("login");
  setClienteLoginData({
    telefono: "",
    password: "",
  });
  setClienteRegistroData({
    nombre: "",
    telefono: "",
    password: "",
    direccion: "",
    referencia: "",
    aliasDireccion: "Casa",
    pagoPreferido: "Llave",
  });
}


  function getCartKey(producto) {
  if (producto.esCombo) {
    return `${producto.id}-combo`;
  }

    return `${producto.id}-${producto.salsa || "sin-salsa"}`;
  }

  function formatearDetalleCombo(detalleCombo = []) {
  return detalleCombo.map((item) => {
    const salsa = item.salsa ? ` • ${item.salsa}` : "";
    return `${item.nombre} x${item.cantidad}${salsa}`;
  });
}

    function agregarProducto(producto, target) {
    if (!laboratorioAbierto) {
      mostrarMensaje(
        "error",
        `Ahora mismo estamos fuera de horario. Horario: ${horarioTexto}`
      );
    }

    const key = getCartKey(producto);
    const existente = carrito.find((item) => item.cartKey === key);

    setBotonAnimando(key);
    setCarritoAnimando(true);
    setHeaderCartAnimando(true);
    setPanelCarritoVista("carrito");
    setPanelCarritoAbierto(true);

    setTimeout(() => {
      setBotonAnimando(null);
    }, 220);

    setTimeout(() => {
      setCarritoAnimando(false);
    }, 420);

    setTimeout(() => {
      setHeaderCartAnimando(false);
    }, 520);

    if (existente) {
      setCarrito((prev) =>
        prev.map((item) =>
          item.cartKey === key
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        )
      );

      mostrarToast(`✅ ${producto.nombre} agregado a tu pedido`, target);
      return;
    }

    setCarrito((prev) => [
      ...prev,
      {
        ...producto,
        cantidad: 1,
        cartKey: key,
        experimento: producto.experimento || "Experimento 1",
        categoriaExperimento:
          producto.categoriaExperimento || "Alitas Crispy",
        esPromo: Boolean(producto.esPromo),
      },
    ]);

    mostrarToast(`✅ ${producto.nombre} agregado a tu pedido`, target);
  }

    function agregarProductoDirecto(producto, cantidad = 1, target = null) {
    if (!laboratorioAbierto) {
      mostrarMensaje(
        "error",
        `Ahora mismo estamos fuera de horario. Horario: ${horarioTexto}`
      );
    }

    const nuevoProducto = {
      ...producto,
      cantidad,
      cartKey: `${producto.id}-${producto.salsa || "sin-salsa"}`,
      experimento: producto.experimento || "Experimento 1",
      categoriaExperimento:
        producto.categoriaExperimento || "Alitas Crispy",
      esPromo: Boolean(producto.esPromo),
    };

    setPanelCarritoVista("carrito");
    setPanelCarritoAbierto(true);
    setCarritoAnimando(true);
    setHeaderCartAnimando(true);

    setTimeout(() => {
      setCarritoAnimando(false);
    }, 420);

    setTimeout(() => {
      setHeaderCartAnimando(false);
    }, 520);

    setCarrito((prev) => {
      const existente = prev.find(
        (item) => item.cartKey === nuevoProducto.cartKey
      );

      if (existente) {
        return prev.map((item) =>
          item.cartKey === nuevoProducto.cartKey
            ? { ...item, cantidad: item.cantidad + cantidad }
            : item
        );
      }

      return [...prev, nuevoProducto];
    });

    if (target) {
      mostrarToast(`✅ ${producto.nombre} agregado`, target);
    }
  }

    function agregarCombo(combo, target = null, salsaSeleccionada = "BBQ Reactor") {
    if (!laboratorioAbierto) {
      mostrarMensaje(
        "error",
        `Ahora mismo estamos fuera de horario. Horario: ${horarioTexto}`
      );
    }

    const salsaFinal = salsaSeleccionada || "BBQ Reactor";
    const cartKey = `${combo.id}-combo-${salsaFinal}`;

    setPanelCarritoVista("carrito");
    setPanelCarritoAbierto(true);
    setHeaderCartAnimando(true);

    setCarrito((prev) => {
      const existente = prev.find((item) => item.cartKey === cartKey);

      if (existente) {
        return prev.map((item) =>
          item.cartKey === cartKey
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
      }

      return [
        ...prev,
        {
          id: combo.id,
          nombre: combo.nombre,
          descripcion: combo.descripcion,
          precio: combo.precio,
          cantidad: 1,
          cartKey,
          esCombo: true,
          badge: combo.badge,
          emoji: combo.emoji,
          salsa: salsaFinal,
          experimento: combo.experimento || "Combos del Lab",
          categoriaExperimento:
            combo.categoriaExperimento || "Combos del Lab",
          detalleCombo: combo.itemsInternos.map((item) => {
            if (item.nombre.toLowerCase().includes("alitas")) {
              return {
                ...item,
                salsa: salsaFinal,
              };
            }

            return { ...item };
          }),
          esPromo: Boolean(combo.esPromo),
        },
      ];
    });

    setCarritoAnimando(true);
    setTimeout(() => setCarritoAnimando(false), 650);

    setTimeout(() => {
      setHeaderCartAnimando(false);
    }, 520);

    mostrarToast(`🔥 ${combo.nombre} agregado con ${salsaFinal}`, target);
  }

  function seleccionarSalsa(producto, salsa, target) {
  agregarProducto(
    {
      ...producto,
      salsa: salsa.nombre,
    },
    target
  );

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

    function activarModoPedido(modo) {
    if (modo === "recoger") {
      activarModoPedido("recoger");
      setHoraRecogida("");
      mostrarMensaje(
        "ok",
        "⚡ Estás en modo Express. Este pedido será para recoger en el lab."
      );
      return;
    }

    activarModoPedido("domicilio");
    setHoraRecogida("");
    mostrarMensaje(
      "ok",
      "🚚 Modo domicilio activado. Tu pedido será enviado a tu dirección."
    );
  }

    function validarCliente() {
    if (!cliente.nombre.trim()) return "Completa el nombre.";
    if (!cliente.telefono.trim()) return "Completa el teléfono.";
    if (!/^[0-9+\-\s]{7,20}$/.test(cliente.telefono.trim())) {
      return "El teléfono no parece válido.";
    }

    if (tipoPedido === "domicilio" && !cliente.direccion.trim()) {
      return "Completa la dirección.";
    }

    if (tipoPedido === "recoger" && !horaRecogida.trim()) {
      return "Indica la hora aproximada de recogida.";
    }

    if (carrito.length === 0) return "Agrega al menos un producto.";
    return null;
  }

   const ahoraBogota = useMemo(() => {
    return new Date(
      new Date().toLocaleString("en-US", { timeZone: "America/Bogota" })
    );
  }, []);

  const diaSemana = ahoraBogota.getDay(); // 0 domingo, 1 lunes, 2 martes...
  const horaActualMinutos =
    ahoraBogota.getHours() * 60 + ahoraBogota.getMinutes();

  const esMiercolesPromo = diaSemana === 3;

  const horarioTexto =
    "Martes a sábado: 4:00 PM a 9:00 PM • Domingos y lunes festivos: 12:00 PM a 9:00 PM";

  const laboratorioAbierto = useMemo(() => {
    const HORA_CIERRE = 21 * 60;

    // Domingo
    if (diaSemana === 0) {
      return horaActualMinutos >= 12 * 60 && horaActualMinutos < HORA_CIERRE;
    }

    // Lunes
    if (diaSemana === 1) {
      return false;
    }

    // Martes a sábado
    return horaActualMinutos >= 16 * 60 && horaActualMinutos < HORA_CIERRE;
  }, [diaSemana, horaActualMinutos]);

  const subtotal = useMemo(() => {
    return carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
  }, [carrito]);

  const carritoTienePromos = useMemo(() => {
    return carrito.some((item) => item.esPromo);
  }, [carrito]);

    const domicilio = useMemo(() => {
    if (tipoPedido === "recoger") return 0;

    // Si hay promo en el carrito, NO aplica domicilio incluido
    if (carritoTienePromos) return 5000;

    return 0;
  }, [carritoTienePromos, tipoPedido]);

  const total = subtotal + domicilio;
  const textoEntrega = tipoPedido === "recoger" ? "Recogida en el lab" : "Domicilio";

  const textoValorEntrega =
    tipoPedido === "recoger"
      ? "Sin costo"
      : domicilio === 0
      ? "Incluido"
      : `$${domicilio.toLocaleString("es-CO")}`;

  const pedidosDelDia = useMemo(() => {
    const hoy = new Date().toLocaleDateString("es-CO");
    return pedidos.filter((pedido) => {
      const fechaPedido = new Date(pedido.fecha);
      if (isNaN(fechaPedido.getTime())) {
        return String(pedido.fecha).includes(hoy);
      }
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
      "🔥 *QUIERO ACTIVAR ESTE EXPERIMENTO*",
      "",
      `👤 Cliente: ${cliente.nombre || "-"}`,
      `📞 Teléfono: ${cliente.telefono || "-"}`,
      `🛍️ Tipo de pedido: ${textoEntrega}`,
      ...(tipoPedido === "domicilio"
        ? [
            `📍 Dirección: ${cliente.direccion || "-"}`,
            `📝 Referencia: ${cliente.referencia || "-"}`,
          ]
        : [`⏰ Hora de recogida: ${horaRecogida || "-"}`]),
      `💳 Pago: ${cliente.pago || "-"}`,
      "",
      "*Productos:*",
      ...carrito.map(
        (item) =>
          `- ${item.experimento || "Experimento 1"} | ${item.nombre} x${
            item.cantidad
          }${item.salsa ? ` | ${item.salsa}` : ""} | $${(
            item.precio * item.cantidad
          ).toLocaleString("es-CO")}`
      ),
      "",
      `Subtotal: $${subtotal.toLocaleString("es-CO")}`,
      `${textoEntrega}: ${textoValorEntrega}`,
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
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
      texto
    )}`;
    window.open(url, "_blank");
  }

  function imprimirTicketPedido(pedido) {
    const metodoPago =
      pedido?.metodoPago || pedido?.cliente?.pago || "No definido";
    const estadoPago = pedido?.estadoPago || "Pendiente";

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
          <p><strong>Método de pago:</strong> ${metodoPago}</p>
          <p><strong>Estado del pago:</strong> ${estadoPago}</p>
          <div class="linea"></div>
          <h3>Productos</h3>
          <ul>
            ${pedido.items
              .map(
                (item) =>
                  `<li>${item.experimento || "Experimento 1"} | ${item.nombre} x${item.cantidad}${
                    item.salsa ? ` - ${item.salsa}` : ""
                  } - $${(item.precio * item.cantidad).toLocaleString(
                    "es-CO"
                  )}</li>`
              )
              .join("")}
          </ul>
          <div class="linea"></div>
          <p>Subtotal: $${pedido.subtotal.toLocaleString("es-CO")}</p>
          <p><strong>Tipo de pedido:</strong> ${pedido.tipoPedido === "recoger" ? "Recogida en el lab" : "Domicilio"}</p>
<p><strong>${pedido.tipoPedido === "recoger" ? "Recogida" : "Domicilio"}:</strong> ${
  pedido.tipoPedido === "recoger"
    ? "Sin costo"
    : pedido.domicilio === 0
    ? "Incluido"
    : `$${Number(pedido.domicilio || 0).toLocaleString("es-CO")}`
}</p>
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
    if (!laboratorioAbierto) {
      mostrarMensaje(
        "error",
        `Estamos fuera de horario. ${horarioTexto}`
      );
      return;
    }

    const errorValidacion = validarCliente();

    if (errorValidacion) {
      mostrarMensaje("error", errorValidacion);
      return;
    }

    try {
      setCargandoPedido(true);

            const clienteLimpio = {
        ...cliente,
        nombre: cliente.nombre.trim(),
        telefono: cliente.telefono.trim(),
        direccion: tipoPedido === "domicilio" ? cliente.direccion.trim() : "Recoge en el lab",
        referencia: tipoPedido === "domicilio" ? cliente.referencia.trim() : `Hora de recogida: ${horaRecogida}`,
      };

      const response = await fetch(`${API_URL}/pedidos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cliente: {
            ...clienteLimpio,
            id: clienteSesion?.id || "",
            aliasDireccion:
              direccionesCliente.find((item) => item.id === direccionSeleccionadaId)?.alias ||
              "",
          },
          items: carrito,
          subtotal,
          domicilio,
          total,
          metodoPago: cliente.pago,
          tipoPedido,
          horaRecogida,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error guardando pedido");
      }

      const nuevoPedido = data?.pedido || null;
      const nuevoId = nuevoPedido?.id || "";
      const nuevoTrackingToken = nuevoPedido?.trackingToken || "";

      setPedidoCreadoId(nuevoId);
      setTrackingToken(nuevoTrackingToken);
      setPedidoConsultado(nuevoPedido);

      if (nuevoTrackingToken) {
        localStorage.setItem("dr_tracking_token", nuevoTrackingToken);
      }

      setPedidoConfirmadoInfo({
        id: nuevoId,
        nombre: clienteLimpio.nombre,
        telefono: clienteLimpio.telefono,
        total,
      });

     setModalPedidoAbierto(true);
mostrarMensaje("ok", `Pedido creado correctamente: ${nuevoId}`);
mostrarToast("🎉 Tu pedido fue confirmado correctamente");

// 🔥 cerrar todos los carritos / paneles
setCheckoutMovilAbierto(false);
setDrawerCarritoAbierto(false);
setPanelCarritoAbierto(false);
setPanelCarritoVista("carrito");

// 🔥 limpiar carrito
setCarrito([]);
      if (clienteSesion?.id) {
        await cargarPerfilCliente(clienteSesion.id);
      } else {
        limpiarCliente();
      }

      setVista("seguimiento");

      if (nuevoTrackingToken) {
        consultarMiSeguimiento(nuevoTrackingToken);
      }
    } catch (error) {
      mostrarMensaje("error", error.message);
    } finally {
      setCargandoPedido(false);
    }
  }

  async function consultarMiSeguimiento(tokenManual) {
    const token = (tokenManual ?? trackingToken).trim();

    if (!token) {
      mostrarMensaje(
        "error",
        "Aún no tienes un pedido asociado en este dispositivo."
      );
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

  async function actualizarPagoPedido(id, nuevoEstadoPago) {
    try {
      const response = await fetch(`${API_URL}/pedidos/${id}/pago`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          estadoPago: nuevoEstadoPago,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "No se pudo actualizar el pago");
      }

      mostrarMensaje(
        "ok",
        `Pago del pedido ${id} actualizado a "${nuevoEstadoPago}"`
      );

      if (pedidoConsultado?.id === id) {
        await consultarMiSeguimiento();
      }
    } catch (error) {
      mostrarMensaje("error", error.message);
    }
  }

  async function eliminarPedido(id) {
    const confirmar = window.confirm(
      `¿Seguro que deseas eliminar el pedido ${id}?`
    );
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
    if (clienteSesion?.id) {
      cargarPerfilCliente(clienteSesion.id);
      setClienteAuthModo("perfil");
    }
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
  function irACategoriaVisual(tipo) {
  if (tipo === "experimentos") {
    setVista("cliente");
    setSeccionCliente("catalogo");
    return;
  }

  if (tipo === "combos") {
    setVista("cliente");
    setSeccionCliente("combos");
    return;
  }

  if (tipo === "adicionales") {
    setVista("cliente");
    setSeccionCliente("adicionales");
    return;
  }

  if (tipo === "bebidas") {
    setVista("cliente");
    setSeccionCliente("bebidas");
    return;
  }

  if (tipo === "express") {
    setVista("cliente");
    setSeccionCliente("inicio");

    setTimeout(() => {
      expressSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 120);

    return;
  }
}

  function notificarProximamente(experimento) {
    const texto = `Hola Dr. Crispy Lab, quiero que me avisen cuando esté disponible ${experimento.titulo} - ${experimento.subtitulo}.`;
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
      texto
    )}`;
    window.open(url, "_blank");
  }

  function renderFormulaCard(producto) {
  return renderCatalogCard({
    id: `formula-${producto.id}`,
    nombre: producto.nombre,
    descripcion: producto.descripcion,
    precio: producto.precio,
    imagen: producto.imagen,
    badge: "ELIGE TU SALSA",
    onAgregar: () => setFormulaSeleccionada(producto),
  });
}

function renderCatalogCard({
  id,
  nombre,
  descripcion,
  precio,
  imagen,
  badge,
  onAgregar,
}) {
  const cardKey = `catalog-${id}`;

  return (
    <div
      key={id}
      style={{
        ...styles.kfcCard,
        ...(cardHover === cardKey ? styles.kfcCardHover : {}),
      }}
      onMouseEnter={() => setCardHover(cardKey)}
      onMouseLeave={() => setCardHover("")}
    >
      <div style={styles.kfcCardImageWrap}>
        <img
          src={imagen || "/images/producto-placeholder.png"}
          alt={nombre}
          style={styles.kfcCardImage}
        />
      </div>

      <div style={styles.kfcCardContent}>
        <div style={styles.kfcCardPrice}>${precio.toLocaleString("es-CO")}</div>

        <h3 style={styles.kfcCardTitle}>{nombre}</h3>

        <p style={styles.kfcCardDesc}>{descripcion}</p>

        {badge ? <div style={styles.kfcCardBadge}>{badge}</div> : null}

        <button
          type="button"
          style={{
            ...styles.kfcCardBtn,
            ...(botonAnimando === cardKey ? styles.addBtnPop : {}),
          }}
          onClick={(e) => {
            e.stopPropagation();
            setBotonAnimando(cardKey);

            setTimeout(() => {
              setBotonAnimando(null);
            }, 220);

            onAgregar(e);
          }}
        >
          Agregar
        </button>
      </div>
    </div>
  );
}

  function renderSimpleCard(producto) {
  const esBebida = producto.categoria === "bebidas";
  const esAdicional = producto.categoria === "adicionales";

  return renderCatalogCard({
    id: `simple-${producto.id}`,
    nombre: producto.nombre,
    descripcion: producto.descripcion,
    precio: producto.precio,
    imagen: producto.imagen,
    badge: esBebida ? "BEBIDA" : esAdicional ? "ADICIONAL" : "",
    onAgregar: (e) => agregarProducto(producto, e.currentTarget),
  });
}

  function renderComboCard(combo) {
  return renderCatalogCard({
    id: `combo-${combo.id}`,
    nombre: combo.nombre,
    descripcion: combo.descripcion,
    precio: combo.precio,
    imagen: combo.imagen,
    badge: combo.badge || "COMBO",
    onAgregar: (e) => {
      setComboPendiente({ combo, target: e.currentTarget });
    },
  });
}
function renderBarraModoPedido() {
  return (
    <section
      style={{
        ...styles.modoPedidoBar,
        flexDirection: esMovil ? "column" : "row",
        alignItems: esMovil ? "stretch" : "center",
      }}
    >
      <div style={styles.modoPedidoBarInfo}>
        <div style={styles.modoPedidoBarLabel}>MODO DE PEDIDO</div>

        <div style={styles.modoPedidoBarButtons}>
          <button
            type="button"
            style={{
              ...styles.modoPedidoBtn,
              ...(tipoPedido === "domicilio"
                ? styles.modoPedidoBtnActiveDomicilio
                : {}),
            }}
            onClick={() => activarModoPedido("domicilio")}
          >
            🚚 Domicilio
          </button>

          <button
            type="button"
            style={{
              ...styles.modoPedidoBtn,
              ...(tipoPedido === "recoger"
                ? styles.modoPedidoBtnActiveExpress
                : {}),
            }}
            onClick={() => activarModoPedido("recoger")}
          >
            ⚡ Recoger en el lab
          </button>
        </div>
      </div>

      <div style={styles.modoPedidoBarStatus}>
        {tipoPedido === "recoger"
          ? "Express activo"
          : "Domicilio activo"}
      </div>
    </section>
  );
}

function renderFranjaExpressActiva() {
  if (tipoPedido !== "recoger") return null;

  return (
    <section
      style={{
        ...styles.expressActiveNotice,
        flexDirection: esMovil ? "column" : "row",
        alignItems: esMovil ? "stretch" : "center",
      }}
    >
      <div style={styles.expressActiveNoticeTextWrap}>
        <div style={styles.expressActiveNoticeTitle}>
          ⚡ Estás en modo Express
        </div>
        <div style={styles.expressActiveNoticeText}>
          Este pedido será para recoger en el lab. No se pedirá dirección ni referencia en el checkout.
        </div>
        <div style={styles.expressActiveNoticeAddress}>
          📍 {LAB_DIRECCION}
        </div>
        <div style={styles.expressActiveNoticeReference}>
          {LAB_REFERENCIA}
        </div>
      </div>

      <button
        type="button"
        style={styles.expressBackBtn}
        onClick={() => activarModoPedido("domicilio")}
      >
        Volver a domicilio
      </button>
    </section>
  );
}

  function renderHeroInicio() {
  return (
    <section
      style={{
        ...styles.labHero,
        gridTemplateColumns: esMovil ? "1fr" : "1.08fr 0.92fr",
      }}
    >
      <div style={styles.labHeroContent}>
        <div style={styles.heroMini}>🔥 LABORATORIO ACTIVO</div>

        <h2
          style={{
            ...styles.labHeroTitle,
            fontSize: esMovil ? 52 : 92,
          }}
        >
          NO ES POLLO. <br />
          ES UN EXPERIMENTO.
        </h2>

        <p style={styles.labHeroText}>
          Crujiente calibrado, combos activados y pedido rápido.
          <br />
          Dr. Crispy Lab no vende pollo común: activa antojos.
        </p>

        <div style={styles.heroUrgencyWrap}>
          <div style={styles.heroUrgencyPill}>🚚 Domicilio incluido</div>
          <div style={styles.heroUrgencyPill}>🔥 Top del laboratorio</div>
          <div style={styles.heroUrgencyPill}>⚡ Pide en minutos</div>
        </div>

        <div style={styles.heroActionRow}>
                    <button
            style={styles.heroPrimaryBtn}
            onClick={() => {
              activarModoPedido("domicilio");
              entrarExperimento1();
            }}
          >
            Pedir ahora
          </button>

          <button
            style={styles.heroSecondaryBtn}
            onClick={() => irASeccionCliente("catalogo")}
          >
            Ver combos y experimentos
          </button>
        </div>

        <div style={styles.heroInfoStrip}>
          <div style={styles.heroInfoCard}>
            <div style={styles.heroInfoValue}>+ Más pedido</div>
            <div style={styles.heroInfoLabel}>Combo Pareja y Experimento 01</div>
          </div>

          <div style={styles.heroInfoCard}>
            <div style={styles.heroInfoValue}>40 min</div>
            <div style={styles.heroInfoLabel}>Express para recoger</div>
          </div>

          <div style={styles.heroInfoCard}>
            <div style={styles.heroInfoValue}>3 fórmulas</div>
            <div style={styles.heroInfoLabel}>BBQ, Honey y Fuego Atómico</div>
          </div>
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

          <div style={styles.heroPosterBadge}>🍗 EXPERIENCIA CRISPY ACTIVADA</div>

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

    function renderExpressSection() {
    return (
      <section style={styles.expressSection}>
        <div style={styles.expressInner}>
          <div style={styles.expressBadge}>⚡ DR. CRISPY LAB EXPRESS</div>

          <div
            style={{
              ...styles.expressContent,
              gridTemplateColumns: esMovil ? "1fr" : "1.1fr 0.9fr",
            }}
          >
            <div style={styles.expressTextBlock}>
              <h2 style={styles.expressTitle}>PIDE Y RECOGE EN EL LAB</h2>
              <p style={styles.expressText}>
                Haz tu pedido y recógelo directamente en el laboratorio. Ideal
                para quienes quieren pasar por él sin esperar domicilio.
              </p>

              <div style={styles.expressPills}>
                <div style={styles.expressPill}>⏱️ Más rápido</div>
                <div style={styles.expressPill}>📍 Recoge en el lab</div>
                <div style={styles.expressPill}>🔥 Flujo express</div>
              </div>

              <div style={styles.heroActionRow}>
                <button
                  style={styles.heroPrimaryBtn}
                  onClick={() => {
                    activarModoPedido("recoger");
                    setPanelCarritoAbierto(false);
                    setDrawerCarritoAbierto(false);
                    setCheckoutMovilAbierto(false);
                    setPanelCarritoVista("carrito");
                    setVista("cliente");
                    setSeccionCliente("combos");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  Pedir para recoger
                </button>

                <button
                  style={styles.heroSecondaryBtn}
                  onClick={() => {
                    activarModoPedido("recoger");
                    setPanelCarritoAbierto(false);
                    setDrawerCarritoAbierto(false);
                    setCheckoutMovilAbierto(false);
                    setPanelCarritoVista("carrito");
                    setVista("cliente");
                    setSeccionCliente("combos");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  Elegir hora
                </button>
              </div>

            <div style={styles.expressVisual}>
              <img
                src="/images/categoria-express.png"
                alt="Dr Crispy Lab Express"
                style={styles.expressImage}
              />
            </div>
          </div>
        </div>
      </section>
    );
  }

  function renderMiercolesPromoSection() {
    if (!esMiercolesPromo) return null;

    return (
      <section style={styles.panel}>
        <div style={styles.catalogHeader}>
          <div style={styles.menuInteractiveBadge}>🔥 SOLO HOY</div>
          <h2 style={styles.catalogTitle}>MIÉRCOLES DE PROMOCIÓN</h2>
          <p style={styles.catalogText}>
            Promos activas del laboratorio solo por hoy. En promociones no aplica domicilio incluido.
          </p>
        </div>

        <div
          style={{
            ...styles.comboGrid,
            gridTemplateColumns: esMovil
              ? "1fr"
              : "repeat(2, minmax(0, 1fr))",
          }}
        >
          {PROMOS_MIERCOLES.map((promo) =>
            renderCatalogCard({
              id: `promo-${promo.id}`,
              nombre: promo.nombre,
              descripcion: promo.descripcion,
              precio: promo.precio,
              imagen: promo.imagen,
              badge: promo.badge || "PROMO",
              onAgregar: (e) => agregarProductoDirecto(promo, 1, e.currentTarget),
            })
          )}
        </div>
      </section>
    );
  }

function renderCategoriasVisuales() {
  const categorias = [
    {
      id: "experimentos",
      nombre: "🧪 Experimentos",
      imagen: "/images/categoria-experimentos.png",
    },
    {
      id: "combos",
      nombre: "🔥 Combos",
      imagen: "/images/categoria-combos.png",
    },
    {
      id: "adicionales",
      nombre: "🍟 Adicionales",
      imagen: "/images/categoria-complementos.png",
    },
    {
      id: "bebidas",
      nombre: "🥤 Bebidas",
      imagen: "/images/categoria-bebidas.png",
    },
    {
      id: "express",
      nombre: "⚡ Express",
      imagen: "/images/categoria-express.png",
    },
  ];

  return (
    <section style={styles.panel}>
      <div style={styles.catalogHeader}>
        <div style={styles.menuInteractiveBadge}>🍗 EXPLORA RÁPIDO</div>
        <h2 style={styles.catalogTitle}>ELIGE TU RUTA EN EL LAB</h2>
        <p style={styles.catalogText}>
          Toca y entra directo a lo que quieres pedir.
        </p>
      </div>

      <div
        style={{
          ...styles.categoriasVisualesGrid,
          gridTemplateColumns: esMovil
            ? "1fr 1fr"
            : "repeat(5, minmax(0, 1fr))",
        }}
      >
        {categorias.map((cat) => (
          <button
            key={cat.id}
            type="button"
            style={styles.categoriaVisualCard}
            onClick={() => irACategoriaVisual(cat.id)}
          >
            <div style={styles.categoriaVisualImageWrap}>
              <img
                src={cat.imagen}
                alt={cat.nombre}
                style={styles.categoriaVisualImage}
              />
            </div>

            <div style={styles.categoriaVisualTitle}>{cat.nombre}</div>
          </button>
        ))}
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
            gridTemplateColumns: esMovil
              ? "1fr"
              : "repeat(3, minmax(0, 1fr))",
          }}
        >
          {EXPERIMENTOS.map((experimento) => (
            <div
              key={experimento.id}
              style={{
                ...styles.experimentCard,
                ...(experimento.id === "exp1"
                  ? styles.experimentCardActive
                  : {}),
                ...(cardHover === experimento.id
                  ? styles.experimentCardHover
                  : {}),
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

                    <span
                      style={{ ...styles.salsaDot, ...styles.salsaDot1 }}
                    ></span>
                    <span
                      style={{ ...styles.salsaDot, ...styles.salsaDot2 }}
                    ></span>
                    <span
                      style={{ ...styles.salsaDot, ...styles.salsaDot3 }}
                    ></span>
                    <span
                      style={{ ...styles.salsaDot, ...styles.salsaDot4 }}
                    ></span>
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
                <div style={styles.experimentSubtitle}>
                  {experimento.subtitulo}
                </div>
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

  function renderCombosScreen() {
  return (
    <section
      style={{
        ...styles.mainGrid,
        gridTemplateColumns: esMovil ? "1fr" : "1.35fr 0.85fr",
      }}
    >
      <div style={styles.panel}>
        <div style={styles.experimentoHeaderRow}>
          <div>
            <div style={styles.menuInteractiveBadge}>🔥 COMBOS ACTIVADOS</div>
            <h2 style={styles.experimentScreenTitle}>COMBOS DEL LAB</h2>
            <p style={styles.experimentScreenText}>
              Los más pedidos del laboratorio. Más rápidos de elegir, más fáciles de vender.
            </p>
          </div>

          <button
            style={styles.backCatalogBtn}
            onClick={() => irASeccionCliente("inicio")}
          >
            ← Volver al inicio
          </button>
        </div>

        <div
          style={{
            ...styles.comboGrid,
            gridTemplateColumns: esMovil
              ? "1fr"
              : "repeat(2, minmax(0, 1fr))",
            marginTop: 22,
          }}
        >
          {COMBOS.map(renderComboCard)}
        </div>
      </div>
    </section>
  );
}

function renderBebidasScreen() {
  return (
    <section
      style={{
        ...styles.mainGrid,
        gridTemplateColumns: esMovil ? "1fr" : "1.35fr 0.85fr",
      }}
    >
      <div style={styles.panel}>
        <div style={styles.experimentoHeaderRow}>
          <div>
            <div style={styles.menuInteractiveBadge}>🥤 BEBIDAS ACTIVADAS</div>
            <h2 style={styles.experimentScreenTitle}>BEBIDAS</h2>
            <p style={styles.experimentScreenText}>
              Agrégale bebida fría a tu pedido y completa la fórmula del lab.
            </p>
          </div>

          <button
            style={styles.backCatalogBtn}
            onClick={() => irASeccionCliente("inicio")}
          >
            ← Volver al inicio
          </button>
        </div>

        <div
          style={{
            ...styles.simpleGrid,
            gridTemplateColumns: "1fr",
          }}
        >
          {BEBIDAS.map(renderSimpleCard)}
        </div>
      </div>
    </section>
  );
}

  function renderExperimento1() {
  return (
    <section
      style={{
        ...styles.mainGrid,
        gridTemplateColumns: "1fr",
      }}
    >
      <div>
        <div style={styles.panel}>
          <div style={styles.experimentoHeaderRow}>
            <div>
              <div style={styles.menuInteractiveBadge}>
                🔥 EXPERIMENTO 1 ACTIVO
              </div>
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
              filter: "brightness(1.08) contrast(1.12)",
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

          <div style={styles.menuInteractiveSection}>
            <div style={styles.menuInteractiveHeader}>
              <div style={styles.menuInteractiveBadge}>🍗 MENÚ INTERACTIVO</div>
              <h2 style={styles.menuInteractiveTitle}>
                SELECCIONA TU EXPERIMENTO
              </h2>
              <p style={styles.catalogText}>
                Elige el tamaño y después selecciona tu salsa.
              </p>
            </div>

            <div
              style={{
                ...styles.posterFormulaGrid,
                gridTemplateColumns: "1fr",
              }}
            >
              {FORMULAS.map(renderFormulaCard)}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function renderAdicionalesScreen() {
  return (
    <section
      style={{
        ...styles.mainGrid,
        gridTemplateColumns: esMovil ? "1fr" : "1.35fr 0.85fr",
      }}
    >
      <div style={styles.panel}>
        <div style={styles.experimentoHeaderRow}>
          <div>
            <div style={styles.menuInteractiveBadge}>🍟 ADICIONALES DEL LAB</div>
            <h2 style={styles.experimentScreenTitle}>ADICIONALES</h2>
            <p style={styles.experimentScreenText}>
              Completa tu experimento con papas y extras del laboratorio.
            </p>
          </div>

          <button
            style={styles.backCatalogBtn}
            onClick={() => irASeccionCliente("inicio")}
          >
            ← Volver al inicio
          </button>
        </div>

        <div
          style={{
            ...styles.simpleGrid,
            gridTemplateColumns: "1fr",
          }}
        >
          {ADICIONALES.map(renderSimpleCard)}
        </div>
      </div>
    </section>
  );
}

function renderCarritoDesktop() {
  if (esMovil) return null;

  return (
    <div>
      <div
        style={{
          ...styles.panelSticky,
          ...(carritoAnimando ? styles.panelStickyPulse : {}),
          position: "sticky",
          display: "block",
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
              <div style={{ flex: 1, minWidth: 0 }}>
                <strong style={{ display: "block", marginBottom: 4 }}>
                  {item.esCombo ? `🔥 ${item.nombre}` : item.nombre}
                </strong>

                <div style={styles.cartSub}>
                  {item.experimento || "Experimento 1"}
                </div>

                {item.salsa && (
                  <div
                    style={{
                      ...styles.cartSub,
                      color: "#ffd166",
                      fontWeight: "bold",
                    }}
                  >
                    Sabor: {item.salsa}
                  </div>
                )}

                {item.esCombo && Array.isArray(item.detalleCombo) && (
                  <div style={{ marginTop: 8 }}>
                    {formatearDetalleCombo(item.detalleCombo).map(
                      (detalle, idx) => (
                        <div key={idx} style={styles.cartSub}>
                          • {detalle}
                        </div>
                      )
                    )}
                  </div>
                )}

                <div
                  style={{
                    ...styles.cartSub,
                    marginTop: 8,
                    fontWeight: "bold",
                    color: "#fff",
                  }}
                >
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

        {carrito.length > 0 && (
          <div style={styles.upsellBox}>
            <div style={styles.upsellTextWrap}>
              <div style={styles.upsellTitle}>🍟 Agrégale papas</div>
              <div style={styles.upsellText}>
                Súmale una porción por solo $4.000 más
              </div>
            </div>

            <button
              type="button"
              style={styles.upsellBtn}
              onClick={(e) =>
                agregarProducto(
                  {
                    id: "upsell-papas-4000",
                    nombre: "Papas fritas promo",
                    descripcion: "Upsell del laboratorio",
                    precio: 4000,
                    emoji: "🍟",
                    categoria: "adicionales",
                  },
                  e.currentTarget
                )
              }
            >
              Agregar
            </button>
          </div>
        )}

        <div style={styles.summaryBox}>
          <div style={styles.summaryRow}>
            <span>Subtotal</span>
            <span>${subtotal.toLocaleString("es-CO")}</span>
          </div>

          <div style={styles.summaryRow}>
  <span>{textoEntrega}</span>
  <span style={{ color: "#ffd166", fontWeight: "bold" }}>
    {textoValorEntrega}
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
          {cargandoPedido ? "Activando pedido..." : "🔥 PEDIR AHORA"}
        </button>

        <div style={styles.cartTrustText}>
          {tipoPedido === "recoger"
            ? "⚡ Recógelo caliente en el lab. Sin costo de entrega."
            : "⚡ Recíbelo caliente. Domicilio incluido."}
        </div>

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
  );
}

function renderPickupInfoCard() {
  if (tipoPedido !== "recoger") return null;

  return (
    <div style={styles.pickupInfoCard}>
      <div style={styles.pickupInfoBadge}>⚡ RECOGIDA EN EL LAB</div>

      <div style={styles.pickupInfoTitle}>
        Recoge tu pedido en esta dirección
      </div>

      <div style={styles.pickupInfoAddress}>{LAB_DIRECCION}</div>

      <div style={styles.pickupInfoReference}>{LAB_REFERENCIA}</div>
    </div>
  );
}

  function renderCliente() {
  return (
    <>
      <section style={styles.clientNavWrap}>
        <button
          style={{
            ...styles.clientNavBtn,
            ...(seccionCliente === "inicio"
              ? styles.clientNavBtnActive
              : {}),
          }}
          onClick={() => irASeccionCliente("inicio")}
        >
          Inicio
        </button>

        <button
          style={{
            ...styles.clientNavBtn,
            ...(seccionCliente === "catalogo"
              ? styles.clientNavBtnActive
              : {}),
          }}
          onClick={() => irASeccionCliente("catalogo")}
        >
          Experimentos
        </button>

        <button
          style={{
            ...styles.clientNavBtn,
            ...(seccionCliente === "combos"
              ? styles.clientNavBtnActive
              : {}),
          }}
          onClick={() => setSeccionCliente("combos")}
        >
          Combos
        </button>

        <button
          style={{
            ...styles.clientNavBtn,
            ...(seccionCliente === "adicionales"
              ? styles.clientNavBtnActive
              : {}),
          }}
          onClick={() => setSeccionCliente("adicionales")}
        >
          Adicionales
        </button>

        <button
          style={{
            ...styles.clientNavBtn,
            ...(seccionCliente === "bebidas"
              ? styles.clientNavBtnActive
              : {}),
          }}
          onClick={() => setSeccionCliente("bebidas")}
        >
          Bebidas
        </button>
      </section>

      {/* 🔥 BLOQUE CORRECTO */}
            {seccionCliente === "inicio" && (
        <>
          {renderHeroInicio()}
          <div ref={expressSectionRef}>
            {renderExpressSection()}
          </div>
          {renderMiercolesPromoSection()}
          {renderCategoriasVisuales()}
          {renderCatalogoExperimentos()}
        </>
      )}

      {seccionCliente === "catalogo" && renderCatalogoExperimentos()}
      {seccionCliente === "combos" && renderCombosScreen()}
      {seccionCliente === "adicionales" && renderAdicionalesScreen()}
      {seccionCliente === "bebidas" && renderBebidasScreen()}
      {seccionCliente === "experimento1" && renderExperimento1()}

      {esMovil && carrito.length > 0 && (
        <div
          style={{
            ...styles.floatingCartWrap,
            ...(carritoAnimando ? styles.floatingCartWrapPop : {}),
          }}
        >
          <button
  type="button"
  style={{
    ...styles.floatingCartBtn,
    ...(carritoAnimando ? styles.floatingCartBtnPulse : {}),
  }}
  onClick={() => {
    setPanelCarritoAbierto(true);
    setPanelCarritoVista("carrito");
  }}
>
  <span>🛒 Ver pedido</span>
  <span>
    {totalItemsCarrito} item{totalItemsCarrito > 1 ? "s" : ""} • $
    {total.toLocaleString("es-CO")}
  </span>
</button>
        </div>
      )}
    </>
  );
}

  return (
    <div style={styles.page}>
      <audio ref={audioRef} src={alertaSound} preload="auto" />
      <div style={styles.overlay}></div>

      {toast.visible && (
        <div
          style={{
            ...styles.toastBox,
            left: toast.x,
            top: toast.y,
            transform: "translate(-50%, -100%)",
          }}
        >
          <div style={styles.toastInner}>
            <div style={styles.toastIcon}>✅</div>
            <div style={styles.toastText}>{toast.texto}</div>
          </div>
        </div>
      )}

      {modalPedidoAbierto && (
        <div
          style={styles.modalBackdrop}
          onClick={() => setModalPedidoAbierto(false)}
        >
          <div
            style={styles.successModalCard}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={styles.successEmoji}>🎉🍗</div>

            <h2 style={styles.successTitle}>Experimento confirmado</h2>

            <p style={styles.successText}>
              Tu pedido fue recibido correctamente en el laboratorio.
            </p>

            {pedidoConfirmadoInfo && (
              <div style={styles.successDataBox}>
                <div style={styles.successDataRow}>
                  <span>Pedido</span>
                  <strong>{pedidoConfirmadoInfo.id}</strong>
                </div>

                <div style={styles.successDataRow}>
                  <span>Cliente</span>
                  <strong>{pedidoConfirmadoInfo.nombre}</strong>
                </div>

                <div style={styles.successDataRow}>
                  <span>Total</span>
                  <strong>
                    ${pedidoConfirmadoInfo.total.toLocaleString("es-CO")}
                  </strong>
                </div>
              </div>
            )}

            <p style={styles.successHint}>
              Puedes seguir el estado de tu pedido en la sección de seguimiento.
            </p>

            <div style={styles.successActions}>
              <button
                style={styles.heroSecondaryBtn}
                onClick={() => {
                  setModalPedidoAbierto(false);
                  setVista("seguimiento");
                  consultarMiSeguimiento();
                }}
              >
                Ver seguimiento
              </button>

              <button
                style={styles.heroPrimaryBtn}
                onClick={() => setModalPedidoAbierto(false)}
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {formulaSeleccionada && (
  <div
    style={styles.kfcModalBackdrop}
    onClick={() => setFormulaSeleccionada(null)}
  >
    <div
      style={styles.kfcModalCard}
      onClick={(e) => e.stopPropagation()}
    >
      <div
        style={{
          ...styles.kfcModalLayout,
          gridTemplateColumns: esMovil ? "1fr" : "320px 1fr",
        }}
      >
        <div style={styles.kfcModalImageWrap}>
          <img
            src={
              formulaSeleccionada.imagen || "/images/producto-placeholder.png"
            }
            alt={formulaSeleccionada.nombre}
            style={styles.kfcModalImage}
          />
        </div>

        <div style={styles.kfcModalContent}>
          <div style={styles.kfcModalTopBar}>
            <div>
              <div style={styles.kfcModalMiniBadge}>
                🧪 PERSONALIZA TU PEDIDO
              </div>
              <h2 style={styles.kfcModalTitle}>
                {formulaSeleccionada.nombre}
              </h2>
              <div style={styles.kfcModalPrice}>
                ${formulaSeleccionada.precio.toLocaleString("es-CO")}
              </div>
              <p style={styles.kfcModalDesc}>
                {formulaSeleccionada.descripcion}
              </p>
            </div>

            <button
              type="button"
              style={styles.kfcModalCloseBtn}
              onClick={() => setFormulaSeleccionada(null)}
            >
              ✕
            </button>
          </div>

          <div style={styles.kfcModalSection}>
            <div style={styles.kfcModalSectionHeader}>
              <div>
                <div style={styles.kfcModalSectionTitle}>
                  ¿Qué sabor deseas?
                </div>
                <div style={styles.kfcModalSectionSub}>
                  Es necesario elegir uno
                </div>
              </div>

              <div style={styles.kfcStepBubble}>1 / 1</div>
            </div>

            <div style={styles.kfcOptionList}>
              {SALSAS.map((salsa) => (
                <button
                  key={salsa.nombre}
                  type="button"
                  style={styles.kfcOptionCard}
                  onClick={() => {
                    agregarProducto(
                      {
                        ...formulaSeleccionada,
                        salsa: salsa.nombre,
                      },
                      null
                    );

                    setFormulaSeleccionada(null);
                  }}
                >
                  <div style={styles.kfcOptionLeft}>
                    <div style={styles.kfcOptionEmoji}>{salsa.emoji}</div>
                    <div>
                      <div style={styles.kfcOptionTitle}>{salsa.nombre}</div>
                      <div style={styles.kfcOptionText}>
                        {salsa.descripcion}
                      </div>
                    </div>
                  </div>

                  <div style={styles.kfcOptionAction}>Elegir</div>
                </button>
              ))}
            </div>
          </div>

          <div style={styles.kfcModalFooterNote}>
            Selecciona un sabor para agregar este producto al carrito.
          </div>
        </div>
      </div>
    </div>
  </div>
)}

      {comboPendiente && (
  <div
    style={styles.kfcModalBackdrop}
    onClick={() => setComboPendiente(null)}
  >
    <div
      style={styles.kfcModalCard}
      onClick={(e) => e.stopPropagation()}
    >
      <div
        style={{
          ...styles.kfcModalLayout,
          gridTemplateColumns: esMovil ? "1fr" : "320px 1fr",
        }}
      >
        <div style={styles.kfcModalImageWrap}>
          <img
            src={
              comboPendiente.combo.imagen || "/images/producto-placeholder.png"
            }
            alt={comboPendiente.combo.nombre}
            style={styles.kfcModalImage}
          />
        </div>

        <div style={styles.kfcModalContent}>
          <div style={styles.kfcModalTopBar}>
            <div>
              <div style={styles.kfcModalMiniBadge}>
                🔥 PERSONALIZA TU COMBO
              </div>
              <h2 style={styles.kfcModalTitle}>
                {comboPendiente.combo.nombre}
              </h2>
              <div style={styles.kfcModalPrice}>
                ${comboPendiente.combo.precio.toLocaleString("es-CO")}
              </div>
              <p style={styles.kfcModalDesc}>
                {comboPendiente.combo.descripcion}
              </p>
            </div>

            <button
              type="button"
              style={styles.kfcModalCloseBtn}
              onClick={() => setComboPendiente(null)}
            >
              ✕
            </button>
          </div>

          <div style={styles.kfcComboSummaryBox}>
            <div style={styles.kfcComboSummaryTitle}>
              Incluye este combo:
            </div>

            <div style={styles.kfcComboSummaryList}>
              {comboPendiente.combo.itemsInternos.map((item) => (
                <div key={item.id} style={styles.kfcComboSummaryItem}>
                  • {item.nombre} x{item.cantidad}
                </div>
              ))}
            </div>
          </div>

          <div style={styles.kfcModalSection}>
            <div style={styles.kfcModalSectionHeader}>
              <div>
                <div style={styles.kfcModalSectionTitle}>
                  ¿Qué sabor deseas?
                </div>
                <div style={styles.kfcModalSectionSub}>
                  Es necesario elegir uno
                </div>
              </div>

              <div style={styles.kfcStepBubble}>1 / 1</div>
            </div>

            <div style={styles.kfcOptionList}>
              {SALSAS.map((salsa) => (
                <button
                  key={salsa.nombre}
                  type="button"
                  style={styles.kfcOptionCard}
                  onClick={() => {
                    agregarCombo(
                      comboPendiente.combo,
                      comboPendiente.target,
                      salsa.nombre
                    );

                    setComboPendiente(null);
                  }}
                >
                  <div style={styles.kfcOptionLeft}>
                    <div style={styles.kfcOptionEmoji}>{salsa.emoji}</div>
                    <div>
                      <div style={styles.kfcOptionTitle}>{salsa.nombre}</div>
                      <div style={styles.kfcOptionText}>
                        {salsa.descripcion}
                      </div>
                    </div>
                  </div>

                  <div style={styles.kfcOptionAction}>Elegir</div>
                </button>
              ))}
            </div>
          </div>

          <div style={styles.kfcStickyFooter}>
            <div style={styles.kfcStickyFooterPrice}>
              Total: ${comboPendiente.combo.precio.toLocaleString("es-CO")}
            </div>
            <div style={styles.kfcModalFooterNote}>
              Selecciona una salsa para continuar.
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
)}

      {esMovil && carrito.length > 0 && !panelCarritoAbierto && (
  <button
    type="button"
    style={styles.floatingCartBtn}
    onClick={() => {
      setPanelCarritoAbierto(true);
      setPanelCarritoVista("carrito");
    }}
  >
          <span>🛒 Ver pedido</span>
          <span>
            {totalItemsCarrito} • ${total.toLocaleString("es-CO")}
          </span>
        </button>
      )}

              {esMovil && drawerCarritoAbierto && (
  <div
    style={styles.drawerBackdrop}
    onClick={() => setDrawerCarritoAbierto(false)}
  >
    <div
      style={styles.drawerCart}
      onClick={(e) => e.stopPropagation()}
    >
      <div style={styles.drawerContainer}>
        <div style={styles.drawerHeader}>
          <div style={styles.drawerHeaderContent}>
            <div style={styles.drawerMini}>🛒 TU PEDIDO</div>

            <h2 style={styles.drawerTitle}>Tu pedido del laboratorio</h2>

            <div style={styles.drawerHeaderMeta}>
              <span style={styles.drawerMetaPill}>
                {totalItemsCarrito} item{totalItemsCarrito > 1 ? "s" : ""}
              </span>

              <span style={styles.drawerMetaPillHighlight}>
                ${total.toLocaleString("es-CO")}
              </span>
            </div>

            <div style={styles.drawerEta}>
              ⚡ Revísalo y confirma cuando estés listo
            </div>
          </div>

          <button
            type="button"
            style={styles.drawerCloseBtn}
            onClick={() => setDrawerCarritoAbierto(false)}
          >
            ✕
          </button>
        </div>

        <div style={styles.drawerContent}>
          {carrito.length === 0 ? (
            <div style={styles.emptyBox}>
              No has agregado productos todavía.
            </div>
          ) : (
            <div style={styles.drawerItemsWrap}>
              {carrito.map((item) => (
                <div key={item.cartKey} style={styles.cartItem}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <strong style={{ display: "block", marginBottom: 4 }}>
                      {item.esCombo ? `🔥 ${item.nombre}` : item.nombre}
                    </strong>

                    <div style={styles.cartSub}>
                      {item.experimento || "Experimento 1"}
                    </div>

                    {item.salsa && (
                      <div
                        style={{
                          ...styles.cartSub,
                          color: "#ffd166",
                          fontWeight: "bold",
                        }}
                      >
                        Sabor: {item.salsa}
                      </div>
                    )}

                    {item.esCombo && Array.isArray(item.detalleCombo) && (
                      <div style={{ marginTop: 8 }}>
                        {formatearDetalleCombo(item.detalleCombo).map(
                          (detalle, idx) => (
                            <div key={idx} style={styles.cartSub}>
                              • {detalle}
                            </div>
                          )
                        )}
                      </div>
                    )}

                    <div
                      style={{
                        ...styles.cartSub,
                        marginTop: 8,
                        fontWeight: "bold",
                        color: "#fff",
                      }}
                    >
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
              ))}
            </div>
          )}
        </div>

        {carrito.length > 0 && (
  <div style={styles.drawerFooter}>
    <div style={styles.summaryBox}>
      <div style={styles.summaryRow}>
        <span>Subtotal</span>
        <span>${subtotal.toLocaleString("es-CO")}</span>
      </div>

      <div style={styles.summaryRow}>
        <span>{textoEntrega}</span>
        <span style={{ color: "#ffd166", fontWeight: "bold" }}>
          {textoValorEntrega}
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
        marginTop: 0,
      }}
      onClick={() => {
        setDrawerCarritoAbierto(false);
        setPanelCarritoAbierto(true);
        setPanelCarritoVista("checkout");
      }}
    >
      🔥 CONTINUAR PEDIDO
    </button>

    {!laboratorioAbierto && (
      <div style={styles.cartClosedHint}>
        🕒 Estamos fuera de horario. Puedes seguir armando tu pedido, pero
        solo podrás confirmarlo en horario de atención.
      </div>
    )}

    <div style={styles.cartTrustText}>
      {tipoPedido === "recoger"
        ? "⚡ Recógelo caliente en el lab. Sin costo de entrega."
        : "⚡ Recíbelo caliente. Domicilio incluido."}
    </div>

    <button
      style={styles.whatsappBtn}
      onClick={abrirWhatsAppPedido}
    >
      Enviar pedido por WhatsApp
    </button>
  </div>
)}
      </div>
    </div>
  </div>
)}
              {esMovil && checkoutMovilAbierto && (
        <div
          style={styles.modalBackdrop}
          onClick={() => setCheckoutMovilAbierto(false)}
        >
          <div
            style={styles.checkoutMobileCard}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={styles.checkoutMobileHeader}>
              <div>
                <div style={styles.menuInteractiveBadge}>📦 FINALIZAR PEDIDO</div>
                <h2 style={styles.checkoutMobileTitle}>Checkout del laboratorio</h2>
                <p style={styles.checkoutMobileSubtitle}>
                  Confirma tus datos de entrega y método de pago.
                </p>
              </div>

              <button
                type="button"
                style={styles.modalCloseBtn}
                onClick={() => setCheckoutMovilAbierto(false)}
              >
                ✕
              </button>
            </div>

            <div style={styles.checkoutMobileBody}>
              {clienteSesion?.id ? (
  <div style={styles.checkoutProfileBox}>
    <div style={styles.checkoutProfileTop}>
      <div>
        <div style={styles.checkoutProfileBadge}>👤 PERFIL ACTIVO</div>
        <div style={styles.checkoutProfileName}>
          {clienteSesion.nombre || cliente.nombre || "-"}
        </div>
      </div>

      <div style={styles.checkoutProfileStatus}>Listo para pedir</div>
    </div>

    <div style={styles.checkoutProfileDataGrid}>
      <div style={styles.checkoutProfileDataCard}>
        <div style={styles.checkoutProfileLabel}>Celular</div>
        <div style={styles.checkoutProfileValue}>
          {cliente.telefono || clienteSesion.telefono || "-"}
        </div>
      </div>

      <div style={styles.checkoutProfileDataCard}>
        <div style={styles.checkoutProfileLabel}>Entrega</div>
        <div style={styles.checkoutProfileValue}>
          {cliente.direccion || "Selecciona dirección"}
        </div>
      </div>
    </div>

    {direccionesCliente.length > 0 && !usarOtraDireccion && (
      <div style={{ marginBottom: 14 }}>
        <label style={styles.label}>Dirección guardada</label>
        <select
          style={styles.input}
          value={direccionSeleccionadaId}
          onChange={(e) => usarDireccionGuardada(e.target.value)}
        >
          {direccionesCliente.map((direccion) => (
            <option key={direccion.id} value={direccion.id}>
              {direccion.alias} — {direccion.direccion}
            </option>
          ))}
        </select>
      </div>
    )}

    <div style={styles.checkoutActionsRow}>
      <button
        type="button"
        style={styles.secondaryBtn}
        onClick={() => setUsarOtraDireccion((prev) => !prev)}
      >
        {usarOtraDireccion
          ? "Usar dirección guardada"
          : "Usar otra dirección hoy"}
      </button>

      <button
        type="button"
        style={{
          ...styles.secondaryBtn,
          ...(guardandoDireccionCliente ? styles.disabledBtn : {}),
        }}
        onClick={guardarDireccionActualCliente}
        disabled={guardandoDireccionCliente}
      >
        {guardandoDireccionCliente
          ? "Guardando..."
          : "Guardar dirección actual"}
      </button>
    </div>
  </div>
) : (
  <div style={styles.checkoutGuestBox}>
    <div style={styles.checkoutHintBox}>
      Completa tus datos para finalizar el pedido.
    </div>
  </div>
)}

              <Input
                label="Nombre"
                value={cliente.nombre}
                onChange={(e) => actualizarCliente("nombre", e.target.value)}
              />

              <Input
                label="Celular para contacto"
                value={cliente.telefono}
                onChange={(e) => actualizarCliente("telefono", e.target.value)}
              />

              {tipoPedido === "domicilio" ? (
  <>
                <Input
                  label="Dirección de entrega"
                  value={cliente.direccion}
                  onChange={(e) => actualizarCliente("direccion", e.target.value)}
                  disabled={Boolean(
                    clienteSesion?.id &&
                      direccionesCliente.length > 0 &&
                      !usarOtraDireccion
                  )}
                />

                <Input
                  label="Referencia"
                  value={cliente.referencia}
                  onChange={(e) => actualizarCliente("referencia", e.target.value)}
                  disabled={Boolean(
                    clienteSesion?.id &&
                      direccionesCliente.length > 0 &&
                      !usarOtraDireccion
                  )}
                />
              </>
            ) : (
              <>
                {renderPickupInfoCard()}

                <Input
                  label="Hora aproximada de recogida"
                  value={horaRecogida}
                  onChange={(e) => setHoraRecogida(e.target.value)}
                  placeholder="Ej: 7:30 PM"
                />
              </>
            )}

              <div style={{ marginBottom: 16 }}>
  <label style={styles.label}>Método de pago</label>

  <div
    style={{
      ...styles.paymentMethodGrid,
      gridTemplateColumns: esMovil ? "1fr" : "1fr 1fr",
    }}
  >
    <button
      type="button"
      style={{
        ...styles.paymentMethodCard,
        ...(cliente.pago === "Llave" ? styles.paymentMethodCardActive : {}),
      }}
      onClick={() => actualizarCliente("pago", "Llave")}
    >
      <div style={styles.paymentMethodIcon}>🔑</div>
      <div style={styles.paymentMethodInfo}>
        <div style={styles.paymentMethodTitle}>Pago por Llave</div>
        <div style={styles.paymentMethodText}>3152487938</div>
        <div style={styles.paymentMethodHint}>
          Verificación manual del laboratorio
        </div>
      </div>
    </button>

    <button
      type="button"
      style={{
        ...styles.paymentMethodCard,
        ...(cliente.pago === "QR Nequi"
          ? styles.paymentMethodCardActive
          : {}),
      }}
      onClick={() => actualizarCliente("pago", "QR Nequi")}
    >
      <div style={styles.paymentMethodIcon}>📱</div>
      <div style={styles.paymentMethodInfo}>
        <div style={styles.paymentMethodTitle}>QR Nequi</div>
        <div style={styles.paymentMethodText}>Pago escaneando QR</div>
        <div style={styles.paymentMethodHint}>
          Rápido y directo desde tu celular
        </div>
      </div>
    </button>
  </div>
</div>

              {cliente.pago === "Llave" && (
                <div style={styles.paymentInfoBox}>
                  <div style={styles.paymentInfoTitle}>🔑 Pago por Llave</div>
                  <div style={styles.paymentInfoText}>Llave: 3152487938</div>
                  <div style={styles.paymentInfoText}>
                    El pedido quedará pendiente de verificación.
                  </div>
                </div>
              )}

              {cliente.pago === "QR Nequi" && (
                <div style={styles.paymentInfoBox}>
                  <div style={styles.paymentInfoTitle}>📱 Pago con QR Nequi</div>
                  <div style={styles.paymentInfoText}>
                    Escanea este QR para realizar el pago.
                  </div>

                  <div style={styles.qrWrap}>
                    <img
                      src="/qr-nequi.png"
                      alt="QR Nequi Dr. Crispy Lab"
                      style={styles.qrImage}
                    />
                  </div>

                  <div style={styles.paymentInfoText}>Nequi: 3152487938</div>
                  <div style={styles.paymentInfoText}>
                    El pedido quedará pendiente de verificación.
                  </div>
                </div>
              )}
            </div>

            <div style={styles.checkoutMobileFooter}>
  <div style={styles.checkoutMobileResumeCard}>
    <div style={styles.checkoutMobileResumeRow}>
      <span>Subtotal</span>
      <strong>${subtotal.toLocaleString("es-CO")}</strong>
    </div>

    <div style={styles.checkoutMobileResumeRow}>
  <span>{textoEntrega}</span>
  <strong style={{ color: "#ffd166" }}>{textoValorEntrega}</strong>
</div>

    <div style={styles.checkoutMobileResumeTotal}>
      <span>Total del pedido</span>
      <span>${total.toLocaleString("es-CO")}</span>
    </div>
  </div>

  <button
  style={{
    ...styles.confirmBtn,
    ...((cargandoPedido || !laboratorioAbierto) ? styles.disabledBtn : {}),
    marginTop: 0,
  }}
  onClick={async () => {
    await confirmarPedido();
  }}
  disabled={cargandoPedido || !laboratorioAbierto}
>
  {!laboratorioAbierto
    ? "🕒 FUERA DE HORARIO"
    : cargandoPedido
    ? "Activando pedido..."
    : "🔥 CONFIRMAR PEDIDO"}
</button>

{!laboratorioAbierto && (
  <div style={styles.checkoutClosedHint}>
    Puedes dejar tu pedido listo, pero la confirmación se habilita en horario de atención.
  </div>
)}

  <div style={styles.checkoutTrustText}>
    ⚡ Pedido rápido, claro y listo para validar
  </div>

  <button
    style={styles.whatsappBtn}
    onClick={abrirWhatsAppPedido}
  >
    Enviar pedido por WhatsApp
  </button>
</div>
          </div>
        </div>
      )}

      {panelCarritoAbierto && (
  <div
    style={styles.globalCartBackdrop}
    onClick={cerrarPanelCarrito}
  >
    <div
      style={styles.globalCartPanel}
      onClick={(e) => e.stopPropagation()}
    >
      <div style={styles.globalCartHeaderPro}>
        <div style={styles.globalCartHeaderLeft}>
          <div style={styles.globalCartTopRow}>
            <div style={styles.globalCartMiniPill}>
              {panelCarritoVista === "carrito"
                ? "🛒 TU PEDIDO"
                : panelCarritoVista === "checkout"
                ? "📦 CHECKOUT"
                : panelCarritoVista === "auth_login"
                ? "👤 INGRESAR"
                : "🧪 CREAR PERFIL"}
            </div>

            <div style={styles.globalCartCountPill}>
              {totalItemsCarrito} item{totalItemsCarrito !== 1 ? "s" : ""}
            </div>
          </div>

          <h2 style={styles.globalCartTitlePro}>
            {panelCarritoVista === "carrito"
              ? "Tu pedido del laboratorio"
              : panelCarritoVista === "checkout"
              ? "Finalizar pedido"
              : panelCarritoVista === "auth_login"
              ? "Iniciar sesión"
              : "Crear perfil"}
          </h2>

          <p style={styles.globalCartSubPro}>
            {panelCarritoVista === "carrito"
              ? "Revisa tus productos antes de continuar."
              : panelCarritoVista === "checkout"
              ? "Confirma tus datos y termina tu pedido."
              : panelCarritoVista === "auth_login"
              ? "Ingresa con tu perfil para autocompletar tus datos."
              : "Crea tu perfil y acelera tus próximos pedidos."}
          </p>
        </div>

        <div style={{ display: "grid", gap: 10 }}>
          <div style={styles.globalCartTopTotalCard}>
            <div style={styles.globalCartTopTotalLabel}>Total</div>
            <div style={styles.globalCartTopTotalValue}>
              ${total.toLocaleString("es-CO")}
            </div>
          </div>

          <button
            type="button"
            style={styles.drawerCloseBtn}
            onClick={cerrarPanelCarrito}
          >
            ✕
          </button>
        </div>
      </div>

      {panelCarritoVista === "carrito" && (
        <>
          <div style={styles.globalCartBody}>
            {carrito.length === 0 ? (
              <div style={styles.emptyBox}>
                No has agregado productos todavía.
              </div>
            ) : (
              <div style={styles.drawerItemsWrap}>
                {carrito.map((item) => (
                    <div
                      key={item.cartKey}
                      style={{
                        ...styles.cartItemPro,
                        gridTemplateColumns: esMovil ? "64px 1fr" : "72px 1fr auto",
                      }}
>                    <div style={styles.cartItemThumbWrap}>
                      <img
                        src={item.imagen || "/images/producto-placeholder.png"}
                        alt={item.nombre}
                        style={styles.cartItemThumb}
                      />
                    </div>

                    <div style={{ minWidth: 0 }}>
                      <strong style={styles.cartItemTitlePro}>
                        {item.esCombo ? `🔥 ${item.nombre}` : item.nombre}
                      </strong>

                      <div style={styles.cartItemMetaPro}>
                        {item.experimento || "Experimento 1"}
                      </div>

                      {item.salsa && (
                        <div
                          style={{
                            ...styles.cartItemMetaPro,
                            color: "#ffd166",
                            fontWeight: "bold",
                          }}
                        >
                          Sabor: {item.salsa}
                        </div>
                      )}

                      {item.esCombo && Array.isArray(item.detalleCombo) && (
                        <div style={{ marginTop: 8 }}>
                          {formatearDetalleCombo(item.detalleCombo).map(
                            (detalle, idx) => (
                              <div key={idx} style={styles.cartItemMetaPro}>
                                • {detalle}
                              </div>
                            )
                          )}
                        </div>
                      )}

                      <div style={styles.cartItemPricePro}>
                        ${item.precio.toLocaleString("es-CO")} x {item.cantidad}
                      </div>
                    </div>

<div
  style={{
    ...styles.qtyBoxPro,
    marginTop: esMovil ? 10 : 0,
    justifySelf: esMovil ? "start" : "end",
    gridColumn: esMovil ? "2 / 3" : "auto",
  }}
>                  <button
                        style={styles.qtyBtnPro}
                        onClick={() => cambiarCantidad(item.cartKey, -1)}
                      >
                        -
                      </button>

                      <span style={styles.qtyValuePro}>{item.cantidad}</span>

                      <button
                        style={styles.qtyBtnPro}
                        onClick={() => cambiarCantidad(item.cartKey, 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={styles.globalCartFooterPro}>
            <div style={styles.cartSummaryCardPro}>
              <div style={styles.summaryRow}>
                <span>Subtotal</span>
                <span>${subtotal.toLocaleString("es-CO")}</span>
              </div>

              <div style={styles.summaryRow}>
                <span>{textoEntrega}</span>
                <span style={{ color: "#ffd166", fontWeight: "bold" }}>
                  {textoValorEntrega}
                </span>
              </div>

              <div style={styles.summaryTotal}>
                <span>Total</span>
                <span>${total.toLocaleString("es-CO")}</span>
              </div>
            </div>

            <div style={styles.globalCartActions}>
  <button
    type="button"
    style={styles.secondaryBtn}
    onClick={cerrarPanelCarrito}
  >
    Seguir comprando
  </button>

  <button
    type="button"
    style={{ ...styles.confirmBtn, marginTop: 0 }}
    onClick={irAlCheckoutDesdePanel}
    disabled={carrito.length === 0}
  >
    🔥 CONTINUAR PEDIDO
  </button>
</div>

<div
  style={{
    ...styles.cartStatusBar,
    ...(laboratorioAbierto
      ? styles.cartStatusBarOpen
      : styles.cartStatusBarClosed),
  }}
>
  {laboratorioAbierto ? (
    <span>🟢 Estamos atendiendo. Tu pedido se preparará de inmediato.</span>
  ) : (
    <span>
      🕒 Estamos fuera de horario. Puedes armar tu pedido, pero solo podrás
      confirmarlo en horario de atención.
    </span>
  )}
</div>

<div style={styles.globalCartFooterHint}>
  {tipoPedido === "recoger"
    ? "⚡ Express activado para recoger en el lab"
    : "⚡ Pedido rápido, claro y listo para continuar"}
</div>
          </div>
        </>
      )}

      {panelCarritoVista === "checkout" && (
        <>
          <div style={styles.globalCartBody}>
                        <div style={{ marginBottom: 16 }}>
              <label style={styles.label}>Tipo de pedido</label>

              <div style={styles.paymentMethodGrid}>
                <button
                  type="button"
                  style={{
                    ...styles.paymentMethodCard,
                    ...(tipoPedido === "domicilio"
                      ? styles.paymentMethodCardActive
                      : {}),
                  }}
                  onClick={() => activarModoPedido("domicilio")}
                >
                  <div style={styles.paymentMethodIcon}>🚚</div>
                  <div style={styles.paymentMethodInfo}>
                    <div style={styles.paymentMethodTitle}>Domicilio</div>
                    <div style={styles.paymentMethodText}>Entrega a tu dirección</div>
                    <div style={styles.paymentMethodHint}>
                      Incluido excepto promociones
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  style={{
                    ...styles.paymentMethodCard,
                    ...(tipoPedido === "recoger"
                      ? styles.paymentMethodCardActive
                      : {}),
                  }}
                  onClick={() => activarModoPedido("recoger")}
                >
                  <div style={styles.paymentMethodIcon}>📍</div>
                  <div style={styles.paymentMethodInfo}>
                    <div style={styles.paymentMethodTitle}>Recoger en el lab</div>
                    <div style={styles.paymentMethodText}>Pasa por tu pedido</div>
                    <div style={styles.paymentMethodHint}>
                      Más rápido y sin domicilio
                    </div>
                  </div>
                </button>
              </div>
            </div>
            {mostrarPromptPerfil && !clienteSesion?.id && (
              <div style={styles.checkoutGuestPromptBox}>
                <div style={styles.checkoutGuestPromptTitle}>
                  👤 ¿Quieres pedir más rápido?
                </div>

                <div style={styles.checkoutGuestPromptText}>
                  Inicia sesión o crea tu perfil para llenar tus datos automáticamente.
                </div>

                <div style={styles.checkoutActionsRow}>
                  <button
                    type="button"
                    style={styles.secondaryBtn}
                    onClick={() => {
                      setClienteAuthModo("login");
                      setPanelCarritoVista("auth_login");
                    }}
                  >
                    Iniciar sesión
                  </button>

                  <button
                    type="button"
                    style={styles.secondaryBtn}
                    onClick={() => {
                      setClienteAuthModo("registro");
                      setPanelCarritoVista("auth_registro");
                    }}
                  >
                    Crear perfil
                  </button>

                  <button
                    type="button"
                    style={styles.secondaryBtn}
                    onClick={() => {
                      setMostrarPromptPerfil(false);
                    }}
                  >
                    Continuar como invitado
                  </button>
                </div>
              </div>
            )}

            {clienteSesion?.id && (
              <div style={styles.checkoutProfileBox}>
                <div style={styles.checkoutProfileTop}>
                  <div>
                    <div style={styles.checkoutProfileBadge}>👤 PERFIL ACTIVO</div>
                    <div style={styles.checkoutProfileName}>
                      {clienteSesion.nombre || cliente.nombre || "-"}
                    </div>
                  </div>

                  <div style={styles.checkoutProfileStatus}>
                    Listo para pedir
                  </div>
                </div>

                <div style={styles.checkoutProfileDataGrid}>
                  <div style={styles.checkoutProfileDataCard}>
                    <div style={styles.checkoutProfileLabel}>Celular</div>
                    <div style={styles.checkoutProfileValue}>
                      {cliente.telefono || clienteSesion.telefono || "-"}
                    </div>
                  </div>

                  <div style={styles.checkoutProfileDataCard}>
                    <div style={styles.checkoutProfileLabel}>Entrega</div>
                    <div style={styles.checkoutProfileValue}>
                      {cliente.direccion || "Selecciona dirección"}
                    </div>
                  </div>
                </div>

                {direccionesCliente.length > 0 && !usarOtraDireccion && (
                  <div style={{ marginBottom: 14 }}>
                    <label style={styles.label}>Dirección guardada</label>
                    <select
                      style={styles.input}
                      value={direccionSeleccionadaId}
                      onChange={(e) => usarDireccionGuardada(e.target.value)}
                    >
                      {direccionesCliente.map((direccion) => (
                        <option key={direccion.id} value={direccion.id}>
                          {direccion.alias} — {direccion.direccion}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div style={styles.checkoutActionsRow}>
                  <button
                    type="button"
                    style={styles.secondaryBtn}
                    onClick={() => setUsarOtraDireccion((prev) => !prev)}
                  >
                    {usarOtraDireccion
                      ? "Usar dirección guardada"
                      : "Usar otra dirección hoy"}
                  </button>

                  <button
                    type="button"
                    style={{
                      ...styles.secondaryBtn,
                      ...(guardandoDireccionCliente ? styles.disabledBtn : {}),
                    }}
                    onClick={guardarDireccionActualCliente}
                    disabled={guardandoDireccionCliente}
                  >
                    {guardandoDireccionCliente
                      ? "Guardando..."
                      : "Guardar dirección actual"}
                  </button>
                </div>
              </div>
            )}

            <Input
              label="Nombre"
              value={cliente.nombre}
              onChange={(e) => actualizarCliente("nombre", e.target.value)}
            />

            <Input
              label="Celular para contacto"
              value={cliente.telefono}
              onChange={(e) => actualizarCliente("telefono", e.target.value)}
            />

            {tipoPedido === "domicilio" ? (
              <>
              <Input
                label="Dirección de entrega"
                value={cliente.direccion}
                onChange={(e) => actualizarCliente("direccion", e.target.value)}
                disabled={Boolean(
                  clienteSesion?.id &&
                    direccionesCliente.length > 0 &&
                    !usarOtraDireccion
                )}
              />

              <Input
                label="Referencia"
                value={cliente.referencia}
                onChange={(e) => actualizarCliente("referencia", e.target.value)}
                disabled={Boolean(
                  clienteSesion?.id &&
                    direccionesCliente.length > 0 &&
                    !usarOtraDireccion
                )}
              />
            </>
          ) : (
            <>
              {renderPickupInfoCard()}

              <Input
                label="Hora aproximada de recogida"
                value={horaRecogida}
                onChange={(e) => setHoraRecogida(e.target.value)}
                placeholder="Ej: 7:30 PM"
              />
            </>
          )}

            <div style={{ marginBottom: 16 }}>
              <label style={styles.label}>Método de pago</label>

              <div style={styles.paymentMethodGrid}>
                <button
                  type="button"
                  style={{
                    ...styles.paymentMethodCard,
                    ...(cliente.pago === "Llave"
                      ? styles.paymentMethodCardActive
                      : {}),
                  }}
                  onClick={() => actualizarCliente("pago", "Llave")}
                >
                  <div style={styles.paymentMethodIcon}>🔑</div>
                  <div style={styles.paymentMethodInfo}>
                    <div style={styles.paymentMethodTitle}>Pago por Llave</div>
                    <div style={styles.paymentMethodText}>3152487938</div>
                    <div style={styles.paymentMethodHint}>
                      Verificación manual del laboratorio
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  style={{
                    ...styles.paymentMethodCard,
                    ...(cliente.pago === "QR Nequi"
                      ? styles.paymentMethodCardActive
                      : {}),
                  }}
                  onClick={() => actualizarCliente("pago", "QR Nequi")}
                >
                  <div style={styles.paymentMethodIcon}>📱</div>
                  <div style={styles.paymentMethodInfo}>
                    <div style={styles.paymentMethodTitle}>QR Nequi</div>
                    <div style={styles.paymentMethodText}>Pago escaneando QR</div>
                    <div style={styles.paymentMethodHint}>
                      Rápido y directo desde tu celular
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {cliente.pago === "Llave" && (
              <div style={styles.paymentInfoBox}>
                <div style={styles.paymentInfoTitle}>🔑 Pago por Llave</div>
                <div style={styles.paymentInfoText}>Llave: 3152487938</div>
                <div style={styles.paymentInfoText}>
                  El pedido quedará pendiente de verificación.
                </div>
              </div>
            )}

            {cliente.pago === "QR Nequi" && (
              <div style={styles.paymentInfoBox}>
                <div style={styles.paymentInfoTitle}>📱 Pago con QR Nequi</div>
                <div style={styles.paymentInfoText}>
                  Escanea este QR para realizar el pago.
                </div>

                <div style={styles.qrWrap}>
                  <img
                    src="/qr-nequi.png"
                    alt="QR Nequi Dr. Crispy Lab"
                    style={styles.qrImage}
                  />
                </div>

                <div style={styles.paymentInfoText}>Nequi: 3152487938</div>
                <div style={styles.paymentInfoText}>
                  El pedido quedará pendiente de verificación.
                </div>
              </div>
            )}
          </div>

          <div style={styles.globalCartFooterPro}>
            <div style={styles.checkoutMobileResumeCard}>
              <div style={styles.checkoutMobileResumeRow}>
                <span>Subtotal</span>
                <strong>${subtotal.toLocaleString("es-CO")}</strong>
              </div>

              <div style={styles.checkoutMobileResumeRow}>
                <span>{textoEntrega}</span>
                <strong style={{ color: "#ffd166" }}>
                  {textoValorEntrega}
                </strong>
              </div>

              <div style={styles.checkoutMobileResumeTotal}>
                <span>Total del pedido</span>
                <span>${total.toLocaleString("es-CO")}</span>
              </div>
            </div>

            <div style={styles.globalCartActions}>
              <button
                type="button"
                style={styles.secondaryBtn}
                onClick={() => setPanelCarritoVista("carrito")}
              >
                ← Volver
              </button>

              <button
  style={{
    ...styles.confirmBtn,
    ...((cargandoPedido || !laboratorioAbierto) ? styles.disabledBtn : {}),
    marginTop: 0,
  }}
  onClick={confirmarPedido}
  disabled={cargandoPedido || !laboratorioAbierto}
>
  {!laboratorioAbierto
    ? "🕒 FUERA DE HORARIO"
    : cargandoPedido
    ? "Activando pedido..."
    : "🔥 CONFIRMAR PEDIDO"}
</button>
            </div>
{!laboratorioAbierto && (
  <div style={styles.checkoutClosedHint}>
    Puedes dejar tu pedido listo, pero la confirmación se habilita en horario de atención.
  </div>
)}
                        <div style={styles.globalCartFooterHint}>
              {tipoPedido === "recoger"
                ? "⚡ Recoge tu pedido directamente en el lab"
                : "⚡ Estás a un paso de confirmar tu experimento"}
            </div>
          </div>
        </>
      )}

      {panelCarritoVista === "auth_login" && (
        <>
          <div style={styles.globalCartBody}>
            <div style={styles.panel}>
              <div style={styles.menuInteractiveBadge}>👤 INGRESAR</div>
              <h2 style={styles.panelTitle}>INICIAR SESIÓN</h2>
              <p style={styles.loginHint}>
                Entra con tu perfil para autocompletar tus datos y pedir más rápido.
              </p>

              <Input
                label="Teléfono registrado"
                value={clienteLoginData.telefono}
                onChange={(e) =>
                  setClienteLoginData((prev) => ({
                    ...prev,
                    telefono: e.target.value,
                  }))
                }
              />

              <div style={{ marginBottom: 14 }}>
                <label style={styles.label}>Contraseña</label>
                <input
                  type="password"
                  style={styles.input}
                  value={clienteLoginData.password}
                  onChange={(e) =>
                    setClienteLoginData((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
          </div>

          <div style={styles.globalCartFooterPro}>
            <div style={styles.globalCartActions}>
                            <button
                type="button"
                style={styles.secondaryBtn}
                onClick={() =>
                  setPanelCarritoVista(carrito.length > 0 ? "checkout" : "carrito")
                }
              >
                ← Volver
              </button>

              <button
                type="button"
                style={{
                  ...styles.confirmBtn,
                  marginTop: 0,
                  ...(cargandoClienteAuth ? styles.disabledBtn : {}),
                }}
                onClick={async () => {
                  await iniciarSesionCliente();
                  setMostrarPromptPerfil(false);
                  setPanelCarritoVista("checkout");
                }}
                disabled={cargandoClienteAuth}
              >
                {cargandoClienteAuth ? "Ingresando..." : "Ingresar con mi perfil"}
              </button>
            </div>
          </div>
        </>
      )}

      {panelCarritoVista === "auth_registro" && (
        <>
          <div style={styles.globalCartBody}>
            <div style={styles.panel}>
              <div style={styles.menuInteractiveBadge}>🧪 CREAR PERFIL</div>
              <h2 style={styles.panelTitle}>CREAR PERFIL</h2>
              <p style={styles.loginHint}>
                Guarda tus datos y acelera tus próximos pedidos.
              </p>

              <Input
                label="Nombre"
                value={clienteRegistroData.nombre}
                onChange={(e) =>
                  setClienteRegistroData((prev) => ({
                    ...prev,
                    nombre: e.target.value,
                  }))
                }
              />

              <Input
                label="Teléfono"
                value={clienteRegistroData.telefono}
                onChange={(e) =>
                  setClienteRegistroData((prev) => ({
                    ...prev,
                    telefono: e.target.value,
                  }))
                }
              />

              <div style={{ marginBottom: 14 }}>
                <label style={styles.label}>Contraseña</label>
                <input
                  type="password"
                  style={styles.input}
                  value={clienteRegistroData.password}
                  onChange={(e) =>
                    setClienteRegistroData((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                />
              </div>

              <Input
                label="Dirección principal"
                value={clienteRegistroData.direccion}
                onChange={(e) =>
                  setClienteRegistroData((prev) => ({
                    ...prev,
                    direccion: e.target.value,
                  }))
                }
              />

              <Input
                label="Referencia"
                value={clienteRegistroData.referencia}
                onChange={(e) =>
                  setClienteRegistroData((prev) => ({
                    ...prev,
                    referencia: e.target.value,
                  }))
                }
              />

              <Input
                label="Alias de dirección"
                value={clienteRegistroData.aliasDireccion}
                onChange={(e) =>
                  setClienteRegistroData((prev) => ({
                    ...prev,
                    aliasDireccion: e.target.value,
                  }))
                }
              />
            </div>
          </div>

          <div style={styles.globalCartFooterPro}>
            <div style={styles.globalCartActions}>
                            <button
                type="button"
                style={styles.secondaryBtn}
                onClick={() =>
                  setPanelCarritoVista(carrito.length > 0 ? "checkout" : "carrito")
                }
              >
                ← Volver
              </button>

              <button
                type="button"
                style={{
                  ...styles.confirmBtn,
                  marginTop: 0,
                  ...(cargandoClienteAuth ? styles.disabledBtn : {}),
                }}
                onClick={async () => {
                  await registrarCliente();
                  setMostrarPromptPerfil(false);
                  setPanelCarritoVista("checkout");
                }}
                disabled={cargandoClienteAuth}
              >
                {cargandoClienteAuth ? "Creando perfil..." : "Crear perfil"}
              </button>
            </div>
          </div>
        </>
      )}
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
  <div style={styles.headerBrandBlock}>
    <div style={styles.headerTopLine}>
      <div style={styles.badge}>🧪 DR. CRISPY LAB</div>

      <div
        style={{
          ...styles.headerStatusPill,
          ...(socketConectado
            ? styles.headerStatusOnline
            : styles.headerStatusOffline),
        }}
      >
        {socketConectado ? "🟢 LAB ACTIVO" : "🔴 LAB EN SINCRONIZACIÓN"}
      </div>
    </div>

    <h1 style={styles.title}>Dr. Crispy Lab</h1>

    <p style={styles.headerTagline}>
      No es pollo. Es un experimento.
    </p>

    <div style={styles.headerMiniInfoRow}>
      <div style={styles.headerMiniInfo}>🚚 Domicilio incluido</div>
      <div style={styles.headerMiniInfo}>🔥 Combos activados</div>
      <div style={styles.headerMiniInfo}>⚡ Express disponible</div>
    </div>
  </div>

  <div style={styles.navButtons}>
    <button
    style={{
      ...styles.navBtn,
      ...(vista === "cliente" && seccionCliente === "inicio"
        ? styles.navBtnActive
        : {}),
    }}
    onClick={() => {
      setVista("cliente");
      setSeccionCliente("inicio");
      setPanelCarritoAbierto(false);
      setPanelCarritoVista("carrito");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }}
  >
    Inicio
  </button>

    {!clienteSesion?.id ? (
    <>
      <button
        type="button"
        style={{
          ...styles.navBtn,
          ...(panelCarritoAbierto && panelCarritoVista === "auth_login"
            ? styles.navBtnActive
            : {}),
        }}
        onClick={() => abrirPanelAuth("login")}
      >
        Ingresar
      </button>

      <button
        type="button"
        style={{
          ...styles.navBtn,
          ...(panelCarritoAbierto && panelCarritoVista === "auth_registro"
            ? styles.navBtnActive
            : {}),
        }}
        onClick={() => abrirPanelAuth("registro")}
      >
        Crear perfil
      </button>
    </>
  ) : (
    <>
      <div style={styles.userMiniPill}>
        👤 {clienteSesion.nombre || "Cliente"}
      </div>

            <button
        type="button"
        style={{
          ...styles.navBtn,
          ...(panelCarritoAbierto && panelCarritoVista === "checkout"
            ? styles.navBtnActive
            : {}),
        }}
        onClick={() => {
          setVista("cliente");
          setSeccionCliente("inicio");
          setMostrarPromptPerfil(false);
          setPanelCarritoAbierto(true);
          setPanelCarritoVista("checkout");
        }}
      >
        Mi perfil
      </button>

      <button
        type="button"
        style={styles.navBtn}
        onClick={cerrarSesionCliente}
      >
        Cerrar sesión
      </button>
    </>
  )}

  <button
    style={{
      ...styles.navBtn,
      ...(vista === "seguimiento" ? styles.navBtnActive : {}),
    }}
    onClick={() => setVista("seguimiento")}
  >
    Seguimiento
  </button>

  <button
  type="button"
  style={{
    ...styles.navBtn,
    ...(panelCarritoAbierto ? styles.navBtnActive : {}),
    ...(headerCartAnimando ? styles.headerCartBtnPop : {}),
    position: "relative",
  }}
  onClick={() => {
    setPanelCarritoVista("carrito");
    setPanelCarritoAbierto(true);
  }}
>
  🛒 Carrito
  {totalItemsCarrito > 0
    ? ` (${totalItemsCarrito}) • $${total.toLocaleString("es-CO")}`
    : ""}
</button>

  {puedeVerAdmin && (
    <button
      style={{
        ...styles.navBtn,
        ...(vista === "admin" ? styles.navBtnActive : {}),
      }}
      onClick={() => setVista("admin")}
    >
      Admin
    </button>
  )}

  {puedeVerRepartidor && (
    <button
      style={{
        ...styles.navBtn,
        ...(vista === "repartidor" ? styles.navBtnActive : {}),
      }}
      onClick={() => setVista("repartidor")}
    >
      Repartidor
    </button>
  )}
</div>
</header>
        {vista === "cliente" && (
          <>
            {renderBarraModoPedido()}
            {renderFranjaExpressActiva()}
          </>
        )}
        {mensaje.texto && (
          <div
            style={{
              ...styles.messageBox,
              ...(mensaje.tipo === "ok"
                ? styles.messageOk
                : styles.messageError),
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
                  <strong>Método de pago:</strong>{" "}
                  {pedidoConsultado?.metodoPago ||
                    pedidoConsultado?.cliente?.pago ||
                    "No definido"}
                </p>
                <p>
                  <strong>Estado del pago:</strong>{" "}
                  {pedidoConsultado?.estadoPago || "Pendiente"}
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
                      {
                        pedidosCocina.filter((p) => p.estado === "Recibido")
                          .length
                      }
                    </div>
                  </div>
                  <div style={styles.kpiCard}>
                    <div style={styles.kpiLabel}>En cocina</div>
                    <div style={styles.kpiValue}>
                      {
                        pedidosCocina.filter((p) => p.estado === "En cocina")
                          .length
                      }
                    </div>
                  </div>
                  <div style={styles.kpiCard}>
                    <div style={styles.kpiLabel}>En camino</div>
                    <div style={styles.kpiValue}>
                      {
                        pedidosCocina.filter((p) => p.estado === "En camino")
                          .length
                      }
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
                        <strong>Dirección:</strong> {pedido?.cliente?.direccion}
                      </p>
                      <p>
                        <strong>Referencia:</strong>{" "}
                        {pedido?.cliente?.referencia || "N/A"}
                      </p>
                      <p>
                        <strong>Método de pago:</strong>{" "}
                        {pedido?.metodoPago ||
                          pedido?.cliente?.pago ||
                          "No definido"}
                      </p>
                      <p>
                        <strong>Estado del pago:</strong>{" "}
                        {pedido?.estadoPago || "Pendiente"}
                      </p>
                      <p>
                        <strong>Repartidor:</strong>{" "}
                        {pedido?.repartidor || "Sin asignar"}
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

                      <div style={{ marginTop: 12 }}>
                        <p style={styles.label}>Gestión de pago:</p>
                        <div style={styles.statusButtons}>
                          <button
                            style={styles.statusBtn}
                            onClick={() =>
                              actualizarPagoPedido(pedido.id, "Pendiente")
                            }
                          >
                            Pendiente
                          </button>
                          <button
                            style={styles.statusBtn}
                            onClick={() =>
                              actualizarPagoPedido(
                                pedido.id,
                                "Pendiente de verificación"
                              )
                            }
                          >
                            Verificar
                          </button>
                          <button
                            style={styles.statusBtn}
                            onClick={() =>
                              actualizarPagoPedido(pedido.id, "Pagado")
                            }
                          >
                            Pagado
                          </button>
                          <button
                            style={styles.statusBtn}
                            onClick={() =>
                              actualizarPagoPedido(pedido.id, "Rechazado")
                            }
                          >
                            Rechazado
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
                    <strong>Pago:</strong>{" "}
                    {pedido.metodoPago || pedido.cliente.pago}
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

function Input({ label, value, onChange, disabled = false }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={styles.label}>{label}</label>
      <input
        style={{
          ...styles.input,
          ...(disabled
            ? {
                opacity: 0.7,
                cursor: "not-allowed",
              }
            : {}),
        }}
        value={value}
        onChange={onChange}
        disabled={disabled}
      />
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
  gap: 24,
  alignItems: "center",
  flexWrap: "wrap",
  marginBottom: 24,
  padding: 22,
  background:
    "radial-gradient(circle at top right, rgba(255,0,0,0.08), transparent 24%), linear-gradient(180deg, rgba(18,18,18,0.98), rgba(10,10,10,0.98))",
  border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: 24,
  boxShadow: "0 14px 30px rgba(0,0,0,0.18)",
},

drawerContainer: {
  flex: 1,
  minHeight: 0,
  display: "flex",
  flexDirection: "column",
},

drawerContent: {
  flex: 1,
  minHeight: 0,
  overflowY: "auto",
  padding: 18,
  paddingBottom: 120,
  WebkitOverflowScrolling: "touch",
},

drawerContent: {
  flex: 1,
  minHeight: 0,
  overflowY: "auto",
  padding: 18,
  paddingBottom: 120,
  WebkitOverflowScrolling: "touch",
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
  marginBottom: 0,
},
  title: {
  margin: 0,
  fontSize: 56,
  color: "#ff2727",
  textShadow: "0 0 20px rgba(255,0,0,0.25)",
  fontFamily: '"Bebas Neue", sans-serif',
  letterSpacing: 1.4,
  lineHeight: 0.95,
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
  alignItems: "center",
  justifyContent: "flex-end",
},
  navBtn: {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  color: "#fff",
  padding: "12px 16px",
  borderRadius: 14,
  cursor: "pointer",
  fontWeight: "bold",
  transition: "all 0.2s ease",
},
  navBtnActive: {
  background: "linear-gradient(135deg, #ff0000, #b30000)",
  border: "1px solid #ff0000",
  boxShadow: "0 10px 22px rgba(255,0,0,0.18)",
},

  userMiniPill: {
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.10)",
  color: "#fff",
  padding: "12px 14px",
  borderRadius: 12,
  fontWeight: "bold",
  fontSize: 14,
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
  heroUrgencyWrap: {
    display: "flex",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 18,
  },
  heroUrgencyPill: {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.08)",
    color: "#ffd8d8",
    padding: "9px 12px",
    borderRadius: 999,
    fontWeight: "bold",
    fontSize: 13,
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

  comboCardFeaturedPro: {
  border: "1px solid rgba(255,0,0,0.28)",
  boxShadow: "0 24px 46px rgba(255,0,0,0.18)",
},

comboIncludesPro: {
  display: "grid",
  gap: 8,
  marginTop: 16,
  marginBottom: 8,
  position: "relative",
  zIndex: 2,
},

comboIncludePill: {
  background: "rgba(255,255,255,0.045)",
  border: "1px solid rgba(255,255,255,0.08)",
  color: "#e8e8e8",
  padding: "9px 12px",
  borderRadius: 12,
  fontSize: 13,
  lineHeight: 1.35,
  fontWeight: "bold",
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
    animation:
      "crispyGlow 2s ease-in-out infinite, crispyFloat 2.4s ease-in-out infinite",
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
    background:
      "radial-gradient(circle at top right, rgba(255,0,0,0.06), transparent 26%), rgba(17,17,17,0.96)",
    border: "1px solid rgba(255,255,255,0.05)",
    borderRadius: 22,
    padding: 24,
    top: 20,
    boxShadow: "0 16px 34px rgba(0,0,0,0.22)",
    transition: "transform 0.28s ease, box-shadow 0.28s ease",
  },
   
  floatingCartWrap: {
  position: "fixed",
  left: 12,
  right: 12,
  bottom: "calc(12px + env(safe-area-inset-bottom))",
  zIndex: 9998,
},

  floatingCartBtn: {
  width: "100%",
  border: "none",
  borderRadius: 18,
  background: "linear-gradient(135deg, #ff1200, #b30000)",
  color: "#fff",
  padding: "15px 18px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  fontWeight: "bold",
  fontSize: 15,
  boxShadow: "0 18px 36px rgba(255,0,0,0.28)",
},

  drawerBackdrop: {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.62)",
  zIndex: 9999,
  display: "flex",
  justifyContent: "flex-end",
  alignItems: "stretch",
},

drawerCart: {
  width: "100%",
  maxWidth: 520,
  height: "100dvh",
  background:
    "radial-gradient(circle at top right, rgba(255,0,0,0.10), transparent 24%), linear-gradient(180deg, rgba(18,18,18,0.99), rgba(8,8,8,1))",
  borderLeft: "1px solid rgba(255,255,255,0.08)",
  boxShadow: "-20px 0 50px rgba(0,0,0,0.38)",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
},

  drawerHeader: {
  padding: "18px 18px 14px",
  borderBottom: "1px solid rgba(255,255,255,0.08)",
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  flexShrink: 0,
},

  drawerMini: {
    display: "inline-block",
    background: "rgba(255,0,0,0.12)",
    border: "1px solid rgba(255,0,0,0.24)",
    color: "#ffb0b0",
    padding: "7px 12px",
    borderRadius: 999,
    fontWeight: "bold",
    fontSize: 12,
    marginBottom: 10,
  },

  drawerTitle: {
    margin: 0,
    fontSize: 34,
    lineHeight: 0.95,
    textTransform: "uppercase",
    fontFamily: '"Bebas Neue", sans-serif',
    letterSpacing: 1,
  },

  drawerEta: {
    marginTop: 8,
    color: "#ffd166",
    fontWeight: "bold",
    fontSize: 13,
  },

  drawerCloseBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.04)",
    color: "#fff",
    fontSize: 18,
    cursor: "pointer",
  },
  
  loginHint: {
  color: "#cfcfcf",
  fontSize: 14,
  marginBottom: 16,
  lineHeight: 1.4,
  maxWidth: 500,
},

  drawerItemsWrap: {
    display: "grid",
    gap: 10,
    marginBottom: 16,
  },

  upsellBox: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    background:
      "radial-gradient(circle at top right, rgba(255,209,102,0.08), transparent 30%), rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,209,102,0.18)",
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
  },
  
  globalCartBackdrop: {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.62)",
  zIndex: 9999,
  display: "flex",
  justifyContent: "flex-end",
  alignItems: "stretch",
},

globalCartPanel: {
  width: "100%",
  maxWidth: 520,
  height: "100dvh",
  background:
    "radial-gradient(circle at top right, rgba(255,0,0,0.10), transparent 24%), linear-gradient(180deg, rgba(18,18,18,0.99), rgba(8,8,8,1))",
  borderLeft: "1px solid rgba(255,255,255,0.08)",
  boxShadow: "-20px 0 50px rgba(0,0,0,0.38)",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
},

globalCartHeader: {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 12,
  padding: 20,
  borderBottom: "1px solid rgba(255,255,255,0.06)",
},

globalCartTitle: {
  margin: "8px 0 0 0",
  fontSize: 38,
  color: "#fff",
  textTransform: "uppercase",
  fontFamily: '"Bebas Neue", sans-serif',
  letterSpacing: 1,
  lineHeight: 0.95,
},

globalCartBody: {
  flex: 1,
  minHeight: 0,
  overflowY: "auto",
  padding: 18,
  paddingBottom: 120,
  WebkitOverflowScrolling: "touch",
},
globalCartHeaderPro: {
  padding: "18px 18px 14px",
  borderBottom: "1px solid rgba(255,255,255,0.08)",
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  flexShrink: 0,
},

globalCartHeaderLeft: {
  display: "flex",
  flexDirection: "column",
  gap: 8,
},

globalCartTopRow: {
  display: "flex",
  alignItems: "center",
  gap: 10,
  flexWrap: "wrap",
},

globalCartMiniPill: {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  background: "rgba(255,0,0,0.12)",
  border: "1px solid rgba(255,0,0,0.22)",
  color: "#ffb0b0",
  padding: "7px 12px",
  borderRadius: 999,
  fontWeight: "bold",
  fontSize: 12,
},

globalCartCountPill: {
  display: "inline-flex",
  alignItems: "center",
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.08)",
  color: "#fff",
  padding: "7px 12px",
  borderRadius: 999,
  fontWeight: "bold",
  fontSize: 12,
},

globalCartTitlePro: {
  margin: 0,
  fontSize: 40,
  color: "#fff",
  textTransform: "uppercase",
  fontFamily: '"Bebas Neue", sans-serif',
  letterSpacing: 1,
  lineHeight: 0.95,
},

globalCartSubPro: {
  margin: 0,
  color: "#c9c9c9",
  fontSize: 14,
  lineHeight: 1.45,
},

globalCartTopTotalCard: {
  minWidth: 120,
  background:
    "linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.03))",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 16,
  padding: "12px 14px",
  textAlign: "right",
},

globalCartTopTotalLabel: {
  color: "#a7a7a7",
  fontSize: 12,
  marginBottom: 4,
  fontWeight: "bold",
  textTransform: "uppercase",
  letterSpacing: 0.5,
},

globalCartTopTotalValue: {
  color: "#fff",
  fontSize: 24,
  fontWeight: "bold",
  lineHeight: 1,
},

cartItemPro: {
  display: "grid",
  gridTemplateColumns: "72px 1fr auto",
  gap: 12,
  alignItems: "start",
  padding: 12,
  borderRadius: 16,
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.06)",
},

cartItemThumbWrap: {
  width: 72,
  height: 72,
  borderRadius: 14,
  overflow: "hidden",
  background: "#151515",
  border: "1px solid rgba(255,255,255,0.06)",
},

cartItemThumb: {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  display: "block",
},

cartItemTitlePro: {
  display: "block",
  marginBottom: 4,
  color: "#fff",
  fontSize: 16,
  lineHeight: 1.2,
},

cartItemMetaPro: {
  color: "#bdbdbd",
  fontSize: 13,
  lineHeight: 1.4,
  marginTop: 4,
},

cartItemPricePro: {
  marginTop: 10,
  color: "#fff",
  fontWeight: "bold",
  fontSize: 15,
},

qtyBoxPro: {
  display: "flex",
  alignItems: "center",
  gap: 8,
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 999,
  padding: "6px 8px",
},

qtyBtnPro: {
  width: 30,
  height: 30,
  background: "linear-gradient(135deg, #ff1200, #b30000)",
  border: "none",
  color: "#fff",
  borderRadius: "50%",
  cursor: "pointer",
  fontWeight: "bold",
  fontSize: 16,
  lineHeight: 1,
},

qtyValuePro: {
  minWidth: 20,
  textAlign: "center",
  fontWeight: "bold",
  color: "#fff",
  fontSize: 14,
},

cartSummaryCardPro: {
  background:
    "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 18,
  padding: 16,
},

globalCartFooterPro: {
  borderTop: "1px solid rgba(255,255,255,0.08)",
  padding: "16px 18px calc(16px + env(safe-area-inset-bottom))",
  background: "rgba(10,10,10,0.96)",
  flexShrink: 0,
},

globalCartFooterHint: {
  color: "#d5d5d5",
  fontSize: 13,
  textAlign: "center",
  lineHeight: 1.4,
},
globalCartFooter: {
  borderTop: "1px solid rgba(255,255,255,0.08)",
  padding: 18,
  background:
    "linear-gradient(180deg, rgba(12,12,12,0.96), rgba(8,8,8,1))",
},

globalCartActions: {
  display: "grid",
  gap: 10,
},
cartClosedHint: {
  marginTop: 12,
  padding: 12,
  borderRadius: 14,
  background: "rgba(255, 209, 102, 0.10)",
  border: "1px solid rgba(255, 209, 102, 0.22)",
  color: "#ffd166",
  fontSize: 13,
  lineHeight: 1.45,
  fontWeight: "bold",
},

checkoutClosedHint: {
  marginTop: 12,
  padding: 12,
  borderRadius: 14,
  background: "rgba(255, 80, 80, 0.10)",
  border: "1px solid rgba(255, 80, 80, 0.22)",
  color: "#ffb3b3",
  fontSize: 13,
  lineHeight: 1.45,
  textAlign: "center",
  fontWeight: "bold",
},
checkoutGuestPromptBox: {
  background: "rgba(255,196,0,0.10)",
  border: "1px solid rgba(255,196,0,0.18)",
  color: "#ffd166",
  borderRadius: 16,
  padding: 16,
  marginBottom: 16,
},

checkoutGuestPromptTitle: {
  fontWeight: "bold",
  fontSize: 16,
  marginBottom: 8,
},

checkoutGuestPromptText: {
  fontSize: 14,
  lineHeight: 1.45,
  marginBottom: 12,
},
  

  upsellTextWrap: {
    flex: 1,
    minWidth: 0,
  },

  upsellTitle: {
    color: "#ffd166",
    fontWeight: "bold",
    marginBottom: 4,
    fontSize: 14,
  },

  upsellText: {
    color: "#d3d3d3",
    fontSize: 13,
    lineHeight: 1.35,
  },

  upsellBtn: {
    border: "none",
    background: "linear-gradient(135deg, #ff1200, #b30000)",
    color: "#fff",
    borderRadius: 12,
    padding: "10px 14px",
    fontWeight: "bold",
    cursor: "pointer",
    flexShrink: 0,
  },

  sauceVisualCardSelected: {
  transform: "scale(0.97)",
  border: "1px solid rgba(255,209,102,0.58)",
  boxShadow: "0 0 0 2px rgba(255,209,102,0.14), 0 18px 34px rgba(255,0,0,0.18)",
  background:
    "radial-gradient(circle at top right, rgba(255,209,102,0.16), transparent 28%), linear-gradient(180deg, rgba(34,22,10,0.98), rgba(12,12,12,1))",
  transition: "all 0.18s ease",
},

  panelStickyPulse: {
    transform: "translateY(-4px) scale(1.01)",
    boxShadow: "0 24px 44px rgba(255,0,0,0.14)",
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
    transition:
      "transform 0.25s ease, box-shadow 0.25s ease, border 0.25s ease",
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
    alignItems: "flex-start",
    gap: 12,
    background:
      "radial-gradient(circle at top right, rgba(255,0,0,0.06), transparent 30%), linear-gradient(180deg, rgba(28,28,28,0.98), rgba(18,18,18,0.98))",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    flexWrap: "nowrap",
    boxShadow: "0 10px 22px rgba(0,0,0,0.16)",
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
  cartTrustText: {
    marginTop: 12,
    textAlign: "center",
    color: "#ffd1d1",
    fontWeight: "bold",
    fontSize: 14,
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
  comboIncludesWrap: {
    display: "grid",
    gap: 8,
    marginTop: 14,
    marginBottom: 16,
  },

  comboIncludeItem: {
    fontSize: 13,
    color: "#d8d8d8",
    padding: "9px 11px",
    borderRadius: 12,
    background: "rgba(255,255,255,0.045)",
    border: "1px solid rgba(255,255,255,0.06)",
    lineHeight: 1.35,
  },

  comboFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: 12,
    marginBottom: 14,
  },

  comboMiniLabel: {
    display: "inline-block",
    background: "rgba(255,209,102,0.10)",
    color: "#ffd166",
    border: "1px solid rgba(255,209,102,0.18)",
    padding: "6px 10px",
    borderRadius: 999,
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 10,
    letterSpacing: 0.4,
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
  classifiedSmoke: {
    position: "absolute",
    inset: 0,
    background:
      "radial-gradient(circle at 50% 45%, rgba(255,0,0,0.16), transparent 30%), radial-gradient(circle at 70% 20%, rgba(255,80,0,0.10), transparent 22%)",
    pointerEvents: "none",
  },
  classifiedOverlay: {
    position: "absolute",
    inset: 0,
    background:
      "radial-gradient(circle at center, rgba(255,0,0,0.06), transparent 34%)",
    opacity: 0.75,
    transition: "opacity 0.25s ease, transform 0.25s ease",
    pointerEvents: "none",
  },
  classifiedOverlayHover: {
    opacity: 1,
    transform: "scale(1.03)",
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
  comboSection: {
    padding: 24,
    background:
      "radial-gradient(circle at top right, rgba(255,0,0,0.08), transparent 24%), linear-gradient(180deg, rgba(12,12,12,0.98), rgba(8,8,8,1))",
    borderTop: "1px solid rgba(255,255,255,0.06)",
  },
  comboGrid: {
    display: "grid",
    gap: 18,
  },
  comboCard: {
    position: "relative",
    background:
      "radial-gradient(circle at top right, rgba(255,0,0,0.10), transparent 28%), linear-gradient(180deg, rgba(24,24,24,0.98), rgba(10,10,10,1))",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 20,
    padding: 18,
    boxShadow: "0 16px 30px rgba(0,0,0,0.20)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  headerCartBtnPop: {
  transform: "scale(1.06)",
  boxShadow: "0 0 0 2px rgba(255,255,255,0.06), 0 0 24px rgba(255,0,0,0.32)",
  transition: "all 0.18s ease",
},
  comboCardFeatured: {
    border: "1px solid rgba(255,0,0,0.34)",
    boxShadow: "0 20px 40px rgba(255,0,0,0.18)",
    transform: "translateY(-4px)",
  },
  comboTopRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  comboEmoji: {
    fontSize: 34,
  },
  comboBadge: {
    background: "linear-gradient(135deg, #ff0000, #b30000)",
    color: "#fff",
    padding: "8px 12px",
    borderRadius: 999,
    fontWeight: "bold",
    fontSize: 11,
    letterSpacing: 1,
  },
  comboTitle: {
    margin: "0 0 8px 0",
    fontSize: 36,
    color: "#fff",
    textTransform: "uppercase",
    fontFamily: '"Bebas Neue", sans-serif',
    letterSpacing: 1,
    lineHeight: 0.92,
  },
  comboDesc: {
    margin: 0,
    color: "#d2d2d2",
    lineHeight: 1.5,
    fontSize: 15,
  },
  comboPrice: {
    marginTop: 16,
    marginBottom: 16,
    fontSize: 34,
    fontWeight: "bold",
    color: "#ff3535",
    textShadow: "0 0 16px rgba(255,0,0,0.20)",
  },
  comboBtn: {
    width: "100%",
    background: "linear-gradient(135deg, #ff1200, #c30000)",
    color: "#fff",
    border: "none",
    padding: "15px 16px",
    borderRadius: 14,
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: 15,
    boxShadow: "0 12px 24px rgba(255,0,0,0.18)",
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

  addBtnPop: {
  transform: "scale(1.07)",
  boxShadow: "0 0 0 2px rgba(255,255,255,0.08), 0 0 22px rgba(255,0,0,0.38)",
  transition: "all 0.18s ease",
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

globalCartBackdrop: {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.58)",
  backdropFilter: "blur(8px)",
  zIndex: 120,
  display: "flex",
  justifyContent: "flex-end",
  animation: "fadeInSoft 0.22s ease",
},

globalCartPanel: {
  width: "100%",
  maxWidth: 520,
  height: "100vh",
  background:
    "radial-gradient(circle at top right, rgba(255,0,0,0.10), transparent 24%), linear-gradient(180deg, rgba(18,18,18,0.99), rgba(8,8,8,1))",
  borderLeft: "1px solid rgba(255,255,255,0.08)",
  boxShadow: "-20px 0 50px rgba(0,0,0,0.38)",
  display: "flex",
  flexDirection: "column",
  animation: "slideInRightCart 0.28s ease",
},

floatingCartWrapPop: {
  transform: "translateY(-2px)",
  transition: "transform 0.18s ease",
},

floatingCartBtnPulse: {
  transform: "scale(1.03)",
  boxShadow: "0 0 0 2px rgba(255,255,255,0.08), 0 22px 40px rgba(255,0,0,0.34)",
  transition: "all 0.18s ease",
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
  background: "rgba(0,0,0,0.66)",
  zIndex: 9999,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 12,
},
  modalCard: {
    width: "100%",
    maxWidth: 920,
    background:
      "radial-gradient(circle at top right, rgba(255,0,0,0.10), transparent 26%), linear-gradient(180deg, rgba(20,20,20,0.98), rgba(8,8,8,0.99))",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 24,
    padding: 22,
    boxShadow: "0 30px 90px rgba(0,0,0,0.56)",
    animation: "modalPopIn 0.24s ease",
  },
  modalTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: 16,
    alignItems: "flex-start",
    marginBottom: 18,
  },
  modalTitle: {
    margin: 0,
    fontSize: 44,
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
    fontSize: 15,
    lineHeight: 1.45,
  },
  
  sauceVisualCardHover: {
  transform: "translateY(-3px)",
  border: "1px solid rgba(255,0,0,0.30)",
  boxShadow: "0 16px 30px rgba(255,0,0,0.12)",
},

  modalCloseBtn: {
    background: "rgba(255,255,255,0.04)",
    color: "#fff",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 14,
    width: 46,
    height: 46,
    cursor: "pointer",
    fontSize: 20,
    fontWeight: "bold",
    transition: "transform 0.18s ease, border 0.18s ease, background 0.18s ease",
  },
  sauceVisualGrid: {
    display: "grid",
    gap: 14,
  },
  sauceVisualCard: {
  background:
    "radial-gradient(circle at top right, rgba(255,0,0,0.14), transparent 28%), linear-gradient(180deg, rgba(28,28,28,0.98), rgba(12,12,12,1))",
  border: "1px solid rgba(255,0,0,0.18)",
  borderRadius: 20,
  padding: 18,
  cursor: "pointer",
  textAlign: "left",
  color: "#fff",
  transition:
    "transform 0.2s ease, box-shadow 0.2s ease, border 0.2s ease, background 0.2s ease",
  boxShadow: "0 12px 24px rgba(0,0,0,0.18)",
},
  sauceVisualCardActive: {
    border: "1px solid #ff2d2d",
    boxShadow: "0 0 0 2px rgba(255,45,45,0.18), 0 14px 32px rgba(255,0,0,0.14)",
    transform: "translateY(-3px)",
  },
  sauceVisualEmoji: {
    fontSize: 30,
    marginBottom: 10,
  },

  paymentMethodGrid: {
  display: "grid",
  gap: 12,
},

productCardPro: {
  background: "linear-gradient(145deg, #111, #0a0a0a)",
  borderRadius: 20,
  padding: 20,
  border: "1px solid rgba(255,0,0,0.15)",
  boxShadow: "0 10px 30px rgba(0,0,0,0.6)",
  transition: "all 0.25s ease",
  cursor: "pointer",
},

productCardTop: {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 10,
},

productEmoji: {
  fontSize: 28,
},

productBadge: {
  fontSize: 10,
  background: "rgba(255,0,0,0.2)",
  color: "#ff3b3b",
  padding: "4px 8px",
  borderRadius: 8,
  fontWeight: "bold",
},

productTitlePro: {
  color: "#fff",
  fontSize: 18,
  fontWeight: "bold",
  marginBottom: 6,
},

productDescPro: {
  color: "#aaa",
  fontSize: 13,
  marginBottom: 14,
},

productPricePro: {
  color: "#fff",
  fontSize: 22,
  fontWeight: "bold",
  marginBottom: 16,
},

productBtnPro: {
  width: "100%",
  background: "linear-gradient(90deg, #ff0000, #ff3b3b)",
  border: "none",
  color: "#fff",
  padding: "12px",
  borderRadius: 12,
  fontWeight: "bold",
  cursor: "pointer",
  transition: "all 0.2s ease",
},

paymentMethodCard: {
  background:
    "linear-gradient(180deg, rgba(24,24,24,0.98), rgba(10,10,10,1))",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 18,
  padding: 16,
  display: "flex",
  alignItems: "flex-start",
  gap: 12,
  textAlign: "left",
  cursor: "pointer",
  color: "#fff",
  width: "100%",
  transition: "all 0.2s ease",
  boxShadow: "0 10px 24px rgba(0,0,0,0.16)",
},

paymentMethodCardActive: {
  border: "1px solid rgba(255,0,0,0.42)",
  boxShadow: "0 0 0 2px rgba(255,0,0,0.12), 0 14px 28px rgba(255,0,0,0.16)",
  background:
    "radial-gradient(circle at top right, rgba(255,0,0,0.14), transparent 26%), linear-gradient(180deg, rgba(28,18,18,0.98), rgba(10,10,10,1))",
},

paymentMethodIcon: {
  fontSize: 24,
  flexShrink: 0,
  marginTop: 2,
},

paymentMethodInfo: {
  display: "flex",
  flexDirection: "column",
  gap: 4,
  minWidth: 0,
},

paymentMethodTitle: {
  fontWeight: "bold",
  color: "#fff",
  fontSize: 15,
},

paymentMethodText: {
  color: "#f2f2f2",
  fontSize: 14,
},

paymentMethodHint: {
  color: "#bdbdbd",
  fontSize: 12,
  lineHeight: 1.4,
},

checkoutProfileTop: {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 12,
  flexWrap: "wrap",
  marginBottom: 14,
},

checkoutProfileBadge: {
  display: "inline-block",
  background: "rgba(255,0,0,0.14)",
  border: "1px solid rgba(255,0,0,0.24)",
  color: "#ffb0b0",
  padding: "6px 10px",
  borderRadius: 999,
  fontWeight: "bold",
  fontSize: 11,
  letterSpacing: 0.6,
  marginBottom: 8,
},

checkoutProfileName: {
  fontSize: 22,
  fontWeight: "bold",
  color: "#fff",
  lineHeight: 1.1,
},

checkoutProfileStatus: {
  background: "rgba(80,220,120,0.10)",
  border: "1px solid rgba(80,220,120,0.20)",
  color: "#9ef0b8",
  padding: "8px 12px",
  borderRadius: 999,
  fontWeight: "bold",
  fontSize: 12,
},

checkoutProfileDataGrid: {
  display: "grid",
  gridTemplateColumns: "1fr",
  gap: 10,
  marginBottom: 14,
},

checkoutProfileDataCard: {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: 14,
  padding: 12,
},

productCardPro: {
  position: "relative",
  overflow: "hidden",
  background:
    "radial-gradient(circle at top right, rgba(255,0,0,0.10), transparent 26%), linear-gradient(180deg, rgba(24,24,24,0.98), rgba(10,10,10,1))",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 22,
  padding: 22,
  boxShadow: "0 16px 30px rgba(0,0,0,0.22)",
  transition:
    "transform 0.25s ease, box-shadow 0.25s ease, border 0.25s ease",
  cursor: "pointer",
},

productCardProHover: {
  transform: "translateY(-8px)",
  border: "1px solid rgba(255,0,0,0.26)",
  boxShadow: "0 24px 44px rgba(255,0,0,0.16)",
},

productCardGlow: {
  position: "absolute",
  width: 180,
  height: 180,
  borderRadius: "50%",
  background:
    "radial-gradient(circle, rgba(255,0,0,0.18) 0%, rgba(255,0,0,0.08) 40%, rgba(255,0,0,0.02) 70%, transparent 100%)",
  top: -70,
  right: -50,
  filter: "blur(12px)",
  pointerEvents: "none",
},

productCardTop: {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
  marginBottom: 14,
  position: "relative",
  zIndex: 2,
},

productEmoji: {
  fontSize: 34,
  filter: "drop-shadow(0 4px 10px rgba(255,0,0,0.20))",
},

productBadge: {
  background: "rgba(255,0,0,0.14)",
  border: "1px solid rgba(255,0,0,0.26)",
  color: "#ffb0b0",
  padding: "7px 10px",
  borderRadius: 999,
  fontWeight: "bold",
  fontSize: 11,
  letterSpacing: 0.6,
},

productTitlePro: {
  margin: "0 0 8px 0",
  fontSize: 42,
  color: "#fff",
  textTransform: "uppercase",
  fontFamily: '"Bebas Neue", sans-serif',
  letterSpacing: 1,
  lineHeight: 0.95,
  position: "relative",
  zIndex: 2,
},

productDescPro: {
  margin: 0,
  color: "#d0d0d0",
  fontSize: 14,
  lineHeight: 1.55,
  minHeight: 42,
  position: "relative",
  zIndex: 2,
},

productMetaRow: {
  display: "flex",
  flexWrap: "wrap",
  gap: 8,
  marginTop: 16,
  marginBottom: 18,
  position: "relative",
  zIndex: 2,
},

productMetaPill: {
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.08)",
  color: "#f1f1f1",
  padding: "8px 10px",
  borderRadius: 999,
  fontSize: 12,
  fontWeight: "bold",
},

productBottomPro: {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-end",
  gap: 16,
  marginTop: 6,
  position: "relative",
  zIndex: 2,
},

productPriceLabel: {
  color: "#9e9e9e",
  fontSize: 12,
  marginBottom: 6,
  textTransform: "uppercase",
  letterSpacing: 0.8,
  fontWeight: "bold",
},

productPricePro: {
  color: "#fff",
  fontSize: 30,
  fontWeight: "bold",
  textShadow: "0 0 14px rgba(255,0,0,0.14)",
},

productBtnPro: {
  border: "none",
  background: "linear-gradient(135deg, #ff1200, #b30000)",
  color: "#fff",
  borderRadius: 14,
  padding: "13px 16px",
  fontWeight: "bold",
  fontSize: 14,
  cursor: "pointer",
  whiteSpace: "nowrap",
  boxShadow: "0 12px 24px rgba(255,0,0,0.18)",
  transition: "transform 0.18s ease, box-shadow 0.18s ease",
},

checkoutProfileLabel: {
  color: "#bdbdbd",
  fontSize: 12,
  marginBottom: 6,
},

checkoutProfileValue: {
  color: "#fff",
  fontWeight: "bold",
  fontSize: 14,
  lineHeight: 1.4,
},

checkoutMobileResumeCard: {
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 16,
  padding: 14,
  marginBottom: 14,
},

checkoutMobileResumeRow: {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  color: "#d7d7d7",
  fontSize: 14,
  marginBottom: 8,
},

checkoutMobileResumeTotal: {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  color: "#ff4a4a",
  fontWeight: "bold",
  fontSize: 24,
  marginTop: 10,
},

checkoutTrustText: {
  marginTop: 10,
  marginBottom: 10,
  textAlign: "center",
  color: "#ffd1d1",
  fontWeight: "bold",
  fontSize: 13,
},

  sauceVisualName: {
    fontSize: 34,
    fontWeight: "bold",
    marginBottom: 6,
    textTransform: "uppercase",
    fontFamily: '"Bebas Neue", sans-serif',
    letterSpacing: 1,
    lineHeight: 0.95,
  },
  sauceVisualDesc: {
    color: "#d0d0d0",
    marginBottom: 0,
    fontSize: 14,
    lineHeight: 1.45,
  },
  cocinaGrid: {
    display: "grid",
    gap: 18,
  },
  qrWrap: {
    marginTop: 14,
    marginBottom: 14,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 18,
    padding: 16,
  },
  qrImage: {
    width: "100%",
    maxWidth: 240,
    height: "auto",
    borderRadius: 16,
    display: "block",
    background: "#fff",
    padding: 8,
  },

  kfcModalBackdrop: {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.78)",
  backdropFilter: "blur(8px)",
  zIndex: 200,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 20,
},

kfcModalCard: {
  width: "100%",
  maxWidth: 1120,
  maxHeight: "92vh",
  overflow: "hidden",
  borderRadius: 22,
  background:
    "linear-gradient(180deg, rgba(18,18,18,0.99), rgba(8,8,8,1))",
  border: "1px solid rgba(255,255,255,0.08)",
  boxShadow: "0 24px 60px rgba(0,0,0,0.45)",
},

kfcModalLayout: {
  display: "grid",
  minHeight: 560,
},

kfcModalImageWrap: {
  background:
    "radial-gradient(circle at center, rgba(255,0,0,0.18), transparent 38%), #101010",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 22,
  borderRight: "1px solid rgba(255,255,255,0.06)",
},

kfcModalImage: {
  width: "100%",
  maxWidth: 280,
  borderRadius: 18,
  objectFit: "cover",
  display: "block",
},

kfcModalContent: {
  display: "flex",
  flexDirection: "column",
  minHeight: 560,
  maxHeight: "92vh",
  overflowY: "auto",
  padding: 24,
},

kfcModalContentOnly: {
  display: "flex",
  flexDirection: "column",
  padding: 24,
},

kfcModalTopBar: {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 16,
  marginBottom: 22,
},

kfcModalMiniBadge: {
  display: "inline-block",
  background: "rgba(255,0,0,0.12)",
  border: "1px solid rgba(255,0,0,0.24)",
  color: "#ffb0b0",
  padding: "7px 12px",
  borderRadius: 999,
  fontWeight: "bold",
  fontSize: 12,
  marginBottom: 12,
},

kfcModalTitle: {
  margin: 0,
  fontSize: 46,
  lineHeight: 0.95,
  textTransform: "uppercase",
  fontFamily: '"Bebas Neue", sans-serif',
  letterSpacing: 1,
  color: "#fff",
},

kfcModalPrice: {
  marginTop: 12,
  color: "#ff4b4b",
  fontWeight: "bold",
  fontSize: 32,
  textShadow: "0 0 14px rgba(255,0,0,0.16)",
},

kfcModalDesc: {
  marginTop: 10,
  marginBottom: 0,
  color: "#d0d0d0",
  lineHeight: 1.6,
  fontSize: 15,
  maxWidth: 620,
},

kfcModalCloseBtn: {
  width: 44,
  height: 44,
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.04)",
  color: "#fff",
  fontSize: 18,
  cursor: "pointer",
  flexShrink: 0,
},

pickupInfoCard: {
  marginBottom: 16,
  padding: 16,
  borderRadius: 16,
  background: "linear-gradient(180deg, rgba(255,209,102,0.14), rgba(255,209,102,0.06))",
  border: "1px solid rgba(255,209,102,0.22)",
  display: "grid",
  gap: 6,
},

pickupInfoBadge: {
  display: "inline-flex",
  width: "fit-content",
  padding: "6px 10px",
  borderRadius: 999,
  background: "rgba(17,17,17,0.9)",
  color: "#ffd166",
  fontWeight: "bold",
  fontSize: 12,
},

pickupInfoTitle: {
  color: "#fff",
  fontWeight: "bold",
  fontSize: 16,
},

pickupInfoAddress: {
  color: "#ffd166",
  fontWeight: "bold",
  lineHeight: 1.45,
},

pickupInfoReference: {
  color: "#d8d8d8",
  fontSize: 14,
  lineHeight: 1.45,
},

expressActiveNoticeAddress: {
  color: "#fff3c2",
  fontWeight: "bold",
  fontSize: 14,
  lineHeight: 1.45,
},

kfcModalSection: {
  marginTop: 6,
},

kfcModalSectionHeader: {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 14,
  marginBottom: 14,
  flexWrap: "wrap",
},

kfcModalSectionTitle: {
  color: "#fff",
  fontWeight: "bold",
  fontSize: 24,
  lineHeight: 1.1,
},

kfcModalSectionSub: {
  color: "#bcbcbc",
  fontSize: 13,
  marginTop: 4,
},

kfcStepBubble: {
  background: "#111827",
  border: "1px solid rgba(255,255,255,0.08)",
  color: "#fff",
  padding: "8px 12px",
  borderRadius: 999,
  fontWeight: "bold",
  fontSize: 13,
},

kfcOptionList: {
  display: "grid",
  gap: 12,
},

kfcOptionCard: {
  width: "100%",
  background:
    "linear-gradient(180deg, rgba(26,26,26,0.98), rgba(18,18,18,1))",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 18,
  padding: "16px 18px",
  color: "#fff",
  cursor: "pointer",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 16,
  textAlign: "left",
},

kfcOptionCardActive: {
  border: "1px solid rgba(255,0,0,0.28)",
  boxShadow: "0 0 0 2px rgba(255,0,0,0.10)",
  background:
    "radial-gradient(circle at top right, rgba(255,0,0,0.10), transparent 26%), linear-gradient(180deg, rgba(26,26,26,0.98), rgba(18,18,18,1))",
},

kfcOptionLeft: {
  display: "flex",
  alignItems: "center",
  gap: 14,
  minWidth: 0,
},

kfcOptionEmoji: {
  fontSize: 26,
  flexShrink: 0,
},

kfcOptionTitle: {
  color: "#fff",
  fontWeight: "bold",
  fontSize: 16,
  marginBottom: 4,
},

kfcOptionText: {
  color: "#bcbcbc",
  fontSize: 13,
  lineHeight: 1.4,
},

kfcOptionAction: {
  background: "#20262d",
  border: "1px solid rgba(255,255,255,0.08)",
  color: "#fff",
  padding: "10px 14px",
  borderRadius: 999,
  fontWeight: "bold",
  fontSize: 13,
  whiteSpace: "nowrap",
},

kfcRadioDot: {
  width: 34,
  height: 34,
  borderRadius: "50%",
  border: "1px solid rgba(255,255,255,0.22)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: "bold",
  color: "#fff",
  flexShrink: 0,
},

kfcComboSummaryBox: {
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: 16,
  padding: 16,
  marginBottom: 18,
},

kfcComboSummaryTitle: {
  color: "#ffd166",
  fontWeight: "bold",
  marginBottom: 10,
  fontSize: 14,
},

kfcComboSummaryList: {
  display: "grid",
  gap: 8,
},

kfcComboSummaryItem: {
  color: "#e2e2e2",
  fontSize: 14,
  lineHeight: 1.4,
},

kfcStickyFooter: {
  marginTop: 22,
  paddingTop: 18,
  borderTop: "1px solid rgba(255,255,255,0.08)",
  display: "grid",
  gap: 12,
},

kfcStickyFooterPrice: {
  color: "#fff",
  fontWeight: "bold",
  fontSize: 24,
},

kfcModalFooterNote: {
  color: "#bdbdbd",
  fontSize: 13,
  lineHeight: 1.45,
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

drawerHeaderContent: {
  display: "flex",
  flexDirection: "column",
  gap: 8,
  flex: 1,
  minWidth: 0,
},

drawerHeaderMeta: {
  display: "flex",
  gap: 8,
  flexWrap: "wrap",
  alignItems: "center",
},

drawerMetaPill: {
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.10)",
  color: "#f5f5f5",
  padding: "8px 12px",
  borderRadius: 999,
  fontWeight: "bold",
  fontSize: 12,
},

drawerMetaPillHighlight: {
  background: "linear-gradient(135deg, #ff1200, #b30000)",
  border: "1px solid rgba(255,255,255,0.10)",
  color: "#fff",
  padding: "8px 12px",
  borderRadius: 999,
  fontWeight: "bold",
  fontSize: 12,
  boxShadow: "0 10px 20px rgba(255,0,0,0.18)",
},drawerHeaderContent: {
  display: "flex",
  flexDirection: "column",
  gap: 8,
  flex: 1,
  minWidth: 0,
},

drawerHeaderMeta: {
  display: "flex",
  gap: 8,
  flexWrap: "wrap",
  alignItems: "center",
},

drawerMetaPill: {
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.10)",
  color: "#f5f5f5",
  padding: "8px 12px",
  borderRadius: 999,
  fontWeight: "bold",
  fontSize: 12,
},

drawerMetaPillHighlight: {
  background: "linear-gradient(135deg, #ff1200, #b30000)",
  border: "1px solid rgba(255,255,255,0.10)",
  color: "#fff",
  padding: "8px 12px",
  borderRadius: 999,
  fontWeight: "bold",
  fontSize: 12,
  boxShadow: "0 10px 20px rgba(255,0,0,0.18)",
},
kfcCard: {
  display: "grid",
  gridTemplateColumns: "108px 1fr",
  gap: 14,
  alignItems: "start",
  background:
    "linear-gradient(180deg, rgba(20,20,20,0.98), rgba(10,10,10,1))",
  border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: 18,
  padding: 14,
  boxShadow: "0 10px 24px rgba(0,0,0,0.20)",
  transition: "transform 0.22s ease, box-shadow 0.22s ease, border 0.22s ease",
},

kfcCardHover: {
  transform: "translateY(-4px)",
  border: "1px solid rgba(255,0,0,0.20)",
  boxShadow: "0 18px 34px rgba(255,0,0,0.10)",
},

kfcCardImageWrap: {
  width: 108,
  height: 108,
  borderRadius: 16,
  overflow: "hidden",
  background: "#151515",
  border: "1px solid rgba(255,255,255,0.06)",
  flexShrink: 0,
},

kfcCardImage: {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  display: "block",
},

kfcCardContent: {
  minWidth: 0,
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
},

kfcCardPrice: {
  color: "#ffffff",
  fontWeight: "bold",
  fontSize: 22,
  lineHeight: 1,
  marginBottom: 8,
  textShadow: "0 0 12px rgba(255,0,0,0.10)",
},

kfcCardTitle: {
  margin: "0 0 6px 0",
  color: "#fff",
  fontSize: 22,
  lineHeight: 1,
  textTransform: "uppercase",
  fontFamily: '"Bebas Neue", sans-serif',
  letterSpacing: 0.8,
},

kfcCardDesc: {
  margin: 0,
  color: "#bdbdbd",
  fontSize: 14,
  lineHeight: 1.45,
  display: "-webkit-box",
  WebkitLineClamp: 2,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
  maxWidth: "100%",
},

kfcCardBadge: {
  marginTop: 10,
  marginBottom: 10,
  background: "rgba(255,0,0,0.12)",
  border: "1px solid rgba(255,0,0,0.22)",
  color: "#ffb0b0",
  padding: "6px 10px",
  borderRadius: 999,
  fontSize: 11,
  fontWeight: "bold",
  letterSpacing: 0.5,
},

kfcCardBtn: {
  marginTop: 4,
  background: "#242a31",
  border: "1px solid rgba(255,255,255,0.08)",
  color: "#fff",
  padding: "10px 16px",
  borderRadius: 999,
  cursor: "pointer",
  fontWeight: "bold",
  fontSize: 14,
  transition: "all 0.18s ease",
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
  toastBox: {
    position: "fixed",
    zIndex: 9999,
    width: "calc(100% - 32px)",
    maxWidth: 420,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    pointerEvents: "none",
  },
  toastInner: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    background:
      "radial-gradient(circle at top right, rgba(255,0,0,0.12), transparent 28%), linear-gradient(135deg, rgba(18,18,18,0.98), rgba(8,8,8,0.98))",
    border: "1px solid rgba(255,0,0,0.25)",
    color: "#fff",
    padding: "16px 18px",
    borderRadius: 18,
    boxShadow: "0 18px 45px rgba(0,0,0,0.42)",
    animation: "toastPop 0.22s ease",
  },
  toastIcon: {
    fontSize: 20,
    flexShrink: 0,
  },
  toastText: {
    fontWeight: "bold",
    fontSize: 15,
    lineHeight: 1.35,
    textAlign: "center",
  },
  successModalCard: {
    width: "100%",
    maxWidth: 520,
    background:
      "radial-gradient(circle at top right, rgba(255,0,0,0.10), transparent 28%), linear-gradient(180deg, #171717, #0c0c0c)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 24,
    padding: 28,
    boxShadow: "0 30px 80px rgba(0,0,0,0.50)",
    textAlign: "center",
  },
  cartStatusBar: {
  marginTop: 12,
  padding: 12,
  borderRadius: 14,
  fontSize: 13,
  lineHeight: 1.45,
  fontWeight: "bold",
},

cartStatusBarOpen: {
  background: "rgba(0, 200, 0, 0.10)",
  border: "1px solid rgba(0, 200, 0, 0.25)",
  color: "#aaffaa",
},

cartStatusBarClosed: {
  background: "rgba(255, 209, 102, 0.10)",
  border: "1px solid rgba(255, 209, 102, 0.25)",
  color: "#ffd166",
},
  successEmoji: {
    fontSize: 42,
    marginBottom: 10,
  },
  successTitle: {
    margin: "0 0 10px 0",
    fontSize: 52,
    color: "#fff",
    textTransform: "uppercase",
    fontFamily: '"Bebas Neue", sans-serif',
  },
  successText: {
    marginBottom: 18,
    color: "#d7d7d7",
  },
  successDataBox: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  successDataRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "6px 0",
    color: "#f2f2f2",
  },
  successHint: {
    color: "#ffbdbd",
    fontSize: 14,
    marginBottom: 18,
  },
  successActions: {
    display: "flex",
    gap: 12,
    justifyContent: "center",
    flexWrap: "wrap",
  },
  expressSection: {
  marginBottom: 24,
},

expressInner: {
  background:
    "radial-gradient(circle at top right, rgba(255,0,0,0.10), transparent 24%), linear-gradient(180deg, rgba(18,18,18,0.98), rgba(8,8,8,1))",
  border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: 24,
  padding: 26,
  boxShadow: "0 16px 34px rgba(0,0,0,0.22)",
},

expressBadge: {
  display: "inline-block",
  background: "rgba(255,196,0,0.12)",
  border: "1px solid rgba(255,196,0,0.24)",
  color: "#ffd166",
  padding: "8px 14px",
  borderRadius: 999,
  fontWeight: "bold",
  fontSize: 12,
  letterSpacing: 1,
  marginBottom: 14,
},

expressContent: {
  display: "grid",
  gridTemplateColumns: "1.1fr 0.9fr",
  gap: 22,
  alignItems: "center",
},

expressTextBlock: {
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
},

expressTitle: {
  margin: "0 0 10px 0",
  fontSize: 54,
  lineHeight: 0.95,
  color: "#fff",
  textTransform: "uppercase",
  fontFamily: '"Bebas Neue", sans-serif',
  letterSpacing: 1,
},

expressText: {
  color: "#d2d2d2",
  lineHeight: 1.7,
  fontSize: 16,
  maxWidth: 560,
  marginBottom: 18,
},

expressPills: {
  display: "flex",
  flexWrap: "wrap",
  gap: 10,
  marginBottom: 18,
},

expressPill: {
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.08)",
  color: "#ffd8d8",
  padding: "9px 12px",
  borderRadius: 999,
  fontWeight: "bold",
  fontSize: 13,
},

expressVisual: {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
},

expressImage: {
  width: "100%",
  maxWidth: 340,
  height: "auto",
  objectFit: "cover",
  borderRadius: 22,
  border: "1px solid rgba(255,255,255,0.08)",
  boxShadow: "0 18px 38px rgba(255,0,0,0.12)",
},

categoriasVisualesGrid: {
  display: "grid",
  gap: 14,
},

categoriaVisualCard: {
  background:
    "linear-gradient(180deg, rgba(24,24,24,0.98), rgba(10,10,10,1))",
  border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: 18,
  overflow: "hidden",
  boxShadow: "0 12px 24px rgba(0,0,0,0.18)",
  cursor: "pointer",
},

categoriaVisualImageWrap: {
  width: "100%",
  height: 130,
  overflow: "hidden",
  background: "#111",
},

categoriaVisualImage: {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  display: "block",
},

categoriaVisualTitle: {
  padding: "14px 12px",
  textAlign: "center",
  fontWeight: "bold",
  color: "#fff",
  fontSize: 14,
},

heroInfoStrip: {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
  gap: 12,
  marginTop: 26,
},

heroInfoCard: {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 16,
  padding: "14px 14px",
  boxShadow: "0 10px 24px rgba(0,0,0,0.14)",
},

heroInfoValue: {
  color: "#fff",
  fontWeight: "bold",
  fontSize: 20,
  marginBottom: 6,
},

heroInfoLabel: {
  color: "#cfcfcf",
  fontSize: 13,
  lineHeight: 1.4,
},

heroPosterBadge: {
  display: "inline-block",
  background: "rgba(255,196,0,0.12)",
  border: "1px solid rgba(255,196,0,0.22)",
  color: "#ffd166",
  padding: "8px 14px",
  borderRadius: 999,
  fontWeight: "bold",
  fontSize: 12,
  letterSpacing: 0.8,
  marginTop: 12,
  position: "relative",
  zIndex: 3,
},

headerBrandBlock: {
  display: "flex",
  flexDirection: "column",
  gap: 10,
  maxWidth: 680,
},

headerTopLine: {
  display: "flex",
  alignItems: "center",
  gap: 12,
  flexWrap: "wrap",
},

headerStatusPill: {
  display: "inline-block",
  padding: "8px 12px",
  borderRadius: 999,
  fontSize: 12,
  fontWeight: "bold",
  letterSpacing: 0.8,
},

headerStatusOnline: {
  background: "rgba(80,220,120,0.10)",
  border: "1px solid rgba(80,220,120,0.25)",
  color: "#9ef0b8",
},

headerStatusOffline: {
  background: "rgba(255,80,80,0.10)",
  border: "1px solid rgba(255,80,80,0.22)",
  color: "#ffc1c1",
},

headerTagline: {
  color: "#f5f5f5",
  marginTop: 0,
  marginBottom: 0,
  fontSize: 18,
  fontWeight: "bold",
  letterSpacing: 0.2,
},

headerMiniInfoRow: {
  display: "flex",
  flexWrap: "wrap",
  gap: 10,
  marginTop: 4,
},

headerMiniInfo: {
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.08)",
  color: "#ffdcdc",
  padding: "8px 12px",
  borderRadius: 999,
  fontWeight: "bold",
  fontSize: 12,
},
comboCardPro: {
  background:
    "linear-gradient(180deg, rgba(24,24,24,0.98), rgba(10,10,10,1))",
  border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: 24,
  overflow: "hidden",
  boxShadow: "0 16px 34px rgba(0,0,0,0.22)",
  display: "flex",
  flexDirection: "column",
  transition: "transform 0.22s ease, box-shadow 0.22s ease, border 0.22s ease",
},

comboCardProFeatured: {
  border: "1px solid rgba(255,0,0,0.30)",
  boxShadow: "0 22px 42px rgba(255,0,0,0.16)",
  transform: "translateY(-4px)",
},

comboImageWrap: {
  position: "relative",
  width: "100%",
  height: 210,
  overflow: "hidden",
  background: "#111",
},

comboImage: {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  display: "block",
},

comboImageOverlay: {
  position: "absolute",
  inset: 0,
  background:
    "linear-gradient(to top, rgba(0,0,0,0.72), rgba(0,0,0,0.10) 45%, rgba(0,0,0,0.18))",
},

comboTopBadges: {
  position: "absolute",
  top: 12,
  left: 12,
  right: 12,
  display: "flex",
  justifyContent: "space-between",
  gap: 8,
  flexWrap: "wrap",
},

comboBadgePro: {
  background: "linear-gradient(135deg, #ff0000, #b30000)",
  color: "#fff",
  padding: "8px 12px",
  borderRadius: 999,
  fontWeight: "bold",
  fontSize: 11,
  letterSpacing: 0.9,
  boxShadow: "0 8px 18px rgba(255,0,0,0.18)",
},

comboDeliveryBadge: {
  background: "rgba(255,196,0,0.14)",
  border: "1px solid rgba(255,196,0,0.22)",
  color: "#ffd166",
  padding: "8px 12px",
  borderRadius: 999,
  fontWeight: "bold",
  fontSize: 11,
},

comboBodyPro: {
  padding: 18,
  display: "flex",
  flexDirection: "column",
  gap: 12,
  flex: 1,
},

comboEmojiLine: {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 10,
},

comboEmojiPro: {
  fontSize: 30,
},

comboMiniTag: {
  display: "inline-block",
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.08)",
  color: "#ffdcdc",
  padding: "7px 10px",
  borderRadius: 999,
  fontSize: 11,
  fontWeight: "bold",
  letterSpacing: 0.6,
},

comboTitlePro: {
  margin: 0,
  fontSize: 40,
  color: "#fff",
  textTransform: "uppercase",
  fontFamily: '"Bebas Neue", sans-serif',
  letterSpacing: 1,
  lineHeight: 0.95,
},

comboDescPro: {
  margin: 0,
  color: "#d2d2d2",
  lineHeight: 1.5,
  fontSize: 15,
},

comboQuickList: {
  display: "grid",
  gap: 8,
},

comboQuickItem: {
  fontSize: 13,
  color: "#d8d8d8",
  padding: "9px 11px",
  borderRadius: 12,
  background: "rgba(255,255,255,0.045)",
  border: "1px solid rgba(255,255,255,0.06)",
  lineHeight: 1.35,
},

comboBottomRow: {
  marginTop: "auto",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-end",
  gap: 14,
  flexWrap: "wrap",
},

comboPriceLabel: {
  color: "#bdbdbd",
  fontSize: 12,
  marginBottom: 4,
},

comboPricePro: {
  fontSize: 34,
  fontWeight: "bold",
  color: "#ff3535",
  textShadow: "0 0 16px rgba(255,0,0,0.20)",
  lineHeight: 1,
},

comboBtnPro: {
  background: "linear-gradient(135deg, #ff1200, #c30000)",
  color: "#fff",
  border: "none",
  padding: "14px 18px",
  borderRadius: 14,
  cursor: "pointer",
  fontWeight: "bold",
  fontSize: 15,
  boxShadow: "0 12px 24px rgba(255,0,0,0.18)",
},

simpleCardPro: {
  background:
    "linear-gradient(180deg, rgba(25,25,25,0.98), rgba(10,10,10,1))",
  border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: 22,
  overflow: "hidden",
  boxShadow: "0 14px 28px rgba(0,0,0,0.20)",
  display: "flex",
  flexDirection: "column",
},

simpleCardTop: {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 10,
  padding: "16px 16px 0 16px",
},

simpleEmojiPro: {
  fontSize: 30,
},

simpleTypeBadge: {
  background: "rgba(255,0,0,0.12)",
  border: "1px solid rgba(255,0,0,0.22)",
  color: "#ffb0b0",
  padding: "7px 10px",
  borderRadius: 999,
  fontSize: 11,
  fontWeight: "bold",
  letterSpacing: 0.7,
},

simpleVisualWrap: {
  position: "relative",
  width: "100%",
  height: 170,
  overflow: "hidden",
  marginTop: 14,
  background: "#111",
},

simpleVisualImage: {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  display: "block",
},

simpleVisualOverlay: {
  position: "absolute",
  inset: 0,
  background:
    "linear-gradient(to top, rgba(0,0,0,0.62), rgba(0,0,0,0.08) 45%, rgba(0,0,0,0.16))",
},

simpleCardBody: {
  padding: 16,
  display: "flex",
  flexDirection: "column",
  gap: 12,
  flex: 1,
},

simpleTitlePro: {
  margin: 0,
  fontSize: 38,
  color: "#fff",
  textTransform: "uppercase",
  fontFamily: '"Bebas Neue", sans-serif',
  letterSpacing: 1,
  lineHeight: 0.95,
},

simpleDescPro: {
  color: "#d2d2d2",
  margin: 0,
  lineHeight: 1.5,
  fontSize: 14,
},

simpleBenefitRow: {
  display: "flex",
  flexWrap: "wrap",
  gap: 8,
},

simpleBenefitPill: {
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.08)",
  color: "#ffdcdc",
  padding: "8px 10px",
  borderRadius: 999,
  fontSize: 12,
  fontWeight: "bold",
},

simpleBottomRow: {
  marginTop: "auto",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-end",
  gap: 12,
  flexWrap: "wrap",
},

simplePriceLabel: {
  color: "#bdbdbd",
  fontSize: 12,
  marginBottom: 4,
},

simplePricePro: {
  fontSize: 30,
  fontWeight: "bold",
  color: "#ff2c2c",
  textShadow: "0 0 16px rgba(255,0,0,0.20)",
  lineHeight: 1,
},

comboModalLayout: {
  display: "grid",
  minHeight: 560,
  background:
    "radial-gradient(circle at top right, rgba(255,0,0,0.08), transparent 24%), linear-gradient(180deg, rgba(18,18,18,0.98), rgba(8,8,8,1))",
},

comboModalImageSide: {
  position: "relative",
  minHeight: 320,
  background: "#111",
  overflow: "hidden",
},

comboModalImage: {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  display: "block",
},

comboModalImageOverlay: {
  position: "absolute",
  inset: 0,
  background:
    "linear-gradient(to top, rgba(0,0,0,0.82), rgba(0,0,0,0.18) 45%, rgba(0,0,0,0.22))",
},

comboModalImageContent: {
  position: "absolute",
  left: 22,
  right: 22,
  bottom: 22,
  zIndex: 2,
},

comboModalBadge: {
  display: "inline-block",
  background: "linear-gradient(135deg, #ff0000, #b30000)",
  color: "#fff",
  padding: "8px 12px",
  borderRadius: 999,
  fontWeight: "bold",
  fontSize: 12,
  letterSpacing: 0.8,
  marginBottom: 12,
},

comboModalImageTitle: {
  margin: 0,
  fontSize: 52,
  color: "#fff",
  textTransform: "uppercase",
  fontFamily: '"Bebas Neue", sans-serif',
  lineHeight: 0.95,
  letterSpacing: 1,
},

comboModalImagePrice: {
  marginTop: 10,
  fontSize: 34,
  fontWeight: "bold",
  color: "#ff3a3a",
  textShadow: "0 0 16px rgba(255,0,0,0.20)",
},

comboModalContentSide: {
  padding: 24,
  display: "flex",
  flexDirection: "column",
  gap: 18,
},

comboModalInfoBox: {
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: 18,
  padding: 16,
},

comboModalInfoTitle: {
  fontWeight: "bold",
  color: "#ffd166",
  marginBottom: 10,
  fontSize: 14,
},

comboModalInfoList: {
  display: "grid",
  gap: 8,
},

comboModalInfoItem: {
  color: "#e4e4e4",
  fontSize: 14,
  lineHeight: 1.4,
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.05)",
  borderRadius: 12,
  padding: "10px 12px",
},

comboModalFooter: {
  marginTop: "auto",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 14,
  flexWrap: "wrap",
  paddingTop: 14,
  borderTop: "1px solid rgba(255,255,255,0.08)",
},
checkoutMobileCard: {
  width: "min(100%, 560px)",
  maxHeight: "92dvh",
  margin: "auto",
  background:
    "radial-gradient(circle at top right, rgba(255,0,0,0.10), transparent 24%), linear-gradient(180deg, rgba(18,18,18,0.99), rgba(8,8,8,1))",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 24,
  boxShadow: "0 30px 90px rgba(0,0,0,0.56)",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
},

checkoutMobileHeader: {
  padding: "18px 18px 14px",
  borderBottom: "1px solid rgba(255,255,255,0.08)",
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  flexShrink: 0,
},

checkoutMobileTitle: {
  margin: 0,
  fontSize: 42,
  color: "#fff",
  textTransform: "uppercase",
  fontFamily: '"Bebas Neue", sans-serif',
  letterSpacing: 1,
  lineHeight: 0.95,
},

checkoutMobileSubtitle: {
  marginTop: 8,
  marginBottom: 0,
  color: "#cfcfcf",
  fontSize: 14,
  lineHeight: 1.45,
},

checkoutMobileBody: {
  flex: 1,
  minHeight: 0,
  overflowY: "auto",
  padding: 18,
  WebkitOverflowScrolling: "touch",
},

checkoutMobileFooter: {
  borderTop: "1px solid rgba(255,255,255,0.08)",
  padding: "16px 18px calc(16px + env(safe-area-inset-bottom))",
  background: "rgba(10,10,10,0.96)",
  flexShrink: 0,
},

checkoutMobileTotalBox: {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 14,
},

checkoutMobileTotalLabel: {
  color: "#cfcfcf",
  fontWeight: "bold",
  fontSize: 14,
},

checkoutMobileTotalValue: {
  color: "#ff4a4a",
  fontWeight: "bold",
  fontSize: 28,
},

checkoutProfileBox: {
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 16,
  padding: 16,
  marginBottom: 16,
},

checkoutGuestBox: {
  marginBottom: 16,
},

checkoutHintBox: {
  background: "rgba(255,196,0,0.10)",
  border: "1px solid rgba(255,196,0,0.18)",
  color: "#ffd166",
  borderRadius: 14,
  padding: 14,
  fontWeight: "bold",
  fontSize: 14,
},

checkoutProfileRow: {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  padding: "6px 0",
  color: "#f2f2f2",
  flexWrap: "wrap",
},

checkoutActionsRow: {
  display: "flex",
  gap: 10,
  flexWrap: "wrap",
  marginTop: 12,
},

comboModalFooterText: {
  color: "#cfcfcf",
  fontSize: 14,
  lineHeight: 1.4,
  maxWidth: 420,
},

comboModalFooterPrice: {
  fontSize: 28,
  fontWeight: "bold",
  color: "#ff3535",
  textShadow: "0 0 16px rgba(255,0,0,0.20)",
},

};

export default App;