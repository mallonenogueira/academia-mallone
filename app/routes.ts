import { type RouteConfig, index, route } from "@react-router/dev/routes";

export const Paths = {
  session: "/",
  sessaoConsulta: "/sessao/:id",
  sessaoFormularioNovo: "/sessao/novo/formulario",
  sessaoFormulario: "/sessao/:id/formulario",
  treinos: "/treinos",
  treinosFormularioNovo: "/treinos/novo",
  treinosFormulario: "/treinos/:id",
  treinosResumo: "/treinos/:id/resumo",
  exercicios: "/exercicios",
  exerciciosNovo: "/exercicios/novo",
  exerciciosFormulario: "/exercicios/:id",
  exerciciosResumo: "/exercicios/:id/resumo",
};

export default [
  index("routes/training-session-table.tsx"),
  route("/sessao/:id/formulario", "routes/training-session-form.tsx"),
  route("/sessao/:id", "routes/training-session-view.tsx"),
  route("/treinos", "routes/training-table.tsx"),
  route("/treinos/:id/resumo", "routes/training-summary.tsx"),
  route("/treinos/:id", "routes/training-form.tsx"),
  route("/exercicios", "routes/exercise-table.tsx"),
  route("/exercicios/:id/resumo", "routes/exercise-summary.tsx"),
  route("/exercicios/:id", "routes/exercise-form.tsx"),
] satisfies RouteConfig;
