import React, { useEffect, useState } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import DataTable from "~/components/datatable";
import { Link } from "react-router";
import { TrainingService } from "~/services/training-service";
import type { Training } from "~/types/training";
import { Paths } from "~/routes";
import { ButtonPrimary, ButtonSecondary } from "~/components/button";

const columnHelper = createColumnHelper<Training>();

const columns = [
  columnHelper.accessor("id", {
    header: "Id",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("title", {
    header: "Título",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor((row) => row.divisions.length, {
    id: "divisionCount",
    header: "Divisões",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor(
    (row) => row.divisions.reduce((acc, d) => acc + d.exercises.length, 0),
    {
      id: "totalExercises",
      header: "Exercícios Totais",
      cell: (info) => info.getValue(),
    }
  ),
  columnHelper.accessor("id", {
    id: "actions",
    header: "",
    cell: (info) => (
      <Link tabIndex={-1} to={Paths.treinosFormulario.replace(":id", info.getValue())}>
        <ButtonSecondary>Editar</ButtonSecondary>
      </Link>
    ),
  }),
];

const TrainingListPage: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    new TrainingService()
      .findAll()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-semibold text-center mb-6">Treinos</h1>

      <Link tabIndex={-1} to={Paths.treinosFormularioNovo}>
        <ButtonPrimary>Novo treino</ButtonPrimary>
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
