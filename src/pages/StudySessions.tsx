import { useEffect } from "react";
import SpacedRepetitionDashboard from "../components/spacedRepetitionDashboard";
import { useReviews } from "../../hooks/useReviews";

const StudySessions = () => {
  const { fetchAllReviews, pendingReviews, upcomingReviews } = useReviews();

  useEffect(() => {
    fetchAllReviews();
  }, []);

  const upcomingCount =
    upcomingReviews && typeof upcomingReviews === "object"
      ? Object.values(upcomingReviews).reduce((total, dateGroup) => {
          return total + (Array.isArray(dateGroup) ? dateGroup.length : 0);
        }, 0)
      : 0;

  return (
    <div className="max-w-7xl mx-auto">
      <SpacedRepetitionDashboard />
    </div>
  );
};

export default StudySessions;
