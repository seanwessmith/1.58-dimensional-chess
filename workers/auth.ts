type KVNamespaceLike = {
  get: (key: string) => Promise<string | null>;
  put: (key: string, value: string, options?: { expirationTtl?: number }) => Promise<void>;
  delete: (key: string) => Promise<void>;
};

type Env = {
  AUTH_TOKENS: KVNamespaceLike;
  JWT_SECRET: string;
  FRONTEND_URL: string;
  RESEND_API_KEY: string;
  EMAIL_FROM?: string;
};

type ResponseHeaders = Record<string, string>;

type MagicLinkRecord = {
  email: string;
  created: number;
};

type JwtPayload = {
  email: string;
  exp: number;
};

const json = (body: unknown, headers: ResponseHeaders, init: ResponseInit = {}) =>
  new Response(JSON.stringify(body), { ...init, headers });

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Unknown error";

const bytesToBase64Url = (bytes: Uint8Array) =>
  btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");

const stringToBase64Url = (value: string) =>
  bytesToBase64Url(new TextEncoder().encode(value));

const base64UrlToBytes = (value: string) => {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = "=".repeat((4 - (normalized.length % 4)) % 4);
  return Uint8Array.from(atob(`${normalized}${padding}`), (char) =>
    char.charCodeAt(0)
  );
};

const base64UrlToString = (value: string) =>
  new TextDecoder().decode(base64UrlToBytes(value));

export default {
  async fetch(request: Request, env: Env) {
    const url = new URL(request.url);

    const headers: ResponseHeaders = {
      "Access-Control-Allow-Origin": env.FRONTEND_URL,
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Content-Type": "application/json",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers });
    }

    try {
      if (
        url.pathname === "/auth/send-magic-link" &&
        request.method === "POST"
      ) {
        return await handleSendMagicLink(request, env, headers);
      }

      if (url.pathname === "/auth/verify" && request.method === "POST") {
        return await handleVerifyToken(request, env, headers);
      }

      if (url.pathname === "/auth/validate" && request.method === "GET") {
        return await handleValidateSession(request, env, headers);
      }

      return json({ error: "Not found" }, headers, { status: 404 });
    } catch (error) {
      return json({ error: getErrorMessage(error) }, headers, { status: 500 });
    }
  },
};

async function handleSendMagicLink(
  request: Request,
  env: Env,
  headers: ResponseHeaders
) {
  const { email } = (await request.json()) as { email?: string };

  if (!email || !email.includes("@")) {
    return json({ error: "Invalid email" }, headers, { status: 400 });
  }

  const token = crypto.randomUUID();

  await env.AUTH_TOKENS.put(
    `token:${token}`,
    JSON.stringify({
      email,
      created: Date.now(),
    } satisfies MagicLinkRecord),
    {
      expirationTtl: 600,
    }
  );

  const emailResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: env.EMAIL_FROM ?? "onboarding@resend.dev",
      to: email,
      subject: "Your magic login link",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Login to 1.58 Dimensional Chess</h2>
          <p>Click the link below to log in:</p>
          <a href="${env.FRONTEND_URL}/auth/callback?token=${token}" 
             style="display: inline-block; padding: 12px 24px; background: #2563EB; color: white; text-decoration: none; border-radius: 6px;">
            Log in
          </a>
          <p style="color: #666; margin-top: 20px;">This link expires in 10 minutes.</p>
        </div>
      `,
    }),
  });

  if (!emailResponse.ok) {
    const emailError = await emailResponse.text();
    return json(
      {
        error: "Failed to send email",
        details:
          emailError || `Resend returned status ${emailResponse.status}`,
        resendStatus: emailResponse.status,
      },
      headers,
      { status: 502 }
    );
  }

  return json({ success: true }, headers);
}

async function handleVerifyToken(
  request: Request,
  env: Env,
  headers: ResponseHeaders
) {
  const { token } = (await request.json()) as { token?: string };

  if (!token) {
    return json({ error: "Missing token" }, headers, { status: 400 });
  }

  const tokenData = await env.AUTH_TOKENS.get(`token:${token}`);

  if (!tokenData) {
    return json({ error: "Invalid or expired token" }, headers, { status: 401 });
  }

  const { email } = JSON.parse(tokenData) as MagicLinkRecord;
  await env.AUTH_TOKENS.delete(`token:${token}`);

  const jwt = await generateJWT({ email }, env.JWT_SECRET);

  return json(
    {
      token: jwt,
      email,
    },
    headers
  );
}

async function handleValidateSession(
  request: Request,
  env: Env,
  headers: ResponseHeaders
) {
  const authHeader = request.headers.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return json({ valid: false }, headers);
  }

  const token = authHeader.substring(7);

  try {
    const payload = await verifyJWT(token, env.JWT_SECRET);
    return json(
      {
        valid: true,
        email: payload.email,
      },
      headers
    );
  } catch {
    return json({ valid: false }, headers);
  }
}

async function generateJWT(
  payload: { email: string },
  secret: string
): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const header = stringToBase64Url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payloadData = stringToBase64Url(
    JSON.stringify({
      ...payload,
      exp: Math.floor(Date.now() / 1000) + 86400 * 7,
    } satisfies JwtPayload)
  );
  const message = `${header}.${payloadData}`;
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(message)
  );

  return `${message}.${bytesToBase64Url(new Uint8Array(signature))}`;
}

async function verifyJWT(token: string, secret: string): Promise<JwtPayload> {
  const [header, payload, signature] = token.split(".");

  if (!header || !payload || !signature) {
    throw new Error("Malformed token");
  }

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"]
  );

  const verified = await crypto.subtle.verify(
    "HMAC",
    key,
    base64UrlToBytes(signature),
    encoder.encode(`${header}.${payload}`)
  );

  if (!verified) {
    throw new Error("Invalid signature");
  }

  const data = JSON.parse(base64UrlToString(payload)) as JwtPayload;
  if (data.exp < Math.floor(Date.now() / 1000)) {
    throw new Error("Token expired");
  }

  return data;
}
