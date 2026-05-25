import { collection, doc, getDoc } from "firebase/firestore";
import { Collections, db } from "~/firebase/config";
import { FirestoreCrudService } from "./firestore-crud-service";
import type { Exercise } from "~/types/exercise";

export class ExerciseService extends FirestoreCrudService<Exercise> {
  private col = collection(db, Collections.EXERCISE);

  constructor() {
    super(Collections.EXERCISE);
  }

  async findByIds(ids: string[]): Promise<Exercise[]> {
    if (ids.length === 0) return [];
    const docs = await Promise.all(
      ids.map((id) => getDoc(doc(this.col, id)))
    );
    return docs
      .filter((d) => d.exists())
      .map((d) => ({ id: d.id, ...d.data() }) as Exercise);
  }
}
