"use client";

import React from "react";
import { Play, Settings } from "lucide-react";
import type { TabState } from "@/types";
import { Image, Settings } from "lucide-react";

interface TabNavigationProps {
  activeTab: TabState["activeTab"];
  onTabChange: (tab: TabState["activeTab"]) => void;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({
  activeTab,
  onTabChange,
}) => {
  const tabs = [
    {
      id: "image-to-prompt" as const,
      label: "Image to Prompt",
      icon: Image,
      description: "Upload images and generate prompts",
    },
    {
      id: "settings" as const,
      label: "Settings",
      icon: Settings,
      description: "Configure API keys and preferences",
    },
  ];

  return (
    <nav
      className="border-b border-gray-200 dark:border-gray-700"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`
                  group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm
                  transition-colors duration-200 ease-in-out
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                  ${
                    isActive
                      ? "border-blue-500 text-blue-600 dark:text-blue-400"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600"
                  }
                `}
                role="tab"
                aria-selected={isActive}
                aria-controls={`${tab.id}-panel`}
                tabIndex={isActive ? 0 : -1}
              >
                <Icon
                  className={`
                    mr-3 h-5 w-5
                    transition-colors duration-200 ease-in-out
                    ${
                      isActive
                        ? "text-blue-500"
                        : "text-gray-400 group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-400"
                    }
                  `}
                  aria-hidden="true"
                />
                <span className="sr-only">{tab.label} tab</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
