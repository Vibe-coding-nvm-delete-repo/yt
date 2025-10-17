"use client";

import React from "react";
import { Image, Settings, BookOpen, List, Sparkles } from "lucide-react";
import type { TabState } from "@/types";

type NavigationTab = TabState["activeTab"] | "prompt-creator";

interface TabNavigationProps {
  activeTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({
  activeTab,
  onTabChange,
}) => {
  const tabs = [
    {
      id: "image-to-prompt" as const,
      label: "Image to Prompt",
      shortLabel: "Generate", // Shorter label for mobile
      icon: Image,
      description: "Upload images and generate prompts",
    },
    {
      id: "prompt-creator" as const,
      label: "Prompt Creator",
      shortLabel: "Creator",
      icon: Sparkles,
      description: "Assemble structured prompt inputs and generate variations",
    },
    {
      id: "best-practices" as const,
      label: "Best Practices",
      shortLabel: "Best Practices",
      icon: BookOpen,
      description: "Manage best practices for your workflow",
    },
    {
      id: "usage" as const,
      label: "Usage & Costs",
      shortLabel: "Usage",
      icon: List,
      description: "View usage statistics and costs",
    },
    {
      id: "settings" as const,
      label: "Settings",
      shortLabel: "Settings",
      icon: Settings,
      description: "Configure API keys and preferences",
    },
  ];

  return (
    <nav
      className="bg-white dark:bg-gray-800 shadow-[0_1px_0_0_rgba(0,0,0,0.03)]"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="mx-auto px-3 sm:px-4 md:px-6 lg:px-8 max-w-4xl">
        {/* Mobile-first tab design */}
        <div className="flex">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`
                  group flex-1 sm:flex-none inline-flex flex-col sm:flex-row items-center justify-center sm:justify-start
                  py-3 sm:py-4 px-2 sm:px-1 sm:mr-8 border-b-2 font-medium text-xs sm:text-sm
                  transition-colors duration-200 ease-in-out min-h-[48px] sm:min-h-auto
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-inset
                  active:scale-95 sm:active:scale-100 transform transition-transform
                  ${
                    isActive
                      ? "border-blue-500 text-blue-600 dark:text-blue-400 bg-transparent"
                      : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-transparent"
                  }
                `}
                role="tab"
                aria-selected={isActive}
                aria-controls={`${tab.id}-panel`}
                tabIndex={isActive ? 0 : -1}
                title={tab.description}
              >
                <Icon
                  className={`
                    h-5 w-5 sm:mr-3 mb-1 sm:mb-0
                    transition-colors duration-200 ease-in-out
                    ${
                      isActive
                        ? "text-blue-500"
                        : "text-gray-400 group-hover:text-gray-600 dark:text-gray-500 dark:group-hover:text-gray-400"
                    }
                  `}
                  aria-hidden="true"
                />
                <span className="sr-only">{tab.label} tab</span>
                {/* Show short label on mobile, full label on larger screens */}
                <span className="block sm:hidden">{tab.shortLabel}</span>
                <span className="hidden sm:block">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
