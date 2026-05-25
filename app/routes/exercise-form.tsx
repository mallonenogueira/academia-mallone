import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ExerciseService } from "~/services/exercise-service";
import { Label } from "~/components/label";
import { Input } from "~/components/input";
import { ButtonPrimary, ButtonSecondary } from "~/components/button";
import { FeedbackBanner, type FeedbackState } from "~/components/feedback-banner";
import { Paths } from "~/routes";
import { MUSCLE_GROUPS } from "~/types/exercise";
import { handleError } from "~/utils/errors";
import { fileToBase64, urlToBase64 } from "~/utils/gif-to-base64";

type FormErrors = { name?: string; muscleGroup?: string };
type GifMode = "file" | "url";

const exerciseService = new ExerciseService();

export default function ExerciseFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = !id || id === "novo";
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [muscleGroup, setMuscleGroup] = useState("");
  const [gif, setGif] = useState<string | undefined>(undefined);
  const [gifMode, setGifMode] = useState<GifMode>("file");
  const [urlInput, setUrlInput] = useState("");
  const [loadingUrl, setLoadingUrl] = useState(false);
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
        if (!exercise) { setFeedback({ type: "error", message: "Exercício não encontrado." }); return; }
        setName(exercise.name);
        setMuscleGroup(exercise.muscleGroup);
        setGif(exercise.gif);
      })
      .catch((err) => setFeedback({ type: "error", message: handleError(err, "Erro ao carregar exercício.") }))
      .finally(() => setLoading(false));
  }, [id, isNew]);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64 = await fileToBase64(file);
      setGif(base64);
      setFeedback(null);
    } catch (err) {
      setFeedback({ type: "error", message: handleError(err, "Erro ao processar arquivo.") });
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleUrlLoad() {
    if (!urlInput.trim()) return;
    setLoadingUrl(true);
    setFeedback(null);
    try {
      const base64 = await urlToBase64(urlInput.trim());
      setGif(base64);
      setUrlInput("");
    } catch (err) {
      setFeedback({ type: "error", message: handleError(err, "Erro ao baixar imagem da URL.") });
    } finally {
      setLoadingUrl(false);
    }
  }

  function handleRemoveGif() {
    setGif(undefined);
    setUrlInput("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

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
        await exerciseService.create({ name: name.trim(), muscleGroup, gif });
        navigate(Paths.exercicios);
      } else {
        await exerciseService.update(id!, { name: name.trim(), muscleGroup, gif });
        setFeedback({ type: "success", message: "Exercício atualizado com sucesso!" });
      }
    } catch (err) {
      setFeedback({ type: "error", message: handleError(err, "Erro ao salvar exercício.") });
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-center text-gray-500 mt-10">Carregando...</p>;

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
            <option key={group} value={group}>{group}</option>
          ))}
        </select>
        {errors.muscleGroup && <p className="text-red-500 text-sm">{errors.muscleGroup}</p>}
      </div>

      {/* GIF */}
      <div className="space-y-3">
        <Label>GIF do exercício <span className="text-gray-400 font-normal">(opcional, máx. 700KB)</span></Label>

        {gif ? (
          <div className="space-y-2">
            <img
              src={gif}
              alt="Preview"
              className="h-40 rounded-xl border border-gray-200 object-contain bg-gray-50 w-full"
            />
            <button
              type="button"
              onClick={handleRemoveGif}
              className="text-sm text-red-500 hover:text-red-700 font-medium"
            >
              Remover GIF
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Toggle */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setGifMode("file")}
                className={`text-sm px-3 py-1.5 rounded-lg border font-medium transition-colors ${gifMode === "file" ? "bg-gray-900 text-white border-gray-900" : "text-gray-500 border-gray-200 hover:border-gray-400"}`}
              >
                Upload de arquivo
              </button>
              <button
                type="button"
                onClick={() => setGifMode("url")}
                className={`text-sm px-3 py-1.5 rounded-lg border font-medium transition-colors ${gifMode === "url" ? "bg-gray-900 text-white border-gray-900" : "text-gray-500 border-gray-200 hover:border-gray-400"}`}
              >
                Colar URL
              </button>
            </div>

            {gifMode === "file" ? (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-gray-200 rounded-xl py-8 text-sm text-gray-400 hover:border-gray-400 hover:text-gray-600 transition-colors flex flex-col items-center gap-1"
              >
                <span className="text-2xl">🎞</span>
                <span>Clique para selecionar um GIF</span>
              </button>
            ) : (
              <div className="flex gap-2">
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://..."
                  className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleUrlLoad(); }}}
                />
                <ButtonSecondary
                  type="button"
                  onClick={handleUrlLoad}
                  disabled={loadingUrl || !urlInput.trim()}
                  className="text-sm py-2.5 px-4 shrink-0"
                >
                  {loadingUrl ? "Baixando..." : "Carregar"}
                </ButtonSecondary>
              </div>
            )}
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/gif"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      <div className="flex justify-end">
        <ButtonPrimary type="submit" disabled={saving}>
          {saving ? "Salvando..." : "Salvar exercício"}
        </ButtonPrimary>
      </div>
    </form>
  );
}
