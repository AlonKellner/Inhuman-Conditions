/**
 * InvestigatorFormInterface Component
 * Main VK-82(e) investigator interview recording form
 * Overlays interactive widgets on the official form image
 */

import { type FC, useMemo, useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
import { useGameStore } from '../../store/GameStoreContext';
import { FormCheckbox } from './FormCheckbox';
import { FormLetterBox } from './FormLetterBox';
import { FormTextField } from './FormTextField';
import { FormTextArea } from './FormTextArea';
import { FormIconSelector } from './FormIconSelector';
import { FormContentSelector } from './FormContentSelector';
import { FormSignature } from './FormSignature';
import { parseFormLabels, groupElementsBySection } from '../../utils/parseFormLabels';
import formLabelsData from '../../data/form_labels.json';
import { backgrounds } from '../../data/backgrounds';
import { packets } from '../../data/packets';
import type { Background } from '../../types/background';
import styles from './InvestigatorFormInterface.module.css';

export const InvestigatorFormInterface: FC = () => {
  // State for captured form image
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const formContainerRef = useRef<HTMLDivElement>(null);

  // Parse form labels once
  const formElements = useMemo(() => parseFormLabels(formLabelsData), []);
  const sections = useMemo(() => groupElementsBySection(formElements), [formElements]);

  // Original image dimensions: 1157x401
  // Target display size: 900x300
  const SCALE_X = 900 / 1157;
  const SCALE_Y = 300 / 401;

  // Helper to scale positions
  const scalePosition = (pos: { x: number; y: number; width: number; height: number }) => ({
    x: pos.x * SCALE_X,
    y: pos.y * SCALE_Y,
    width: pos.width * SCALE_X,
    height: pos.height * SCALE_Y,
  });

  // Get game state and form data
  const {
    investigatorForm,
    selectedPacket,
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
    selectContentById,
  } = useGameStore();

  // Check if form can be submitted
  const canSubmit =
    investigatorForm.signature.trim() !== '' &&
    determination !== null &&
    investigatorForm.performanceReview === null; // Only allow submit if not already submitted

  // Handle single letter change in name
  const handleLetterChange = (nameField: 'first' | 'middle' | 'last', index: number, value: string) => {
    const currentName = investigatorForm.suspectName[nameField] || '';
    const nameArray = currentName.split('');

    // Pad array if needed
    while (nameArray.length <= index) {
      nameArray.push('');
    }

    // Update the letter at the index
    nameArray[index] = value;

    // Trim trailing empty strings
    while (nameArray.length > 0 && nameArray[nameArray.length - 1] === '') {
      nameArray.pop();
    }

    const newName = nameArray.join('');

    updateFormSuspectName({
      ...investigatorForm.suspectName,
      [nameField]: newName,
    });
  };

  // Handle advancing to next name field (triggered by space or reaching end)
  const handleAdvanceToField = (targetField: 'first' | 'middle' | 'last') => {
    // Find the first letter box of the target field and focus it
    const firstBox = document.querySelector<HTMLInputElement>(
      `input[data-name-field="${targetField}"][data-index="0"]`
    );
    if (firstBox) {
      firstBox.focus();
    }
  };

  // Find COG and BRAIN positions for icon selector - use array indices
  const iconSelectors = sections.verify.filter((el) => el.type === 'icon-selector');
  const cogElementRaw = iconSelectors[0]; // First icon selector is COG
  const brainElementRaw = iconSelectors[1]; // Second icon selector is BRAIN

  // Adjust bounding boxes: Make BRAIN square (width = height), then make COG same size but centered
  // Increase size by 10% for better circle visibility
  const brainElement = brainElementRaw
    ? {
        ...brainElementRaw,
        position: {
          ...brainElementRaw.position,
          x: brainElementRaw.position.x + 3 - (brainElementRaw.position.height * 0.1) / 2, // Shift 3px right and center 10% increase
          y: brainElementRaw.position.y - (brainElementRaw.position.height * 0.1) / 2, // Center 10% increase
          width: brainElementRaw.position.height * 1.1, // Make square using height, 10% larger
          height: brainElementRaw.position.height * 1.1,
        },
      }
    : brainElementRaw;

  const cogElement = cogElementRaw && brainElementRaw
    ? {
        ...cogElementRaw,
        position: {
          // Center the new square on COG's original center, 10% larger
          x: cogElementRaw.position.x + cogElementRaw.position.width / 2 - (brainElementRaw.position.height * 1.1) / 2,
          y: cogElementRaw.position.y + cogElementRaw.position.height / 2 - (brainElementRaw.position.height * 1.1) / 2,
          width: brainElementRaw.position.height * 1.1, // Same size as BRAIN, 10% larger
          height: brainElementRaw.position.height * 1.1,
        },
      }
    : cogElementRaw;

  // Success/failure message after submission
  const showResultMessage = investigatorForm.performanceReview !== null;
  const isCorrect = investigatorForm.performanceReview === 'correct';
  const isDead = investigatorForm.performanceReview === 'na';

  // Capture form as image when submitted
  const captureForm = async () => {
    if (formContainerRef.current) {
      try {
        const canvas = await html2canvas(formContainerRef.current, {
          backgroundColor: '#ffffff',
          scale: 2, // Higher quality
          logging: false,
          useCORS: true,
          allowTaint: true,
          foreignObjectRendering: false, // Better transform support
        });
        const imageData = canvas.toDataURL('image/png');
        setCapturedImage(imageData);
      } catch (error) {
        console.error('Failed to capture form:', error);
      }
    }
  };

  // Capture after a delay to ensure all transforms and positions are applied
  useEffect(() => {
    if (showResultMessage && !capturedImage) {
      // Wait for performance review checkboxes to render and settle
      setTimeout(() => {
        captureForm();
      }, 200);
    }
  }, [showResultMessage, capturedImage]);

  return (
    <div>
      {capturedImage ? (
        // Show captured static image after submission
        <div className={styles.capturedFormContainer}>
          <img
            src={capturedImage}
            alt="Completed VK-82(e) Form"
            className={styles.capturedFormImage}
          />
        </div>
      ) : (
        // Show interactive form before submission
        <div ref={formContainerRef} className={styles.formContainer}>
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
              position={scalePosition(el.position)}
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
          position={{
            ...scalePosition(sections.induce.find((el) => el.description.includes('Selected Module'))!.position),
            y: scalePosition(sections.induce.find((el) => el.description.includes('Selected Module'))!.position).y + 1
          }}
          label="Module"
          options={packets.map((packet) => ({ id: packet.id, name: packet.name, icon: packet.icon }))}
          selectedId={selectedPacket?.id || null}
          onSelect={(id) => selectContentById('packet', id)}
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
              position={scalePosition(el.position)}
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

      {/* SUSPECT Section - Background selector */}
      {sections.suspect.find((el) => el.description.includes('Background')) && (
        <FormContentSelector
          position={scalePosition(sections.suspect.find((el) => el.description.includes('Background'))!.position)}
          label="Background"
          options={backgrounds.map((bg: Background) => ({ id: bg.id, name: bg.name }))}
          selectedId={selectedBackground?.id || null}
          onSelect={(id) => selectContentById('background', id)}
          onPrevious={() => cycleContent('background', 'previous')}
          onNext={() => cycleContent('background', 'next')}
        />
      )}

      {/* SUSPECT Section - Name letter boxes */}
      {sections.suspect
        .filter((el) => el.type === 'letter-box')
        .map((el, idx) => {
          const nameField = el.metadata?.nameField as 'first' | 'middle' | 'last';
          const letterIndex = el.metadata?.letterIndex as number;
          const name = investigatorForm.suspectName[nameField] || '';
          const letter = name.charAt(letterIndex);

          // Auto-focus the first letter box of the first name field
          const isFirstBox = idx === 0;

          return (
            <FormLetterBox
              key={el.id}
              position={scalePosition(el.position)}
              letter={letter}
              index={letterIndex}
              nameField={nameField}
              readOnly={showResultMessage}
              onChange={handleLetterChange}
              onAdvance={handleAdvanceToField}
              autoFocus={isFirstBox}
            />
          );
        })}

      {/* NOTES Section - Textarea */}
      {sections.notes.map((el) => {
        if (el.type === 'textarea') {
          return (
            <FormTextArea
              key={el.id}
              position={scalePosition(el.position)}
              value={investigatorForm.investigatorNotes}
              onChange={updateFormNotes}
              placeholder="Investigator observations during interview..."
              readOnly={showResultMessage}
              ariaLabel="Investigator notes"
            />
          );
        }
        return null;
      })}

      {/* VERIFY Section - COG/BRAIN Icon Selector */}
      {cogElement && brainElement && (
        <FormIconSelector
          cogPosition={scalePosition(cogElement.position)}
          brainPosition={scalePosition(brainElement.position)}
          value={determination}
          onChange={setDetermination}
          disabled={showResultMessage}
        />
      )}

      {/* VERIFY Section - Signature */}
      {sections.verify.find((el) => el.description.includes('signature section')) && (
        <FormSignature
          position={scalePosition(sections.verify.find((el) => el.description.includes('signature section'))!.position)}
          value={investigatorForm.signature}
          onChange={updateFormSignature}
          readOnly={showResultMessage}
          ariaLabel="Investigator signature"
        />
      )}

      {/* VERIFY Section - Date */}
      {sections.verify.find((el) => el.description.toLowerCase().includes('date')) && (
        <FormTextField
          position={scalePosition(sections.verify.find((el) => el.description.toLowerCase().includes('date'))!.position)}
          value={new Date().toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })}
          onChange={() => {}} // Read-only, shows current date
          readOnly={true}
          ariaLabel="Interview date"
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
                position={scalePosition(el.position)}
                checked={checked}
                onChange={() => {}} // Read-only
                disabled={true}
                ariaLabel={`Performance review: ${value}`}
              />
            );
          }
          return null;
        })}

      </div>
      )}

      {/* Submit Button - Below Form */}
      {!showResultMessage && (
        <button
          onClick={submitInvestigatorForm}
          disabled={!canSubmit}
          className={styles.submitButton}
          aria-label="Submit VK-82(e) Form"
        >
          SUBMIT VK-82(e) FORM
        </button>
      )}

      {/* Print Button - Directly Below Form */}
      {showResultMessage && (
        <button
          onClick={() => window.print()}
          className={styles.printButton}
          aria-label="Print VK-82(e) Form"
        >
          PRINT FORM
        </button>
      )}

      {/* Result Message - Below Print Button */}
      {showResultMessage && (
        <div className={`${styles.resultMessage} ${isCorrect ? styles.success : isDead ? styles.dead : styles.failure}`}>
          <div className={styles.resultHeader}>
            {isCorrect ? 'PERFORMANCE REVIEW: CORRECT' : isDead ? 'PERFORMANCE REVIEW: N/A (TERMINATED)' : 'PERFORMANCE REVIEW: INCORRECT'}
          </div>
          <div className={styles.resultBody}>
            <p>
              {isCorrect
                ? 'Subject correctly identified. Investigator performance meets standard.'
                : isDead
                ? 'Violent robot incident resulted in investigator termination. Determination recorded as N/A.'
                : `Subject was ${selectedRole?.roleType === 'human' ? 'HUMAN' : selectedRole?.roleType === 'violent-robot' ? 'VIOLENT ROBOT' : 'PATIENT ROBOT'}. Investigator determination was incorrect.`}
            </p>
            <div className={styles.resultDetails}>
              <div>INVESTIGATOR DETERMINATION: {determination === 'human' ? 'HUMAN (BRAIN)' : 'ROBOT (COG)'}</div>
              <div>ACTUAL CLASSIFICATION: {selectedRole?.roleType === 'human' ? 'HUMAN' : selectedRole?.roleType === 'violent-robot' ? 'VIOLENT ROBOT' : 'PATIENT ROBOT'}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
