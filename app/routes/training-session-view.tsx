import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { ButtonSecondary } from "~/components/button";
import { Paths } from "~/routes";
import { TrainingSessionService } from "~/services/training-session-service";
import type { TrainingSession } from "~/types/training-session";

export default function SessaoConsultaPage() {
  const { id } = useParams<{ id: string }>();
  const [session, setSession] = useState<TrainingSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    new TrainingSessionService()
      .findOne(id)
      .then(setSession)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <p className="text-center text-gray-500">Carregando sessão...</p>;
  }

  if (!session) {
    return <p className="text-center text-red-500">Sessão não encontrada.</p>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-xl font-semibold">Sessão de Treino</h1>

      <div className="text-sm text-gray-600">
        <p>
          <strong>Divisão:</strong> {session.divisionName}
        </p>

        <p>
          <strong>Data:</strong>{" "}
          {new Date(session.date).toLocaleDateString("pt-BR")}
        </p>
      </div>

      {session.exercises.map((exercise, exIndex) => (
        <div key={exIndex} className="border-t pt-4">
          <h2 className="font-medium mb-2">{exercise.name}</h2>

          {exercise.series.map((serie, serieIndex) => (
            <div
              key={serieIndex}
              className="grid grid-cols-3 gap-2 items-center text-sm mb-2"
            >
              <span>Série {serieIndex + 1}</span>
              <span>Peso: {serie.weight || "-"}</span>
              <span>Reps: {serie.reps || "-"}</span>
            </div>
          ))}
        </div>
      ))}

      <Link to={Paths.sessaoFormulario.replace(":id", id!)}>
        <ButtonSecondary>Editar</ButtonSecondary>
      </Link>
    </div>
  );
}
