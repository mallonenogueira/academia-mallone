import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ExerciseService } from "~/services/exercise-service";
import { Label } from "~/components/label";
import { Input } from "~/components/input";
import { ButtonPrimary } from "~/components/button";
import { FeedbackBanner, type FeedbackState } from "~/components/feedback-banner";
import { Paths } from "~/routes";
import { MUSCLE_GROUPS } from "~/types/exercise";
import { handleError } from "~/utils/errors";

type FormErrors = {
  name?: string;
  muscleGroup?: string;
};

const exerciseService = new ExerciseService();

export default function ExerciseFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = !id || id === "novo";

  const [name, setName] = useState("");
  const [muscleGroup, setMuscleGroup] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [feedback, setFeedback] = useState<FeedbackState>(null);

  useEffect(() => {
    if (isNew) return;

    setLoading(true);
    exerciseService
      .findOne(id!)
      .then((exercise) => {
        if (!exercise) {
          setFeedback({ type: "error", message: "Exercício não encontrado." });
          return;
        }
        setName(exercise.name);
        setMuscleGroup(exercise.muscleGroup);
      })
      .catch((err) => setFeedback({ type: "error", message: handleError(err, "Erro ao carregar exercício.") }))
      .finally(() => setLoading(false));
  }, [id, isNew]);

  function validate(): boolean {
    const errs: FormErrors = {};
    if (!name.trim()) errs.name = "Nome é obrigatório.";
    if (!muscleGroup) errs.muscleGroup = "Grupo muscular é obrigatório.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      if (isNew) {
        await exerciseService.create({ name: name.trim(), muscleGroup });
        navigate(Paths.exercicios);
      } else {
        await exerciseService.update(id!, { name: name.trim(), muscleGroup });
        setFeedback({ type: "success", message: "Exercício atualizado com sucesso!" });
      }
    } catch (err) {
      setFeedback({ type: "error", message: handleError(err, "Erro ao salvar exercício.") });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-center text-gray-500 mt-10">Carregando...</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-5 p-6">
      <h1 className="text-2xl font-semibold text-gray-900">
        {isNew ? "Novo exercício" : "Editar exercício"}
      </h1>

      <FeedbackBanner feedback={feedback} />

      <div className="space-y-1">
        <Label htmlFor="name">Nome do exercício</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex: Supino reto com barra"
        />
        {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
      </div>

      <div className="space-y-1">
        <Label htmlFor="muscleGroup">Grupo muscular</Label>
        <select
          id="muscleGroup"
          value={muscleGroup}
          onChange={(e) => setMuscleGroup(e.target.value)}
          className="px-3 py-1.5 bg-transparent text-gray-900 border border-black font-medium rounded-sm shadow-sm w-full focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-1 cursor-pointer"
        >
          <option value="">Selecione</option>
          {MUSCLE_GROUPS.map((group) => (
            <option key={group} value={group}>
              {group}
            </option>
          ))}
        </select>
        {errors.muscleGroup && (
          <p className="text-red-500 text-sm">{errors.muscleGroup}</p>
        )}
      </div>

      <div className="flex justify-end">
        <ButtonPrimary type="submit" disabled={saving}>
          {saving ? "Salvando..." : "Salvar exercício"}
        </ButtonPrimary>
      </div>
    </form>
  );
}
