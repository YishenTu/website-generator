import React from 'react';
import { TabButton, TabActionButton } from './TabButton';
import { GenerationStatus } from './GenerationStatus';
import { ActiveTab } from '../types/types';
import { AppStage } from '../App';
import { getModelInfo } from '../services/aiService';
import { ArrowPathIcon } from './icons';

interface TabNavigationProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  appStage: AppStage;
  isRefineMode: boolean;
  onToggleRefineMode: () => void;
  onStartNewSession: () => void;
  isLoading?: boolean;
  isChatLoading?: boolean;
  streamingModel?: string;
}

export const TabNavigation: React.FC<TabNavigationProps> = React.memo(({
  activeTab,
  onTabChange,
  appStage,
  isRefineMode,
  onToggleRefineMode,
  onStartNewSession,
  isLoading = false,
  isChatLoading = false,
  streamingModel
}) => {
  const getTabDisabled = (tab: ActiveTab): boolean => {
    switch (tab) {
      case ActiveTab.Input:
        return false; // Always enabled
      case ActiveTab.Plan:
        return appStage === 'initial'; // Disabled until plan generation starts
      case ActiveTab.Code:
        return appStage === 'initial' || appStage === 'planPending' || appStage === 'planReady'; // Disabled until HTML generation starts
      case ActiveTab.Preview:
        return appStage === 'initial' || appStage === 'planPending' || appStage === 'planReady' || appStage === 'htmlPending'; // Disabled until HTML is ready
      default:
        return false;
    }
  };

  return (
    <div className="glass-effect rounded-xl border border-white/10 backdrop-blur-lg p-2 shadow-xl shadow-black/30">
      <div className="flex justify-between items-center">
        <nav className="flex space-x-1">
          <TabButton
            label="Input"
            isActive={activeTab === ActiveTab.Input}
            onClick={() => onTabChange(ActiveTab.Input)}
            disabled={getTabDisabled(ActiveTab.Input)}
          />
          <TabButton
            label="Plan"
            isActive={activeTab === ActiveTab.Plan}
            onClick={() => onTabChange(ActiveTab.Plan)}
            disabled={getTabDisabled(ActiveTab.Plan)}
          />
          <TabButton
            label="Code"
            isActive={activeTab === ActiveTab.Code}
            onClick={() => onTabChange(ActiveTab.Code)}
            disabled={getTabDisabled(ActiveTab.Code)}
          />
          <TabButton
            label="Preview"
            isActive={activeTab === ActiveTab.Preview}
            onClick={() => onTabChange(ActiveTab.Preview)}
            disabled={getTabDisabled(ActiveTab.Preview)}
          />
        </nav>
        
        <div className="flex items-center space-x-3">
          {/* Generation status - show when generating HTML or plan */}
          {((appStage === 'planPending' || appStage === 'htmlPending' || appStage === 'htmlReady') && streamingModel && isLoading) && (
            <GenerationStatus
              isGenerating={isLoading}
              modelName={getModelInfo(streamingModel)?.name}
              className=""
            />
          )}
          
          {/* Refine button - only show when plan is ready or later */}
          {(appStage === 'planReady' || appStage === 'htmlPending' || appStage === 'htmlReady') && (
            <TabActionButton
              onClick={onToggleRefineMode}
              disabled={isLoading || isChatLoading}
              isActive={isRefineMode}
            >
              {isRefineMode ? 'Close Refine' : 'Refine'}
            </TabActionButton>
          )}
          
          {/* New Session button - only show when HTML is ready */}
          {appStage === 'htmlReady' && (
            <TabActionButton
              onClick={onStartNewSession}
              disabled={isLoading || isChatLoading}
            >
              <ArrowPathIcon className="w-4 h-4 mr-1.5" />
              New Session
            </TabActionButton>
          )}
        </div>
      </div>
    </div>
  );
});