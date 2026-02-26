/**
 * Penalties
 * 18 actions Suspects must perform when violating restrictions
 * Patient Robots must perform these when they break their restrictions
 */

import type { Penalty } from '../types/penalty';

export const penalties: Penalty[] = [
  { id: 'apologize', text: 'Apologize', examples: ["I'm sorry", 'My apologies'], cardImage: '/assets/cards/penalties/penalties_p1_c01_penalty.png' },
  { id: 'swear', text: 'Swear', examples: ['Damn!', 'Hell!', 'Shit!'], cardImage: '/assets/cards/penalties/penalties_p1_c02_penalty.png' },
  {
    id: 'alliteration',
    text: 'Say three consecutive words beginning with the same letter',
    examples: ['Big bad bear', 'Silly silly situation', 'Truly terrible times'],
    cardImage: '/assets/cards/penalties/penalties_p1_c03_penalty.png',
  },
  { id: 'sound-effect', text: 'Make a sound effect', examples: ['Beep!', 'Buzz!', 'Whoosh!'], cardImage: '/assets/cards/penalties/penalties_p2_c01_penalty.png' },
  { id: 'stand-up', text: 'Stand up', examples: ['(Stand up from your seat)'], cardImage: '/assets/cards/penalties/penalties_p2_c02_penalty.png' },
  { id: 'clap', text: 'Clap your hands', examples: ['(Clap once or multiple times)'], cardImage: '/assets/cards/penalties/penalties_p2_c03_penalty.png' },
  {
    id: 'knock',
    text: 'Knock on the table',
    examples: ['(Knock once)', '(Knock three times)'],
    cardImage: '/assets/cards/penalties/penalties_p3_c01_penalty.png',
  },
  { id: 'cough', text: 'Cough', examples: ['(Cough deliberately)'], cardImage: '/assets/cards/penalties/penalties_p3_c02_penalty.png' },
  { id: 'laugh', text: 'Laugh out loud', examples: ['Ha ha!', 'Hahaha!'], cardImage: '/assets/cards/penalties/penalties_p3_c03_penalty.png' },
  {
    id: 'touch-nose',
    text: 'Touch your nose',
    examples: ['(Touch your nose with your finger)'],
    cardImage: '/assets/cards/penalties/penalties_p4_c01_penalty.png',
  },
  {
    id: 'cross-arms',
    text: 'Cross your arms',
    examples: ['(Cross your arms across your chest)'],
    cardImage: '/assets/cards/penalties/penalties_p4_c02_penalty.png',
  },
  {
    id: 'snap',
    text: 'Snap your fingers',
    examples: ['(Snap fingers)', '(Attempt to snap)'],
    cardImage: '/assets/cards/penalties/penalties_p4_c03_penalty.png',
  },
  {
    id: 'count',
    text: 'Count to three out loud',
    examples: ['One, two, three', 'Un, deux, trois'],
    cardImage: '/assets/cards/penalties/penalties_p5_c01_penalty.png',
  },
  { id: 'nod', text: 'Nod your head vigorously', examples: ['(Nod three times quickly)'], cardImage: '/assets/cards/penalties/penalties_p5_c02_penalty.png' },
  { id: 'clear-throat', text: 'Clear your throat', examples: ['Ahem!', '(Clear throat loudly)'], cardImage: '/assets/cards/penalties/penalties_p5_c03_penalty.png' },
  {
    id: 'blink',
    text: 'Blink rapidly three times',
    examples: ['(Blink blink blink)'],
    cardImage: '/assets/cards/penalties/penalties_p6_c01_penalty.png',
  },
  {
    id: 'excuse-me',
    text: 'Say "excuse me"',
    examples: ['Excuse me', 'Pardon me'],
    cardImage: '/assets/cards/penalties/penalties_p6_c02_penalty.png',
  },
  {
    id: 'repeat',
    text: 'Repeat the last word you said',
    examples: ['(If you said "Yes", say "Yes" again)'],
    cardImage: '/assets/cards/penalties/penalties_p6_c03_penalty.png',
  },
];
