/**
 * Penalties
 * 18 actions Suspects must perform when violating restrictions
 * Patient Robots must perform these when they break their restrictions
 */

import type { Penalty } from '../types/penalty';

export const penalties: Penalty[] = [
  { id: 'apologize', text: 'Apologize', examples: ["I'm sorry", 'My apologies'] },
  { id: 'swear', text: 'Swear', examples: ['Damn!', 'Hell!', 'Shit!'] },
  {
    id: 'alliteration',
    text: 'Say three consecutive words beginning with the same letter',
    examples: ['Big bad bear', 'Silly silly situation', 'Truly terrible times'],
  },
  { id: 'sound-effect', text: 'Make a sound effect', examples: ['Beep!', 'Buzz!', 'Whoosh!'] },
  { id: 'stand-up', text: 'Stand up', examples: ['(Stand up from your seat)'] },
  { id: 'clap', text: 'Clap your hands', examples: ['(Clap once or multiple times)'] },
  {
    id: 'knock',
    text: 'Knock on the table',
    examples: ['(Knock once)', '(Knock three times)'],
  },
  { id: 'cough', text: 'Cough', examples: ['(Cough deliberately)'] },
  { id: 'laugh', text: 'Laugh out loud', examples: ['Ha ha!', 'Hahaha!'] },
  {
    id: 'touch-nose',
    text: 'Touch your nose',
    examples: ['(Touch your nose with your finger)'],
  },
  {
    id: 'cross-arms',
    text: 'Cross your arms',
    examples: ['(Cross your arms across your chest)'],
  },
  {
    id: 'snap',
    text: 'Snap your fingers',
    examples: ['(Snap fingers)', '(Attempt to snap)'],
  },
  {
    id: 'count',
    text: 'Count to three out loud',
    examples: ['One, two, three', 'Un, deux, trois'],
  },
  { id: 'nod', text: 'Nod your head vigorously', examples: ['(Nod three times quickly)'] },
  { id: 'clear-throat', text: 'Clear your throat', examples: ['Ahem!', '(Clear throat loudly)'] },
  {
    id: 'blink',
    text: 'Blink rapidly three times',
    examples: ['(Blink blink blink)'],
  },
  {
    id: 'excuse-me',
    text: 'Say "excuse me"',
    examples: ['Excuse me', 'Pardon me'],
  },
  {
    id: 'repeat',
    text: 'Repeat the last word you said',
    examples: ['(If you said "Yes", say "Yes" again)'],
  },
];
