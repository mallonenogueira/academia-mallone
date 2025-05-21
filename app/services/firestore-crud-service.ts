import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db, type Collections } from "~/firebase/config";

export class FirestoreCrudService<T> {
  private collectionName: string;

  constructor(col: Collections) {
    this.collectionName = col.toString();
  }

  async findAll(): Promise<T[]> {
    const collectionRef = collection(db, this.collectionName);
    const querySnapshot = await getDocs(collectionRef);
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as T[];
  }

  async findOne(id: string): Promise<T | null> {
    const docRef = doc(db, this.collectionName, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as T;
    }

    return null;
  }

  async create(data: any): Promise<T> {
    const collectionRef = collection(db, this.collectionName);
    const newDocRef = doc(collectionRef);
    await setDoc(newDocRef, data);

    return { id: newDocRef.id, ...data };
  }

  async update(id: string, data: any): Promise<T> {
    const docRef = doc(db, this.collectionName, id);
    await updateDoc(docRef, data);

    return { id, ...data };
  }

  async remove(id: string) {
    const docRef = doc(db, this.collectionName, id);
    await deleteDoc(docRef);

    return { id };
  }
}
