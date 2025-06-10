import React from 'react';
import { useAppState } from '../contexts/AppContext';
import {
  InitialStage,
  PlanPendingStage,
  PlanReadyStage,
  HtmlPendingStage,
  HtmlReadyStage
} from './stages';

export const AppStages: React.FC = React.memo(() => {
  const { appStage } = useAppState();

  switch (appStage) {
    case 'planPending':
      return <PlanPendingStage />;
    case 'planReady':
      return <PlanReadyStage />;
    case 'htmlPending':
      return <HtmlPendingStage />;
    case 'htmlReady':
      return <HtmlReadyStage />;
    default:
      return <InitialStage />;
  }
});
