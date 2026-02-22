import { type FC } from 'react';
import styles from './ProgressIndicator.module.css';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  showDots?: boolean;
}

export const ProgressIndicator: FC<ProgressIndicatorProps> = ({
  currentStep,
  totalSteps,
  showDots = true,
}) => {
  return (
    <div className={styles.container}>
      <div className={styles.text}>
        Step {currentStep} of {totalSteps}
      </div>

      {showDots && (
        <div className={styles.dots}>
          {Array.from({ length: totalSteps }, (_, index) => (
            <span
              key={index}
              role="presentation"
              className={[styles.dot, index + 1 === currentStep && styles.active]
                .filter(Boolean)
                .join(' ')}
              aria-hidden="true"
            />
          ))}
        </div>
      )}
    </div>
  );
};
