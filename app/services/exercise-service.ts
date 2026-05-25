import { Collections } from "~/firebase/config";
import { FirestoreCrudService } from "./firestore-crud-service";
import type { Exercise } from "~/types/exercise";

export class ExerciseService extends FirestoreCrudService<Exercise> {
  constructor() {
    super(Collections.EXERCISE);
  }
}
