import React, { useEffect, useState } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import DataTable from "~/components/datatable";
import { Link } from "react-router";
import { Paths } from "~/routes";
import { ButtonPrimary, ButtonSecondary } from "~/components/button";
import { TrainingSessionService } from "~/services/training-session-service";
import { useAuth } from "~/contexts/auth";
import type { TrainingSession } from "~/types/training-session";

const columnHelper = createColumnHelper<TrainingSession>();

const columns = [
  columnHelper.accessor("id", {
    header: "Id",
  }),
  columnHelper.accessor("trainId", {
    header: "Treino",
  }),
  columnHelper.accessor("divisionName", {
    header: "Nome",
  }),
  columnHelper.accessor("date", {
    header: "Data",
    cell: (info) =>
      new Date(info.getValue()).toLocaleDateString("pt-BR") +
      " " +
      new Date(info.getValue()).toLocaleTimeString("pt-BR"),
  }),
  columnHelper.accessor("id", {
    id: "actions",
    header: "",
    cell: (info) => (
      <Link to={Paths.sessaoConsulta.replace(":id", info.getValue())}>
        <ButtonSecondary>Consulta</ButtonSecondary>
      </Link>
    ),
  }),
];

const TrainingListPage: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const auth = useAuth();

  useEffect(() => {
    new TrainingSessionService()
      .findAllByUser(auth.user.uid!)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-semibold text-center mb-6">
        Sessões de treino
      </h1>

      <Link to={Paths.sessaoFormularioNovo}>
        <ButtonPrimary>Nova sessão</ButtonPrimary>
      </Link>

      <div className="mb-4"></div>

      {loading ? (
        <p className="text-center text-gray-500">Carregando...</p>
      ) : (
        <DataTable columns={columns} data={data} />
      )}
    </div>
  );
};

export default TrainingListPage;
