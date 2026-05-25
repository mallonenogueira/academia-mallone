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
import { ButtonPrimary } from "./components/button";
import { Paths } from "./routes";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
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
  return auth.isAuth ? <LayoutPadrao /> : <LayoutLogin />;
}

function LayoutLogin() {
  const auth = useAuth();
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 max-w-sm w-full text-center">
        <div className="w-12 h-12 bg-gray-900 rounded-2xl mx-auto mb-6 flex items-center justify-center">
          <span className="text-white font-bold text-lg">M</span>
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Meus Treinos</h1>
        <p className="text-sm text-gray-400 mb-6">Registre seus treinos e acompanhe sua evolução.</p>
        <ButtonPrimary onClick={() => auth.login()} className="w-full">
          Entrar com Google
        </ButtonPrimary>
      </div>
    </main>
  );
}

const NAV_LINKS = [
  { to: Paths.session, label: "Sessões", match: (p: string) => p === "/" },
  { to: Paths.treinos, label: "Treinos", match: (p: string) => p.startsWith("/treinos") },
  { to: Paths.exercicios, label: "Exercícios", match: (p: string) => p.startsWith("/exercicios") },
];

function LayoutPadrao() {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 flex items-center justify-between h-14">
          <div className="flex items-center gap-6">
            <Link to={Paths.session} className="font-bold text-gray-900 text-base">
              Meus Treinos
            </Link>
            <nav className="hidden sm:flex items-center gap-1">
              {NAV_LINKS.map(({ to, label, match }) => (
                <Link
                  key={to}
                  to={to}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    match(location.pathname)
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {user.photoURL && (
              <img src={user.photoURL} alt="Avatar" className="w-7 h-7 rounded-full" />
            )}
            <button
              onClick={logout}
              className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
            >
              Sair
            </button>
          </div>
        </div>

        {/* Mobile bottom nav */}
        <nav className="sm:hidden flex border-t border-gray-100">
          {NAV_LINKS.map(({ to, label, match }) => (
            <Link
              key={to}
              to={to}
              className={`flex-1 py-2.5 text-center text-xs font-medium transition-colors ${
                match(location.pathname)
                  ? "text-gray-900 border-t-2 border-gray-900 -mt-px"
                  : "text-gray-400"
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>
      </header>

      <main className="flex-1">
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
  let details = "Ocorreu um erro inesperado.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Erro";
    details =
      error.status === 404
        ? "Página não encontrada."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 max-w-2xl mx-auto text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-2">{message}</h1>
      <p className="text-gray-500">{details}</p>
      {stack && (
        <pre className="mt-6 text-left text-xs bg-gray-100 rounded-xl p-4 overflow-x-auto">
          {stack}
        </pre>
      )}
    </main>
  );
}
