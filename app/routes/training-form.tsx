import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { TrainingService } from "~/services/training-service";
import { ExerciseService } from "~/services/exercise-service";
import type { Exercise } from "~/types/exercise";
import type { Division } from "~/types/training";
import { Label } from "~/components/label";
import { Input } from "~/components/input";
import { ButtonPrimary, ButtonSecondary, IconButton } from "~/components/button";
import { FeedbackBanner, type FeedbackState } from "~/components/feedback-banner";
import { Paths } from "~/routes";
import { handleError } from "~/utils/errors";

const trainingService = new TrainingService();
const exerciseService = new ExerciseService();

type PickerTarget = { divIndex: number; groupIndex: number } | null;

export default function TrainingFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = !id || id === "novo";

  const [title, setTitle] = useState("");
  const [divisions, setDivisions] = useState<Division[]>([
    { name: "", seriesGroups: [{ sets: 4, exercises: [] }] },
  ]);
  const [allExercises, setAllExercises] = useState<Exercise[]>([]);
  const [pickerTarget, setPickerTarget] = useState<PickerTarget>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    exerciseService
      .findAll()
      .then(setAllExercises)
      .catch((err) => setFeedback({ type: "error", message: handleError(err, "Erro ao carregar exercícios.") }));
  }, []);

  useEffect(() => {
    if (isNew) return;
    setLoading(true);
    trainingService
      .findOne(id!)
      .then((train) => {
        if (!train) { setFeedback({ type: "error", message: "Treino não encontrado." }); return; }
        setTitle(train.title);
        setDivisions(train.divisions);
      })
      .catch((err) => setFeedback({ type: "error", message: handleError(err, "Erro ao carregar treino.") }))
      .finally(() => setLoading(false));
  }, [id, isNew]);

  useEffect(() => {
    if (pickerTarget) {
      setSearch("");
      setTimeout(() => searchRef.current?.focus(), 50);
    }
  }, [pickerTarget]);

  function validate() {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = "Título é obrigatório.";
    divisions.forEach((d, di) => {
      if (!d.name.trim()) errs[`div-${di}`] = "Nome da divisão é obrigatório.";
      d.seriesGroups.forEach((g, gi) => {
        if (g.exercises.length === 0) errs[`group-${di}-${gi}`] = "Adicione pelo menos um exercício.";
      });
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      if (isNew) {
        await trainingService.create({ title: title.trim(), divisions });
        navigate(Paths.treinos);
      } else {
        await trainingService.update(id!, { title: title.trim(), divisions });
        setFeedback({ type: "success", message: "Treino atualizado!" });
      }
    } catch (err) {
      console.error("Erro ao salvar treino:", err);
      setFeedback({ type: "error", message: "Erro ao salvar treino." });
    } finally {
      setSaving(false);
    }
  }

  // Division actions
  function addDivision() {
    setDivisions([...divisions, { name: "", seriesGroups: [{ sets: 4, exercises: [] }] }]);
  }
  function removeDivision(di: number) {
    setDivisions(divisions.filter((_, i) => i !== di));
  }
  function updateDivisionName(di: number, name: string) {
    const updated = [...divisions];
    updated[di] = { ...updated[di], name };
    setDivisions(updated);
  }

  // Series group actions
  function addSeriesGroup(di: number) {
    const updated = [...divisions];
    updated[di].seriesGroups.push({ sets: 4, exercises: [] });
    setDivisions(updated);
  }
  function removeSeriesGroup(di: number, gi: number) {
    const updated = [...divisions];
    updated[di].seriesGroups = updated[di].seriesGroups.filter((_, i) => i !== gi);
    setDivisions(updated);
  }
  function updateSets(di: number, gi: number, delta: number) {
    const updated = [...divisions];
    const current = updated[di].seriesGroups[gi].sets;
    updated[di].seriesGroups[gi].sets = Math.min(8, Math.max(1, current + delta));
    setDivisions(updated);
  }

  // Exercise actions
  function addExercise(exercise: Exercise) {
    if (!pickerTarget) return;
    const { divIndex, groupIndex } = pickerTarget;
    const updated = [...divisions];
    const group = updated[divIndex].seriesGroups[groupIndex];
    if (group.exercises.some((e) => e.exerciseId === exercise.id)) return;
    group.exercises.push({ exerciseId: exercise.id, exerciseName: exercise.name });
    setDivisions(updated);
  }
  function removeExercise(di: number, gi: number, exIdx: number) {
    const updated = [...divisions];
    updated[di].seriesGroups[gi].exercises = updated[di].seriesGroups[gi].exercises.filter(
      (_, i) => i !== exIdx
    );
    setDivisions(updated);
  }

  const filteredExercises = allExercises.filter(
    (e) =>
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.muscleGroup.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <p className="text-center text-gray-400 mt-20">Carregando...</p>;

  return (
    <>
      {/* Exercise picker modal */}
      {pickerTarget && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40"
          onClick={(e) => { if (e.target === e.currentTarget) setPickerTarget(null); }}
        >
          <div className="bg-white w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl shadow-xl flex flex-col max-h-[70vh]">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">Adicionar exercício</h3>
              <IconButton onClick={() => setPickerTarget(null)} aria-label="Fechar">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </IconButton>
            </div>
            <div className="p-4 border-b border-gray-100">
              <input
                ref={searchRef}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar exercício..."
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>
            <div className="overflow-y-auto flex-1">
              {filteredExercises.length === 0 ? (
                <p className="text-center text-gray-400 py-8 text-sm">Nenhum exercício encontrado</p>
              ) : (
                filteredExercises.map((ex) => {
                  const group = divisions[pickerTarget.divIndex]?.seriesGroups[pickerTarget.groupIndex];
                  const selected = group?.exercises.some((e) => e.exerciseId === ex.id);
                  return (
                    <button
                      key={ex.id}
                      onClick={() => { addExercise(ex); }}
                      className={`w-full flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 transition-colors text-left border-b border-gray-50 ${selected ? "opacity-40 cursor-default" : ""}`}
                      disabled={selected}
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">{ex.name}</p>
                        <p className="text-xs text-gray-400">{ex.muscleGroup}</p>
                      </div>
                      {selected && <span className="text-xs text-gray-400">Adicionado</span>}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto px-4 py-6 space-y-6 pb-24">
        <h1 className="text-2xl font-bold text-gray-900">
          {isNew ? "Novo treino" : "Editar treino"}
        </h1>

        <FeedbackBanner feedback={feedback} />

        <div>
          <Label htmlFor="title">Título do treino</Label>
          <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Hipertrofia A/B/C" />
          {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Divisões</h2>
            <ButtonSecondary type="button" onClick={addDivision} className="text-sm py-2 px-4">
              + Divisão
            </ButtonSecondary>
          </div>

          {divisions.map((division, di) => (
            <div key={di} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
              {/* Division header */}
              <div className="flex items-center gap-3 p-4 bg-gray-50 border-b border-gray-200">
                <input
                  value={division.name}
                  onChange={(e) => updateDivisionName(di, e.target.value)}
                  placeholder="Ex: A — Push"
                  className="flex-1 bg-transparent font-semibold text-gray-900 placeholder:text-gray-400 focus:outline-none text-base"
                />
                {divisions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeDivision(di)}
                    className="text-sm text-red-500 hover:text-red-700 font-medium transition-colors px-2 py-1"
                  >
                    Remover
                  </button>
                )}
              </div>
              {errors[`div-${di}`] && (
                <p className="text-red-500 text-xs px-4 pt-2">{errors[`div-${di}`]}</p>
              )}

              {/* Series groups */}
              <div className="p-4 space-y-4">
                {(division.seriesGroups ?? []).map((group, gi) => (
                  <div key={gi} className="border border-gray-100 rounded-xl p-4 space-y-3">
                    {/* Group header: title + set counter + remove */}
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-gray-500 shrink-0">
                        Grupo {gi + 1}
                      </span>

                      {/* Set counter */}
                      <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-2 py-1">
                        <button
                          type="button"
                          onClick={() => updateSets(di, gi, -1)}
                          className="w-7 h-7 flex items-center justify-center text-gray-600 hover:text-gray-900 font-bold rounded transition-colors"
                        >
                          −
                        </button>
                        <span className="text-sm font-semibold text-gray-900 w-4 text-center">
                          {group.sets}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateSets(di, gi, +1)}
                          className="w-7 h-7 flex items-center justify-center text-gray-600 hover:text-gray-900 font-bold rounded transition-colors"
                        >
                          +
                        </button>
                      </div>
                      <span className="text-xs text-gray-400">sets</span>

                      <div className="flex-1" />
                      {(division.seriesGroups ?? []).length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeSeriesGroup(di, gi)}
                          className="text-sm text-red-500 hover:text-red-700 font-medium transition-colors"
                        >
                          Remover
                        </button>
                      )}
                    </div>

                    {/* Exercises list */}
                    <div className="space-y-2">
                      {group.exercises.map((ex, exIdx) => (
                        <div key={exIdx} className="flex items-center gap-3 bg-gray-50 rounded-lg px-3 py-2.5">
                          <span className="flex-1 text-sm font-medium text-gray-900">{ex.exerciseName}</span>
                          <IconButton
                            type="button"
                            onClick={() => removeExercise(di, gi, exIdx)}
                            aria-label="Remover exercício"
                            className="w-8 h-8 shrink-0"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </IconButton>
                        </div>
                      ))}
                      {errors[`group-${di}-${gi}`] && (
                        <p className="text-red-500 text-xs">{errors[`group-${di}-${gi}`]}</p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => setPickerTarget({ divIndex: di, groupIndex: gi })}
                      className="w-full border-2 border-dashed border-gray-200 rounded-lg py-2.5 text-sm text-gray-400 hover:border-gray-400 hover:text-gray-600 transition-colors"
                    >
                      + Exercício
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => addSeriesGroup(di)}
                  className="w-full border border-dashed border-gray-200 rounded-xl py-3 text-sm text-gray-400 hover:border-gray-400 hover:text-gray-600 transition-colors"
                >
                  + Novo grupo
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Fixed bottom save */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 shadow-lg sm:static sm:bg-transparent sm:border-0 sm:shadow-none sm:p-0 sm:flex sm:justify-end">
          <ButtonPrimary type="submit" disabled={saving} className="w-full sm:w-auto">
            {saving ? "Salvando..." : "Salvar treino"}
          </ButtonPrimary>
        </div>
      </form>
    </>
  );
}
