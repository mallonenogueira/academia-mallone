import { type RouteConfig, index, route } from "@react-router/dev/routes";

export const Paths = {
  session: "/",
  sessaoConsulta: "/sessao/:id",
  sessaoFormularioNovo: "/sessao/novo/formulario",
  sessaoFormulario: "/sessao/:id/formulario",
  treinos: "/treinos",
  treinosFormularioNovo: "/treinos/novo",
  treinosFormulario: "/treinos/:id",
};

export default [
  index("routes/training-session-table.tsx"),
  route("/sessao/:id/formulario", "routes/training-session-form.tsx"),
  route("/sessao/:id", "routes/training-session-view.tsx"),
  route("/treinos", "routes/training-table.tsx"),
  route("/treinos/:id", "routes/training-form.tsx"),
] satisfies RouteConfig;
