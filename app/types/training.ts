export type Division = {
  name: string;
  exercises: string[];
};

export type Training = {
  id: string;
  title: string;
  divisions: Division[];
};
