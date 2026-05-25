export type FeedbackState = { type: "success" | "error"; message: string } | null;

export function FeedbackBanner({ feedback }: { feedback: FeedbackState }) {
  if (!feedback) return null;
  return (
    <div
      className={`px-4 py-3 rounded-xl text-sm border ${
        feedback.type === "success"
          ? "bg-green-50 text-green-800 border-green-200"
          : "bg-red-50 text-red-800 border-red-200"
      }`}
    >
      {feedback.message}
    </div>
  );
}
