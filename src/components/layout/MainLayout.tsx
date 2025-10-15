"use client";

import React, { useMemo, useEffect, useState } from "react";
import { TabNavigation } from "./TabNavigation";
import type { TabState } from "@/types";
import { usageStorage } from "@/lib/usage";
import { DollarSign } from "lucide-react";

interface MainLayoutProps {
  children: React.ReactNode;
  activeTab: TabState["activeTab"];
  onTabChange: (tab: TabState["activeTab"]) => void;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  activeTab,
  onTabChange,
}) => {
  const [updateTrigger, setUpdateTrigger] = useState(0);

  // Subscribe to usage storage changes to update total cost
  useEffect(() => {
    const unsubscribe = usageStorage.subscribe(() => {
      setUpdateTrigger((prev) => prev + 1);
    });
    return unsubscribe;
  }, []);

  // Calculate total cost from all usage entries

  const totalCost = useMemo(() => {
    const allEntries = usageStorage.list();
    return allEntries.reduce((sum, entry) => sum + entry.totalCost, 0);
  }, [updateTrigger]);

  const formatCurrency = (n: number) => {
    // Show user-friendly format: 2 decimal places for amounts >= $0.01
    // Otherwise show up to 6 decimals for very small amounts
    if (n >= 0.01) {
      return `$${n.toFixed(2)}`;
    }
    return `$${n.toFixed(6)}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Header - Mobile optimized */}
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-50">
        <div className="mx-auto px-3 sm:px-4 md:px-6 lg:px-8 max-w-4xl">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center">
              <h1 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white truncate">
                YouTube Tools
              </h1>
            </div>
            <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 px-3 py-1.5 rounded-lg shadow-sm">
              <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
              <div className="flex flex-col items-end">
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  Total Cost
                </span>
                <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                  {formatCurrency(totalCost)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Tab Navigation - Mobile optimized */}
      <TabNavigation activeTab={activeTab} onTabChange={onTabChange} />

      {/* Main Content - Mobile-first responsive */}
      <main className="flex-1 w-full">
        <div className="mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 max-w-4xl">
          <div
            id={`${activeTab}-panel`}
            role="tabpanel"
            aria-labelledby={`${activeTab}-tab`}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 sm:p-6 min-h-[60vh] sm:min-h-[50vh]"
          >
            {children}
          </div>
        </div>
      </main>

      {/* Footer - Mobile optimized */}
      <footer className="bg-white dark:bg-gray-800 mt-auto shadow-[0_-1px_0_0_rgba(0,0,0,0.03)]">
        <div className="mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 max-w-4xl">
          <div className="flex items-center justify-center text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            <div className="text-center">
              © 2025 YouTube Tools. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
