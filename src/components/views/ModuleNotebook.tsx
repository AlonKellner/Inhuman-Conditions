/**
 * ModuleNotebook Component
 * Displays module investigation materials as a flip notebook
 * Shows Cover Sheet, Primary Prompts, or Secondary Prompts
 */

import { type FC } from 'react';
import { useGameStore } from '../../store/GameStoreContext';
import styles from './ModuleNotebook.module.css';

interface ModuleNotebookProps {
  currentPage: number; // 0-6: cover, primary1, primary2, primary3, secondary1, secondary2, secondary3
  onPageChange: (page: number) => void;
}

export const ModuleNotebook: FC<ModuleNotebookProps> = ({
  currentPage,
  onPageChange,
}) => {
  const { selectedPacket } = useGameStore();

  if (!selectedPacket) {
    return (
      <div className={styles.container}>
        <div className={styles.placeholder}>
          <p>No module selected yet</p>
          <p className={styles.hint}>Module will appear after Packet Display phase</p>
        </div>
      </div>
    );
  }

  // Helper to get next/previous page
  const goToPreviousPage = () => {
    if (currentPage > 0) {
      onPageChange(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < 6) {
      onPageChange(currentPage + 1);
    }
  };

  const canGoPrevious = currentPage > 0;
  const canGoNext = currentPage < 6;

  // Get primary and secondary questions
  const primaryQuestions = selectedPacket.questions.filter((q) => q.type === 'primary');
  const secondaryQuestions = selectedPacket.questions.filter((q) => q.type === 'secondary');

  // Determine what to show on current page
  // Page 1: Cover, Page 2: Primary1, Page 3: Secondary1, Page 4: Primary2, Page 5: Secondary2, Page 6: Primary3, Page 7: Secondary3
  const getPageContent = () => {
    if (currentPage === 0) {
      // Page 1: Cover Sheet
      return {
        type: 'cover',
        image: selectedPacket.coverSheetImage,
        fallback: (
          <div className={styles.fallbackContent}>
            <h4>Cover Sheet</h4>
            <p>{selectedPacket.prompt}</p>
          </div>
        ),
      };
    } else {
      // Pages 2-7: Alternating Primary/Secondary
      // Page 2 (idx 1) = Primary 1 (idx 0)
      // Page 3 (idx 2) = Secondary 1 (idx 0)
      // Page 4 (idx 3) = Primary 2 (idx 1)
      // Page 5 (idx 4) = Secondary 2 (idx 1)
      // Page 6 (idx 5) = Primary 3 (idx 2)
      // Page 7 (idx 6) = Secondary 3 (idx 2)

      const isPrimary = currentPage % 2 === 1; // Odd pages (1, 3, 5) are primary
      const questionIndex = Math.floor((currentPage - 1) / 2); // 1->0, 2->0, 3->1, 4->1, 5->2, 6->2

      if (isPrimary) {
        const question = primaryQuestions[questionIndex];
        return {
          type: 'primary',
          image: question?.cardImage,
          fallback: question ? (
            <div className={styles.fallbackCard}>
              <p><strong>Primary Prompt {questionIndex + 1}:</strong> {question.text}</p>
              <ul>
                {question.examples.map((ex, j) => (
                  <li key={j}>{ex}</li>
                ))}
              </ul>
            </div>
          ) : null,
        };
      } else {
        const question = secondaryQuestions[questionIndex];
        return {
          type: 'secondary',
          image: question?.cardImage,
          fallback: question ? (
            <div className={styles.fallbackCard}>
              <p><strong>Secondary Prompt {questionIndex + 1}:</strong> {question.text}</p>
              <ul>
                {question.examples.map((ex, j) => (
                  <li key={j}>{ex}</li>
                ))}
              </ul>
            </div>
          ) : null,
        };
      }
    }
  };

  const pageContent = getPageContent();

  return (
    <div className={styles.container}>
      {/* Notebook Header */}
      <div className={styles.header}>
        <h3 className={styles.moduleName}>{selectedPacket.name}</h3>
        <div className={styles.difficulty}>
          Difficulty: <strong>{selectedPacket.difficulty}</strong>
        </div>
      </div>

      {/* Flipbook Navigation */}
      <div className={styles.navigation}>
        <button
          className={styles.navButton}
          onClick={goToPreviousPage}
          disabled={!canGoPrevious}
          aria-label="Previous page"
        >
          ← Previous
        </button>
        <div className={styles.pageIndicator}>
          Page {currentPage + 1} of 7
        </div>
        <button
          className={styles.navButton}
          onClick={goToNextPage}
          disabled={!canGoNext}
          aria-label="Next page"
        >
          Next →
        </button>
      </div>

      {/* Page Content */}
      <div className={styles.pageContent}>
        <div className={styles.imagePage}>
          {pageContent.image ? (
            <img
              src={pageContent.image}
              alt={`Page ${currentPage + 1}`}
              className={styles.pageImage}
            />
          ) : (
            pageContent.fallback
          )}
        </div>
      </div>
    </div>
  );
};
