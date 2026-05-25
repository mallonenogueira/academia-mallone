import { useEffect, useState } from "react";
import { Link } from "react-router";
import { ButtonPrimary, ButtonSecondary, ButtonGhost } from "~/components/button";
import { ConfirmDialog } from "~/components/confirm-dialog";
import { FeedbackBanner, type FeedbackState } from "~/components/feedback-banner";
import { ExerciseService } from "~/services/exercise-service";
import { TrainingService } from "~/services/training-service";
import { Paths } from "~/routes";
import type { Exercise } from "~/types/exercise";
import { handleError } from "~/utils/errors";

const exerciseService = new ExerciseService();
const trainingService = new TrainingService();

type DialogState =
  | { type: "confirm"; exercise: Exercise }
  | { type: "blocked"; name: string }
  | null;

const GROUP_COLORS: Record<string, string> = {
  Peito: "bg-blue-50 text-blue-700",
  Costas: "bg-emerald-50 text-emerald-700",
  Ombros: "bg-violet-50 text-violet-700",
  Bíceps: "bg-orange-50 text-orange-700",
  Tríceps: "bg-rose-50 text-rose-700",
  Antebraço: "bg-lime-50 text-lime-700",
  Pernas: "bg-cyan-50 text-cyan-700",
  Glúteos: "bg-pink-50 text-pink-700",
  Abdômen: "bg-yellow-50 text-yellow-700",
  Panturrilha: "bg-indigo-50 text-indigo-700",
  Cardio: "bg-red-50 text-red-700",
};

export default function ExerciseTablePage() {
  const [data, setData] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [dialog, setDialog] = useState<DialogState>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    exerciseService
      .findAll()
      .then(setData)
      .catch((err) => setFeedback({ type: "error", message: handleError(err, "Erro ao carregar exercícios.") }))
      .finally(() => setLoading(false));
  }, []);

  async function handleDeleteClick(exercise: Exercise) {
    try {
      const trainings = await trainingService.findAll();
      const inUse = trainings.some((t) =>
        (t.divisions ?? []).some((d) =>
          (d.seriesGroups ?? []).some((g) =>
            (g.exercises ?? []).some((e) => e.exerciseId === exercise.id)
          )
        )
      );
      if (inUse) {
        setDialog({ type: "blocked", name: exercise.name });
      } else {
        setDialog({ type: "confirm", exercise });
      }
    } catch (err) {
      setFeedback({ type: "error", message: handleError(err, "Erro ao verificar uso do exercício.") });
    }
  }

  async function handleConfirmDelete() {
    if (dialog?.type !== "confirm") return;
    setDeleting(true);
    try {
      await exerciseService.remove(dialog.exercise.id);
      setData((prev) => prev.filter((e) => e.id !== dialog.exercise.id));
      setDialog(null);
    } catch (err) {
      setFeedback({ type: "error", message: handleError(err, "Erro ao excluir exercício.") });
      setDialog(null);
    } finally {
      setDeleting(false);
    }
  }

  const filtered = data.filter(
    (e) =>
      e.name.toLowerCase().includes(filter.toLowerCase()) ||
      e.muscleGroup.toLowerCase().includes(filter.toLowerCase())
  );

  const grouped = filtered.reduce<Record<string, Exercise[]>>((acc, e) => {
    if (!acc[e.muscleGroup]) acc[e.muscleGroup] = [];
    acc[e.muscleGroup].push(e);
    return acc;
  }, {});

  return (
    <>
      <ConfirmDialog
        open={dialog?.type === "confirm"}
        title="Excluir exercício"
        description={`Tem certeza que deseja excluir "${dialog?.type === "confirm" ? dialog.exercise.name : ""}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        variant="danger"
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDialog(null)}
      />

      <ConfirmDialog
        open={dialog?.type === "blocked"}
        title="Não é possível excluir"
        description={`"${dialog?.type === "blocked" ? dialog.name : ""}" está sendo utilizado em um ou mais treinos e não pode ser excluído.`}
        closeOnly
        onConfirm={() => setDialog(null)}
        onCancel={() => setDialog(null)}
      />

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Exercícios</h1>
          <Link to={Paths.exerciciosNovo}>
            <ButtonPrimary className="py-2.5 px-4 text-sm">+ Novo exercício</ButtonPrimary>
          </Link>
        </div>

        <FeedbackBanner feedback={feedback} />

        <input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Buscar exercício ou grupo muscular..."
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900"
        />

        {loading ? (
          <p className="text-center text-gray-400 py-12 animate-pulse">Carregando...</p>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-lg mb-1">Nenhum exercício encontrado</p>
            {data.length === 0 && <p className="text-sm">Cadastre o primeiro exercício para começar</p>}
          </div>
        ) : (
          <div className="space-y-5">
            {Object.entries(grouped)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([group, exercises]) => (
                <div key={group}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${GROUP_COLORS[group] ?? "bg-gray-100 text-gray-600"}`}>
                      {group}
                    </span>
                    <span className="text-xs text-gray-400">{exercises.length}</span>
                  </div>
                  <div className="space-y-1.5">
                    {exercises.map((exercise) => (
                      <div
                        key={exercise.id}
                        className="bg-white border border-gray-200 rounded-xl px-4 py-3.5 flex items-center gap-3"
                      >
                        <p className="flex-1 font-medium text-gray-900 text-sm">{exercise.name}</p>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <Link to={Paths.exerciciosResumo.replace(":id", exercise.id)}>
                            <ButtonSecondary className="text-xs py-1.5 px-3">Resumo</ButtonSecondary>
                          </Link>
                          <Link to={Paths.exerciciosFormulario.replace(":id", exercise.id)}>
                            <ButtonGhost className="text-xs py-1.5 px-3">Editar</ButtonGhost>
                          </Link>
                          <button
                            onClick={() => handleDeleteClick(exercise)}
                            className="text-xs text-red-500 hover:text-red-700 font-medium py-1.5 px-3 rounded-lg hover:bg-red-50 transition-colors"
                          >
                            Excluir
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </>
  );
}
