const MAX_BYTES = 700 * 1024;

export async function fileToBase64(file: File): Promise<string> {
  if (file.size > MAX_BYTES) {
    throw new Error(`O arquivo é muito grande (${(file.size / 1024).toFixed(0)}KB). Máximo permitido: 700KB.`);
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Erro ao ler o arquivo."));
    reader.readAsDataURL(file);
  });
}

export async function urlToBase64(url: string): Promise<string> {
  let response: Response;
  try {
    response = await fetch(url);
  } catch {
    throw new Error("Não foi possível acessar a URL. O servidor pode estar bloqueando requisições externas (CORS).");
  }
  if (!response.ok) throw new Error(`Erro ao baixar a imagem: ${response.status} ${response.statusText}`);

  const blob = await response.blob();
  if (blob.size > MAX_BYTES) {
    throw new Error(`A imagem é muito grande (${(blob.size / 1024).toFixed(0)}KB). Máximo permitido: 700KB.`);
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Erro ao processar a imagem."));
    reader.readAsDataURL(blob);
  });
}
