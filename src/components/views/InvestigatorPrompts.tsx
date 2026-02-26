/**
 * InvestigatorPrompts Component
 * Context-aware prompts telling investigator what to do based on game state
 * Different prompts for single-device vs multi-device modes
 */

import { type FC } from 'react';
import type { GameState } from '../../types';
import styles from './InvestigatorPrompts.module.css';

interface InvestigatorPromptsProps {
  gameState: GameState;
  isSingleDevice: boolean;
}

export const InvestigatorPrompts: FC<InvestigatorPromptsProps> = ({
  gameState,
  isSingleDevice,
}) => {
  const prompts = getPromptsForState(gameState, isSingleDevice);

  if (!prompts) {
    return null;
  }

  return (
    <div className={styles.promptCard}>
      <div className={styles.promptHeader}>
        <span className={styles.promptIcon}>📋</span>
        <h3 className={styles.promptTitle}>{prompts.title}</h3>
      </div>
      <div className={styles.promptContent}>
        {prompts.steps.map((step, index) => (
          <div key={index} className={styles.promptStep}>
            <span className={styles.stepNumber}>{index + 1}</span>
            <p className={styles.stepText}>{step}</p>
          </div>
        ))}
      </div>
      {prompts.hint && (
        <div className={styles.promptHint}>
          💡 <em>{prompts.hint}</em>
        </div>
      )}
    </div>
  );
};

interface Prompts {
  title: string;
  steps: string[];
  hint?: string;
}

function getPromptsForState(state: GameState, isSingleDevice: boolean): Prompts | null {
  const deviceAction = isSingleDevice
    ? 'Switch to Suspect View and have them'
    : 'Ask the Suspect to';

  switch (state) {
    case 'penalty-calibration':
      return {
        title: 'Penalty Calibration Phase',
        steps: [
          'Read the selected penalty aloud to the Suspect.',
          `${deviceAction} practice performing the penalty 3 times.`,
          'Check the 3 penalty attempt boxes on the form as they practice.',
          'Discuss and agree on what counts as performing this penalty.',
        ],
        hint: 'The suspect must clearly demonstrate the penalty each time.',
      };

    case 'packet-display':
      return {
        title: 'Module Selection',
        steps: [
          'Review the available investigation modules.',
          'Select a module using the cycle buttons or dropdown on the form.',
          'Review the Cover Sheet, Primary Prompts, and Secondary Prompts in the notebook.',
        ],
        hint: 'Choose a module that matches your investigation style.',
      };

    case 'role-reveal':
      return {
        title: 'Suspect Role Assignment',
        steps: [
          `${deviceAction} review their assigned role (Human or Robot).`,
          'Wait for the Suspect to confirm they understand their role.',
          'Do NOT ask about their role - they will tell you what you need to know.',
        ],
        hint: isSingleDevice
          ? 'Switch to Suspect View to let them see their role, then switch back.'
          : 'The Suspect is reviewing their role privately.',
      };

    case 'inducer-puzzle':
      return {
        title: 'Inducer Puzzle (Interference Task)',
        steps: [
          `${deviceAction} solve the inducer maze pattern.`,
          'Observe whether they answer the schematic order question correctly.',
          'Mark YES or NO on the form based on their result.',
        ],
        hint: isSingleDevice
          ? 'Switch views to let the suspect solve the maze, then switch back to mark the result.'
          : 'The suspect will tell you if they passed or failed the inducer puzzle.',
      };

    case 'background-display':
      return {
        title: 'Suspect Identity',
        steps: [
          `${deviceAction} select a background character.`,
          'Ask the Suspect for their full name (First, Middle Initial, Last).',
          'Fill in the suspect name fields on the form.',
          'Record the background on the form.',
        ],
        hint: 'Names can be up to 15 letters for first/last, 1 letter for middle initial.',
      };

    case 'ready-to-start':
      return {
        title: 'Ready to Begin Interview',
        steps: [
          'Review all form sections to ensure everything is filled in.',
          'Confirm the Suspect is ready to begin.',
          'When ready, the timer will start automatically.',
        ],
        hint: 'You have 5 minutes once the interview begins.',
      };

    case 'interview':
      return {
        title: 'Conducting the Interview',
        steps: [
          'Ask questions from the Primary Prompts first.',
          'Take notes in the NOTES section of the form.',
          'Use Secondary Prompts if needed for follow-up questions.',
          'Observe the Suspect\'s behavior and responses carefully.',
        ],
        hint: 'Look for inconsistencies or signs they might be a robot.',
      };

    case 'conclusion':
      return {
        title: 'Interview Complete - Review Results',
        steps: [
          'Review the complete VK-82(e) form.',
          'See if your determination was correct.',
          'Check the Performance Review section for the result.',
        ],
      };

    default:
      return null;
  }
}
