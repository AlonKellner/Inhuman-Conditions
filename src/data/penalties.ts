/**
 * Penalties
 * 18 actions Suspects must perform when violating restrictions
 * Full data will be populated in Phase 3
 */

import type { Penalty } from '../types/penalty';

export const penalties: Penalty[] = [
  { id: 'apologize', text: 'Apologize', examples: ["I'm sorry"] },
  { id: 'swear', text: 'Swear', examples: ['Damn!', 'Hell!'] },
  {
    id: 'alliteration',
    text: 'Say three consecutive words beginning with the same letter',
    examples: ['Big bad bear', 'Silly silly situation'],
  },
];
