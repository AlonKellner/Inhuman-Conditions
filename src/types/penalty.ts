/**
 * Penalty Types
 * Actions Suspect must perform when violating restrictions (Patient Robots only)
 */

export interface Penalty {
  id: string;
  text: string;
  examples?: string[];
}
