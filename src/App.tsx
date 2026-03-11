import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Navigate, useNavigate } from "react-router-dom";
import "./index.css";

type AuthUser = {
  email: string;
};

type Context = {
  sendMagicLink: (email: string) => Promise<boolean>;
  user: AuthUser | null;
  verifyToken: (token: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
};

const AuthContext = createContext<Context | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside an AuthProvider");
  }

  return context;
};

const AUTH_API_BASE =
  (typeof process !== "undefined" &&
  process.env &&
  process.env.BUN_PUBLIC_AUTH_WORKER_URL
    ? process.env.BUN_PUBLIC_AUTH_WORKER_URL
    : undefined) ?? "/auth";
const AUTH_TOKEN_STORAGE_KEY = "authToken";
const AUTH_EMAIL_STORAGE_KEY = "authEmail";

type SessionValidationState = "valid" | "invalid" | "unreachable";

async function getAuthError(
  response: Response,
  fallback: string
): Promise<string> {
  try {
    const data = (await response.json()) as { error?: string; details?: string };

    if (response.status === 401) {
      return "This login link is invalid or has expired. Request a new one.";
    }

    return data.error || data.details || fallback;
  } catch {
    if (response.status === 401) {
      return "This login link is invalid or has expired. Request a new one.";
    }

    return fallback;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const clearStoredSession = useCallback(() => {
    localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
    localStorage.removeItem(AUTH_EMAIL_STORAGE_KEY);
    setUser(null);
  }, []);

  const validateSession = useCallback(async (token: string) => {
    let response: Response;

    try {
      response = await fetch(`${AUTH_API_BASE}/validate`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error("Session validation error:", error);
      return "unreachable" as const;
    }

    if (!response.ok) {
      console.error("Session validation failed:", response.status);
      return "unreachable" as const;
    }

    try {
      const data = (await response.json()) as { valid?: boolean; email?: string };

      if (data.valid && data.email) {
        localStorage.setItem(AUTH_EMAIL_STORAGE_KEY, data.email);
        setUser({ email: data.email });
        return "valid" as const;
      }
    } catch (error) {
      console.error("Session validation parsing error:", error);
      return "unreachable" as const;
    }

    clearStoredSession();
    return "invalid" as const;
  }, [clearStoredSession]);

  useEffect(() => {
    const token = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
    const cachedEmail = localStorage.getItem(AUTH_EMAIL_STORAGE_KEY);

    if (!token) {
      setLoading(false);
      return;
    }

    if (cachedEmail) {
      setUser({ email: cachedEmail });
      setLoading(false);
      void validateSession(token);
      return;
    }

    void validateSession(token).finally(() => setLoading(false));
  }, [validateSession]);

  const sendMagicLink = useCallback(async (email: string) => {
    let response: Response;

    try {
      response = await fetch(`${AUTH_API_BASE}/send-magic-link`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });
    } catch {
      throw new Error("Could not reach the auth service. Check your connection and try again.");
    }

    if (!response.ok) {
      throw new Error(await getAuthError(response, "Failed to send magic link"));
    }

    return true;
  }, []);

  const verifyToken = useCallback(async (token: string) => {
    let response: Response;

    try {
      response = await fetch(`${AUTH_API_BASE}/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });
    } catch {
      throw new Error("Could not reach the auth service. Check your connection and try again.");
    }

    if (!response.ok) {
      throw new Error(await getAuthError(response, "Invalid token"));
    }

    const data = (await response.json()) as { token: string; email: string };
    localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, data.token);
    localStorage.setItem(AUTH_EMAIL_STORAGE_KEY, data.email);
    setUser({ email: data.email });

    return true;
  }, []);

  const logout = useCallback(() => {
    clearStoredSession();
  }, [clearStoredSession]);

  const value = useMemo(
    () => ({
      user,
      loading,
      sendMagicLink,
      verifyToken,
      logout,
    }),
    [loading, logout, sendMagicLink, user, verifyToken]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  );
  const [error, setError] = useState("");
  const { sendMagicLink } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    setError("");

    try {
      await sendMagicLink(email);
      setStatus("sent");
    } catch (err) {
      console.error(err);
      setStatus("error");
      setError((err as Error).message);
    }
  };

  if (status === "sent") {
    return (
      <div className="max-w-md mx-auto rounded-lg bg-white p-6 shadow-md">
        <div className="text-center">
          <svg
            className="mx-auto mb-4 h-16 w-16 text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          <h2 className="mb-2 text-2xl font-bold">Check your email!</h2>
          <p className="mb-4 text-gray-600">
            We sent a magic link to <strong>{email}</strong>
          </p>
          <p className="text-sm text-gray-500">
            Click the link in the email to log in. The link expires in 10
            minutes.
          </p>
          <button
            onClick={() => {
              setStatus("idle");
              setEmail("");
            }}
            className="mt-4 text-sm text-blue-600 hover:text-blue-700"
          >
            Try a different email
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md rounded-lg bg-white p-6 shadow-md">
      <h2 className="mb-6 text-2xl font-bold">Sign in with email</h2>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label
            htmlFor="email"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Email address
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="you@example.com"
          />
        </div>

        {error && (
          <div className="mb-4 rounded border border-red-400 bg-red-100 p-3 text-red-700">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={status === "sending"}
          className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {status === "sending" ? "Sending..." : "Send magic link"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-gray-600">
        We&apos;ll email you a magic link for a password-free sign in.
      </p>
    </div>
  );
}

export function AuthCallback() {
  const [status, setStatus] = useState<"verifying" | "success" | "error">(
    "verifying"
  );
  const [error, setError] = useState("");
  const { verifyToken } = useAuth();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(window.location.search);
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setError("No token provided");
      return;
    }

    let redirectTimer: number | undefined;

    void verifyToken(token)
      .then(() => {
        setStatus("success");
        redirectTimer = window.setTimeout(() => {
          navigate("/chessboard", { replace: true });
        }, 1000);
      })
      .catch((err) => {
        setStatus("error");
        setError((err as Error).message);
      });

    return () => {
      if (redirectTimer) {
        window.clearTimeout(redirectTimer);
      }
    };
  }, [navigate, token, verifyToken]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 text-center shadow-md">
        {status === "verifying" && (
          <>
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
            <p className="text-gray-600">Verifying your login...</p>
          </>
        )}

        {status === "success" && (
          <>
            <svg
              className="mx-auto mb-4 h-16 w-16 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <h2 className="mb-2 text-2xl font-bold text-gray-900">Success!</h2>
            <p className="text-gray-600">You&apos;re now logged in. Redirecting...</p>
          </>
        )}

        {status === "error" && (
          <>
            <svg
              className="mx-auto mb-4 h-16 w-16 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h2 className="mb-2 text-2xl font-bold text-gray-900">
              Login failed
            </h2>
            <p className="mb-4 text-gray-600">{error}</p>
            <a href="/login" className="text-blue-600 hover:text-blue-700">
              Try logging in again
            </a>
          </>
        )}
      </div>
    </div>
  );
}

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default function App() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {user ? (
        <div className="p-8">
          <div className="mx-auto max-w-4xl">
            <div className="rounded-lg bg-white p-6 shadow">
              <h1 className="mb-4 text-2xl font-bold">Welcome!</h1>
              <p className="mb-4 text-gray-600">
                You&apos;re logged in as: <strong>{user.email}</strong>
              </p>
              <button
                onClick={logout}
                className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
              >
                Log out
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="pt-20">
          <LoginForm />
        </div>
      )}
    </div>
  );
}
