export interface TrainingSession {
  id: string;
  userId: string;
  trainId: string;
  divisionName: string;
  date: string;
  exercises: ExerciseEntry[];
}

export interface SeriesEntry {
  weight: string;
  reps: string;
  previousWeight?: string;
  previousReps?: string;
}

export interface ExerciseEntry {
  name: string;
  series: SeriesEntry[];
}
