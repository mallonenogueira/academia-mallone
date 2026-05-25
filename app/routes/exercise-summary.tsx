import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { ExerciseService } from "~/services/exercise-service";
import { TrainingSessionService } from "~/services/training-session-service";
import { ButtonSecondary } from "~/components/button";
import { FeedbackBanner, type FeedbackState } from "~/components/feedback-banner";
import { Paths } from "~/routes";
import type { Exercise } from "~/types/exercise";
import type { TrainingSession } from "~/types/training-session";
import { handleError } from "~/utils/errors";

const exerciseService = new ExerciseService();
const sessionService = new TrainingSessionService();

type HistoryEntry = {
  session: TrainingSession;
  sets: { weight: string; reps: string }[];
};

export default function ExerciseSummaryPage() {
  const { id } = useParams<{ id: string }>();
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<FeedbackState>(null);

  useEffect(() => {
    if (!id) return;
    Promise.all([exerciseService.findOne(id), sessionService.findAll()])
      .then(([ex, sessions]) => {
        setExercise(ex);
        const entries: HistoryEntry[] = [];
        for (const session of sessions) {
          for (const seriesEntry of session.seriesEntries ?? []) {
            const firstSetExercises = seriesEntry.sets[0]?.exercises ?? [];
            const exIdx = firstSetExercises.findIndex((e) => e.exerciseId === id);
            if (exIdx === -1) continue;
            const sets = seriesEntry.sets.map((setRecord) => ({
              weight: setRecord.exercises[exIdx]?.weight ?? "",
              reps: setRecord.exercises[exIdx]?.reps ?? "",
            }));
            entries.push({ session, sets });
          }
        }
        entries.sort(
          (a, b) => new Date(b.session.date).getTime() - new Date(a.session.date).getTime()
        );
        setHistory(entries);
      })
      .catch((err) => setFeedback({ type: "error", message: handleError(err, "Erro ao carregar resumo do exercício.") }))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="text-center text-gray-400 mt-20">Carregando...</p>;

  if (feedback && !exercise) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6">
        <FeedbackBanner feedback={feedback} />
      </div>
    );
  }

  if (!exercise) return <p className="text-center text-red-500 mt-20">Exercício não encontrado.</p>;

  const maxWeight =
    history.length > 0
      ? Math.max(...history.flatMap((h) => h.sets.map((s) => parseFloat(s.weight) || 0)))
      : null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <FeedbackBanner feedback={feedback} />

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{exercise.name}</h1>
          <p className="text-sm text-gray-400 mt-1">{exercise.muscleGroup}</p>
        </div>
        <Link to={Paths.exerciciosFormulario.replace(":id", id!)}>
          <ButtonSecondary className="text-sm py-2 px-4">Editar</ButtonSecondary>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white border border-gray-200 rounded-xl px-4 py-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{history.length}</p>
          <p className="text-xs text-gray-400 mt-1">Aparições</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl px-4 py-4 text-center">
          <p className="text-2xl font-bold text-gray-900">
            {maxWeight != null && maxWeight > 0 ? `${maxWeight}kg` : "—"}
          </p>
          <p className="text-xs text-gray-400 mt-1">Peso máximo</p>
        </div>
      </div>

      {/* History */}
      <div className="space-y-2">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
          Histórico ({history.length})
        </h2>
        {history.length === 0 ? (
          <p className="text-sm text-gray-400 py-4">Este exercício ainda não foi registrado em nenhuma sessão.</p>
        ) : (
          history.map((h, i) => (
            <Link
              key={i}
              to={Paths.sessaoConsulta.replace(":id", h.session.id)}
              className="block bg-white border border-gray-200 rounded-xl px-4 py-3.5 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-900">
                  {h.session.trainTitle} — {h.session.divisionName}
                </p>
                <span className="text-xs text-gray-400">
                  {new Date(h.session.date).toLocaleDateString("pt-BR")}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {h.sets.map((s, si) => (
                  <span
                    key={si}
                    className="text-xs bg-gray-100 text-gray-600 rounded-lg px-2 py-1"
                  >
                    {s.weight || "—"}kg × {s.reps || "—"}
                  </span>
                ))}
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
