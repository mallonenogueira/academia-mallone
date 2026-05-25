export type Exercise = {
  id: string;
  name: string;
  muscleGroup: string;
  gif?: string;
};

export const MUSCLE_GROUPS = [
  "Peito",
  "Costas",
  "Ombros",
  "Bíceps",
  "Tríceps",
  "Antebraço",
  "Pernas",
  "Glúteos",
  "Abdômen",
  "Panturrilha",
  "Cardio",
  "Outro",
] as const;
