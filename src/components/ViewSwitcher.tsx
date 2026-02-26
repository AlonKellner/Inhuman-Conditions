/**
 * ViewSwitcher Component
 * Allows toggling between Investigator and Suspect views at any time
 * Works for both single-device and multi-device modes
 */

import { type FC, useState } from 'react';
import { useInvestigatorStore } from '../store/gameStore';
import { InvestigatorGameFlow } from './InvestigatorGameFlow';
import { SuspectGameFlow } from './SuspectGameFlow';
import styles from './ViewSwitcher.module.css';

type ViewType = 'investigator' | 'suspect';

export const ViewSwitcher: FC = () => {
  // ViewSwitcher uses investigator store ONLY for global mode/playerRole settings
  // Each game flow (InvestigatorGameFlow/SuspectGameFlow) routes based on its own store's gameState
  const { mode, playerRole } = useInvestigatorStore();

  // In multi-device mode, use playerRole to determine which view to show
  // In single-device mode, allow switching between views
  const isSingleDevice = mode === 'single-device';

  const [currentView, setCurrentView] = useState<ViewType>(
    isSingleDevice ? 'investigator' : (playerRole === 'suspect' ? 'suspect' : 'investigator')
  );

  // In multi-device mode, lock to assigned role
  const effectiveView = isSingleDevice ? currentView : (playerRole === 'suspect' ? 'suspect' : 'investigator');

  const handleViewSwitch = (view: ViewType) => {
    if (isSingleDevice) {
      setCurrentView(view);
    }
  };

  return (
    <div className={styles.container}>
      {/* View Switcher Controls (only in single-device mode) */}
      {isSingleDevice && (
        <div className={styles.viewSwitcher}>
          <button
            className={`${styles.viewButton} ${effectiveView === 'investigator' ? styles.active : ''}`}
            onClick={() => handleViewSwitch('investigator')}
            aria-pressed={effectiveView === 'investigator'}
          >
            Investigator View
          </button>
          <button
            className={`${styles.viewButton} ${effectiveView === 'suspect' ? styles.active : ''}`}
            onClick={() => handleViewSwitch('suspect')}
            aria-pressed={effectiveView === 'suspect'}
          >
            Suspect View
          </button>
        </div>
      )}

      {/* Current View Display */}
      <div className={styles.viewContainer}>
        {effectiveView === 'investigator' ? (
          <InvestigatorGameFlow />
        ) : (
          <SuspectGameFlow />
        )}
      </div>

      {/* Device Transfer Hint (single-device mode only) */}
      {isSingleDevice && (
        <div className={styles.deviceHint}>
          <p>
            {effectiveView === 'investigator'
              ? 'Switch to Suspect View when you need the suspect to perform an action'
              : 'Switch back to Investigator View to continue the interview process'}
          </p>
        </div>
      )}
    </div>
  );
};
