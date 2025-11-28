import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Brain, ArrowLeft } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import { LanguageSelector } from "../components/LanguageSelector";

const PrivacyPolicy: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogin = () => {
    navigate("/login");
  };

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate("/topics");
    } else {
      navigate("/register");
    }
  };

  // Helper function to render list items
  const renderList = (items: string[], ordered = false) => {
    const ListTag = ordered ? "ol" : "ul";
    return (
      <ListTag
        className={`${
          ordered ? "list-decimal" : "list-disc"
        } pl-6 space-y-2 text-gray-600`}
      >
        {items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ListTag>
    );
  };

  // Helper function to render a section with title and content
  const renderSection = (titleKey: string, children: React.ReactNode) => (
    <section className="mb-10">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">{t(titleKey)}</h2>
      {children}
    </section>
  );

  // Helper function to render a subsection
  const renderSubsection = (titleKey: string, children: React.ReactNode) => (
    <div className="mb-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-3">
        {t(titleKey)}
      </h3>
      {children}
    </div>
  );

  // Helper function to render a data collection block
  const renderDataBlock = (
    titleKey: string,
    whatWeCollectKey: string,
    whatWeCollectItemsKey: string,
    purposeKey: string,
    purposeItemsKey: string,
    legalBasisKey: string,
    legalBasisValueKey: string
  ) => (
    <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-100">
      <h4 className="font-semibold text-gray-800 mb-3">{t(titleKey)}</h4>

      <div className="mb-3">
        <p className="text-sm font-medium text-gray-700 mb-1">
          {t(whatWeCollectKey)}
        </p>
        {renderList(
          t(whatWeCollectItemsKey, { returnObjects: true }) as string[]
        )}
      </div>

      <div className="mb-3">
        <p className="text-sm font-medium text-gray-700 mb-1">
          {t(purposeKey)}
        </p>
        {renderList(t(purposeItemsKey, { returnObjects: true }) as string[])}
      </div>

      <div>
        <p className="text-sm font-medium text-gray-700 mb-1">
          {t(legalBasisKey)}
        </p>
        <p className="text-gray-600 text-sm">{t(legalBasisValueKey)}</p>
      </div>
    </div>
  );

  // Helper function to render a third-party service block
  const renderServiceBlock = (
    titleKey: string,
    providerKey: string,
    dataSharedKey: string,
    purposeKey: string,
    privacyKey: string,
    extraContent?: React.ReactNode
  ) => (
    <div className="mb-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
      <h4 className="font-semibold text-gray-800 mb-3">{t(titleKey)}</h4>
      <div className="space-y-2 text-sm text-gray-600">
        <p>
          <span className="font-medium">{t(providerKey)}</span>
        </p>
        <p>
          <span className="font-medium">{t(dataSharedKey)}</span>
        </p>
        <p>
          <span className="font-medium">{t(purposeKey)}</span>
        </p>
        <p>
          <span className="font-medium">{t(privacyKey)}</span>
        </p>
        {extraContent}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-white/80 backdrop-blur-md shadow-sm"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => navigate("/")}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600">
                <Brain size={24} className="text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-br from-indigo-500 to-purple-600 bg-clip-text text-transparent">
                MemoPal
              </span>
            </div>

            <div className="flex items-center gap-4">
              <LanguageSelector />
              {!isAuthenticated && (
                <button
                  onClick={handleLogin}
                  className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
                >
                  {t("landing.nav.login")}
                </button>
              )}
              <button
                onClick={handleGetStarted}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-all transform hover:scale-105"
              >
                {isAuthenticated
                  ? t("landing.hero.goToDashboard")
                  : t("landing.nav.getStarted")}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors mb-8"
          >
            <ArrowLeft size={20} />
            {t("common.backToHome")}
          </button>

          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {t("privacy.subtitle")}
            </h1>

            {/* Meta information */}
            <div className="bg-indigo-50 p-6 rounded-xl mb-6">
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-indigo-800">
                    <span className="font-semibold">
                      {t("privacy.lastUpdated")}:
                    </span>{" "}
                    {t("privacy.lastUpdatedDate")}
                  </p>
                  <p className="text-indigo-800">
                    <span className="font-semibold">
                      {t("privacy.responsible")}:
                    </span>{" "}
                    {t("privacy.responsibleValue")}
                  </p>
                </div>
                <div>
                  <p className="text-indigo-800">
                    <span className="font-semibold">
                      {t("privacy.contactEmail")}:
                    </span>{" "}
                    {t("privacy.contactEmailValue")}
                  </p>
                  <p className="text-indigo-800">
                    <span className="font-semibold">
                      {t("privacy.jurisdiction")}:
                    </span>{" "}
                    {t("privacy.jurisdictionValue")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="prose prose-lg max-w-none">
            {/* Section 1: Information We Collect */}
            {renderSection(
              "privacy.section1.title",
              <>
                <p className="text-gray-600 mb-6">
                  {t("privacy.section1.intro")}
                </p>

                {/* JWT Token */}
                {renderDataBlock(
                  "privacy.section1.jwt.title",
                  "privacy.section1.jwt.whatWeCollect",
                  "privacy.section1.jwt.whatWeCollectItems",
                  "privacy.section1.jwt.purpose",
                  "privacy.section1.jwt.purposeItems",
                  "privacy.section1.jwt.legalBasis",
                  "privacy.section1.jwt.legalBasisValue"
                )}

                {/* Registration Data */}
                {renderDataBlock(
                  "privacy.section1.registration.title",
                  "privacy.section1.registration.whatWeCollect",
                  "privacy.section1.registration.whatWeCollectItems",
                  "privacy.section1.registration.purpose",
                  "privacy.section1.registration.purposeItems",
                  "privacy.section1.registration.legalBasis",
                  "privacy.section1.registration.legalBasisValue"
                )}

                {/* Usage Data */}
                {renderDataBlock(
                  "privacy.section1.usage.title",
                  "privacy.section1.usage.whatWeCollect",
                  "privacy.section1.usage.whatWeCollectItems",
                  "privacy.section1.usage.purpose",
                  "privacy.section1.usage.purposeItems",
                  "privacy.section1.usage.legalBasis",
                  "privacy.section1.usage.legalBasisValue"
                )}

                {/* Google Calendar Tokens */}
                {renderDataBlock(
                  "privacy.section1.googleCalendar.title",
                  "privacy.section1.googleCalendar.whatWeCollect",
                  "privacy.section1.googleCalendar.whatWeCollectItems",
                  "privacy.section1.googleCalendar.purpose",
                  "privacy.section1.googleCalendar.purposeItems",
                  "privacy.section1.googleCalendar.legalBasis",
                  "privacy.section1.googleCalendar.legalBasisValue"
                )}

                {/* Email Verification Token */}
                {renderDataBlock(
                  "privacy.section1.emailVerification.title",
                  "privacy.section1.emailVerification.whatWeCollect",
                  "privacy.section1.emailVerification.whatWeCollectItems",
                  "privacy.section1.emailVerification.purpose",
                  "privacy.section1.emailVerification.purposeItems",
                  "privacy.section1.emailVerification.legalBasis",
                  "privacy.section1.emailVerification.legalBasisValue"
                )}

                {/* Images */}
                {renderDataBlock(
                  "privacy.section1.images.title",
                  "privacy.section1.images.whatWeCollect",
                  "privacy.section1.images.whatWeCollectItems",
                  "privacy.section1.images.purpose",
                  "privacy.section1.images.purposeItems",
                  "privacy.section1.images.legalBasis",
                  "privacy.section1.images.legalBasisValue"
                )}

                {/* AI Usage */}
                <div className="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <h4 className="font-semibold text-blue-800 mb-3">
                    {t("privacy.section1.ai.title")}
                  </h4>
                  <p className="text-blue-700 mb-3">
                    {t("privacy.section1.ai.intro")}
                  </p>
                  {renderList(
                    t("privacy.section1.ai.features", {
                      returnObjects: true,
                    }) as string[]
                  )}

                  <div className="mt-4 bg-amber-50 p-4 rounded-lg border border-amber-200">
                    <h5 className="font-semibold text-amber-800 mb-2">
                      {t("privacy.section1.ai.importantTitle")}
                    </h5>
                    {renderList(
                      t("privacy.section1.ai.importantItems", {
                        returnObjects: true,
                      }) as string[]
                    )}
                  </div>

                  <div className="mt-4">
                    <h5 className="font-semibold text-blue-800 mb-2">
                      {t("privacy.section1.ai.servicesTitle")}
                    </h5>
                    {renderList(
                      t("privacy.section1.ai.servicesItems", {
                        returnObjects: true,
                      }) as string[]
                    )}
                  </div>

                  <p className="text-blue-700 mt-4 font-medium">
                    {t("privacy.section1.ai.userControl")}
                  </p>
                </div>

                {/* Important Clarification */}
                <div className="mb-6 bg-green-50 p-4 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-green-800 mb-3">
                    {t("privacy.section1.clarification.title")}
                  </h4>
                  <p className="text-green-700 mb-2">
                    {t("privacy.section1.clarification.intro")}
                  </p>
                  {renderList(
                    t("privacy.section1.clarification.items", {
                      returnObjects: true,
                    }) as string[]
                  )}
                </div>

                {/* Technical Cookies */}
                <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h4 className="font-semibold text-gray-800 mb-3">
                    {t("privacy.section1.technicalCookies.title")}
                  </h4>
                  <p className="text-gray-600 mb-2">
                    {t("privacy.section1.technicalCookies.intro")}
                  </p>
                  {renderList(
                    t("privacy.section1.technicalCookies.items", {
                      returnObjects: true,
                    }) as string[]
                  )}
                </div>
              </>
            )}

            {/* Section 2: Purpose and Legal Basis */}
            {renderSection(
              "privacy.section2.title",
              <>
                <p className="text-gray-600 mb-6">
                  {t("privacy.section2.intro")}
                </p>

                {renderSubsection(
                  "privacy.section2.mainServices.title",
                  renderList(
                    t("privacy.section2.mainServices.items", {
                      returnObjects: true,
                    }) as string[]
                  )
                )}

                {renderSubsection(
                  "privacy.section2.communications.title",
                  renderList(
                    t("privacy.section2.communications.items", {
                      returnObjects: true,
                    }) as string[]
                  )
                )}

                {renderSubsection(
                  "privacy.section2.integrations.title",
                  renderList(
                    t("privacy.section2.integrations.items", {
                      returnObjects: true,
                    }) as string[]
                  )
                )}

                <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 rounded-r-lg mt-4">
                  <p className="text-indigo-800">
                    {t("privacy.section2.legalBasis")}
                  </p>
                </div>
              </>
            )}

            {/* Section 3: Storage and Security */}
            {renderSection(
              "privacy.section3.title",
              <>
                {renderSubsection(
                  "privacy.section3.infrastructure.title",
                  <div className="bg-gray-50 p-4 rounded-lg">
                    {renderList(
                      t("privacy.section3.infrastructure.items", {
                        returnObjects: true,
                      }) as string[]
                    )}
                  </div>
                )}

                {renderSubsection(
                  "privacy.section3.security.title",
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    {renderList(
                      t("privacy.section3.security.items", {
                        returnObjects: true,
                      }) as string[]
                    )}
                  </div>
                )}

                {renderSubsection(
                  "privacy.section3.imageOptimization.title",
                  <div className="bg-gray-50 p-4 rounded-lg">
                    {renderList(
                      t("privacy.section3.imageOptimization.items", {
                        returnObjects: true,
                      }) as string[]
                    )}
                  </div>
                )}
              </>
            )}

            {/* Section 4: Third-Party Services */}
            {renderSection(
              "privacy.section4.title",
              <>
                <p className="text-gray-600 mb-6">
                  {t("privacy.section4.intro")}
                </p>

                {renderServiceBlock(
                  "privacy.section4.railway.title",
                  "privacy.section4.railway.provider",
                  "privacy.section4.railway.dataShared",
                  "privacy.section4.railway.purpose",
                  "privacy.section4.railway.privacy"
                )}

                {renderServiceBlock(
                  "privacy.section4.cloudflareR2.title",
                  "privacy.section4.cloudflareR2.provider",
                  "privacy.section4.cloudflareR2.dataShared",
                  "privacy.section4.cloudflareR2.purpose",
                  "privacy.section4.cloudflareR2.privacy"
                )}

                {renderServiceBlock(
                  "privacy.section4.cloudflarePages.title",
                  "privacy.section4.cloudflarePages.provider",
                  "privacy.section4.cloudflarePages.dataShared",
                  "privacy.section4.cloudflarePages.purpose",
                  "privacy.section4.cloudflarePages.privacy"
                )}

                {renderServiceBlock(
                  "privacy.section4.resend.title",
                  "privacy.section4.resend.provider",
                  "privacy.section4.resend.dataShared",
                  "privacy.section4.resend.purpose",
                  "privacy.section4.resend.privacy"
                )}

                {/* Gemini API */}
                <div className="mb-4 bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <h4 className="font-semibold text-blue-800 mb-3">
                    {t("privacy.section4.gemini.title")}
                  </h4>
                  <div className="space-y-2 text-sm text-blue-700">
                    <p>{t("privacy.section4.gemini.provider")}</p>
                    <p>{t("privacy.section4.gemini.dataShared")}</p>
                    <p>{t("privacy.section4.gemini.purpose")}</p>
                    <p>{t("privacy.section4.gemini.usage")}</p>
                    <p>{t("privacy.section4.gemini.privacy")}</p>
                  </div>
                </div>

                {/* Google Calendar API */}
                <div className="mb-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h4 className="font-semibold text-gray-800 mb-3">
                    {t("privacy.section4.googleCalendar.title")}
                  </h4>
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <p>{t("privacy.section4.googleCalendar.provider")}</p>
                    <p>{t("privacy.section4.googleCalendar.dataShared")}</p>
                    <p>{t("privacy.section4.googleCalendar.purpose")}</p>
                    <p>{t("privacy.section4.googleCalendar.scope")}</p>
                    <p>{t("privacy.section4.googleCalendar.usage")}</p>
                    <p>{t("privacy.section4.googleCalendar.privacy")}</p>
                  </div>

                  <div className="bg-white p-3 rounded-lg mb-3">
                    <h5 className="font-semibold text-gray-800 mb-2">
                      {t("privacy.section4.googleCalendar.detailsTitle")}
                    </h5>
                    {renderList(
                      t("privacy.section4.googleCalendar.details", {
                        returnObjects: true,
                      }) as string[]
                    )}
                  </div>

                  <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
                    <p className="text-amber-800 text-sm font-medium">
                      {t("privacy.section4.googleCalendar.important")}
                    </p>
                  </div>
                </div>
              </>
            )}

            {/* Section 5: Data Retention */}
            {renderSection(
              "privacy.section5.title",
              <>
                {renderSubsection(
                  "privacy.section5.activeUse.title",
                  <p className="text-gray-600">
                    {t("privacy.section5.activeUse.content")}
                  </p>
                )}

                {renderSubsection(
                  "privacy.section5.deletion.title",
                  <>
                    <p className="text-gray-600 mb-2">
                      {t("privacy.section5.deletion.intro")}
                    </p>
                    {renderList(
                      t("privacy.section5.deletion.items", {
                        returnObjects: true,
                      }) as string[]
                    )}
                  </>
                )}

                {renderSubsection(
                  "privacy.section5.autoExpiration.title",
                  <div className="bg-gray-50 p-4 rounded-lg">
                    {renderList(
                      t("privacy.section5.autoExpiration.items", {
                        returnObjects: true,
                      }) as string[]
                    )}
                  </div>
                )}
              </>
            )}

            {/* Section 6: Your Rights */}
            {renderSection(
              "privacy.section6.title",
              <>
                <p className="text-gray-600 mb-6">
                  {t("privacy.section6.intro")}
                </p>

                {renderSubsection(
                  "privacy.section6.access.title",
                  <p className="text-gray-600">
                    {t("privacy.section6.access.content")}
                  </p>
                )}

                {renderSubsection(
                  "privacy.section6.update.title",
                  <p className="text-gray-600">
                    {t("privacy.section6.update.content")}
                  </p>
                )}

                {renderSubsection(
                  "privacy.section6.deletion.title",
                  <>
                    <p className="text-gray-600 mb-2">
                      {t("privacy.section6.deletion.intro")}
                    </p>
                    <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                      {renderList(
                        t("privacy.section6.deletion.items", {
                          returnObjects: true,
                        }) as string[]
                      )}
                    </div>
                  </>
                )}

                {renderSubsection(
                  "privacy.section6.revocation.title",
                  <>
                    <p className="text-gray-600 mb-2">
                      {t("privacy.section6.revocation.intro")}
                    </p>
                    {renderList(
                      t("privacy.section6.revocation.items", {
                        returnObjects: true,
                      }) as string[]
                    )}
                  </>
                )}

                {renderSubsection(
                  "privacy.section6.complaints.title",
                  <p className="text-gray-600">
                    {t("privacy.section6.complaints.content")}
                  </p>
                )}
              </>
            )}

            {/* Section 7: Minors */}
            {renderSection(
              "privacy.section7.title",
              <>
                <p className="text-gray-600 mb-4">
                  {t("privacy.section7.intro")}
                </p>
                <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                  <p className="text-amber-800 font-semibold mb-2">
                    {t("privacy.section7.minimumAge")}
                  </p>
                  <p className="text-amber-700">
                    {t("privacy.section7.parentalConsent")}
                  </p>
                </div>
              </>
            )}

            {/* Section 8: International Transfers */}
            {renderSection(
              "privacy.section8.title",
              <>
                <p className="text-gray-600 mb-4">
                  {t("privacy.section8.content")}
                </p>
                <p className="text-gray-600">
                  {t("privacy.section8.compliance")}
                </p>
              </>
            )}

            {/* Section 9: Changes to Policy */}
            {renderSection(
              "privacy.section9.title",
              <>
                <p className="text-gray-600 mb-4">
                  {t("privacy.section9.intro")}
                </p>
                {renderList(
                  t("privacy.section9.notificationMethods", {
                    returnObjects: true,
                  }) as string[]
                )}
                <p className="text-gray-600 mt-4">
                  {t("privacy.section9.dateNote")}
                </p>
                <p className="text-gray-600 mt-2">
                  {t("privacy.section9.recommendation")}
                </p>
              </>
            )}

            {/* Section 10: Contact */}
            {renderSection(
              "privacy.section10.title",
              <>
                <p className="text-gray-600 mb-4">
                  {t("privacy.section10.intro")}
                </p>

                <div className="bg-indigo-50 p-6 rounded-xl">
                  <p className="text-indigo-800 font-medium mb-2">
                    {t("privacy.section10.email")}
                  </p>
                  <p className="text-indigo-800 font-medium mb-2">
                    {t("privacy.section10.responsible")}
                  </p>
                  <p className="text-indigo-800 font-medium mb-4">
                    {t("privacy.section10.jurisdiction")}
                  </p>
                  <p className="text-indigo-700">
                    {t("privacy.section10.responseTime")}
                  </p>
                </div>
              </>
            )}

            {/* Footer Note */}
            <div className="border-t border-gray-200 pt-8 text-center">
              <p className="text-gray-500 italic">
                {t("privacy.footer.lastUpdatedNote")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-gray-800 text-gray-400 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600">
                  <Brain size={24} className="text-white" />
                </div>
                <span className="text-xl font-bold text-white">MemoPal</span>
              </div>
              <p className="text-sm">{t("landing.footer.tagline")}</p>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">
                {t("landing.footer.product")}
              </h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="/#features" className="hover:text-white transition">
                    {t("landing.footer.features")}
                  </a>
                </li>
                <li>
                  <a href="/#pricing" className="hover:text-white transition">
                    {t("landing.footer.pricing")}
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">
                {t("landing.footer.resources")}
              </h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition">
                    {t("landing.footer.blog")}
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    {t("landing.footer.guides")}
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    {t("landing.footer.support")}
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">
                {t("landing.footer.legal")}
              </h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="/privacy"
                    className="hover:text-white transition text-white font-medium"
                  >
                    {t("landing.footer.privacy")}
                  </a>
                </li>
                <li>
                  <a href="/terms" className="hover:text-white transition">
                    {t("landing.footer.terms")}
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 dark:border-gray-700 pt-8 text-center text-sm">
            <p>{t("landing.footer.copyright")}</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PrivacyPolicy;
