import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Brain, ArrowLeft } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import { LanguageSelector } from "../components/LanguageSelector";

const TermsOfService: React.FC = () => {
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

  // Helper function to render a feature block
  const renderFeatureBlock = (titleKey: string, itemsKey: string) => (
    <div className="mb-4 bg-gray-50 p-4 rounded-lg">
      <h4 className="font-semibold text-gray-800 mb-2">{t(titleKey)}</h4>
      {renderList(t(itemsKey, { returnObjects: true }) as string[])}
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
              {t("terms.subtitle")}
            </h1>
            <p className="text-sm text-gray-500 mb-6">
              {t("terms.lastUpdated")}: {t("terms.lastUpdatedDate")}
            </p>
            <p className="text-lg text-gray-600 leading-relaxed">
              {t("terms.intro")}
            </p>
          </div>

          <div className="prose prose-lg max-w-none">
            {/* Section 1: Acceptance of Terms */}
            {renderSection(
              "terms.section1.title",
              <>
                <p className="text-gray-600 mb-4">
                  {t("terms.section1.content")}
                </p>
                <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg">
                  <p className="text-amber-800 font-semibold">
                    {t("terms.section1.important")}
                  </p>
                </div>
              </>
            )}

            {/* Section 2: Service Definition */}
            {renderSection(
              "terms.section2.title",
              <>
                {renderSubsection(
                  "terms.section2.subtitle1",
                  <p className="text-gray-600">
                    {t("terms.section2.description")}
                  </p>
                )}

                {renderSubsection(
                  "terms.section2.subtitle2",
                  <>
                    {renderFeatureBlock(
                      "terms.section2.featureA.title",
                      "terms.section2.featureA.items"
                    )}
                    {renderFeatureBlock(
                      "terms.section2.featureB.title",
                      "terms.section2.featureB.items"
                    )}
                    {renderFeatureBlock(
                      "terms.section2.featureC.title",
                      "terms.section2.featureC.items"
                    )}
                    {renderFeatureBlock(
                      "terms.section2.featureD.title",
                      "terms.section2.featureD.items"
                    )}
                    {renderFeatureBlock(
                      "terms.section2.featureE.title",
                      "terms.section2.featureE.items"
                    )}
                    {renderFeatureBlock(
                      "terms.section2.featureF.title",
                      "terms.section2.featureF.items"
                    )}
                  </>
                )}
              </>
            )}

            {/* Section 3: Eligibility and Registration */}
            {renderSection(
              "terms.section3.title",
              <>
                {renderSubsection(
                  "terms.section3.subtitle1",
                  renderList(
                    t("terms.section3.ageRequirements", {
                      returnObjects: true,
                    }) as string[]
                  )
                )}

                {renderSubsection(
                  "terms.section3.subtitle2",
                  <>
                    <p className="text-gray-600 mb-2">
                      {t("terms.section3.registrationInfo")}
                    </p>
                    {renderList(
                      t("terms.section3.registrationItems", {
                        returnObjects: true,
                      }) as string[]
                    )}
                    <div className="mt-4">
                      {renderList(
                        t("terms.section3.registrationExtra", {
                          returnObjects: true,
                        }) as string[]
                      )}
                    </div>
                  </>
                )}

                {renderSubsection(
                  "terms.section3.subtitle3",
                  <>
                    <p className="text-gray-600 mb-2">
                      {t("terms.section3.veracityIntro")}
                    </p>
                    {renderList(
                      t("terms.section3.veracityItems", {
                        returnObjects: true,
                      }) as string[]
                    )}
                  </>
                )}

                {renderSubsection(
                  "terms.section3.subtitle4",
                  <>
                    <p className="text-gray-600 mb-2">
                      {t("terms.section3.accountResponsibility")}
                    </p>
                    {renderList(
                      t("terms.section3.accountItems", {
                        returnObjects: true,
                      }) as string[]
                    )}
                    <p className="text-gray-600 mt-4 mb-2 font-semibold">
                      {t("terms.section3.notifyImmediately")}
                    </p>
                    {renderList(
                      t("terms.section3.notifyItems", {
                        returnObjects: true,
                      }) as string[]
                    )}
                  </>
                )}

                {renderSubsection(
                  "terms.section3.subtitle5",
                  <>
                    <p className="text-gray-600 mb-4">
                      {t("terms.section3.aiIntro")}
                    </p>

                    <div className="space-y-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h5 className="font-semibold text-blue-800 mb-2">
                          {t("terms.section3.aiConsent.title")}
                        </h5>
                        <p className="text-blue-700">
                          {t("terms.section3.aiConsent.content")}
                        </p>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h5 className="font-semibold text-gray-800 mb-2">
                          {t("terms.section3.aiResponsibility.title")}
                        </h5>
                        <p className="text-gray-600 mb-2">
                          {t("terms.section3.aiResponsibility.intro")}
                        </p>
                        {renderList(
                          t("terms.section3.aiResponsibility.items", {
                            returnObjects: true,
                          }) as string[]
                        )}
                      </div>

                      <div className="bg-red-50 p-4 rounded-lg">
                        <h5 className="font-semibold text-red-800 mb-2">
                          {t("terms.section3.aiProhibited.title")}
                        </h5>
                        <p className="text-red-700 mb-2">
                          {t("terms.section3.aiProhibited.intro")}
                        </p>
                        {renderList(
                          t("terms.section3.aiProhibited.items", {
                            returnObjects: true,
                          }) as string[]
                        )}
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h5 className="font-semibold text-gray-800 mb-2">
                          {t("terms.section3.aiNature.title")}
                        </h5>
                        {renderList(
                          t("terms.section3.aiNature.items", {
                            returnObjects: true,
                          }) as string[]
                        )}
                      </div>

                      <div className="bg-amber-50 p-4 rounded-lg">
                        <h5 className="font-semibold text-amber-800 mb-2">
                          {t("terms.section3.aiLimitation.title")}
                        </h5>
                        {renderList(
                          t("terms.section3.aiLimitation.items", {
                            returnObjects: true,
                          }) as string[]
                        )}
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h5 className="font-semibold text-gray-800 mb-2">
                          {t("terms.section3.aiProcessing.title")}
                        </h5>
                        {renderList(
                          t("terms.section3.aiProcessing.items", {
                            returnObjects: true,
                          }) as string[]
                        )}
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h5 className="font-semibold text-gray-800 mb-2">
                          {t("terms.section3.aiIP.title")}
                        </h5>
                        {renderList(
                          t("terms.section3.aiIP.items", {
                            returnObjects: true,
                          }) as string[]
                        )}
                      </div>
                    </div>
                  </>
                )}
              </>
            )}

            {/* Section 4: Intellectual Property */}
            {renderSection(
              "terms.section4.title",
              <>
                {renderSubsection(
                  "terms.section4.subtitle1",
                  <>
                    <p className="text-gray-600 mb-2">
                      {t("terms.section4.providerContent")}
                    </p>
                    {renderList(
                      t("terms.section4.providerItems", {
                        returnObjects: true,
                      }) as string[]
                    )}
                  </>
                )}

                {renderSubsection(
                  "terms.section4.subtitle2",
                  <>
                    <p className="text-gray-600 mb-2">
                      {t("terms.section4.userContent")}
                    </p>
                    {renderList(
                      t("terms.section4.userItems", {
                        returnObjects: true,
                      }) as string[]
                    )}
                  </>
                )}

                {renderSubsection(
                  "terms.section4.subtitle3",
                  <>
                    <p className="text-gray-600 mb-2">
                      {t("terms.section4.licenseToProvider")}
                    </p>
                    {renderList(
                      t("terms.section4.licenseToProviderItems", {
                        returnObjects: true,
                      }) as string[]
                    )}
                  </>
                )}

                {renderSubsection(
                  "terms.section4.subtitle4",
                  <>
                    <p className="text-gray-600 mb-2">
                      {t("terms.section4.licenseToUser")}
                    </p>
                    {renderList(
                      t("terms.section4.licenseToUserItems", {
                        returnObjects: true,
                      }) as string[]
                    )}
                  </>
                )}

                {renderSubsection(
                  "terms.section4.subtitle5",
                  <>
                    <p className="text-gray-600 mb-2">
                      {t("terms.section4.prohibitions")}
                    </p>
                    {renderList(
                      t("terms.section4.prohibitionItems", {
                        returnObjects: true,
                      }) as string[]
                    )}
                  </>
                )}
              </>
            )}

            {/* Section 5: Acceptable Use */}
            {renderSection(
              "terms.section5.title",
              <>
                {renderSubsection(
                  "terms.section5.subtitle1",
                  renderList(
                    t("terms.section5.allowedUses", {
                      returnObjects: true,
                    }) as string[]
                  )
                )}

                {renderSubsection(
                  "terms.section5.subtitle2",
                  <>
                    <div className="bg-red-50 p-4 rounded-lg mb-4">
                      <h4 className="font-semibold text-red-800 mb-2">
                        {t("terms.section5.prohibitedContentTitle")}
                      </h4>
                      <p className="text-red-700 mb-2">
                        {t("terms.section5.prohibitedContentIntro")}
                      </p>
                      {renderList(
                        t("terms.section5.prohibitedContentItems", {
                          returnObjects: true,
                        }) as string[]
                      )}
                    </div>

                    <div className="bg-red-50 p-4 rounded-lg mb-4">
                      <h4 className="font-semibold text-red-800 mb-2">
                        {t("terms.section5.prohibitedActivitiesTitle")}
                      </h4>
                      <p className="text-red-700 mb-2">
                        {t("terms.section5.prohibitedActivitiesIntro")}
                      </p>
                      {renderList(
                        t("terms.section5.prohibitedActivitiesItems", {
                          returnObjects: true,
                        }) as string[]
                      )}
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-800 mb-2">
                        {t("terms.section5.technicalLimitsTitle")}
                      </h4>
                      {renderList(
                        t("terms.section5.technicalLimits", {
                          returnObjects: true,
                        }) as string[]
                      )}
                    </div>
                  </>
                )}

                {renderSubsection(
                  "terms.section5.subtitle3",
                  renderList(
                    t("terms.section5.consequences", {
                      returnObjects: true,
                    }) as string[]
                  )
                )}
              </>
            )}

            {/* Section 6: Data Protection */}
            {renderSection(
              "terms.section6.title",
              <>
                {renderSubsection(
                  "terms.section6.subtitle1",
                  <>
                    <p className="text-gray-600 mb-2">
                      {t("terms.section6.collectionIntro")}
                    </p>
                    {renderList(
                      t("terms.section6.collectionItems", {
                        returnObjects: true,
                      }) as string[]
                    )}
                  </>
                )}

                {renderSubsection(
                  "terms.section6.subtitle2",
                  renderList(
                    t("terms.section6.legalBasis", {
                      returnObjects: true,
                    }) as string[]
                  )
                )}

                {renderSubsection(
                  "terms.section6.subtitle3",
                  <>
                    <p className="text-gray-600 mb-2">
                      {t("terms.section6.minorsIntro")}
                    </p>
                    {renderList(
                      t("terms.section6.minorsItems", {
                        returnObjects: true,
                      }) as string[]
                    )}
                  </>
                )}

                {renderSubsection(
                  "terms.section6.subtitle4",
                  <>
                    <p className="text-gray-600 mb-2">
                      {t("terms.section6.cookiesIntro")}
                    </p>
                    {renderList(
                      t("terms.section6.cookiesItems", {
                        returnObjects: true,
                      }) as string[]
                    )}
                  </>
                )}

                {renderSubsection(
                  "terms.section6.subtitle5",
                  <>
                    <div className="bg-gray-50 p-4 rounded-lg mb-4">
                      <h4 className="font-semibold text-gray-800 mb-2">
                        {t("terms.section6.googleCalendarTitle")}
                      </h4>
                      {renderList(
                        t("terms.section6.googleCalendarItems", {
                          returnObjects: true,
                        }) as string[]
                      )}
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-800 mb-2">
                        {t("terms.section6.otherServicesTitle")}
                      </h4>
                      {renderList(
                        t("terms.section6.otherServicesItems", {
                          returnObjects: true,
                        }) as string[]
                      )}
                    </div>
                  </>
                )}

                {renderSubsection(
                  "terms.section6.subtitle6",
                  renderList(
                    t("terms.section6.internationalTransfers", {
                      returnObjects: true,
                    }) as string[]
                  )
                )}
              </>
            )}

            {/* Section 7: Limitation of Liability */}
            {renderSection(
              "terms.section7.title",
              <>
                {renderSubsection(
                  "terms.section7.subtitle1",
                  <>
                    <p className="text-gray-600 mb-2">
                      {t("terms.section7.serviceNature")}
                    </p>
                    {renderList(
                      t("terms.section7.serviceNatureItems", {
                        returnObjects: true,
                      }) as string[]
                    )}
                  </>
                )}

                {renderSubsection(
                  "terms.section7.subtitle2",
                  renderList(
                    t("terms.section7.availability", {
                      returnObjects: true,
                    }) as string[]
                  )
                )}

                {renderSubsection(
                  "terms.section7.subtitle3",
                  <>
                    <p className="text-gray-600 mb-2">
                      {t("terms.section7.contentResponsibility")}
                    </p>
                    {renderList(
                      t("terms.section7.contentResponsibilityItems", {
                        returnObjects: true,
                      }) as string[]
                    )}
                  </>
                )}

                {renderSubsection(
                  "terms.section7.subtitle4",
                  <>
                    <p className="text-gray-600 mb-2">
                      {t("terms.section7.dataLoss")}
                    </p>
                    {renderList(
                      t("terms.section7.dataLossItems", {
                        returnObjects: true,
                      }) as string[]
                    )}
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg mt-4">
                      <p className="text-blue-800 font-semibold">
                        {t("terms.section7.dataLossRecommendation")}
                      </p>
                    </div>
                  </>
                )}

                {renderSubsection(
                  "terms.section7.subtitle5",
                  <>
                    <p className="text-gray-600 mb-2">
                      {t("terms.section7.thirdParty")}
                    </p>
                    {renderList(
                      t("terms.section7.thirdPartyItems", {
                        returnObjects: true,
                      }) as string[]
                    )}
                  </>
                )}

                {renderSubsection(
                  "terms.section7.subtitle6",
                  <>
                    <p className="text-gray-600 mb-2">
                      {t("terms.section7.monetaryLimit")}
                    </p>
                    {renderList(
                      t("terms.section7.monetaryLimitItems", {
                        returnObjects: true,
                      }) as string[]
                    )}
                    <p className="text-gray-500 text-sm mt-2 italic">
                      {t("terms.section7.monetaryLimitNote")}
                    </p>
                  </>
                )}

                {renderSubsection(
                  "terms.section7.subtitle7",
                  <>
                    <p className="text-gray-600 mb-2">
                      {t("terms.section7.damagesExclusion")}
                    </p>
                    {renderList(
                      t("terms.section7.damagesExclusionItems", {
                        returnObjects: true,
                      }) as string[]
                    )}
                  </>
                )}

                {renderSubsection(
                  "terms.section7.subtitle8",
                  <p className="text-gray-600">
                    {t("terms.section7.jurisdictions")}
                  </p>
                )}
              </>
            )}

            {/* Section 8: Suspension and Termination */}
            {renderSection(
              "terms.section8.title",
              <>
                {renderSubsection(
                  "terms.section8.subtitle1",
                  <>
                    <p className="text-gray-600 mb-2">
                      {t("terms.section8.userTermination")}
                    </p>
                    {renderList(
                      t("terms.section8.userTerminationItems", {
                        returnObjects: true,
                      }) as string[]
                    )}
                    <p className="text-gray-600 mt-4 mb-2">
                      {t("terms.section8.deletionProcess")}
                    </p>
                    {renderList(
                      t("terms.section8.deletionProcessItems", {
                        returnObjects: true,
                      }) as string[],
                      true
                    )}
                  </>
                )}

                {renderSubsection(
                  "terms.section8.subtitle2",
                  <>
                    <p className="text-gray-600 mb-4">
                      {t("terms.section8.providerTermination")}
                    </p>

                    <div className="space-y-4">
                      <div className="bg-red-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-red-800 mb-2">
                          {t("terms.section8.seriousBreachTitle")}
                        </h4>
                        {renderList(
                          t("terms.section8.seriousBreachItems", {
                            returnObjects: true,
                          }) as string[]
                        )}
                      </div>

                      <div className="bg-red-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-red-800 mb-2">
                          {t("terms.section8.fraudTitle")}
                        </h4>
                        {renderList(
                          t("terms.section8.fraudItems", {
                            returnObjects: true,
                          }) as string[]
                        )}
                      </div>

                      <div className="bg-red-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-red-800 mb-2">
                          {t("terms.section8.harmfulTitle")}
                        </h4>
                        {renderList(
                          t("terms.section8.harmfulItems", {
                            returnObjects: true,
                          }) as string[]
                        )}
                      </div>
                    </div>
                  </>
                )}

                {renderSubsection(
                  "terms.section8.subtitle3",
                  renderList(
                    t("terms.section8.terminationProcess", {
                      returnObjects: true,
                    }) as string[]
                  )
                )}

                {renderSubsection(
                  "terms.section8.subtitle4",
                  renderList(
                    t("terms.section8.terminationEffects", {
                      returnObjects: true,
                    }) as string[]
                  )
                )}
              </>
            )}

            {/* Section 9: Data Deletion */}
            {renderSection(
              "terms.section9.title",
              <>
                {renderSubsection(
                  "terms.section9.subtitle1",
                  <>
                    <div className="bg-gray-50 p-4 rounded-lg mb-4">
                      <h4 className="font-semibold text-gray-800 mb-2">
                        {t("terms.section9.requestTitle")}
                      </h4>
                      <p className="text-gray-600 mb-2">
                        {t("terms.section9.requestIntro")}
                      </p>
                      {renderList(
                        t("terms.section9.requestItems", {
                          returnObjects: true,
                        }) as string[]
                      )}
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg mb-4">
                      <h4 className="font-semibold text-gray-800 mb-2">
                        {t("terms.section9.deletedDataTitle")}
                      </h4>
                      <p className="text-gray-600 mb-2">
                        {t("terms.section9.deletedDataIntro")}
                      </p>
                      {renderList(
                        t("terms.section9.deletedDataItems", {
                          returnObjects: true,
                        }) as string[]
                      )}
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-800 mb-2">
                        {t("terms.section9.automatedTitle")}
                      </h4>
                      {renderList(
                        t("terms.section9.automatedItems", {
                          returnObjects: true,
                        }) as string[]
                      )}
                    </div>
                  </>
                )}

                {renderSubsection(
                  "terms.section9.subtitle2",
                  renderList(
                    t("terms.section9.retentionItems", {
                      returnObjects: true,
                    }) as string[]
                  )
                )}

                {renderSubsection(
                  "terms.section9.subtitle3",
                  <>
                    <p className="text-gray-600 mb-2">
                      {t("terms.section9.exceptionsIntro")}
                    </p>
                    {renderList(
                      t("terms.section9.exceptionsItems", {
                        returnObjects: true,
                      }) as string[]
                    )}
                  </>
                )}

                {renderSubsection(
                  "terms.section9.subtitle4",
                  <>
                    <p className="text-gray-600 mb-2">
                      {t("terms.section9.legalRetentionIntro")}
                    </p>
                    {renderList(
                      t("terms.section9.legalRetentionItems", {
                        returnObjects: true,
                      }) as string[]
                    )}
                  </>
                )}
              </>
            )}

            {/* Section 10: Modifications */}
            {renderSection(
              "terms.section10.title",
              <>
                {renderSubsection(
                  "terms.section10.subtitle1",
                  <>
                    <p className="text-gray-600 mb-2">
                      {t("terms.section10.modifyRight")}
                    </p>
                    {renderList(
                      t("terms.section10.modifyRightItems", {
                        returnObjects: true,
                      }) as string[]
                    )}
                  </>
                )}

                {renderSubsection(
                  "terms.section10.subtitle2",
                  <>
                    <div className="bg-gray-50 p-4 rounded-lg mb-4">
                      <h4 className="font-semibold text-gray-800 mb-2">
                        {t("terms.section10.substantialTitle")}
                      </h4>
                      {renderList(
                        t("terms.section10.substantialItems", {
                          returnObjects: true,
                        }) as string[]
                      )}
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-800 mb-2">
                        {t("terms.section10.minorTitle")}
                      </h4>
                      {renderList(
                        t("terms.section10.minorItems", {
                          returnObjects: true,
                        }) as string[]
                      )}
                    </div>
                  </>
                )}

                {renderSubsection(
                  "terms.section10.subtitle3",
                  renderList(
                    t("terms.section10.acceptanceItems", {
                      returnObjects: true,
                    }) as string[]
                  )
                )}

                {renderSubsection(
                  "terms.section10.subtitle4",
                  renderList(
                    t("terms.section10.archivedItems", {
                      returnObjects: true,
                    }) as string[]
                  )
                )}
              </>
            )}

            {/* Section 11: Applicable Law */}
            {renderSection(
              "terms.section11.title",
              <>
                {renderSubsection(
                  "terms.section11.subtitle1",
                  <>
                    <p className="text-gray-600 mb-2">
                      {t("terms.section11.applicableLaw")}
                    </p>
                    {renderList(
                      t("terms.section11.applicableLawItems", {
                        returnObjects: true,
                      }) as string[]
                    )}
                  </>
                )}

                {renderSubsection(
                  "terms.section11.subtitle2",
                  renderList(
                    t("terms.section11.jurisdictionItems", {
                      returnObjects: true,
                    }) as string[]
                  )
                )}

                {renderSubsection(
                  "terms.section11.subtitle3",
                  <>
                    <div className="space-y-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-800 mb-2">
                          {t("terms.section11.negotiationTitle")}
                        </h4>
                        {renderList(
                          t("terms.section11.negotiationItems", {
                            returnObjects: true,
                          }) as string[]
                        )}
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-800 mb-2">
                          {t("terms.section11.mediationTitle")}
                        </h4>
                        {renderList(
                          t("terms.section11.mediationItems", {
                            returnObjects: true,
                          }) as string[]
                        )}
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-800 mb-2">
                          {t("terms.section11.arbitrationTitle")}
                        </h4>
                        {renderList(
                          t("terms.section11.arbitrationItems", {
                            returnObjects: true,
                          }) as string[]
                        )}
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-800 mb-2">
                          {t("terms.section11.judicialTitle")}
                        </h4>
                        {renderList(
                          t("terms.section11.judicialItems", {
                            returnObjects: true,
                          }) as string[]
                        )}
                      </div>
                    </div>
                  </>
                )}
              </>
            )}

            {/* Section 12: Contact Information */}
            {renderSection(
              "terms.section12.title",
              <>
                <p className="text-gray-600 mb-4">
                  {t("terms.section12.intro")}
                </p>

                <div className="bg-indigo-50 p-6 rounded-lg mb-6">
                  <p className="text-indigo-800 font-medium mb-2">
                    {t("terms.section12.email")}
                  </p>
                  <p className="text-indigo-800 font-medium mb-2">
                    {t("terms.section12.website")}
                  </p>
                  <p className="text-indigo-800 font-medium">
                    {t("terms.section12.docs")}
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-2">
                      {t("terms.section12.supportHoursTitle")}
                    </h4>
                    {renderList(
                      t("terms.section12.supportHours", {
                        returnObjects: true,
                      }) as string[]
                    )}
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-2">
                      {t("terms.section12.languagesTitle")}
                    </h4>
                    {renderList(
                      t("terms.section12.languages", {
                        returnObjects: true,
                      }) as string[]
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Section 13: General Provisions */}
            {renderSection(
              "terms.section13.title",
              <>
                {renderSubsection(
                  "terms.section13.subtitle1",
                  <p className="text-gray-600">
                    {t("terms.section13.completeAgreement")}
                  </p>
                )}

                {renderSubsection(
                  "terms.section13.subtitle2",
                  <>
                    <p className="text-gray-600 mb-2">
                      {t("terms.section13.severability")}
                    </p>
                    {renderList(
                      t("terms.section13.severabilityItems", {
                        returnObjects: true,
                      }) as string[]
                    )}
                  </>
                )}

                {renderSubsection(
                  "terms.section13.subtitle3",
                  <p className="text-gray-600">{t("terms.section13.waiver")}</p>
                )}

                {renderSubsection(
                  "terms.section13.subtitle4",
                  renderList(
                    t("terms.section13.assignmentItems", {
                      returnObjects: true,
                    }) as string[]
                  )
                )}

                {renderSubsection(
                  "terms.section13.subtitle5",
                  renderList(
                    t("terms.section13.notificationsItems", {
                      returnObjects: true,
                    }) as string[]
                  )
                )}

                {renderSubsection(
                  "terms.section13.subtitle6",
                  <>
                    <p className="text-gray-600 mb-2">
                      {t("terms.section13.relationshipIntro")}
                    </p>
                    {renderList(
                      t("terms.section13.relationshipItems", {
                        returnObjects: true,
                      }) as string[]
                    )}
                  </>
                )}

                {renderSubsection(
                  "terms.section13.subtitle7",
                  <>
                    <p className="text-gray-600 mb-2">
                      {t("terms.section13.forceMajeureIntro")}
                    </p>
                    {renderList(
                      t("terms.section13.forceMajeureItems", {
                        returnObjects: true,
                      }) as string[]
                    )}
                  </>
                )}

                {renderSubsection(
                  "terms.section13.subtitle8",
                  renderList(
                    t("terms.section13.languageItems", {
                      returnObjects: true,
                    }) as string[]
                  )
                )}
              </>
            )}

            {/* Section 14: Future Features */}
            {renderSection(
              "terms.section14.title",
              <>
                {renderSubsection(
                  "terms.section14.subtitle1",
                  <>
                    <p className="text-gray-600 mb-2">
                      {t("terms.section14.developmentIntro")}
                    </p>
                    {renderList(
                      t("terms.section14.developmentItems", {
                        returnObjects: true,
                      }) as string[]
                    )}
                  </>
                )}

                {renderSubsection(
                  "terms.section14.subtitle2",
                  renderList(
                    t("terms.section14.testingItems", {
                      returnObjects: true,
                    }) as string[]
                  )
                )}

                {renderSubsection(
                  "terms.section14.subtitle3",
                  <>
                    <p className="text-gray-600 mb-2">
                      {t("terms.section14.changesIntro")}
                    </p>
                    {renderList(
                      t("terms.section14.changesItems", {
                        returnObjects: true,
                      }) as string[]
                    )}
                  </>
                )}
              </>
            )}

            {/* Section 15: Third-Party Technologies */}
            {renderSection(
              "terms.section15.title",
              <>
                {renderSubsection(
                  "terms.section15.subtitle1",
                  <>
                    <p className="text-gray-600 mb-2">
                      {t("terms.section15.techIntro")}
                    </p>
                    {renderList(
                      t("terms.section15.techItems", {
                        returnObjects: true,
                      }) as string[]
                    )}
                  </>
                )}

                {renderSubsection(
                  "terms.section15.subtitle2",
                  <p className="text-gray-600">
                    {t("terms.section15.openSource")}
                  </p>
                )}

                {renderSubsection(
                  "terms.section15.subtitle3",
                  <>
                    <p className="text-gray-600 mb-2">
                      {t("terms.section15.thirdPartyIntro")}
                    </p>
                    {renderList(
                      t("terms.section15.thirdPartyItems", {
                        returnObjects: true,
                      }) as string[]
                    )}
                  </>
                )}
              </>
            )}

            {/* Legal Notice */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-10">
              <h2 className="text-2xl font-bold text-amber-800 mb-4">
                {t("terms.legalNotice.title")}
              </h2>
              <p className="text-amber-700 mb-4">
                {t("terms.legalNotice.intro")}
              </p>
              {renderList(
                t("terms.legalNotice.items", {
                  returnObjects: true,
                }) as string[]
              )}

              <p className="text-amber-700 mt-4 mb-2">
                {t("terms.legalNotice.successFactors")}
              </p>
              {renderList(
                t("terms.legalNotice.successFactorsItems", {
                  returnObjects: true,
                }) as string[]
              )}

              <p className="text-amber-700 mt-4 mb-2">
                {t("terms.legalNotice.noGuarantee")}
              </p>
              {renderList(
                t("terms.legalNotice.noGuaranteeItems", {
                  returnObjects: true,
                }) as string[]
              )}
            </div>

            {/* Consent Section */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-10">
              <h2 className="text-2xl font-bold text-green-800 mb-4">
                {t("terms.consent.title")}
              </h2>
              <p className="text-green-700 mb-4">{t("terms.consent.intro")}</p>
              <ul className="space-y-2">
                {(
                  t("terms.consent.items", { returnObjects: true }) as string[]
                ).map((item, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-green-700"
                  >
                    <span className="text-green-600 mt-1">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 p-4 bg-red-100 rounded-lg">
                <p className="text-red-700 font-semibold">
                  {t("terms.consent.warning")}
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 pt-8 text-center">
              <p className="text-gray-600 font-medium mb-2">
                {t("terms.footer.tagline")}
              </p>
              <p className="text-gray-500 text-sm mb-1">
                {t("terms.footer.copyright")}
              </p>
              <p className="text-gray-400 text-sm">
                {t("terms.lastUpdated")}: {t("terms.lastUpdatedDate")} |{" "}
                {t("terms.footer.version")}
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
                  <a href="/privacy" className="hover:text-white transition">
                    {t("landing.footer.privacy")}
                  </a>
                </li>
                <li>
                  <a
                    href="/terms"
                    className="hover:text-white transition text-white font-medium"
                  >
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

export default TermsOfService;
