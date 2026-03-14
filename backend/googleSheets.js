const { google } = require("googleapis");
const path = require("path");

const SHEET_NAME = "pedidos web app";
const CREDENTIALS_PATH = path.join(__dirname, "credenciales-google.json");

// TU GOOGLE SHEET
const SPREADSHEET_ID = "1fvCDbPE_vEZvvvMvNDZWfld8U-6OkZS-DZEOgDq52_g";

const HEADERS = [
  "PEDIDO_ID",
  "TRACKING_TOKEN",
  "FECHA",
  "ESTADO",
  "REPARTIDOR",
  "CLIENTE_NOMBRE",
  "CLIENTE_TELEFONO",
  "CLIENTE_DIRECCION",
  "CLIENTE_REFERENCIA",
  "METODO_PAGO",
  "PRODUCTOS_RESUMEN",
  "ITEMS_JSON",
  "SUBTOTAL",
  "DOMICILIO",
  "TOTAL",
  "ORIGEN",
  "OBSERVACION",
];

async function getAuth() {
  const auth = new google.auth.GoogleAuth({
    keyFile: CREDENTIALS_PATH,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  return auth.getClient();
}

async function getSheetsClient() {
  const authClient = await getAuth();

  return google.sheets({
    version: "v4",
    auth: authClient,
  });
}

async function getSpreadsheetInfo(sheets) {
  const response = await sheets.spreadsheets.get({
    spreadsheetId: SPREADSHEET_ID,
  });

  return response.data;
}

async function ensureSheetExists() {
  const sheets = await getSheetsClient();
  const spreadsheet = await getSpreadsheetInfo(sheets);

  const existingSheet = spreadsheet.sheets.find(
    (sheet) => sheet.properties.title === SHEET_NAME
  );

  if (!existingSheet) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests: [
          {
            addSheet: {
              properties: {
                title: SHEET_NAME,
              },
            },
          },
        ],
      },
    });
  }

  const headersResponse = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET_NAME}!A1:Q1`,
  });

  const values = headersResponse.data.values || [];
  const currentHeaders = values[0] || [];

  const headersAreMissing =
    currentHeaders.length === 0 ||
    HEADERS.some((header, index) => currentHeaders[index] !== header);

  if (headersAreMissing) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A1:Q1`,
      valueInputOption: "RAW",
      requestBody: {
        values: [HEADERS],
      },
    });
  }
}

function resumirProductos(items = []) {
  return items
    .map(
      (item) =>
        `${item.nombre} x${item.cantidad}${
          item.salsa ? ` | ${item.salsa}` : ""
        } | $${Number((item.precio || 0) * (item.cantidad || 0)).toLocaleString("es-CO")}`
    )
    .join(" || ");
}

async function appendPedidoWebApp(pedido) {
  await ensureSheetExists();

  const sheets = await getSheetsClient();

  const row = [
    pedido.id || "",
    pedido.trackingToken || "",
    pedido.fecha || "",
    pedido.estado || "",
    pedido.repartidor || "",
    pedido.cliente?.nombre || "",
    pedido.cliente?.telefono || "",
    pedido.cliente?.direccion || "",
    pedido.cliente?.referencia || "",
    pedido.cliente?.pago || "",
    resumirProductos(pedido.items || []),
    JSON.stringify(pedido.items || []),
    Number(pedido.subtotal || 0),
    Number(pedido.domicilio || 0),
    Number(pedido.total || 0),
    "WEB APP",
    "",
  ];

  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET_NAME}!A:Q`,
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: {
      values: [row],
    },
  });
}

async function updatePedidoWebApp(pedido) {
  await ensureSheetExists();

  const sheets = await getSheetsClient();

  const getRows = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET_NAME}!A:Q`,
  });

  const values = getRows.data.values || [];

  if (values.length <= 1) {
    return false;
  }

  const rowIndex = values.findIndex((row, index) => {
    if (index === 0) return false;
    return String(row[0] || "") === String(pedido.id || "");
  });

  if (rowIndex === -1) {
    return false;
  }

  const sheetRowNumber = rowIndex + 1;

  const updatedRow = [
    pedido.id || "",
    pedido.trackingToken || "",
    pedido.fecha || "",
    pedido.estado || "",
    pedido.repartidor || "",
    pedido.cliente?.nombre || "",
    pedido.cliente?.telefono || "",
    pedido.cliente?.direccion || "",
    pedido.cliente?.referencia || "",
    pedido.cliente?.pago || "",
    resumirProductos(pedido.items || []),
    JSON.stringify(pedido.items || []),
    Number(pedido.subtotal || 0),
    Number(pedido.domicilio || 0),
    Number(pedido.total || 0),
    "WEB APP",
    `Actualizado ${new Date().toLocaleString("es-CO")}`,
  ];

  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET_NAME}!A${sheetRowNumber}:Q${sheetRowNumber}`,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [updatedRow],
    },
  });

  return true;
}

module.exports = {
  appendPedidoWebApp,
  updatePedidoWebApp,
  ensureSheetExists,
};