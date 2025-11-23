import React from "react";
import { useTranslation } from "react-i18next";
import ProgressSection from "../components/progressSection";

const ProgressPage = () => {
  const { t } = useTranslation();
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          {t("progress.title")}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">{t("progress.subtitle")}</p>
      </div>

      <ProgressSection />
    </div>
  );
};

export default ProgressPage;
