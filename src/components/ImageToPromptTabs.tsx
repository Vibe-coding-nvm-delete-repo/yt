"use client";

import React, { useState } from 'react';
import HistoryTab from '@/components/HistoryTab';
import ImageToPromptTab from '@/components/ImageToPromptTab';

const ImageToPromptTabs: React.FC = () => {
  const [active, setActive] = useState<'generate' | 'history'>('generate');

  return (
    <div className="space-y-4">
      <div className="flex gap-2 border-b">
        <button
          className={`px-3 py-2 ${'{'}active === 'generate' ? 'border-b-2 border-blue-500' : ''{'}'}`}
          onClick={() => setActive('generate')}
        >
          Generate Prompt
        </button>
        <button
          className={`px-3 py-2 ${'{'}active === 'history' ? 'border-b-2 border-blue-500' : ''{'}'}`}
          onClick={() => setActive('history')}
        >
          History
        </button>
      </div>

      {active === 'generate' ? <ImageToPromptTab /> : <HistoryTab />}
    </div>
  );
};

export default ImageToPromptTabs;
