import {
  isRouteErrorResponse,
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLocation,
} from "react-router";

import type { Route } from "./+types/root";
import "./app.css";
import { AuthProvider, useAuth } from "./contexts/auth";
import { ButtonPrimary, ButtonSecondary } from "./components/button";
import { Paths } from "./routes";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <AuthProvider>{children}</AuthProvider>

        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

function App2() {
  const auth = useAuth();

  if (auth.isAuth) {
    return <LayoutPadrao />;
  }

  return <LayoutLogin />;
}

function LayoutLogin() {
  const auth = useAuth();

  return (
    <main className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md max-w-sm w-full text-center">
        <h1 className="text-2xl font-bold mb-6">Bem-vindo</h1>
        <p className="mb-4 text-gray-600">Faça login para continuar</p>

        <ButtonPrimary onClick={() => auth.login()} className="w-full">
          Entrar com Google
        </ButtonPrimary>
      </div>
    </main>
  );
}

function LayoutPadrao() {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white shadow px-4 py-3 md:py-4">
        <div className="flex flex-row justify-between md:items-center gap-4">
          {/* Left: Logo + Nav */}
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6">
            <Link
              to={Paths.session}
              className="text-xl font-semibold text-gray-800"
            >
              Meus Treinos
            </Link>

            <nav className="flex gap-4 text-sm">
              <Link
                to={Paths.treinos}
                className={`hover:underline ${
                  location.pathname.includes("/treinos") ? "font-bold" : ""
                }`}
              >
                Treinos
              </Link>
            </nav>
          </div>

          {/* Right: User info */}
          <div className="flex items-center gap-3">
            {user.photoURL && (
              <img
                src={user.photoURL}
                alt="Avatar"
                className="w-8 h-8 rounded-full"
              />
            )}

            <span className="text-sm text-gray-700 truncate max-w-[120px]">
              {user.displayName}
            </span>

            <ButtonSecondary onClick={logout}>Sair</ButtonSecondary>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}

export default function App() {
  return <App2 />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
