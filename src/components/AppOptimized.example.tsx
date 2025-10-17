/**
 * Example: Optimized App Component with Code Splitting
 *
 * This file demonstrates how to implement code splitting in the App component
 * for production optimization. To use this:
 *
 * 1. Update test mocks to handle dynamic imports
 * 2. Rename this file to App.tsx
 * 3. Verify all tests pass
 * 4. Deploy and measure bundle size improvements
 *
 * Expected improvements:
 * - 20-40% reduction in initial bundle size
 * - Faster Time to Interactive (TTI)
 * - Better performance scores
 *
 * See: docs/CODE_SPLITTING_GUIDE.md for more details
 */

"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { MainLayout } from "./layout/MainLayout";
import type { TabState } from "@/types";
import { useSettings } from "@/hooks/useSettings";

// Code splitting: Lazy-load tab components for better performance
// Only the active tab's code is loaded, reducing initial bundle size
const SettingsTab = dynamic(
  () => import("./SettingsTab").then((mod) => ({ default: mod.SettingsTab })),
  {
    loading: () => <TabLoadingSpinner />,
  },
);

const BestPracticesTab = dynamic(
  () =>
    import("./BestPracticesTab").then((mod) => ({
      default: mod.BestPracticesTab,
    })),
  {
    loading: () => <TabLoadingSpinner />,
  },
);

const UsageTab = dynamic(() => import("./UsageTab"), {
  loading: () => <TabLoadingSpinner />,
});

const ImageToPromptTabs = dynamic(() => import("./ImageToPromptTabs"), {
  loading: () => <TabLoadingSpinner />,
  ssr: false, // Image upload doesn't need server-side rendering
});

const PromptCreatorTab = dynamic(() => import("./PromptCreatorTab"), {
  loading: () => <TabLoadingSpinner />,
});

// Reusable loading component for tabs
function TabLoadingSpinner() {
  return (
    <div className="flex h-64 items-center justify-center">
      <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600" />
    </div>
  );
}

type AppTab = TabState["activeTab"] | "prompt-creator";

export const App: React.FC = () => {
  const [tabState, setTabState] = useState<{ activeTab: AppTab }>({
    activeTab: "image-to-prompt",
  });

  const { settings, isInitialized } = useSettings();

  const handleTabChange = (tab: AppTab) => {
    setTabState({ activeTab: tab });
  };

  const renderContent = () => {
    switch (tabState.activeTab) {
      case "image-to-prompt":
        return <ImageToPromptTabs />;
      case "prompt-creator":
        return <PromptCreatorTab apiKey={settings.openRouterApiKey} />;
      case "best-practices":
        return <BestPracticesTab />;
      case "usage":
        return <UsageTab />;
      case "settings":
        return (
          <SettingsTab
            settings={settings}
            onSettingsUpdate={() => {
              /* Settings managed via hook */
            }}
          />
        );
      default:
        return <ImageToPromptTabs />;
    }
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
