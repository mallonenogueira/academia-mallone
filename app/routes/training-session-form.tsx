import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { TrainingService } from "~/services/training-service";
import { TrainingSessionService } from "~/services/training-session-service";
import type { Training } from "~/types/training";
import type { SessionSeriesEntry } from "~/types/training-session";
import { useAuth } from "~/contexts/auth";
import { Label } from "~/components/label";
import { Select } from "~/components/select";
import { ButtonPrimary } from "~/components/button";
import { FeedbackBanner, type FeedbackState } from "~/components/feedback-banner";
import { Paths } from "~/routes";
import { handleError } from "~/utils/errors";

const trainingService = new TrainingService();
const sessionService = new TrainingSessionService();

export default function SessaoTreinoPage() {
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = !id || id === "novo";

  const [trains, setTrains] = useState<Training[]>([]);
  const [selectedTrainingId, setSelectedTrainingId] = useState("");
  const [selectedDivisionIndex, setSelectedDivisionIndex] = useState<number | null>(null);
  const [seriesEntries, setSeriesEntries] = useState<SessionSeriesEntry[]>([]);
  const [lastDate, setLastDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingPrev, setLoadingPrev] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState>(null);

  useEffect(() => {
    trainingService
      .findAll()
      .then(setTrains)
      .catch((err) => setFeedback({ type: "error", message: handleError(err, "Erro ao carregar treinos.") }));
  }, []);

  useEffect(() => {
    if (isNew || !id) return;
    setLoading(true);
    sessionService
      .findOne(id)
      .then((session) => {
        if (!session) { setFeedback({ type: "error", message: "Sessão não encontrada." }); return; }
        setSelectedTrainingId(session.trainId);
        const training = trains.find((t) => t.id === session.trainId);
        const idx = training?.divisions.findIndex((d) => d.name === session.divisionName) ?? -1;
        if (idx !== -1) setSelectedDivisionIndex(idx);
        setSeriesEntries(session.seriesEntries ?? []);
        setLastDate(new Date(session.date).toLocaleDateString("pt-BR"));
      })
      .catch((err) => setFeedback({ type: "error", message: handleError(err, "Erro ao carregar sessão.") }))
      .finally(() => setLoading(false));
  }, [id, isNew, trains]);

  useEffect(() => {
    if (!isNew || !selectedTrainingId || selectedDivisionIndex === null) return;
    const training = trains.find((t) => t.id === selectedTrainingId);
    const division = training?.divisions[selectedDivisionIndex];
    if (!division?.seriesGroups?.length) return;

    setLoadingPrev(true);
    sessionService
      .findLastSessionForDivision(user.uid!, division.name)
      .then((lastSession) => {
        setLastDate(lastSession ? new Date(lastSession.date).toLocaleDateString("pt-BR") : "");

        const entries: SessionSeriesEntry[] = division.seriesGroups.map((group, gi) => {
          const prevEntry = lastSession?.seriesEntries?.[gi];
          return {
            sets: Array(group.sets)
              .fill(null)
              .map((_, si) => ({
                exercises: (group.exercises ?? []).map((ex, ei) => ({
                  exerciseId: ex.exerciseId,
                  exerciseName: ex.exerciseName,
                  weight: "",
                  reps: "",
                  previousWeight: prevEntry?.sets[si]?.exercises[ei]?.weight ?? "",
                  previousReps: prevEntry?.sets[si]?.exercises[ei]?.reps ?? "",
                })),
              })),
          };
        });
        setSeriesEntries(entries);
      })
      .catch((err) => setFeedback({ type: "error", message: handleError(err, "Erro ao carregar sessão anterior.") }))
      .finally(() => setLoadingPrev(false));
  }, [selectedTrainingId, selectedDivisionIndex, isNew]);

  function handleInput(
    groupIdx: number,
    setIdx: number,
    exIdx: number,
    field: "weight" | "reps",
    value: string
  ) {
    setSeriesEntries((prev) =>
      prev.map((entry, gi) => {
        if (gi !== groupIdx) return entry;
        return {
          sets: entry.sets.map((setRecord, si) => {
            if (si !== setIdx) return setRecord;
            return {
              exercises: setRecord.exercises.map((ex, ei) =>
                ei === exIdx ? { ...ex, [field]: value } : ex
              ),
            };
          }),
        };
      })
    );
  }

  async function handleSave() {
    const training = trains.find((t) => t.id === selectedTrainingId);
    const payload = {
      userId: user.uid!,
      trainId: selectedTrainingId,
      trainTitle: training?.title ?? "",
      divisionName: training?.divisions[selectedDivisionIndex!]?.name ?? "",
      date: new Date().toISOString(),
      seriesEntries,
    };

    setSaving(true);
    try {
      if (isNew) {
        await sessionService.create(payload);
        navigate(Paths.session);
      } else {
        await sessionService.update(id!, payload);
        setFeedback({ type: "success", message: "Sessão atualizada!" });
      }
    } catch (err) {
      setFeedback({ type: "error", message: handleError(err, "Erro ao salvar sessão.") });
    } finally {
      setSaving(false);
    }
  }

  const selectedTraining = trains.find((t) => t.id === selectedTrainingId);

  if (loading) return <p className="text-center text-gray-400 mt-20">Carregando...</p>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6 pb-24">
      <h1 className="text-2xl font-bold text-gray-900">
        {isNew ? "Nova sessão" : "Editar sessão"}
      </h1>

      <FeedbackBanner feedback={feedback} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="treino">Treino</Label>
          <Select
            id="treino"
            value={selectedTrainingId}
            onChange={(e) => {
              setSelectedTrainingId(e.target.value);
              setSelectedDivisionIndex(null);
              setSeriesEntries([]);
              setLastDate("");
            }}
          >
            <option value="">Selecione</option>
            {trains.map((t) => (
              <option key={t.id} value={t.id}>{t.title}</option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="divisao">Divisão</Label>
          <Select
            id="divisao"
            value={selectedDivisionIndex ?? ""}
            disabled={!selectedTrainingId}
            onChange={(e) => setSelectedDivisionIndex(Number(e.target.value))}
          >
            <option value="">Selecione</option>
            {selectedTraining?.divisions.map((d, idx) => (
              <option key={idx} value={idx}>{d.name}</option>
            ))}
          </Select>
        </div>
      </div>

      {lastDate && (
        <p className="text-sm text-gray-400">
          Referência: <span className="font-medium text-gray-600">{lastDate}</span>
        </p>
      )}

      {loadingPrev && (
        <p className="text-sm text-gray-400 animate-pulse">Carregando dados anteriores...</p>
      )}

      {seriesEntries.length > 0 && (
        <div className="space-y-4">
          {seriesEntries.map((entry, gi) => {
            const group = selectedTraining?.divisions[selectedDivisionIndex!]?.seriesGroups?.[gi];
            const groupLabel = (group?.exercises ?? []).map((e) => e.exerciseName).join(" + ") || `Série ${gi + 1}`;
            return (
              <div key={gi} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                  <p className="font-semibold text-gray-900 text-sm">{groupLabel}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{group?.sets ?? 0} séries</p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm min-w-[420px]">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-400 w-10">#</th>
                        {(entry.sets[0]?.exercises ?? []).map((ex, ei) => (
                          <th key={ei} colSpan={2} className="px-3 py-2.5 text-left text-xs font-medium text-gray-700 border-l border-gray-100">
                            {ex.exerciseName}
                          </th>
                        ))}
                      </tr>
                      <tr className="border-b border-gray-100 bg-gray-50/50">
                        <th className="px-4 py-1.5" />
                        {(entry.sets[0]?.exercises ?? []).map((_, ei) => (
                          <>
                            <th key={`kg-${ei}`} className="px-3 py-1.5 text-left text-xs text-gray-400 font-normal border-l border-gray-100">
                              Peso kg
                            </th>
                            <th key={`rp-${ei}`} className="px-3 py-1.5 text-left text-xs text-gray-400 font-normal">
                              Reps
                            </th>
                          </>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {(entry.sets ?? []).map((setRecord, si) => (
                        <tr key={si} className="hover:bg-gray-50/50">
                          <td className="px-4 py-2 text-gray-400 font-medium text-xs">{si + 1}</td>
                          {(setRecord.exercises ?? []).map((ex, ei) => (
                            <>
                              <td key={`w-${ei}`} className="px-2 py-2 border-l border-gray-100">
                                <div className="space-y-0.5">
                                  {ex.previousWeight && (
                                    <p className="text-xs text-gray-300">{ex.previousWeight}</p>
                                  )}
                                  <input
                                    type="number"
                                    inputMode="decimal"
                                    placeholder="0"
                                    value={ex.weight}
                                    onChange={(e) => handleInput(gi, si, ei, "weight", e.target.value)}
                                    className="w-20 border border-gray-200 rounded-lg px-2 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                                  />
                                </div>
                              </td>
                              <td key={`r-${ei}`} className="px-2 py-2">
                                <div className="space-y-0.5">
                                  {ex.previousReps && (
                                    <p className="text-xs text-gray-300">{ex.previousReps}</p>
                                  )}
                                  <input
                                    type="number"
                                    inputMode="numeric"
                                    placeholder="0"
                                    value={ex.reps}
                                    onChange={(e) => handleInput(gi, si, ei, "reps", e.target.value)}
                                    className="w-20 border border-gray-200 rounded-lg px-2 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                                  />
                                </div>
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
      )}

      {seriesEntries.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 shadow-lg sm:static sm:bg-transparent sm:border-0 sm:shadow-none sm:flex sm:justify-end">
          <ButtonPrimary onClick={handleSave} disabled={saving} className="w-full sm:w-auto">
            {saving ? "Salvando..." : isNew ? "Salvar sessão" : "Atualizar sessão"}
          </ButtonPrimary>
        </div>
      )}
    </div>
  );
}
