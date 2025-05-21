import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { Collections, db } from "~/firebase/config";
import type { TrainingSession } from "~/types/training-session";
import { FirestoreCrudService } from "./firestore-crud-service";

export class TrainingSessionService extends FirestoreCrudService<TrainingSession> {
  private col = collection(db, Collections.TRAINING_SESSION);

  constructor() {
    super(Collections.TRAINING_SESSION);
  }

  async create(session: Omit<TrainingSession, "id">): Promise<TrainingSession> {
    const docRef = await addDoc(this.col, session);
    return { ...session, id: docRef.id };
  }

  async findOne(id: string): Promise<TrainingSession | null> {
    const docRef = doc(this.col, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as TrainingSession;
    }

    return null;
  }

  async findAllByUser(userId: string): Promise<TrainingSession[]> {
    const q = query(this.col, where("userId", "==", userId));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    })) as TrainingSession[];
  }

  async findLastSessionForDivision(
    userId: string,
    divisionName: string
  ): Promise<TrainingSession | null> {
    const q = query(this.col, where("userId", "==", userId));

    const snapshot = await getDocs(q);

    const sessions = snapshot.docs
      .map((doc) => doc.data() as TrainingSession)
      .filter((s) => s.divisionName === divisionName)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return sessions[0] ?? null;
  }
}
