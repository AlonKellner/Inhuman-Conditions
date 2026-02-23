/**
 * PacketDisplay Component
 * Displays interview question packet with cycling controls
 * Allows players to cycle through all 11 available packets
 */

import { useGameStore } from '../../store/gameStore';
import { CyclingButtons } from './CyclingButtons';
import styles from './PacketDisplay.module.css';

export interface PacketDisplayProps {
  /** Player role determines view permissions */
  role: 'investigator' | 'suspect' | 'spectator';
  /** Callback when player confirms packet selection */
  onContinue: () => void;
}

/**
 * PacketDisplay Component
 *
 * Displays the current question packet and allows cycling through alternatives.
 * - Investigator: Sees full packet details (prompt, question list)
 * - Suspect: Sees only packet theme to maintain mystery
 * - Spectator: Sees read-only packet information
 */
export function PacketDisplay({ role, onContinue }: PacketDisplayProps) {
  const {
    selectedPacket,
    contentIndices,
    permutationSizes,
    cycleContent,
  } = useGameStore();

  const handleCyclePrevious = () => {
    cycleContent('packet', 'previous');
  };

  const handleCycleNext = () => {
    cycleContent('packet', 'next');
  };

  if (!selectedPacket) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <p className={styles.errorMessage}>No packet selected</p>
        </div>
      </div>
    );
  }

  // Spectator view - read-only
  if (role === 'spectator') {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <h2 className={styles.heading}>Question Packet</h2>

          <CyclingButtons
            label="Packet"
            currentIndex={contentIndices.packetIndex}
            totalItems={permutationSizes.packets}
            onPrevious={handleCyclePrevious}
            onNext={handleCycleNext}
          />

          <div className={styles.packetInfo}>
            <div className={styles.packetHeader}>
              {selectedPacket.icon.startsWith('/') ? (
                <img src={selectedPacket.icon} alt="" className={styles.iconImage} />
              ) : (
                <span className={styles.icon}>{selectedPacket.icon}</span>
              )}
              <h3 className={styles.packetName}>{selectedPacket.name}</h3>
            </div>
            <p className={styles.difficulty}>
              Difficulty: <strong>{selectedPacket.difficulty}</strong>
            </p>
          </div>

          <p className={styles.waitingMessage}>
            Waiting for players to select packet...
          </p>
        </div>
      </div>
    );
  }

  // Investigator view - full packet details
  if (role === 'investigator') {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <h2 className={styles.heading}>Question Packet</h2>

          <CyclingButtons
            label="Packet"
            currentIndex={contentIndices.packetIndex}
            totalItems={permutationSizes.packets}
            onPrevious={handleCyclePrevious}
            onNext={handleCycleNext}
          />

          <div className={styles.packetInfo}>
            <div className={styles.packetHeader}>
              {selectedPacket.icon.startsWith('/') ? (
                <img src={selectedPacket.icon} alt="" className={styles.iconImage} />
              ) : (
                <span className={styles.icon}>{selectedPacket.icon}</span>
              )}
              <h3 className={styles.packetName}>{selectedPacket.name}</h3>
            </div>
            <p className={styles.difficulty}>
              Difficulty: <strong>{selectedPacket.difficulty}</strong>
            </p>
          </div>

          <div className={styles.promptBox}>
            <p className={styles.promptLabel}>Investigator Prompt:</p>
            <p className={styles.promptText}>{selectedPacket.prompt}</p>
          </div>

          <div className={styles.questionsBox}>
            <p className={styles.questionsLabel}>
              Questions ({selectedPacket.questions.length}):
            </p>
            <ul className={styles.questionsList}>
              {selectedPacket.questions.map((question, index) => (
                <li key={question.id} className={styles.questionItem}>
                  <span className={styles.questionNumber}>{index + 1}.</span>
                  <span className={styles.questionText}>{question.text}</span>
                  <span className={styles.questionType}>({question.type})</span>
                </li>
              ))}
            </ul>
          </div>

          <button
            className={styles.continueButton}
            onClick={onContinue}
            aria-label="Continue to next stage"
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  // Suspect view - limited information to maintain mystery
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2 className={styles.heading}>Question Packet</h2>

        <CyclingButtons
          label="Packet"
          currentIndex={contentIndices.packetIndex}
          totalItems={permutationSizes.packets}
          onPrevious={handleCyclePrevious}
          onNext={handleCycleNext}
        />

        <div className={styles.packetInfo}>
          <div className={styles.packetHeader}>
            <span className={styles.icon}>{selectedPacket.icon}</span>
            <h3 className={styles.packetName}>{selectedPacket.name}</h3>
          </div>
          <p className={styles.difficulty}>
            Difficulty: <strong>{selectedPacket.difficulty}</strong>
          </p>
        </div>

        <div className={styles.instructions}>
          <p className={styles.instructionText}>
            The Investigator will ask you questions from this packet.
            You will not see the questions in advance.
          </p>
        </div>

        <p className={styles.waitingMessage}>
          Waiting for Investigator to continue...
        </p>
      </div>
    </div>
  );
}
