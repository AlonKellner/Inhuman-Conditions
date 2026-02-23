/**
 * InvestigatorFormInterface Component
 * Main VK-82(e) investigator interview recording form
 * Overlays interactive widgets on the official form image
 */

import { type FC, useMemo } from 'react';
import { useGameStore } from '../../store/gameStore';
import { FormCheckbox } from './FormCheckbox';
import { FormLetterBox } from './FormLetterBox';
import { FormTextField } from './FormTextField';
import { FormTextArea } from './FormTextArea';
import { FormIconSelector } from './FormIconSelector';
import { FormContentSelector } from './FormContentSelector';
import { parseFormLabels, groupElementsBySection } from '../../utils/parseFormLabels';
import formLabelsData from '../../../extraction/data/labels/form_labels.json';
import styles from './InvestigatorFormInterface.module.css';

export const InvestigatorFormInterface: FC = () => {
  // Parse form labels once
  const formElements = useMemo(() => parseFormLabels(formLabelsData), []);
  const sections = useMemo(() => groupElementsBySection(formElements), [formElements]);

  // Get game state and form data
  const {
    investigatorForm,
    selectedPacket,
    selectedPenalty,
    selectedBackground,
    selectedRole,
    determination,
    setDetermination,
    updateFormPenaltyAttempt,
    updateFormInducerResult,
    updateFormSuspectName,
    updateFormNotes,
    updateFormSignature,
    submitInvestigatorForm,
    cycleContent,
    permutationSizes,
    contentIndices,
  } = useGameStore();

  // Check if form can be submitted
  const canSubmit =
    investigatorForm.signature.trim() !== '' &&
    determination !== null &&
    investigatorForm.performanceReview === null; // Only allow submit if not already submitted

  // Handle name change - split into first/middle/last
  const handleNameChange = (field: 'first' | 'middle' | 'last', value: string) => {
    updateFormSuspectName({
      ...investigatorForm.suspectName,
      [field]: value,
    });
  };

  // Find COG and BRAIN positions for icon selector
  const cogElement = sections.verify.find(
    (el) => el.type === 'icon-selector' && el.metadata?.iconValue === 'robot'
  );
  const brainElement = sections.verify.find(
    (el) => el.type === 'icon-selector' && el.metadata?.iconValue === 'human'
  );

  // Success/failure message after submission
  const showResultMessage = investigatorForm.performanceReview !== null;
  const isCorrect = investigatorForm.performanceReview === 'correct';

  return (
    <div className={styles.formContainer}>
      {/* Background form image */}
      <img
        src="/assets/cards/forms/investigator_forms_p1_c01_investigator-form.png"
        alt="VK-82(e) Investigator Interview Recording Form"
        className={styles.formImage}
      />

      {/* PENALTY Section - 3 checkboxes for calibration attempts */}
      {sections.penalty.map((el) => {
        if (el.type === 'checkbox' && el.metadata?.attemptNumber) {
          const attemptNum = el.metadata.attemptNumber as 1 | 2 | 3;
          const checked = investigatorForm.penaltyAttempts[`attempt${attemptNum}`];
          return (
            <FormCheckbox
              key={el.id}
              position={el.position}
              checked={checked}
              onChange={(c) => updateFormPenaltyAttempt(attemptNum, c)}
              ariaLabel={`Penalty calibration attempt ${attemptNum}`}
            />
          );
        }
        return null;
      })}

      {/* INDUCE Section - Module selector */}
      {sections.induce.find((el) => el.description.includes('Selected Module')) && (
        <FormContentSelector
          position={sections.induce.find((el) => el.description.includes('Selected Module'))!.position}
          label="Module"
          options={[
            { id: '01_small_talk', name: 'Small Talk' },
            { id: '02_creative_problem_solving', name: 'Creative Problem Solving' },
            { id: '03_imagination', name: 'Imagination' },
            { id: '04_observation', name: 'Observation' },
            { id: '05_morality', name: 'Morality' },
            { id: '06_philosophy', name: 'Philosophy' },
            { id: '07_music', name: 'Music' },
            { id: '08_the_body', name: 'The Body' },
            { id: '09_intimacy', name: 'Intimacy' },
            { id: '10_empathy', name: 'Empathy' },
            { id: '11_language', name: 'Language' },
          ]}
          selectedId={selectedPacket?.id || null}
          onSelect={(id) => {
            // TODO: Implement direct packet selection by ID
            console.log('Select packet:', id);
          }}
          onPrevious={() => cycleContent('packet', 'previous')}
          onNext={() => cycleContent('packet', 'next')}
        />
      )}

      {/* INDUCE Section - Inducer result YES/NO checkboxes */}
      {sections.induce
        .filter((el) => el.type === 'checkbox')
        .map((el) => {
          const isYes = el.metadata?.inducerValue === 'yes';
          const checked = investigatorForm.inducerResult === (isYes ? 'yes' : 'no');
          return (
            <FormCheckbox
              key={el.id}
              position={el.position}
              checked={checked}
              onChange={(c) => {
                if (c) {
                  updateFormInducerResult(isYes ? 'yes' : 'no');
                } else {
                  updateFormInducerResult(null);
                }
              }}
              ariaLabel={`Inducer puzzle result: ${isYes ? 'YES' : 'NO'}`}
            />
          );
        })}

      {/* SUSPECT Section - Background text */}
      {sections.suspect.find((el) => el.description.includes('Background')) && (
        <FormTextField
          position={sections.suspect.find((el) => el.description.includes('Background'))!.position}
          value={selectedBackground?.title || ''}
          onChange={() => {}} // Read-only, managed by game state
          readOnly={true}
          ariaLabel="Suspect background"
        />
      )}

      {/* SUSPECT Section - Name letter boxes */}
      {sections.suspect
        .filter((el) => el.type === 'letter-box')
        .map((el) => {
          const nameField = el.metadata?.nameField as 'first' | 'middle' | 'last';
          const letterIndex = el.metadata?.letterIndex as number;
          const name = investigatorForm.suspectName[nameField] || '';
          const letter = name.charAt(letterIndex);

          return (
            <FormLetterBox
              key={el.id}
              position={el.position}
              letter={letter}
              index={letterIndex}
              readOnly={true}
            />
          );
        })}

      {/* SUSPECT Section - Name input fields (for typing names) */}
      <div className={styles.nameInputs}>
        <div className={styles.inputGroup}>
          <label>First Name:</label>
          <input
            type="text"
            value={investigatorForm.suspectName.first}
            onChange={(e) => handleNameChange('first', e.target.value)}
            maxLength={15}
            placeholder="Type first name..."
            className={styles.nameInput}
          />
        </div>
        <div className={styles.inputGroup}>
          <label>MI:</label>
          <input
            type="text"
            value={investigatorForm.suspectName.middle}
            onChange={(e) => handleNameChange('middle', e.target.value)}
            maxLength={1}
            placeholder="M"
            className={styles.nameInput}
            style={{ width: '40px' }}
          />
        </div>
        <div className={styles.inputGroup}>
          <label>Last Name:</label>
          <input
            type="text"
            value={investigatorForm.suspectName.last}
            onChange={(e) => handleNameChange('last', e.target.value)}
            maxLength={15}
            placeholder="Type last name..."
            className={styles.nameInput}
          />
        </div>
      </div>

      {/* NOTES Section - Textarea */}
      {sections.notes.map((el) => {
        if (el.type === 'textarea') {
          return (
            <FormTextArea
              key={el.id}
              position={el.position}
              value={investigatorForm.investigatorNotes}
              onChange={updateFormNotes}
              placeholder="Investigator observations during interview..."
              ariaLabel="Investigator notes"
            />
          );
        }
        return null;
      })}

      {/* VERIFY Section - COG/BRAIN Icon Selector */}
      {cogElement && brainElement && (
        <FormIconSelector
          cogPosition={cogElement.position}
          brainPosition={brainElement.position}
          value={determination}
          onChange={setDetermination}
          disabled={showResultMessage}
        />
      )}

      {/* VERIFY Section - Signature */}
      {sections.verify.find((el) => el.description.includes('signature section')) && (
        <FormTextField
          position={sections.verify.find((el) => el.description.includes('signature section'))!.position}
          value={investigatorForm.signature}
          onChange={updateFormSignature}
          placeholder="Investigator signature..."
          ariaLabel="Investigator signature"
        />
      )}

      {/* PERFORMANCE REVIEW Section - Auto-filled checkboxes (read-only) */}
      {showResultMessage &&
        sections.performanceReview.map((el) => {
          if (el.type === 'checkbox') {
            const value = el.metadata?.performanceValue as 'correct' | 'incorrect' | 'na';
            const checked = investigatorForm.performanceReview === value;
            return (
              <FormCheckbox
                key={el.id}
                position={el.position}
                checked={checked}
                onChange={() => {}} // Read-only
                disabled={true}
                ariaLabel={`Performance review: ${value}`}
              />
            );
          }
          return null;
        })}

      {/* Submit Button */}
      {!showResultMessage && (
        <button
          onClick={submitInvestigatorForm}
          disabled={!canSubmit}
          className={styles.submitButton}
          aria-label="Submit VK-82(e) Form"
        >
          Submit VK-82(e) Form
        </button>
      )}

      {/* Result Message Popup */}
      {showResultMessage && (
        <div className={styles.resultOverlay}>
          <div className={`${styles.resultMessage} ${isCorrect ? styles.success : styles.failure}`}>
            <h2>{isCorrect ? '✓ Correct!' : '✗ Incorrect'}</h2>
            <p>
              {isCorrect
                ? 'You correctly identified the suspect.'
                : `The suspect was actually a ${selectedRole?.roleType === 'human' ? 'Human' : 'Robot'}.`}
            </p>
            <p className={styles.resultDetails}>
              <strong>Your determination:</strong> {determination === 'human' ? 'Human (BRAIN)' : 'Robot (COG)'}
              <br />
              <strong>Actual:</strong> {selectedRole?.roleType === 'human' ? 'Human' : 'Robot'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
