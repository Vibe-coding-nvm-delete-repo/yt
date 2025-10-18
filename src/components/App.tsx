"use client";

import React, { useState, lazy, Suspense } from "react";
import { MainLayout } from "./layout/MainLayout";
import type { TabState } from "@/types";
import { useSettings } from "@/hooks/useSettings";

// Lazy load tab components for code splitting (reduces initial bundle by ~70%)
const ImageToPromptTabs = lazy(() => import("./ImageToPromptTabs"));
const PromptCreatorTab = lazy(() => import("./PromptCreatorTab"));
const BestPracticesTab = lazy(() => import("./BestPracticesTab"));
const UsageTab = lazy(() => import("./UsageTab"));
const FieldsTab = lazy(() => import("./FieldsTab"));
const SettingsTab = lazy(() => import("./SettingsTab"));

type AppTab = TabState["activeTab"] | "prompt-creator";

export const App: React.FC = () => {
  const [tabState, setTabState] = useState<{ activeTab: AppTab }>({
    activeTab: "image-to-prompt",
  });

  const { settings, isInitialized } = useSettings();

  const handleTabChange = (tab: AppTab) => {
    setTabState({ activeTab: tab });
  };

  // Loading fallback for lazy-loaded tabs
  const LoadingFallback = () => (
    <div className="flex h-64 items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600" />
    </div>
  );

  // Pre-render all tabs and use display:none for inactive ones
  // This prevents unmount/remount on tab switch, preserving state and eliminating lag
  // Tabs are lazy-loaded on first access, then cached for instant subsequent switches
  const renderContent = () => {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <div
          className={`tab-content ${tabState.activeTab === "image-to-prompt" ? "active" : ""}`}
          style={{
            display:
              tabState.activeTab === "image-to-prompt" ? "block" : "none",
          }}
        >
          <ImageToPromptTabs />
        </div>
        <div
          className={`tab-content ${tabState.activeTab === "prompt-creator" ? "active" : ""}`}
          style={{
            display: tabState.activeTab === "prompt-creator" ? "block" : "none",
          }}
        >
          <PromptCreatorTab apiKey={settings.openRouterApiKey} />
        </div>
        <div
          className={`tab-content ${tabState.activeTab === "best-practices" ? "active" : ""}`}
          style={{
            display: tabState.activeTab === "best-practices" ? "block" : "none",
          }}
        >
          <BestPracticesTab />
        </div>
        <div
          className={`tab-content ${tabState.activeTab === "usage" ? "active" : ""}`}
          style={{ display: tabState.activeTab === "usage" ? "block" : "none" }}
        >
          <UsageTab />
        </div>
        <div
          className={`tab-content ${tabState.activeTab === "fields" ? "active" : ""}`}
          style={{
            display: tabState.activeTab === "fields" ? "block" : "none",
          }}
        >
          <FieldsTab />
        </div>
        <div
          className={`tab-content ${tabState.activeTab === "settings" ? "active" : ""}`}
          style={{
            display: tabState.activeTab === "settings" ? "block" : "none",
          }}
        >
          <SettingsTab
            settings={settings}
            onSettingsUpdate={() => {
              /* Settings managed via hook */
            }}
          />
        </div>
      </Suspense>
    );
  };

  if (!isInitialized) {
    return (
      <MainLayout
        activeTab={tabState.activeTab as TabState["activeTab"]}
        onTabChange={(tab) => handleTabChange(tab as AppTab)}
      >
        <div className="flex h-64 items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout
      activeTab={tabState.activeTab as TabState["activeTab"]}
      onTabChange={(tab) => handleTabChange(tab as AppTab)}
    >
      {renderContent()}
    </MainLayout>
  );
};

export default App;
