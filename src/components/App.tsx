'use client';

import React, { useState, useEffect } from 'react';
import { MainLayout } from './layout/MainLayout';
import { SettingsTab } from './SettingsTab';
import { ImageToPromptTab } from './ImageToPromptTab';
import { TabState, AppSettings } from '@/types';
import { settingsStorage } from '@/lib/storage';

export const App: React.FC = () => {
  const [tabState, setTabState] = useState<TabState>({
    activeTab: 'image-to-prompt',
  });
  
  const [settings, setSettings] = useState<AppSettings>(() => 
    settingsStorage.getSettings()
  );

  // Handle settings updates from storage
  useEffect(() => {
    const unsubscribe = settingsStorage.subscribe(() => {
      const updatedSettings = settingsStorage.getSettings();
      setSettings(updatedSettings);
    });

    return unsubscribe;
  }, []);

  const handleTabChange = (tab: TabState['activeTab']) => {
    setTabState({ activeTab: tab });
  };

  const handleSettingsUpdate = (updatedSettings: AppSettings) => {
    setSettings(updatedSettings);
  };

  return (
    <MainLayout
      activeTab={tabState.activeTab}
      onTabChange={handleTabChange}
    >
      {tabState.activeTab === 'image-to-prompt' && (
        <ImageToPromptTab settings={settings} />
      )}
      {tabState.activeTab === 'settings' && (
        <SettingsTab
          settings={settings}
          onSettingsUpdate={handleSettingsUpdate}
        />
      )}
    </MainLayout>
  );
};
