/**
 * Componente SessionResultsSummary - Fase 2
 * Resumen de resultados post-sesión intensiva
 */
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  CheckCircle,
  Clock,
  Award,
  Zap,
  Calendar,
  ArrowRight,
  Trophy,
} from "lucide-react";
import { IntensiveSessionDetail } from "../types/intensiveSessions";
import { IntradayReview, IntradayReviewStatus } from "../types/intradayReviews";
import { UserBadge } from "../types/gamification";

interface SessionResultsSummaryProps {
  session: IntensiveSessionDetail;
  newBadges?: UserBadge[];
  intradayReviews?: IntradayReview[];
  onClose?: () => void;
  onStartIntradayReview?: (reviewId: string) => void;
}

const SessionResultsSummary: React.FC<SessionResultsSummaryProps> = ({
  session,
  newBadges = [],
  intradayReviews = [],
  onClose,
  onStartIntradayReview,
}) => {
  const { t } = useTranslation();

  // Calcular estadísticas de la sesión
  const stats = useMemo(() => {
    const completedCards =
      session.sessionCards?.filter((c) => c.completed).length || 0;
    const totalCards = session.totalCards || 0;
    const completedPomodoros =
      session.pomodoroBlocks?.filter((p) => p.status === "COMPLETED").length ||
      0;
    const totalPomodoros = session.totalPomodoros || 0;

    return {
      completedCards,
      totalCards,
      completedPomodoros,
      totalPomodoros,
      xpEarned: session.xpEarned || 0,
    };
  }, [session]);

  // Formatear hora de repaso
  const formatReviewTime = (isoString: string): string => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Obtener status color
  const getStatusColor = (status: IntradayReviewStatus) => {
    switch (status) {
      case IntradayReviewStatus.PENDING:
        return "text-amber-600 bg-amber-100 dark:bg-amber-900/30";
      case IntradayReviewStatus.COMPLETED:
        return "text-green-600 bg-green-100 dark:bg-green-900/30";
      case IntradayReviewStatus.MISSED:
        return "text-red-600 bg-red-100 dark:bg-red-900/30";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  // Obtener badge icon
  const getBadgeIcon = (badgeType: string): string => {
    // Badge types: POMODORO_*, SESSION_*, STREAK_*, CARD_*, EARLY_BIRD
    if (badgeType.startsWith("POMODORO")) return "🍅";
    if (badgeType.startsWith("SESSION")) return "📚";
    if (badgeType.startsWith("STREAK")) return "🔥";
    if (badgeType.startsWith("CARD")) return "🃏";
    if (badgeType === "EARLY_BIRD") return "🌅";
    return "🏆";
  };

  // Repasos pendientes
  const pendingReviews = intradayReviews.filter(
    (r) => r.status === IntradayReviewStatus.PENDING,
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header de celebración */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 mb-4">
          <Trophy className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          {t("intensiveStudy.sessionCompleted", "¡Sesión Completada!")}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          {session?.topic?.name ||
            t("intensiveStudy.intensiveSession", "Sesión Intensiva")}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {/* Tarjetas completadas */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {stats.completedCards}/{stats.totalCards}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t("intensiveStudy.cards", "Tarjetas")}
              </p>
            </div>
          </div>
        </div>

        {/* Pomodoros completados */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <Clock className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {stats.completedPomodoros}/{stats.totalPomodoros}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t("intensiveStudy.pomodoros", "Pomodoros")}
              </p>
            </div>
          </div>
        </div>

        {/* XP ganado */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 col-span-2 md:col-span-1">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <Zap className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                +{stats.xpEarned}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t("intensiveStudy.xpEarned", "XP")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Nuevos Badges */}
      {newBadges.length > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl p-6 border border-amber-200 dark:border-amber-700">
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-5 h-5 text-amber-600" />
            <h3 className="font-semibold text-gray-800 dark:text-white">
              {t("intensiveStudy.newBadges", "¡Nuevos Badges Desbloqueados!")}
            </h3>
          </div>

          <div className="flex flex-wrap gap-3">
            {newBadges.map((badge) => (
              <div
                key={badge.id}
                className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 rounded-lg border border-amber-200 dark:border-amber-700"
              >
                <span className="text-2xl">
                  {getBadgeIcon(badge.badgeType)}
                </span>
                <div>
                  <p className="text-sm font-medium text-gray-800 dark:text-white">
                    {badge.badgeType
                      .replace(/_/g, " ")
                      .replace(/\b\w/g, (l) => l.toUpperCase())}
                  </p>
                  {badge.earnedAt && (
                    <p className="text-xs text-gray-500">
                      {new Date(badge.earnedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Repasos Intradía Programados */}
      {pendingReviews.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-800 dark:text-white">
              {t("intensiveStudy.intradayReviews", "Repasos Programados")}
            </h3>
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {t(
              "intensiveStudy.intradayReviewsDesc",
              "Tienes repasos programados para hoy. ¡No los olvides!",
            )}
          </p>

          <div className="space-y-3">
            {pendingReviews.map((review) => (
              <div
                key={review.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(review.status)}`}
                  >
                    {formatReviewTime(review.scheduledFor)}
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {review.cards?.length || 0}{" "}
                    {t("intensiveStudy.cards", "tarjetas")}
                  </span>
                </div>

                {onStartIntradayReview && (
                  <button
                    onClick={() => onStartIntradayReview(review.id)}
                    className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400"
                  >
                    {t("intensiveStudy.startReview", "Repasar")}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Botón de cierre */}
      {onClose && (
        <div className="flex justify-center pt-4">
          <button
            onClick={onClose}
            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
          >
            {t("intensiveStudy.backToDashboard", "Volver al Inicio")}
          </button>
        </div>
      )}
    </div>
  );
};

export default SessionResultsSummary;
