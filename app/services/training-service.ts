import { Collections } from "~/firebase/config";
import { FirestoreCrudService } from "./firestore-crud-service";
import type { Training } from "~/types/training";

export class TrainingService extends FirestoreCrudService<Training> {
  constructor() {
    super(Collections.TRAINING);
  }
}