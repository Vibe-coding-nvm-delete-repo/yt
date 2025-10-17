"use client";

import React, { useState } from "react";
import { MainLayout } from "./layout/MainLayout";
import { SettingsTab } from "./SettingsTab";
import { BestPracticesTab } from "./BestPracticesTab";
import { UsageTab } from "./UsageTab";
import ImageToPromptTabs from "./ImageToPromptTabs";
import PromptCreatorTab from "./PromptCreatorTab";
import type { TabState } from "@/types";
import { useSettings } from "@/hooks/useSettings";

type AppTab = TabState["activeTab"] | "prompt-creator";

export const App: React.FC = () => {
  const [tabState, setTabState] = useState<{ activeTab: AppTab }>({
    activeTab: "image-to-prompt",
  });

  const { settings, isInitialized } = useSettings();

  const handleTabChange = (tab: AppTab) => {
    setTabState({ activeTab: tab });
  };

  // Pre-render all tabs and use display:none for inactive ones
  // This prevents unmount/remount on tab switch, preserving state and eliminating lag
  const renderContent = () => {
    return (
      <>
        <div
          style={{
            display:
              tabState.activeTab === "image-to-prompt" ? "block" : "none",
          }}
        >
          <ImageToPromptTabs />
        </div>
        <div
          style={{
            display: tabState.activeTab === "prompt-creator" ? "block" : "none",
          }}
        >
          <PromptCreatorTab apiKey={settings.openRouterApiKey} />
        </div>
        <div
          style={{
            display: tabState.activeTab === "best-practices" ? "block" : "none",
          }}
        >
          <BestPracticesTab />
        </div>
        <div
          style={{ display: tabState.activeTab === "usage" ? "block" : "none" }}
        >
          <UsageTab />
        </div>
        <div
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
      </>
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
