import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { TrainingService } from "~/services/training-service";
import { TrainingSessionService } from "~/services/training-session-service";
import type { ExerciseEntry } from "~/types/training-session";
import { useAuth } from "~/contexts/auth";
import { Label } from "~/components/label";
import { Select } from "~/components/select";
import { Input } from "~/components/input";
import { ButtonPrimary } from "~/components/button";

type Params = {
  id: string;
};

export default function SessaoTreinoPage() {
  const { user } = useAuth();
  const { id } = useParams<Params>();
  const isNew = !id || id === "novo";

  const [trains, setTrainings] = useState<any[]>([]);
  const [selectedTrainingId, setSelectedTrainingId] = useState<string>("");
  const [selectedDivisionIndex, setSelectedDivisionIndex] = useState<number | null>(null);
  const [entries, setEntries] = useState<ExerciseEntry[]>([]);
  const [lastDate, setLastDate] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    new TrainingService().findAll().then(setTrainings);
  }, []);

  // Carregar sessão se for edição
  useEffect(() => {
    if (isNew || !id) return;

    setLoading(true);

    new TrainingSessionService()
      .findOne(id)
      .then((session) => {
        if (!session) {
          return alert("Sessão não encontrada.");
        }

        setSelectedTrainingId(session.trainId);

        const training = trains.find((t) => t.id === session.trainId);
        const index = training?.divisions?.findIndex((d: any) => d.name === session.divisionName);
        if (index !== -1) {
          setSelectedDivisionIndex(index);
        }

        setEntries(session.exercises);
        setLastDate(new Date(session.date).toLocaleDateString("pt-BR"));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id, isNew, trains]);

  useEffect(() => {
    if (!isNew || !selectedTrainingId || selectedDivisionIndex === null) return;

    const selectedTraining = trains.find((t) => t.id === selectedTrainingId);
    const division = selectedTraining?.divisions[selectedDivisionIndex];
    if (!division) return;

    const generated: ExerciseEntry[] = division.exercises.map((exercise: string) => ({
      name: exercise,
      series: Array(4).fill(null).map(() => ({ weight: "", reps: "" })),
    }));

    const populatePrevious = async () => {
      const lastSession = await new TrainingSessionService().findLastSessionForDivision(
        user.uid!,
        division.name
      );

      if (lastSession) {
        setLastDate(new Date(lastSession.date).toLocaleDateString("pt-BR"));
      } else {
        setLastDate("");
      }

      const populated = generated.map((exercise) => {
        const last = lastSession?.exercises.find((e) => e.name === exercise.name);
        return {
          ...exercise,
          series: exercise.series.map((_, i) => ({
            previousWeight: last?.series[i]?.weight ?? "",
            previousReps: last?.series[i]?.reps ?? "",
            weight: "",
            reps: "",
          })),
        };
      });

      setEntries(populated);
    };

    populatePrevious();
  }, [selectedTrainingId, selectedDivisionIndex, isNew]);

  function handleInputChange(
    exIndex: number,
    serieIndex: number,
    field: "weight" | "reps",
    value: string
  ) {
    const updated = [...entries];
    updated[exIndex].series[serieIndex][field] = value;
    setEntries(updated);
  }

  async function handleSave() {
    const payload = {
      userId: user.uid!,
      trainId: selectedTrainingId,
      divisionName:
        trains.find((t) => t.id === selectedTrainingId)?.divisions[selectedDivisionIndex!].name ?? "",
      date: new Date().toISOString(),
      exercises: entries,
    };

    try {
      if (isNew) {
        await new TrainingSessionService().create(payload);
        alert("Sessão salva com sucesso!");
      } else {
        await new TrainingSessionService().update(id, payload);
        alert("Sessão atualizada com sucesso!");
      }
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar sessão.");
    }
  }

  if (loading) {
    return <p className="text-center text-gray-500 mt-10">Carregando sessão...</p>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-xl font-semibold">
        {isNew ? "Nova Sessão de Treino" : "Editar Sessão de Treino"}
      </h1>

      <div className="space-y-2">
        <Label htmlFor="treino">Escolha o treino</Label>
        <Select
          id="treino"
          value={selectedTrainingId}
          onChange={(e) => {
            setSelectedTrainingId(e.target.value);
            setSelectedDivisionIndex(null);
          }}
        >
          <option value="">Selecione</option>
          {trains.map((t) => (
            <option key={t.id} value={t.id}>
              {t.title}
            </option>
          ))}
        </Select>
      </div>

      {selectedTrainingId && (
        <div className="space-y-2">
          <Label htmlFor="divisao">Escolha a divisão</Label>
          <Select
            id="divisao"
            value={selectedDivisionIndex ?? ""}
            onChange={(e) => setSelectedDivisionIndex(Number(e.target.value))}
          >
            <option value="">Selecione</option>
            {trains
              .find((t) => t.id === selectedTrainingId)
              ?.divisions.map((d: any, idx: number) => (
                <option key={idx} value={idx}>
                  {d.name}
                </option>
              ))}
          </Select>
        </div>
      )}

      {lastDate && (
        <p className="text-sm text-gray-600">
          Última sessão registrada em: <strong>{lastDate}</strong>
        </p>
      )}

      {entries.map((exercise, exIndex) => (
        <div key={exIndex} className="border-t pt-4 w-full">
          <h2 className="font-medium">{exercise.name}</h2>
          {exercise.series.map((serie, serieIndex) => (
            <div key={serieIndex} className="grid grid-cols-3 gap-2 items-center text-sm mb-2">
              <span>Série {serieIndex + 1}</span>

              <div>
                <span className="text-gray-500 block mb-1">
                  Peso anterior: {serie.previousWeight ?? "-"}
                </span>
                <Input
                  placeholder="Peso"
                  value={serie.weight}
                  onChange={(e) =>
                    handleInputChange(exIndex, serieIndex, "weight", e.target.value)
                  }
                />
              </div>

              <div>
                <span className="text-gray-500 block mb-1">
                  Reps anteriores: {serie.previousReps ?? "-"}
                </span>
                <Input
                  placeholder="Reps"
                  value={serie.reps}
                  onChange={(e) =>
                    handleInputChange(exIndex, serieIndex, "reps", e.target.value)
                  }
                />
              </div>
            </div>
          ))}
        </div>
      ))}

      {entries.length > 0 && (
        <ButtonPrimary onClick={handleSave}>
          {isNew ? "Salvar sessão" : "Atualizar sessão"}
        </ButtonPrimary>
      )}
    </div>
  );
}
