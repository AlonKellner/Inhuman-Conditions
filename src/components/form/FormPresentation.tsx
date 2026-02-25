/**
 * FormPresentation Component
 * Static presentation layer for completed investigator forms
 * Renders form data without input elements for accurate capturing/printing
 */

import { type FC } from 'react';
import type { InvestigatorFormData } from '../../types/investigatorForm';
import type { Packet } from '../../types/packet';
import type { Background } from '../../types/background';
import styles from './FormPresentation.module.css';

interface FormPresentationProps {
  formData: InvestigatorFormData;
  selectedPacket: Packet | null;
  selectedBackground: Background | null;
  determination: 'human' | 'robot' | null;
  performanceReview: 'correct' | 'incorrect' | 'na' | null;
}

export const FormPresentation: FC<FormPresentationProps> = ({
  formData,
  selectedPacket,
  selectedBackground,
  determination,
  performanceReview,
}) => {
  // Same scaling as interactive form
  const SCALE_X = 900 / 1157;
  const SCALE_Y = 300 / 401;

  // Positions from form_labels.json (hardcoded for presentation)
  // These match the scaled positions from InvestigatorFormInterface

  return (
    <div className={styles.presentationContainer}>
      {/* Background form image */}
      <img
        src="/assets/cards/forms/investigator_forms_p1_c01_investigator-form.png"
        alt="VK-82(e) Investigator Interview Recording Form"
        className={styles.formImage}
      />

      {/* PENALTY Section - Checkboxes */}
      {formData.penaltyAttempts.attempt1 && (
        <div
          className={styles.checkmark}
          style={{
            left: `${44 * SCALE_X}px`,
            top: `${135 * SCALE_Y}px`,
            width: `${15 * SCALE_X}px`,
            height: `${15 * SCALE_Y}px`,
          }}
        >
          ✓
        </div>
      )}
      {formData.penaltyAttempts.attempt2 && (
        <div
          className={styles.checkmark}
          style={{
            left: `${44 * SCALE_X}px`,
            top: `${151 * SCALE_Y}px`,
            width: `${15 * SCALE_X}px`,
            height: `${15 * SCALE_Y}px`,
          }}
        >
          ✓
        </div>
      )}
      {formData.penaltyAttempts.attempt3 && (
        <div
          className={styles.checkmark}
          style={{
            left: `${44 * SCALE_X}px`,
            top: `${167 * SCALE_Y}px`,
            width: `${15 * SCALE_X}px`,
            height: `${15 * SCALE_Y}px`,
          }}
        >
          ✓
        </div>
      )}

      {/* INDUCE Section - Selected Module */}
      {selectedPacket && (
        <>
          <div
            className={styles.text}
            style={{
              left: `${199 * SCALE_X}px`,
              top: `${(120 + 1) * SCALE_Y}px`,
              width: `${120 * SCALE_X}px`,
              height: `${16 * SCALE_Y}px`,
            }}
          >
            {selectedPacket.name}
          </div>
          <img
            src={selectedPacket.icon}
            alt=""
            className={styles.moduleIcon}
            style={{
              left: `${330 * SCALE_X}px`,
              top: `${120 * SCALE_Y}px`,
              width: `${16 * SCALE_X}px`,
              height: `${16 * SCALE_Y}px`,
            }}
          />
        </>
      )}

      {/* INDUCE Section - YES/NO Checkboxes */}
      {formData.inducerResult === 'yes' && (
        <div
          className={styles.checkmark}
          style={{
            left: `${236 * SCALE_X}px`,
            top: `${151 * SCALE_Y}px`,
            width: `${15 * SCALE_X}px`,
            height: `${15 * SCALE_Y}px`,
          }}
        >
          ✓
        </div>
      )}
      {formData.inducerResult === 'no' && (
        <div
          className={styles.checkmark}
          style={{
            left: `${282 * SCALE_X}px`,
            top: `${151 * SCALE_Y}px`,
            width: `${15 * SCALE_X}px`,
            height: `${15 * SCALE_Y}px`,
          }}
        >
          ✓
        </div>
      )}

      {/* SUSPECT Section - Background */}
      {selectedBackground && (
        <div
          className={styles.text}
          style={{
            left: `${391 * SCALE_X}px`,
            top: `${120 * SCALE_Y}px`,
            width: `${155 * SCALE_X}px`,
            height: `${16 * SCALE_Y}px`,
          }}
        >
          {selectedBackground.name}
        </div>
      )}

      {/* SUSPECT Section - Name (first, middle, last) */}
      {/* First name letter boxes */}
      {formData.suspectName.first.split('').map((letter, index) => (
        <div
          key={`first-${index}`}
          className={styles.letter}
          style={{
            left: `${(391 + index * 16) * SCALE_X}px`,
            top: `${151 * SCALE_Y}px`,
            width: `${14 * SCALE_X}px`,
            height: `${16 * SCALE_Y}px`,
          }}
        >
          {letter}
        </div>
      ))}

      {/* Middle name letter boxes */}
      {formData.suspectName.middle.split('').map((letter, index) => (
        <div
          key={`middle-${index}`}
          className={styles.letter}
          style={{
            left: `${(391 + index * 16) * SCALE_X}px`,
            top: `${167 * SCALE_Y}px`,
            width: `${14 * SCALE_X}px`,
            height: `${16 * SCALE_Y}px`,
          }}
        >
          {letter}
        </div>
      ))}

      {/* Last name letter boxes */}
      {formData.suspectName.last.split('').map((letter, index) => (
        <div
          key={`last-${index}`}
          className={styles.letter}
          style={{
            left: `${(391 + index * 16) * SCALE_X}px`,
            top: `${183 * SCALE_Y}px`,
            width: `${14 * SCALE_X}px`,
            height: `${16 * SCALE_Y}px`,
          }}
        >
          {letter}
        </div>
      ))}

      {/* NOTES Section */}
      {formData.investigatorNotes && (
        <div
          className={styles.notes}
          style={{
            left: `${583 * SCALE_X}px`,
            top: `${120 * SCALE_Y}px`,
            width: `${155 * SCALE_X}px`,
            height: `${80 * SCALE_Y}px`,
          }}
        >
          {formData.investigatorNotes}
        </div>
      )}

      {/* VERIFY Section - COG/BRAIN Circle */}
      {determination && (
        <svg
          className={styles.circle}
          style={{
            left: determination === 'robot' ? `${768 * SCALE_X}px` : `${822 * SCALE_X}px`,
            top: `${117 * SCALE_Y}px`,
            width: `${50 * SCALE_X * 1.1}px`,
            height: `${50 * SCALE_Y * 1.1}px`,
          }}
          viewBox="-5 -5 110 110"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid meet"
        >
          <circle
            cx="50"
            cy="50"
            r="50"
            stroke="#000"
            strokeWidth="5"
            strokeDasharray="4 4"
            fill="none"
          />
        </svg>
      )}

      {/* VERIFY Section - Signature */}
      {formData.signature && (
        <div
          className={styles.signature}
          style={{
            left: `${761 * SCALE_X}px`,
            top: `${183 * SCALE_Y}px`,
            width: `${165 * SCALE_X}px`,
            height: `${16 * SCALE_Y}px`,
          }}
        >
          <img
            src={formData.signature}
            alt="Investigator signature"
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        </div>
      )}

      {/* VERIFY Section - Date */}
      <div
        className={styles.text}
        style={{
          left: `${1010 * SCALE_X}px`,
          top: `${183 * SCALE_Y}px`,
          width: `${130 * SCALE_X}px`,
          height: `${16 * SCALE_Y}px`,
        }}
      >
        {new Date().toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })}
      </div>

      {/* PERFORMANCE REVIEW Section */}
      {performanceReview === 'correct' && (
        <div
          className={styles.checkmark}
          style={{
            left: `${968 * SCALE_X}px`,
            top: `${119 * SCALE_Y}px`,
            width: `${15 * SCALE_X}px`,
            height: `${15 * SCALE_Y}px`,
          }}
        >
          ✓
        </div>
      )}
      {performanceReview === 'incorrect' && (
        <div
          className={styles.checkmark}
          style={{
            left: `${968 * SCALE_X}px`,
            top: `${135 * SCALE_Y}px`,
            width: `${15 * SCALE_X}px`,
            height: `${15 * SCALE_Y}px`,
          }}
        >
          ✓
        </div>
      )}
      {performanceReview === 'na' && (
        <div
          className={styles.checkmark}
          style={{
            left: `${968 * SCALE_X}px`,
            top: `${151 * SCALE_Y}px`,
            width: `${15 * SCALE_X}px`,
            height: `${15 * SCALE_Y}px`,
          }}
        >
          ✓
        </div>
      )}
    </div>
  );
};
