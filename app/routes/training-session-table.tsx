import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { ButtonPrimary } from "~/components/button";
import { FeedbackBanner, type FeedbackState } from "~/components/feedback-banner";
import { TrainingSessionService } from "~/services/training-session-service";
import { useAuth } from "~/contexts/auth";
import { Paths } from "~/routes";
import type { TrainingSession } from "~/types/training-session";
import { handleError } from "~/utils/errors";

const sessionService = new TrainingSessionService();

const MONTHS = [
  "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
  "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro",
];
const WEEKDAYS = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];

const CHIP_COLORS = [
  "bg-blue-100 text-blue-800 border-blue-200",
  "bg-violet-100 text-violet-800 border-violet-200",
  "bg-emerald-100 text-emerald-800 border-emerald-200",
  "bg-orange-100 text-orange-800 border-orange-200",
  "bg-rose-100 text-rose-800 border-rose-200",
  "bg-cyan-100 text-cyan-800 border-cyan-200",
  "bg-amber-100 text-amber-800 border-amber-200",
  "bg-indigo-100 text-indigo-800 border-indigo-200",
];

function chipColor(str: string) {
  let h = 0;
  for (const c of str) h = (h * 31 + c.charCodeAt(0)) % CHIP_COLORS.length;
  return CHIP_COLORS[h];
}

export default function TrainingSessionTablePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [current, setCurrent] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  useEffect(() => {
    sessionService
      .findAllByUser(user.uid!)
      .then(setSessions)
      .catch((err) => setFeedback({ type: "error", message: handleError(err, "Erro ao carregar sessões.") }))
      .finally(() => setLoading(false));
  }, []);

  const { year, month } = current;
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayStr = new Date().toISOString().slice(0, 10);

  const byDate = sessions.reduce<Record<string, TrainingSession[]>>((acc, s) => {
    const key = s.date.slice(0, 10);
    if (!acc[key]) acc[key] = [];
    acc[key].push(s);
    return acc;
  }, {});

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  function prevMonth() {
    setCurrent(({ year, month }) =>
      month === 0 ? { year: year - 1, month: 11 } : { year, month: month - 1 }
    );
  }
  function nextMonth() {
    setCurrent(({ year, month }) =>
      month === 11 ? { year: year + 1, month: 0 } : { year, month: month + 1 }
    );
  }

  function dayKey(day: number) {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }

  const recentSessions = [...sessions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Sessões</h1>
        <Link to={Paths.sessaoFormularioNovo}>
          <ButtonPrimary className="py-2.5 px-4 text-sm">+ Nova sessão</ButtonPrimary>
        </Link>
      </div>

      <FeedbackBanner feedback={feedback} />

      {/* Google Calendar-style month grid */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        {/* Month nav */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <button
            onClick={prevMonth}
            className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 transition-colors text-lg font-light"
          >
            ‹
          </button>
          <span className="font-semibold text-gray-900 text-base">
            {MONTHS[month]} {year}
          </span>
          <button
            onClick={nextMonth}
            className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 transition-colors text-lg font-light"
          >
            ›
          </button>
        </div>

        {/* Weekday labels */}
        <div className="grid grid-cols-7 border-b border-gray-100">
          {WEEKDAYS.map((d) => (
            <div key={d} className="py-2 text-center text-xs font-medium text-gray-400">
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        {loading ? (
          <div className="py-12 text-center text-gray-400 text-sm animate-pulse">
            Carregando sessões...
          </div>
        ) : (
          <div className="grid grid-cols-7 divide-x divide-y divide-gray-100">
            {cells.map((day, i) => {
              if (!day) {
                return <div key={`empty-${i}`} className="min-h-[80px] bg-gray-50/40" />;
              }

              const key = dayKey(day);
              const daySessions = byDate[key] ?? [];
              const isToday = key === todayStr;
              const MAX_VISIBLE = 2;
              const visible = daySessions.slice(0, MAX_VISIBLE);
              const overflow = daySessions.length - MAX_VISIBLE;

              return (
                <div
                  key={key}
                  className="min-h-[80px] p-1 flex flex-col gap-0.5 bg-white"
                >
                  {/* Day number */}
                  <div className="flex justify-center mb-0.5">
                    <span
                      className={`w-7 h-7 flex items-center justify-center rounded-full text-sm font-medium ${
                        isToday ? "bg-gray-900 text-white" : "text-gray-700"
                      }`}
                    >
                      {day}
                    </span>
                  </div>

                  {/* Session chips */}
                  {visible.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => navigate(Paths.sessaoConsulta.replace(":id", s.id))}
                      className={`w-full text-left px-1.5 py-1 rounded border transition-opacity hover:opacity-75 ${chipColor(s.trainId)}`}
                      title={`${s.trainTitle || s.trainId} — ${s.divisionName}`}
                    >
                      <p className="text-xs font-semibold truncate leading-tight">{s.divisionName}</p>
                      <p className="text-xs opacity-60 truncate leading-tight">{s.trainTitle || s.trainId}</p>
                    </button>
                  ))}

                  {overflow > 0 && (
                    <span className="text-xs text-gray-400 px-1">+{overflow} mais</span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recentes */}
      {!loading && recentSessions.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest px-1">
            Recentes
          </h2>
          {recentSessions.map((s) => (
            <Link
              key={s.id}
              to={Paths.sessaoConsulta.replace(":id", s.id)}
              className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-3.5 hover:bg-gray-50 transition-colors"
            >
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${chipColor(s.trainId).split(" ")[0]}`}
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 text-sm truncate">
                  {s.divisionName}
                </p>
                <p className="text-xs text-gray-400 truncate">{s.trainTitle || s.trainId}</p>
              </div>
              <span className="text-xs text-gray-400 shrink-0">
                {new Date(s.date).toLocaleDateString("pt-BR")}
              </span>
            </Link>
          ))}
        </div>
      )}

      {!loading && sessions.length === 0 && !feedback && (
        <div className="text-center py-12 text-gray-400">
          <p className="text-lg mb-1">Nenhuma sessão ainda</p>
          <p className="text-sm">Registre sua primeira sessão para ver no calendário</p>
        </div>
      )}
    </div>
  );
}
