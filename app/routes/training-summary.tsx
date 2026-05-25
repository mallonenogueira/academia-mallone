import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { TrainingService } from "~/services/training-service";
import { TrainingSessionService } from "~/services/training-session-service";
import { ButtonSecondary } from "~/components/button";
import { FeedbackBanner, type FeedbackState } from "~/components/feedback-banner";
import { Paths } from "~/routes";
import type { Training } from "~/types/training";
import type { TrainingSession } from "~/types/training-session";
import { handleError } from "~/utils/errors";

const trainingService = new TrainingService();
const sessionService = new TrainingSessionService();

export default function TrainingSummaryPage() {
  const { id } = useParams<{ id: string }>();
  const [training, setTraining] = useState<Training | null>(null);
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<FeedbackState>(null);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      trainingService.findOne(id),
      sessionService.findAll(),
    ])
      .then(([t, all]) => {
        setTraining(t);
        setSessions(all.filter((s) => s.trainId === id).sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        ));
      })
      .catch((err) => setFeedback({ type: "error", message: handleError(err, "Erro ao carregar resumo do treino.") }))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="text-center text-gray-400 mt-20">Carregando...</p>;

  if (feedback && !training) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6">
        <FeedbackBanner feedback={feedback} />
      </div>
    );
  }

  if (!training) return <p className="text-center text-red-500 mt-20">Treino não encontrado.</p>;

  const totalExercises = training.divisions.reduce(
    (acc, d) => acc + (d.seriesGroups ?? []).reduce((a, g) => a + (g.exercises ?? []).length, 0),
    0
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <FeedbackBanner feedback={feedback} />

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{training.title}</h1>
          <p className="text-sm text-gray-400 mt-1">
            {training.divisions.length} divisões · {totalExercises} exercícios
          </p>
        </div>
        <Link to={Paths.treinosFormulario.replace(":id", id!)}>
          <ButtonSecondary className="text-sm py-2 px-4">Editar</ButtonSecondary>
        </Link>
      </div>

      {/* Divisions overview */}
      <div className="space-y-3">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Estrutura</h2>
        {training.divisions.map((div, di) => (
          <div key={di} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100">
              <p className="font-semibold text-gray-900 text-sm">{div.name}</p>
            </div>
            <div className="px-4 py-3 space-y-2">
              {(div.seriesGroups ?? []).map((g, gi) => (
                <div key={gi} className="flex items-start gap-3">
                  <p className="text-sm text-gray-700 flex-1">
                    {(g.exercises ?? []).map((e) => e.exerciseName).join(" + ")}
                  </p>
                  <span className="text-xs font-medium text-gray-400 bg-gray-100 rounded px-1.5 py-0.5 shrink-0">
                    {g.sets} séries
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Session history */}
      <div className="space-y-2">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
          Histórico ({sessions.length} sessões)
        </h2>
        {sessions.length === 0 ? (
          <p className="text-sm text-gray-400 py-4">Nenhuma sessão registrada ainda.</p>
        ) : (
          sessions.map((s) => (
            <Link
              key={s.id}
              to={Paths.sessaoConsulta.replace(":id", s.id)}
              className="flex items-center justify-between bg-white border border-gray-200 rounded-xl px-4 py-3.5 hover:bg-gray-50 transition-colors"
            >
              <p className="text-sm font-medium text-gray-900">{s.divisionName}</p>
              <span className="text-xs text-gray-400">
                {new Date(s.date).toLocaleDateString("pt-BR")}
              </span>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
