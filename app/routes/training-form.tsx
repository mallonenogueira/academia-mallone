import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { TrainingService } from "~/services/training-service";
import { Label } from "~/components/label";
import { Input } from "~/components/input";
import { ButtonPrimary, ButtonSecondary } from "~/components/button";
import type { Route } from "../+types/root";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Cadastrar treinos" }, { name: "description", content: "" }];
}

type Props = {
  id: string;
};

export default function TrainingFormPage() {
  const { id } = useParams<Props>();
  const isNovo = id === "novo" || !id;
  const [title, setTitle] = useState("");
  const [divisions, setDivisions] = useState([{ name: "", exercises: "" }]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isNovo) return;

    setLoading(true);

    new TrainingService()
      .findOne(id)
      .then((train) => {
        if (!train) {
          return alert("Treino não encontrado.");
        }

        setTitle(train.title || "");
        setDivisions(
          train.divisions?.map((d: any) => ({
            name: d.name || "",
            exercises: d.exercises?.join(", ") || "",
          })) || []
        );
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id, isNovo]);

  function handleAddDivision() {
    setDivisions([...divisions, { name: "", exercises: "" }]);
  }

  function handleDivisionChange(
    index: number,
    field: "name" | "exercises",
    value: string
  ) {
    const updated = [...divisions];
    updated[index][field] = value;
    setDivisions(updated);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const train = {
      title,
      divisions: divisions.map((d) => ({
        name: d.name.trim(),
        exercises: d.exercises
          .split(",")
          .map((e) => e.trim())
          .filter((e) => e),
      })),
    };

    try {
      if (isNovo) {
        await new TrainingService().create(train);
        alert("Treino salvo com sucesso!");
        setTitle("");
        setDivisions([{ name: "", exercises: "" }]);
      } else {
        await new TrainingService().update(id, train);
        alert("Treino atualizado com sucesso!");
      }
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar treino.");
    }
  }

  function handleRemoveDivision(index: number) {
    if (divisions.length <= 1) return;
    const updated = divisions.filter((_, i) => i !== index);
    setDivisions(updated);
  }

  if (loading)
    return (
      <p className="text-center text-gray-500 mt-10">Carregando treino...</p>
    );

  return (
    <form onSubmit={handleSubmit} className="max-w-xl mx-auto space-y-6 p-6">
      <h1 className="text-3xl font-semibold text-center mb-6">
        Formulário de treino
      </h1>

      <div>
        <Label htmlFor="title">Título do treino</Label>

        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ex: Treino Hipertrofia"
        />
      </div>

      {divisions.map((division, index) => (
        <div key={index} className="space-y-2 border-t pt-4 relative">
          <div>
            <Label htmlFor={`division-${index}-name`}>Nome da divisão</Label>

            <Input
              id={`division-${index}-name`}
              value={division.name}
              onChange={(e) =>
                handleDivisionChange(index, "name", e.target.value)
              }
              placeholder="Ex: Peito e Tríceps"
            />
          </div>

          <div>
            <Label htmlFor={`division-${index}-exercises`}>
              Exercícios (separados por vírgula)
            </Label>

            <Input
              id={`division-${index}-exercises`}
              value={division.exercises}
              onChange={(e) =>
                handleDivisionChange(index, "exercises", e.target.value)
              }
              placeholder="Ex: Exercicio 1, Exercicio 2..."
            />
          </div>

          {divisions.length > 1 && (
            <ButtonSecondary
              type="button"
              onClick={() => handleRemoveDivision(index)}
            >
              Excluir
            </ButtonSecondary>
          )}
        </div>
      ))}

      <div className="flex justify-between items-center">
        <ButtonSecondary type="button" onClick={handleAddDivision}>
          Adicionar nova divisão
        </ButtonSecondary>

        <ButtonPrimary type="submit">Salvar treino</ButtonPrimary>
      </div>
    </form>
  );
}
