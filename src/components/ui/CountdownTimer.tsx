import { type FC, useEffect, useState } from 'react';
import styles from './CountdownTimer.module.css';

interface CountdownTimerProps {
  onElapsed: () => void;
  startTimer: boolean;
}

export const CountdownTimer: FC<CountdownTimerProps> = ({ onElapsed, startTimer }) => {
  const [secondsLeft, setSecondsLeft] = useState(300); // 5 minutes
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (startTimer && !isRunning) {
      setIsRunning(true);
    }
  }, [startTimer, isRunning]);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onElapsed();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, onElapsed]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  const isElapsed = secondsLeft === 0;

  return (
    <div className={[styles.timer, isElapsed && styles.elapsed].filter(Boolean).join(' ')}>
      <div className={styles.icon}>{isElapsed ? '⏱️' : '⏱️'}</div>
      <div className={styles.time}>{timeString}</div>
      {isElapsed && <div className={styles.message}>Time's up!</div>}
    </div>
  );
};
