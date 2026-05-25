export type SetExerciseEntry = {
  exerciseId: string;
  exerciseName: string;
  weight: string;
  reps: string;
  previousWeight?: string;
  previousReps?: string;
};

export type SetRecord = {
  exercises: SetExerciseEntry[];
};

export type SessionSeriesEntry = {
  sets: SetRecord[];
};

export type TrainingSession = {
  id: string;
  userId: string;
  trainId: string;
  trainTitle: string;
  divisionName: string;
  date: string;
  seriesEntries: SessionSeriesEntry[];
};
