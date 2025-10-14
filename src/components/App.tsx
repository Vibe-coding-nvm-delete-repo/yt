"use client";

import React, { useState } from "react";
import { MainLayout } from "./layout/MainLayout";
import { SettingsTab } from "./SettingsTab";
import ImageToPromptTabs from "./ImageToPromptTabs";
import type { TabState } from "@/types";
import { useSettings } from "@/hooks/useSettings";

export const App: React.FC = () => {
  const [tabState, setTabState] = useState<TabState>({
    activeTab: "image-to-prompt",
  });

  const { settings, isInitialized } = useSettings();

  const handleTabChange = (tab: TabState["activeTab"]) => {
    setTabState({ activeTab: tab });
  };

  // Show loading state while settings are being initialized
  if (!isInitialized) {
    return (
      <MainLayout activeTab={tabState.activeTab} onTabChange={handleTabChange}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout activeTab={tabState.activeTab} onTabChange={handleTabChange}>
      {tabState.activeTab === "image-to-prompt" && <ImageToPromptTabs />}
      {tabState.activeTab === "settings" && (
        <SettingsTab
          settings={settings}
          onSettingsUpdate={() => {
            // Settings are now managed by the hook, no manual update needed
          }}
        />
      )}
    </MainLayout>
  );
};
