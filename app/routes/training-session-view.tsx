import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { ButtonSecondary } from "~/components/button";
import { ConfirmDialog } from "~/components/confirm-dialog";
import { FeedbackBanner, type FeedbackState } from "~/components/feedback-banner";
import { Paths } from "~/routes";
import { TrainingSessionService } from "~/services/training-session-service";
import type { TrainingSession } from "~/types/training-session";
import { handleError } from "~/utils/errors";

const sessionService = new TrainingSessionService();

export default function SessaoConsultaPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [session, setSession] = useState<TrainingSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;
    sessionService
      .findOne(id)
      .then(setSession)
      .catch((err) => setFeedback({ type: "error", message: handleError(err, "Erro ao carregar sessão.") }))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleDelete() {
    if (!id) return;
    setDeleting(true);
    try {
      await sessionService.remove(id);
      navigate(Paths.session);
    } catch (err) {
      setFeedback({ type: "error", message: handleError(err, "Erro ao excluir sessão.") });
      setDeleting(false);
    }
  }

  if (loading) return <p className="text-center text-gray-400 mt-20">Carregando...</p>;
  if (!session && !feedback) return <p className="text-center text-red-500 mt-20">Sessão não encontrada.</p>;

  return (
    <>
      <ConfirmDialog
        open={confirmDelete}
        title="Excluir sessão"
        description="Tem certeza que deseja excluir esta sessão? Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
        variant="danger"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <FeedbackBanner feedback={feedback} />

        {session && (
          <>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {session.trainTitle || session.trainId}
                </h1>
                <p className="text-gray-500 mt-1">{session.divisionName}</p>
                <p className="text-sm text-gray-400 mt-0.5">
                  {new Date(session.date).toLocaleDateString("pt-BR", {
                    weekday: "long", day: "numeric", month: "long", year: "numeric",
                  })}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {(session.seriesEntries ?? []).map((entry, gi) => {
                const firstSetExercises = entry.sets[0]?.exercises ?? [];
                const exerciseNames =
                  firstSetExercises.map((ex) => ex.exerciseName).join(" + ") || `Série ${gi + 1}`;
                return (
                  <div key={gi} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                    <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                      <p className="font-semibold text-gray-900 text-sm">{exerciseNames}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{entry.sets.length} séries</p>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm min-w-[300px]">
                        <thead>
                          <tr className="border-b border-gray-100 text-xs text-gray-400">
                            <th className="px-4 py-2.5 text-left font-medium w-10">#</th>
                            {firstSetExercises.map((ex, ei) => (
                              <th key={ei} colSpan={2} className="px-3 py-2.5 text-left font-medium border-l border-gray-100">
                                {ex.exerciseName}
                              </th>
                            ))}
                          </tr>
                          <tr className="border-b border-gray-50 bg-gray-50/50 text-xs text-gray-400">
                            <th className="px-4 py-1" />
                            {firstSetExercises.map((_, ei) => (
                              <>
                                <th key={`kg-${ei}`} className="px-3 py-1 text-left font-normal border-l border-gray-100">kg</th>
                                <th key={`rp-${ei}`} className="px-3 py-1 text-left font-normal">reps</th>
                              </>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {(entry.sets ?? []).map((setRecord, si) => (
                            <tr key={si} className="hover:bg-gray-50/50">
                              <td className="px-4 py-2.5 text-gray-400 text-xs font-medium">{si + 1}</td>
                              {(setRecord.exercises ?? []).map((ex, ei) => (
                                <>
                                  <td key={`w-${ei}`} className="px-3 py-2.5 border-l border-gray-100 text-gray-900">
                                    {ex.weight || "—"}
                                  </td>
                                  <td key={`r-${ei}`} className="px-3 py-2.5 text-gray-900">
                                    {ex.reps || "—"}
                                  </td>
                                </>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center gap-3">
              <Link to={Paths.sessaoFormulario.replace(":id", id!)}>
                <ButtonSecondary className="text-sm">Editar</ButtonSecondary>
              </Link>
              <button
                onClick={() => setConfirmDelete(true)}
                className="text-sm text-red-500 hover:text-red-700 font-medium px-4 py-3 rounded-xl hover:bg-red-50 transition-colors"
              >
                Excluir sessão
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
