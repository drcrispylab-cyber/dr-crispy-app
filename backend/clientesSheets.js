const { google } = require("googleapis");

const CLIENTES_SHEET_NAME = "clientes web app";
const CLIENTES_HEADERS = [
  "ID",
  "NOMBRE",
  "TELEFONO",
  "PASSWORD",
  "PAGO_PREFERIDO",
  "DIRECCIONES_JSON",
  "CREADO_EN",
  "ACTUALIZADO_EN",
];

function getSpreadsheetId() {
  const spreadsheetId =
    process.env.GOOGLE_SHEETS_ID ||
    process.env.SPREADSHEET_ID ||
    process.env.GOOGLE_SPREADSHEET_ID;

  if (!spreadsheetId) {
    throw new Error(
      "Falta GOOGLE_SHEETS_ID (o SPREADSHEET_ID / GOOGLE_SPREADSHEET_ID) en variables de entorno"
    );
  }

  return spreadsheetId;
}

function getGoogleAuth() {
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  const privateKeyRaw = process.env.GOOGLE_PRIVATE_KEY;

  if (!clientEmail || !privateKeyRaw) {
    throw new Error(
      "Faltan GOOGLE_CLIENT_EMAIL y/o GOOGLE_PRIVATE_KEY en variables de entorno"
    );
  }

  const privateKey = privateKeyRaw.replace(/\\n/g, "\n");

  return new google.auth.GoogleAuth({
    credentials: {
      client_email: clientEmail,
      private_key: privateKey,
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
}

async function getSheetsClient() {
  const auth = getGoogleAuth();
  const authClient = await auth.getClient();

  return google.sheets({
    version: "v4",
    auth: authClient,
  });
}

function safeJsonParse(valor, fallback) {
  try {
    return JSON.parse(valor);
  } catch (error) {
    return fallback;
  }
}

function mapClienteRow(row = [], rowNumber = 0) {
  return {
    _rowNumber: rowNumber,
    id: String(row[0] || "").trim(),
    nombre: String(row[1] || "").trim(),
    telefono: String(row[2] || "").trim(),
    password: String(row[3] || "").trim(),
    pagoPreferido: String(row[4] || "Llave").trim() || "Llave",
    direcciones: Array.isArray(safeJsonParse(row[5] || "[]", []))
      ? safeJsonParse(row[5] || "[]", [])
      : [],
    creadoEn: String(row[6] || "").trim(),
    actualizadoEn: String(row[7] || "").trim(),
  };
}

function clienteToRow(cliente = {}) {
  return [
    String(cliente.id || "").trim(),
    String(cliente.nombre || "").trim(),
    String(cliente.telefono || "").trim(),
    String(cliente.password || "").trim(),
    String(cliente.pagoPreferido || "Llave").trim() || "Llave",
    JSON.stringify(Array.isArray(cliente.direcciones) ? cliente.direcciones : []),
    String(cliente.creadoEn || "").trim(),
    String(cliente.actualizadoEn || "").trim(),
  ];
}

async function ensureClientesSheetExists() {
  const sheets = await getSheetsClient();
  const spreadsheetId = getSpreadsheetId();

  const spreadsheet = await sheets.spreadsheets.get({
    spreadsheetId,
  });

  const sheetExists = (spreadsheet.data.sheets || []).some(
    (sheet) => sheet.properties?.title === CLIENTES_SHEET_NAME
  );

  if (!sheetExists) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          {
            addSheet: {
              properties: {
                title: CLIENTES_SHEET_NAME,
              },
            },
          },
        ],
      },
    });
  }

  const headerResp = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${CLIENTES_SHEET_NAME}!A1:H1`,
  });

  const currentHeaders = headerResp.data.values?.[0] || [];

  const sameHeaders =
    currentHeaders.length === CLIENTES_HEADERS.length &&
    currentHeaders.every((value, index) => value === CLIENTES_HEADERS[index]);

  if (!sameHeaders) {
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${CLIENTES_SHEET_NAME}!A1:H1`,
      valueInputOption: "RAW",
      requestBody: {
        values: [CLIENTES_HEADERS],
      },
    });
  }
}

async function listarClientesSheet() {
  await ensureClientesSheetExists();

  const sheets = await getSheetsClient();
  const spreadsheetId = getSpreadsheetId();

  const resp = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${CLIENTES_SHEET_NAME}!A2:H`,
  });

  const rows = resp.data.values || [];

  return rows
    .map((row, index) => mapClienteRow(row, index + 2))
    .filter((cliente) => cliente.id);
}

async function buscarClientePorTelefonoSheet(telefono = "") {
  const telefonoLimpio = String(telefono || "").trim();
  const clientes = await listarClientesSheet();

  return (
    clientes.find(
      (cliente) => String(cliente.telefono || "").trim() === telefonoLimpio
    ) || null
  );
}

async function buscarClientePorIdSheet(id = "") {
  const idLimpio = String(id || "").trim();
  const clientes = await listarClientesSheet();

  return (
    clientes.find((cliente) => String(cliente.id || "").trim() === idLimpio) ||
    null
  );
}

async function crearClienteSheet(cliente = {}) {
  await ensureClientesSheetExists();

  const sheets = await getSheetsClient();
  const spreadsheetId = getSpreadsheetId();

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${CLIENTES_SHEET_NAME}!A:H`,
    valueInputOption: "RAW",
    insertDataOption: "INSERT_ROWS",
    requestBody: {
      values: [clienteToRow(cliente)],
    },
  });

  return cliente;
}

async function actualizarClienteSheet(clienteActualizado = {}) {
  if (!clienteActualizado?._rowNumber) {
    throw new Error("Cliente sin _rowNumber para actualizar");
  }

  const sheets = await getSheetsClient();
  const spreadsheetId = getSpreadsheetId();

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${CLIENTES_SHEET_NAME}!A${clienteActualizado._rowNumber}:H${clienteActualizado._rowNumber}`,
    valueInputOption: "RAW",
    requestBody: {
      values: [clienteToRow(clienteActualizado)],
    },
  });

  return clienteActualizado;
}

module.exports = {
  ensureClientesSheetExists,
  listarClientesSheet,
  buscarClientePorTelefonoSheet,
  buscarClientePorIdSheet,
  crearClienteSheet,
  actualizarClienteSheet,
};