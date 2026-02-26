import { type FC, useState } from 'react';
import { Button } from '../ui/Button';
import styles from './InducerPuzzleDisplay.module.css';

export interface InducerPuzzleDisplayProps {
  mazeImage: string;
  question: string;
  expectedSolution: string;
  onSolutionSubmit?: (solution: string, isCorrect: boolean) => void;
}

/**
 * InducerPuzzleDisplay Component
 *
 * Displays the inducer maze puzzle during the interview phase.
 * Robots must solve the maze and submit the solution path.
 * This is a core game mechanic that helps Investigators identify robots.
 *
 * Official game behavior:
 * - Maze image extracted from PDF
 * - Robot navigates the maze and reports solution
 * - Multiple attempts allowed
 * - Case-insensitive validation
 */
export const InducerPuzzleDisplay: FC<InducerPuzzleDisplayProps> = ({
  mazeImage,
  question,
  expectedSolution,
  onSolutionSubmit,
}) => {
  const [solution, setSolution] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);

  const handleSubmit = () => {
    // Don't submit empty solutions
    if (!solution.trim()) {
      return;
    }

    const isCorrect = solution.trim().toUpperCase() === expectedSolution.toUpperCase();
    setFeedback(isCorrect ? 'correct' : 'incorrect');

    if (onSolutionSubmit) {
      onSolutionSubmit(solution, isCorrect);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSolution(e.target.value);
    // Clear feedback when user starts typing a new answer
    if (feedback) {
      setFeedback(null);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {/* Maze Image - title removed as it's on the suspect card */}
        <div className={styles.mazeImageWrapper}>
          <img
            src={mazeImage}
            alt="Inducer Pattern Maze"
            className={styles.mazeImage}
          />
        </div>

        {/* Question */}
        <div className={styles.question}>
          <p>{question}</p>
        </div>

        {/* Solution Input */}
        <div className={styles.solutionInput}>
          <label htmlFor="inducer-solution" className={styles.label}>
            Your Solution:
          </label>
          <input
            id="inducer-solution"
            data-testid="inducer-solution"
            type="text"
            value={solution}
            onChange={handleInputChange}
            placeholder="Enter letter sequence"
            className={styles.input}
          />
          <Button onClick={handleSubmit}>Submit</Button>
        </div>

        {/* Feedback */}
        {feedback && (
          <div className={`${styles.feedback} ${styles[feedback]}`}>
            {feedback === 'correct' ? '✓ Correct!' : '✗ Incorrect - try again'}
          </div>
        )}
      </div>
    </div>
  );
};
