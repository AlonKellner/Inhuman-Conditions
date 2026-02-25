import { type FC } from 'react';
import { useGameStore } from '../../../store/GameStoreContext';
import { Button } from '../../ui/Button';
import { Card } from '../../ui/Card';
import { CountdownTimer } from '../../ui/CountdownTimer';
import { Determination } from '../../../types';
import QuestionCardImage from '../../cards/QuestionCardImage';
import '../../../styles/cards.css';
import styles from './InvestigatorView.module.css';

export const InvestigatorView: FC = () => {
  const {
    shuffledQuestions,
    selectedPacket,
    timerStarted,
    timerElapsed,
    startTimer,
    onTimerElapsed,
    setDetermination,
    advanceState,
  } = useGameStore();

  if (!shuffledQuestions || !selectedPacket) {
    return <div>Loading...</div>;
  }

  const handleDetermination = (determination: Determination) => {
    setDetermination(determination);
    advanceState();
  };

  return (
    <div className={styles.container}>
      {timerStarted && <CountdownTimer onElapsed={onTimerElapsed} startTimer={timerStarted} />}

      <Card title="Investigator - Interview Questions">
        <div className={styles.prompt}>
          <strong>Packet:</strong> {selectedPacket.name} ({selectedPacket.difficulty})
        </div>

        {/* Cover Sheet Image */}
        {selectedPacket.coverSheetImage && (
          <div className={styles.coverSheetContainer}>
            <img
              src={selectedPacket.coverSheetImage}
              alt={`${selectedPacket.name} cover sheet`}
              loading="lazy"
              className={styles.coverSheetImage}
            />
          </div>
        )}

        <div className={styles.prompt}>
          <strong>Instructions:</strong> {selectedPacket.prompt}
        </div>

        {!timerStarted && (
          <Button onClick={startTimer} className={styles.startButton}>
            Start 5-Minute Timer
          </Button>
        )}

        <div className={styles.questions}>
          <h3>Questions:</h3>
          {shuffledQuestions.map((q, index) => (
            <div key={q.id} className={styles.question}>
              {/* Use QuestionCardImage if available, otherwise fallback to custom text */}
              {q.cardImage ? (
                <div className={styles.cardImageContainer}>
                  <div className={styles.questionNumber}>Q{index + 1}</div>
                  <QuestionCardImage question={q} />
                </div>
              ) : (
                <>
                  <div className={styles.questionHeader}>
                    <span className={styles.questionNumber}>Q{index + 1}</span>
                    <span className={[styles.type, styles[q.type]].join(' ')}>
                      {q.type === 'primary' ? 'Primary' : 'Secondary'}
                    </span>
                  </div>
                  <div className={styles.questionText}>{q.text}</div>
                  <div className={styles.examples}>
                    <strong>Follow-ups:</strong>
                    <ul>
                      {q.examples.map((ex, i) => (
                        <li key={i}>{ex}</li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        {timerElapsed && (
          <div className={styles.determination}>
            <h3>Make Your Determination:</h3>
            <div className={styles.determinationButtons}>
              <Button onClick={() => handleDetermination(Determination.Human)} variant="primary">
                Human
              </Button>
              <Button onClick={() => handleDetermination(Determination.Robot)} variant="danger">
                Robot
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
