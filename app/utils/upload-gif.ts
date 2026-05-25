import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "~/firebase/config";

export async function uploadGif(source: File | string, exerciseId: string): Promise<string> {
  const storageRef = ref(storage, `exercises/${exerciseId}.gif`);

  if (source instanceof File) {
    await uploadBytes(storageRef, source, { contentType: "image/gif" });
  } else {
    const response = await fetch(source);
    if (!response.ok) throw new Error("Não foi possível baixar o GIF da URL informada.");
    const blob = await response.blob();
    await uploadBytes(storageRef, blob, { contentType: "image/gif" });
  }

  return getDownloadURL(storageRef);
}
