/**
 * FormSignature Component
 * Drawing canvas for investigator signature
 */

import { type FC, useRef, useEffect } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import type { FormWidgetPosition } from '../../types/investigator-form';
import styles from './FormSignature.module.css';

export interface FormSignatureProps {
  position: FormWidgetPosition;
  value: string; // Base64 data URL
  onChange: (dataUrl: string) => void;
  readOnly?: boolean;
  ariaLabel?: string;
}

export const FormSignature: FC<FormSignatureProps> = ({
  position,
  value,
  onChange,
  readOnly = false,
  ariaLabel = 'Signature canvas',
}) => {
  const sigCanvas = useRef<SignatureCanvas>(null);

  // Load existing signature if provided
  useEffect(() => {
    if (value && sigCanvas.current && sigCanvas.current.isEmpty()) {
      sigCanvas.current.fromDataURL(value);
    }
  }, [value]);

  const handleEnd = () => {
    if (sigCanvas.current && !readOnly) {
      const dataUrl = sigCanvas.current.toDataURL();
      onChange(dataUrl);
    }
  };

  const handleClear = () => {
    if (sigCanvas.current && !readOnly) {
      sigCanvas.current.clear();
      onChange('');
    }
  };

  return (
    <div
      className={styles.signatureContainer}
      style={{
        position: 'absolute',
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${position.width}px`,
        height: `${position.height}px`,
      }}
    >
      <SignatureCanvas
        ref={sigCanvas}
        canvasProps={{
          className: styles.signatureCanvas,
          'aria-label': ariaLabel,
        }}
        penColor="#000"
        minWidth={0.5}
        maxWidth={2.5}
        velocityFilterWeight={0.7}
        onEnd={handleEnd}
      />
      {!readOnly && (
        <button
          type="button"
          onClick={handleClear}
          className={styles.clearButton}
          aria-label="Clear signature"
          title="Clear signature"
        >
          ✕
        </button>
      )}
    </div>
  );
};
