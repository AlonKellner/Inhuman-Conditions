/**
 * FormContentSelector Component
 * Minimal selector with edge-positioned arrow buttons and clickable text for dropdown
 * Used for Module and Background selection in VK-82(e) form
 */

import { type FC, useState, useRef, useEffect } from 'react';
import type { FormWidgetPosition } from '../../types/investigator-form';
import styles from './FormContentSelector.module.css';

export interface FormContentSelectorProps {
  position: FormWidgetPosition;
  label: string;
  options: Array<{ id: string; name: string; icon?: string }>;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onPrevious: () => void;
  onNext: () => void;
  disabled?: boolean;
}

export const FormContentSelector: FC<FormContentSelectorProps> = ({
  position,
  label,
  options,
  selectedId,
  onSelect,
  onPrevious,
  onNext,
  disabled = false,
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [fontSize, setFontSize] = useState(11);
  const textRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLSpanElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selectedOption = options?.find((opt) => opt.id === selectedId);
  const selectedName = selectedOption?.name || '';
  const selectedIcon = selectedOption?.icon;

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!showDropdown) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        textRef.current &&
        !textRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDropdown]);

  // Dynamically adjust font size to fit text between arrows
  useEffect(() => {
    if (!nameRef.current || !containerRef.current || !textRef.current) return;

    const measureText = () => {
      const nameElement = nameRef.current!;
      const textElement = textRef.current!;
      const containerElement = containerRef.current!;

      // Get available width (container width minus arrow buttons and icon space)
      const containerWidth = containerElement.offsetWidth;
      const containerHeight = containerElement.offsetHeight;
      const arrowWidth = 20; // Each arrow button is 20px
      // Icon is 1em + 4px gap, so reserve space proportional to current font size
      const iconSpace = selectedIcon ? (containerHeight + 4) : 0;
      const availableWidth = containerWidth - (2 * arrowWidth) - iconSpace;

      // Start with font size that fills the container vertically (line-height is 1)
      let currentFontSize = containerHeight;
      textElement.style.fontSize = `${currentFontSize}px`;

      // Reduce font size until text (not including icon) fits horizontally
      while (nameElement.scrollWidth > availableWidth && currentFontSize > 6) {
        currentFontSize -= 0.5;
        textElement.style.fontSize = `${currentFontSize}px`;
      }

      setFontSize(currentFontSize);
    };

    measureText();
  }, [selectedName, selectedIcon, position.width, position.height]);

  return (
    <div
      ref={containerRef}
      className={styles.selectorContainer}
      style={{
        position: 'absolute',
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${position.width}px`,
        height: `${position.height}px`,
      }}
    >
      {/* Previous button (left edge) */}
      <button
        type="button"
        className={styles.arrowButton}
        onClick={onPrevious}
        disabled={disabled}
        aria-label={`Previous ${label.toLowerCase()}`}
      >
        ←
      </button>

      {/* Selected text (clickable to show dropdown) */}
      <div
        ref={textRef}
        className={styles.selectedText}
        onClick={() => !disabled && setShowDropdown(!showDropdown)}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label={`Selected ${label.toLowerCase()}: ${selectedName}`}
        style={{ fontSize: `${fontSize}px` }}
      >
        <span ref={nameRef} className={styles.nameText}>{selectedName}</span>
        {selectedIcon && (
          <img src={selectedIcon} alt="" className={styles.iconImage} />
        )}
      </div>

      {/* Custom dropdown (shown on text click) */}
      {showDropdown && options && (
        <div ref={dropdownRef} className={styles.dropdown}>
          {options.map((option) => (
            <div
              key={option.id}
              className={`${styles.dropdownOption} ${option.id === selectedId ? styles.selected : ''}`}
              onClick={() => {
                onSelect(option.id);
                setShowDropdown(false);
              }}
              role="option"
              aria-selected={option.id === selectedId}
            >
              <span className={styles.optionName}>{option.name}</span>
              {option.icon && (
                <img src={option.icon} alt="" className={styles.optionIcon} />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Next button (right edge) */}
      <button
        type="button"
        className={styles.arrowButton}
        onClick={onNext}
        disabled={disabled}
        aria-label={`Next ${label.toLowerCase()}`}
      >
        →
      </button>
    </div>
  );
};
