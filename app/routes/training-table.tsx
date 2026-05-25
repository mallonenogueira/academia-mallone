import { useEffect, useState } from "react";
import { Link } from "react-router";
import { ButtonPrimary, ButtonSecondary, ButtonGhost } from "~/components/button";
import { ConfirmDialog } from "~/components/confirm-dialog";
import { FeedbackBanner, type FeedbackState } from "~/components/feedback-banner";
import { TrainingService } from "~/services/training-service";
import { TrainingSessionService } from "~/services/training-session-service";
import { useAuth } from "~/contexts/auth";
import { Paths } from "~/routes";
import type { Training } from "~/types/training";
import { handleError } from "~/utils/errors";

const trainingService = new TrainingService();
const sessionService = new TrainingSessionService();

type DialogState =
  | { type: "confirm"; training: Training }
  | { type: "blocked"; name: string }
  | null;

export default function TrainingTablePage() {
  const { user } = useAuth();
  const [data, setData] = useState<Training[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [dialog, setDialog] = useState<DialogState>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    trainingService
      .findAll()
      .then(setData)
      .catch((err) => setFeedback({ type: "error", message: handleError(err, "Erro ao carregar treinos.") }))
      .finally(() => setLoading(false));
  }, []);

  async function handleDeleteClick(training: Training) {
    try {
      const sessions = await sessionService.findAllByUser(user.uid!);
      const inUse = sessions.some((s) => s.trainId === training.id);
      if (inUse) {
        setDialog({ type: "blocked", name: training.title });
      } else {
        setDialog({ type: "confirm", training });
      }
    } catch (err) {
      setFeedback({ type: "error", message: handleError(err, "Erro ao verificar uso do treino.") });
    }
  }

  async function handleConfirmDelete() {
    if (dialog?.type !== "confirm") return;
    setDeleting(true);
    try {
      await trainingService.remove(dialog.training.id);
      setData((prev) => prev.filter((t) => t.id !== dialog.training.id));
      setDialog(null);
    } catch (err) {
      setFeedback({ type: "error", message: handleError(err, "Erro ao excluir treino.") });
      setDialog(null);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <ConfirmDialog
        open={dialog?.type === "confirm"}
        title="Excluir treino"
        description={`Tem certeza que deseja excluir "${dialog?.type === "confirm" ? dialog.training.title : ""}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        variant="danger"
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDialog(null)}
      />

      <ConfirmDialog
        open={dialog?.type === "blocked"}
        title="Não é possível excluir"
        description={`"${dialog?.type === "blocked" ? dialog.name : ""}" possui sessões registradas e não pode ser excluído.`}
        closeOnly
        onConfirm={() => setDialog(null)}
        onCancel={() => setDialog(null)}
      />

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Treinos</h1>
          <Link to={Paths.treinosFormularioNovo}>
            <ButtonPrimary className="py-2.5 px-4 text-sm">+ Novo treino</ButtonPrimary>
          </Link>
        </div>

        <FeedbackBanner feedback={feedback} />

        {loading ? (
          <p className="text-center text-gray-400 py-12 animate-pulse">Carregando...</p>
        ) : data.length === 0 && !feedback ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-lg mb-1">Nenhum treino cadastrado</p>
            <p className="text-sm">Crie seu primeiro treino para começar</p>
          </div>
        ) : (
          <div className="space-y-3">
            {data.map((training) => {
              const totalExercises = (training.divisions ?? []).reduce(
                (acc, d) =>
                  acc + (d.seriesGroups ?? []).reduce((a, g) => a + (g.exercises ?? []).length, 0),
                0
              );
              return (
                <div
                  key={training.id}
                  className="bg-white border border-gray-200 rounded-2xl px-5 py-4 flex items-start gap-4 shadow-sm"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900">{training.title}</p>
                    <p className="text-sm text-gray-400 mt-0.5">
                      {training.divisions?.length ?? 0} divisões · {totalExercises} exercícios
                    </p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {(training.divisions ?? []).map((d, i) => (
                        <span key={i} className="text-xs bg-gray-100 text-gray-600 rounded-md px-2 py-0.5">
                          {d.name}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5 shrink-0">
                    <Link to={Paths.treinosResumo.replace(":id", training.id)}>
                      <ButtonSecondary className="text-xs py-2 px-3 w-full">Resumo</ButtonSecondary>
                    </Link>
                    <Link to={Paths.treinosFormulario.replace(":id", training.id)}>
                      <ButtonGhost className="text-xs py-2 px-3 w-full">Editar</ButtonGhost>
                    </Link>
                    <button
                      onClick={() => handleDeleteClick(training)}
                      className="text-xs text-red-500 hover:text-red-700 font-medium py-2 px-3 rounded-lg hover:bg-red-50 transition-colors text-center"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
