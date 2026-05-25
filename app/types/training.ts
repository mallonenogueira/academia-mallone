export type SeriesExercise = {
  exerciseId: string;
  exerciseName: string;
};

export type SeriesGroup = {
  sets: number;
  exercises: SeriesExercise[];
};

export type Division = {
  name: string;
  seriesGroups: SeriesGroup[];
};

export type Training = {
  id: string;
  title: string;
  divisions: Division[];
};
