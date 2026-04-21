import { NextRequest, NextResponse } from "next/server";
import https from "https";

/**
 * Proxy API route pour communiquer avec un noeud LND local (Polar).
 *
 * Toutes les requêtes vers /api/lnd/* sont proxiées vers le LND REST API.
 * La config du nœud est passée via les headers X-Lnd-* ou via les cookies.
 *
 * Routes supportées:
 *   GET  /api/lnd/info                  → GET  /v1/getinfo
 *   GET  /api/lnd/balance               → GET  /v1/balance/blockchain
 *   GET  /api/lnd/channels/balance      → GET  /v1/balance/channels
 *   POST /api/lnd/invoices              → POST /v1/invoices
 *   GET  /api/lnd/invoices              → GET  /v1/invoices
 *   POST /api/lnd/channels/transactions → POST /v1/channels/transactions
 *   GET  /api/lnd/payments              → GET  /v1/payments
 *   GET  /api/lnd/payreq/:bolt11        → GET  /v1/payreq/:bolt11
 */

// Mapping des routes internes vers les routes LND REST
const ROUTE_MAP: Record<string, { lndPath: string; method?: string }> = {
  info: { lndPath: "/v1/getinfo" },
  balance: { lndPath: "/v1/balance/blockchain" },
  "channels/balance": { lndPath: "/v1/balance/channels" },
  invoices: { lndPath: "/v1/invoices" },
  "channels/transactions": { lndPath: "/v1/channels/transactions" },
  payments: { lndPath: "/v1/payments" },
};

function getLndConfig(req: NextRequest) {
  // Lire la config depuis les headers ou les cookies
  const host =
    req.headers.get("x-lnd-host") ||
    req.cookies.get("flash_lnd_host")?.value ||
    "127.0.0.1";
  const port =
    req.headers.get("x-lnd-port") ||
    req.cookies.get("flash_lnd_port")?.value ||
    "8080";
  const macaroon =
    req.headers.get("x-lnd-macaroon") ||
    req.cookies.get("flash_lnd_macaroon")?.value ||
    "";

  return { host, port: Number(port), macaroon };
}

async function proxyToLnd(
  config: { host: string; port: number; macaroon: string },
  path: string,
  method: string,
  body?: unknown
): Promise<{ status: number; data: unknown }> {
  const url = `https://${config.host}:${config.port}${path}`;

  // LND utilise un certificat auto-signé, on désactive la vérification en dev
  const agent = new https.Agent({ rejectUnauthorized: false });

  const headers: Record<string, string> = {
    "Grpc-Metadata-macaroon": config.macaroon,
    "Content-Type": "application/json",
  };

  try {
    const { default: axios } = await import("axios");
    
    const response = await axios({
      url,
      method,
      headers,
      data: body,
      httpsAgent: agent,
    });

    return { status: response.status, data: response.data };
  } catch (error: any) {
    return {
      status: error.response?.status || 502,
      data: {
        error: "Impossible de se connecter au noeud LND",
        detail: error.response?.data?.error || error.message,
        hint: "Vérifiez que Polar est lancé",
      },
    };
  }
}

// Handler pour GET et POST
async function handler(
  req: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const config = getLndConfig(req);

  if (!config.macaroon) {
    return NextResponse.json(
      {
        error: "Noeud LND non configuré",
        hint: "Configurez votre noeud Polar dans Paramètres > Lightning Node",
      },
      { status: 400 }
    );
  }

  const pathSegments = params.path;
  const routeKey = pathSegments.join("/");

  // Check for payreq decode route
  if (pathSegments[0] === "payreq" && pathSegments[1]) {
    const result = await proxyToLnd(
      config,
      `/v1/payreq/${pathSegments[1]}`,
      "GET"
    );
    return NextResponse.json(result.data, { status: result.status });
  }

  const route = ROUTE_MAP[routeKey];
  if (!route) {
    return NextResponse.json(
      { error: `Route /api/lnd/${routeKey} non supportée` },
      { status: 404 }
    );
  }

  const method = req.method || "GET";
  let body: unknown;

  if (method === "POST") {
    try {
      body = await req.json();
    } catch {
      body = {};
    }
  }

  const result = await proxyToLnd(config, route.lndPath, method, body);
  return NextResponse.json(result.data, { status: result.status });
}

export const GET = handler;
export const POST = handler;
