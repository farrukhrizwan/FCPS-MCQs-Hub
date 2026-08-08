import { Subject, SystemClass } from '../types';

export const INITIAL_CLASSES: SystemClass[] = [
  { id: 'middle', name: 'Middle Section (Class 6-8)', categorySlug: 'middle' },
  { id: 'ssc9', name: 'SSC Part 1 (9th Class)', categorySlug: 'ssc9' },
  { id: 'ssc10', name: 'SSC Part 2 (10th Class)', categorySlug: 'ssc10' },
  { id: 'gk_iq', name: 'General Knowledge & IQ', categorySlug: 'gk_iq' }
];

const LOCAL_CLASSES_KEY = 'FCPS_SYSTEM_CLASSES_V2';

export function getStoredClasses(): SystemClass[] {
  try {
    const raw = localStorage.getItem(LOCAL_CLASSES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to parse classes from local storage:', err);
  }
  return INITIAL_CLASSES;
}

export function saveStoredClasses(classes: SystemClass[]): void {
  try {
    localStorage.setItem(LOCAL_CLASSES_KEY, JSON.stringify(classes));
  } catch (err) {
    console.error('Failed to save classes to local storage:', err);
  }
}

export const INITIAL_QUESTION_BANK: Subject[] = [
  // ==========================================
  // MIDDLE SECTION (Class 6-8)
  // ==========================================
  {
    id: 'middle_english',
    name: 'English (Grammar)',
    category: 'middle',
    hasChapters: false,
    chapters: [
      {
        id: 1,
        title: 'English Grammar & Vocabulary',
        questions: [
          { id: 'me1', q: 'Which word is a noun in the sentence: "The brave soldier fought well"?', opts: ['brave', 'soldier', 'fought', 'well'], ans: 1, explain: '"Soldier" is a naming word (noun).' },
          { id: 'me2', q: 'Identify the correct adjective: "She wore a _____ dress to the party."', opts: ['beauty', 'beautifully', 'beautiful', 'beautify'], ans: 2, explain: '"Beautiful" is an adjective describing "dress".' },
          { id: 'me3', q: 'What is the antonym of "Generous"?', opts: ['Selfish', 'Kind', 'Honest', 'Helpful'], ans: 0, explain: 'Generous means giving; selfish is its opposite.' },
          { id: 'me4', q: 'Choose the correct preposition: "He has been living here _____ 2018."', opts: ['for', 'since', 'from', 'in'], ans: 1, explain: 'Use "since" with a specific point in time (2018).' },
          { id: 'me5', q: 'Which sentence is in the Past Continuous Tense?', opts: ['He plays football.', 'He played football.', 'He was playing football.', 'He will play football.'], ans: 2, explain: '"Was playing" is Past Continuous.' },
          { id: 'me6', q: 'What is the plural of "Child"?', opts: ['Childs', 'Children', 'Childrens', 'Childes'], ans: 1, explain: 'The irregular plural of child is children.' },
          { id: 'me7', q: 'Choose the correct conjunction: "She studied hard, _____ she passed the exam."', opts: ['but', 'or', 'so', 'because'], ans: 2, explain: '"So" expresses cause and effect result.' },
          { id: 'me8', q: 'Identify the adverb in: "He ran very quickly."', opts: ['He', 'ran', 'very and quickly', 'quickly only'], ans: 2, explain: 'Both "very" and "quickly" function as adverbs in this context.' },
          { id: 'me9', q: 'What is the synonym of "Abolish"?', opts: ['Cancel / Eliminate', 'Create', 'Build', 'Support'], ans: 0, explain: 'Abolish means to put an end to something.' },
          { id: 'me10', q: 'Choose the correct passive voice of: "The boy broke the window."', opts: ['The window is broken by the boy.', 'The window was broken by the boy.', 'The window had broken by the boy.', 'The window was break by the boy.'], ans: 1, explain: 'Simple past passive requires was/were + V3 (was broken).' },
          { id: 'me11', q: 'Which of the following is a Collective Noun?', opts: ['Flock', 'Sheep', 'Wool', 'Farmer'], ans: 0, explain: 'A "flock" refers to a group of sheep.' },
          { id: 'me12', q: 'Fill in the blank with appropriate article: "He is _____ European scholar."', opts: ['a', 'an', 'the', 'no article'], ans: 0, explain: 'European begins with a consonant sound ("yoo"), so "a" is used.' },
          { id: 'me13', q: 'Select the correct spelling:', opts: ['Receve', 'Receive', 'Recieve', 'Recive'], ans: 1, explain: 'Rule: "I before E except after C".' },
          { id: 'me14', q: 'What is the comparative form of "Good"?', opts: ['Gooder', 'Best', 'Better', 'More good'], ans: 2, explain: 'Degrees of good: Good - Better - Best.' },
          { id: 'me15', q: 'Choose the correct pronoun: "Between you and _____, this is a secret."', opts: ['I', 'me', 'my', 'myself'], ans: 1, explain: 'Prepositions (between) take objective case pronouns (me).' }
        ]
      }
    ]
  },
  {
    id: 'middle_maths',
    name: 'Mathematics',
    category: 'middle',
    hasChapters: true,
    chapters: [
      {
        id: 1,
        title: 'Chapter 1: Integers & Rational Numbers',
        questions: [
          { id: 'mm1_1', q: 'What is the sum of -15 and +25?', opts: ['-10', '+10', '-40', '+40'], ans: 1, explain: '-15 + 25 = 10.' },
          { id: 'mm1_2', q: 'Evaluate: (-8) × (-7)', opts: ['-56', '+56', '-15', '+15'], ans: 1, explain: 'Multiplying two negative numbers gives a positive result.' },
          { id: 'mm1_3', q: 'Which of the following is a rational number?', opts: ['√2', 'π', '3/5', '√3'], ans: 2, explain: '3/5 is in the form p/q where q ≠ 0.' },
          { id: 'mm1_4', q: 'What is the additive inverse of -3/4?', opts: ['3/4', '-4/3', '4/3', '-3/4'], ans: 0, explain: 'The sum of a number and its additive inverse is zero.' },
          { id: 'mm1_5', q: 'Evaluate: | -12 | + | 5 |', opts: ['-7', '7', '17', '-17'], ans: 2, explain: 'Absolute values are 12 + 5 = 17.' },
          { id: 'mm1_6', q: 'The multiplicative inverse of -5/8 is:', opts: ['5/8', '-8/5', '8/5', '1'], ans: 1, explain: 'The product of a number and its reciprocal is 1.' },
          { id: 'mm1_7', q: 'Simplify: 1/2 + 2/3', opts: ['3/5', '7/6', '5/6', '1/6'], ans: 1, explain: '3/6 + 4/6 = 7/6.' },
          { id: 'mm1_8', q: 'Which integer is neither positive nor negative?', opts: ['1', '-1', '0', '10'], ans: 2, explain: 'Zero is neutral.' },
          { id: 'mm1_9', q: 'Simplify: (-20) ÷ (-4)', opts: ['-5', '5', '-16', '16'], ans: 1, explain: '-20 divided by -4 equals +5.' },
          { id: 'mm1_10', q: 'Find the reciprocal of 7:', opts: ['-7', '1/7', '-1/7', '0'], ans: 1, explain: 'Reciprocal of x is 1/x.' }
        ]
      },
      {
        id: 2,
        title: 'Chapter 2: Algebra & Simple Equations',
        questions: [
          { id: 'mm2_1', q: 'Solve for x: 3x - 5 = 10', opts: ['x = 3', 'x = 5', 'x = 15', 'x = 2'], ans: 1, explain: '3x = 15 => x = 5.' },
          { id: 'mm2_2', q: 'What is the degree of the expression 4x²y + 3x?', opts: ['2', '3', '1', '4'], ans: 1, explain: 'The highest term degree is 2+1 = 3.' },
          { id: 'mm2_3', q: 'Expand: (x + 4)(x - 4)', opts: ['x² + 16', 'x² - 16', 'x² - 8x + 16', 'x² + 8'], ans: 1, explain: '(a+b)(a-b) = a² - b².' },
          { id: 'mm2_4', q: 'If 2x + 7 = 19, then x =', opts: ['6', '12', '5', '4'], ans: 0, explain: '2x = 12 => x = 6.' },
          { id: 'mm2_5', q: 'Factorize: 5x + 15y', opts: ['5(x + y)', '5(x + 3y)', '15(x + y)', 'x(5 + 15y)'], ans: 1, explain: 'Take out HCF 5.' },
          { id: 'mm2_6', q: 'Simplify: 4a + 3b - 2a + 5b', opts: ['2a + 8b', '6a + 8b', '2a + 2b', '7ab'], ans: 0, explain: 'Combine like terms.' },
          { id: 'mm2_7', q: 'Evaluate 2x² - 3 when x = 3', opts: ['9', '15', '12', '18'], ans: 1, explain: '2(9) - 3 = 18 - 3 = 15.' },
          { id: 'mm2_8', q: 'Solve: x/4 = 7', opts: ['x = 28', 'x = 11', 'x = 3', 'x = 1.75'], ans: 0, explain: 'x = 7 * 4 = 28.' },
          { id: 'mm2_9', q: 'The perimeter of a square with side length \'s\' is:', opts: ['s²', '2s', '4s', '4+s'], ans: 2, explain: 'Perimeter of a square = 4 * side.' },
          { id: 'mm2_10', q: 'Subtract (2x - 3) from (5x + 4)', opts: ['3x + 7', '3x + 1', '7x + 1', '3x - 7'], ans: 0, explain: '(5x+4) - (2x-3) = 3x + 7.' }
        ]
      }
    ]
  },
  {
    id: 'middle_science',
    name: 'Science',
    category: 'middle',
    hasChapters: true,
    chapters: [
      {
        id: 1,
        title: 'Chapter 1: Matter, Atoms & Molecules',
        questions: [
          { id: 'ms1_1', q: 'Which state of matter has a fixed volume but no fixed shape?', opts: ['Solid', 'Liquid', 'Gas', 'Plasma'], ans: 1, explain: 'Liquids take container shape while retaining volume.' },
          { id: 'ms1_2', q: 'The positively charged particle in an atom is the:', opts: ['Electron', 'Neutron', 'Proton', 'Photon'], ans: 2, explain: 'Protons carry positive charge.' },
          { id: 'ms1_3', q: 'Sublimation is the process of converting:', opts: ['Solid directly to Gas', 'Liquid to Gas', 'Gas to Liquid', 'Solid to Liquid'], ans: 0, explain: 'Bypasses liquid phase.' },
          { id: 'ms1_4', q: 'The central part of an atom is called the:', opts: ['Shell', 'Nucleus', 'Orbit', 'Electron cloud'], ans: 1, explain: 'Contains protons and neutrons.' },
          { id: 'ms1_5', q: 'Which of the following is a chemical change?', opts: ['Melting of wax', 'Freezing of water', 'Rusting of iron', 'Dissolving salt'], ans: 2, explain: 'Rusting creates a new substance.' }
        ]
      }
    ]
  },

  // ==========================================
  // SSC PART 1 (9TH CLASS)
  // ==========================================
  {
    id: 'ssc9_english',
    name: 'English (Grammar)',
    category: 'ssc9',
    hasChapters: false,
    chapters: [
      {
        id: 1,
        title: 'English 9th - Comprehensive Grammar',
        questions: [
          { id: 'e9_1', q: 'Identify the modal verb showing obligation: "You _____ respect your elders."', opts: ['can', 'might', 'must', 'could'], ans: 2, explain: '"Must" expresses obligation.' },
          { id: 'e9_2', q: 'Choose the correct indirect speech: He said, "I am reading a book."', opts: ['He said that he is reading a book.', 'He said that he was reading a book.', 'He says that he was reading a book.', 'He told that he read a book.'], ans: 1, explain: 'Present continuous changes to past continuous.' },
          { id: 'e9_3', q: 'What type of clause is underlined? "The girl *who won the trophy* is my sister."', opts: ['Noun clause', 'Adjective clause', 'Adverb clause', 'Prepositional phrase'], ans: 1, explain: 'It describes the noun "girl".' },
          { id: 'e9_4', q: 'Identify the figure of speech: "Her smile was as bright as the sun."', opts: ['Metaphor', 'Simile', 'Personification', 'Hyperbole'], ans: 1, explain: 'Comparison using "as" is a Simile.' },
          { id: 'e9_5', q: 'Choose the correct word: "The teacher gave us good _____."', opts: ['advise', 'advice', 'advises', 'advising'], ans: 1, explain: '"Advice" is the noun.' },
          { id: 'e9_6', q: 'Select the correct conditional sentence:', opts: ['If it rains, we will stay indoors.', 'If it rains, we stayed indoors.', 'If it will rain, we stay indoors.', 'If it rained, we will stay indoors.'], ans: 0, explain: 'First conditional structure.' },
          { id: 'e9_7', q: 'What is the synonym of "Patience"?', opts: ['Endurance', 'Anger', 'Haste', 'Weakness'], ans: 0, explain: 'Patience means endurance.' },
          { id: 'e9_8', q: 'Correct the sentence: "Neither of the two boys _____ present."', opts: ['were', 'was', 'are', 'have been'], ans: 1, explain: '"Neither" takes a singular verb.' },
          { id: 'e9_9', q: 'Identify the Gerund: "Swimming is a great exercise."', opts: ['Swimming', 'is', 'great', 'exercise'], ans: 0, explain: '"Swimming" acts as a noun subject.' },
          { id: 'e9_10', q: 'Choose the correct idiom meaning "very rarely":', opts: ['Once in a blue moon', 'A piece of cake', 'Spill the beans', 'Bite the bullet'], ans: 0, explain: '"Once in a blue moon" means very rarely.' }
        ]
      }
    ]
  },
  {
    id: 'ssc9_maths',
    name: 'Mathematics',
    category: 'ssc9',
    hasChapters: true,
    chapters: [
      {
        id: 1,
        title: 'Chapter 1: Matrices and Determinants',
        questions: [
          { id: 'm9_1_1', q: 'What is the order of a matrix with 3 rows and 4 columns?', opts: ['3×4', '4×3', '12×1', '7×1'], ans: 0, explain: 'Order = rows × columns = 3×4.' },
          { id: 'm9_1_2', q: 'A matrix having equal number of rows and columns is called:', opts: ['Row matrix', 'Square matrix', 'Column matrix', 'Rectangular matrix'], ans: 1, explain: 'Square matrix has equal rows & columns.' },
          { id: 'm9_1_3', q: 'The determinant of [[3,1],[2,4]] equals:', opts: ['10', '14', '8', '12'], ans: 0, explain: 'det = (3×4)-(1×2) = 12-2 = 10.' },
          { id: 'm9_1_4', q: 'A matrix is called singular if its determinant is:', opts: ['1', 'Greater than 1', '-1', '0'], ans: 3, explain: 'Singular matrix det = 0.' },
          { id: 'm9_1_5', q: 'If A is 2×3 and B is 3×4, the order of AB is:', opts: ['2×4', '3×3', '3×4', '2×3'], ans: 0, explain: 'Product order = 2×4.' }
        ]
      },
      {
        id: 2,
        title: 'Chapter 2: Real and Complex Numbers',
        questions: [
          { id: 'm9_2_1', q: 'Which set includes all rational AND irrational numbers?', opts: ['Z', 'Q', 'R', 'N'], ans: 2, explain: 'R (Real numbers) includes rational and irrational numbers.' },
          { id: 'm9_2_2', q: 'The value of i² is:', opts: ['1', '-1', 'i', '-i'], ans: 1, explain: 'i² = -1.' },
          { id: 'm9_2_3', q: 'The conjugate of 5 - 3i is:', opts: ['5+3i', '-5+3i', '5-3i', '-5-3i'], ans: 0, explain: 'Conjugate negates imaginary component.' },
          { id: 'm9_2_4', q: 'The modulus of 3 + 4i is:', opts: ['7', '1', '5', '25'], ans: 2, explain: '√(3²+4²) = 5.' },
          { id: 'm9_2_5', q: 'Simplify i¹⁵:', opts: ['i', '-i', '1', '-1'], ans: 1, explain: 'i¹⁵ = -i.' }
        ]
      },
      {
        id: 3,
        title: 'Chapter 3: Logarithms',
        questions: [
          { id: 'm9_3_1', q: 'log₁₀(1000) equals:', opts: ['2', '3', '4', '100'], ans: 1, explain: '10³ = 1000.' },
          { id: 'm9_3_2', q: 'log(mn) equals:', opts: ['log m × log n', 'log m - log n', 'log m + log n', 'log m / log n'], ans: 2, explain: 'Product rule: log(mn) = log m + log n.' },
          { id: 'm9_3_3', q: 'log(m/n) equals:', opts: ['log m + log n', 'log m - log n', 'log m × log n', 'n log m'], ans: 1, explain: 'Quotient rule.' },
          { id: 'm9_3_4', q: 'log(m^n) equals:', opts: ['m log n', 'n log m', 'log m / n', 'n + log m'], ans: 1, explain: 'Power rule.' },
          { id: 'm9_3_5', q: 'log_a(a) equals:', opts: ['0', 'a', '1', 'a²'], ans: 2, explain: 'a¹ = a.' }
        ]
      }
    ]
  },
  {
    id: 'ssc9_physics',
    name: 'Physics',
    category: 'ssc9',
    hasChapters: true,
    chapters: [
      {
        id: 1,
        title: 'Chapter 1: Physical Quantities & Measurement',
        questions: [
          { id: 'p9_1_1', q: 'Which of the following is an SI Base Quantity?', opts: ['Force', 'Velocity', 'Time', 'Area'], ans: 2, explain: 'Time is one of 7 base SI quantities.' },
          { id: 'p9_1_2', q: 'The least count of a standard Vernier Caliper is:', opts: ['1 mm', '0.1 mm', '0.01 mm', '0.001 mm'], ans: 1, explain: '0.1 mm (or 0.01 cm).' },
          { id: 'p9_1_3', q: 'The prefix "micro" (μ) corresponds to:', opts: ['10⁻³', '10⁻⁶', '10⁻⁹', '10⁻¹²'], ans: 1, explain: 'Micro = 10⁻⁶.' },
          { id: 'p9_1_4', q: 'An instrument used to measure very small thickness accurately is:', opts: ['Meter rule', 'Vernier Caliper', 'Screw Gauge', 'Measuring tape'], ans: 2, explain: 'Screw Gauge.' },
          { id: 'p9_1_5', q: 'The SI unit of Temperature is:', opts: ['Celsius', 'Fahrenheit', 'Kelvin', 'Rankine'], ans: 2, explain: 'Kelvin (K).' }
        ]
      },
      {
        id: 2,
        title: 'Chapter 2: Kinematics',
        questions: [
          { id: 'p9_2_1', q: 'Speed is a _____ quantity while velocity is a _____ quantity.', opts: ['Vector, Scalar', 'Scalar, Vector', 'Scalar, Scalar', 'Vector, Vector'], ans: 1, explain: 'Speed is scalar; velocity is vector.' },
          { id: 'p9_2_2', q: 'Area under a Velocity-Time graph represents:', opts: ['Acceleration', 'Distance/Displacement', 'Force', 'Speed'], ans: 1, explain: 'Area = distance.' },
          { id: 'p9_2_3', q: 'A body moving with uniform velocity has an acceleration of:', opts: ['Maximum', 'Constant non-zero', 'Zero', 'Negative'], ans: 2, explain: 'Constant velocity => a = 0.' },
          { id: 'p9_2_4', q: 'The 3rd equation of motion is:', opts: ['v = u + at', 's = ut + 1/2 at²', '2as = v² - u²', 's = vt'], ans: 2, explain: '2as = v² - u².' },
          { id: 'p9_2_5', q: 'When an object is thrown vertically upwards, its velocity at highest point is:', opts: ['Maximum', '9.8 m/s', 'Zero', '10 m/s'], ans: 2, explain: 'At highest point, v = 0.' }
        ]
      }
    ]
  },
  {
    id: 'ssc9_chemistry',
    name: 'Chemistry',
    category: 'ssc9',
    hasChapters: true,
    chapters: [
      {
        id: 1,
        title: 'Chapter 1: Fundamentals of Chemistry',
        questions: [
          { id: 'c9_1_1', q: 'Which of the following is a physical change?', opts: ['Rusting of iron', 'Burning of wood', 'Melting of ice', 'Cooking an egg'], ans: 2, explain: 'Melting of ice is reversible.' },
          { id: 'c9_1_2', q: 'Avogadro\'s Number (N_A) is equal to:', opts: ['6.022 × 10²¹', '6.022 × 10²³', '3.011 × 10²³', '1.6 × 10⁻¹⁹'], ans: 1, explain: '6.022 × 10²³.' },
          { id: 'c9_1_3', q: 'The molar mass of Water (H₂O) is:', opts: ['16 g/mol', '18 g/mol', '20 g/mol', '32 g/mol'], ans: 1, explain: '2(1) + 16 = 18 g/mol.' },
          { id: 'c9_1_4', q: 'Empirical formula of Glucose (C₆H₁₂O₆) is:', opts: ['CH₂O', 'C₆H₁₂O₆', 'CHO', 'C₂H₄O₂'], ans: 0, explain: 'Simplest ratio CH₂O.' },
          { id: 'c9_1_5', q: 'Which branch of chemistry deals with carbon compounds?', opts: ['Inorganic', 'Physical', 'Organic', 'Analytical'], ans: 2, explain: 'Organic Chemistry.' }
        ]
      }
    ]
  },
  {
    id: 'ssc9_biology',
    name: 'Biology',
    category: 'ssc9',
    hasChapters: true,
    chapters: [
      {
        id: 1,
        title: 'Chapter 1: Introduction to Biology',
        questions: [
          { id: 'b9_1_1', q: 'The word "Biology" is derived from Greek words meaning:', opts: ['Life & Study', 'Plants & Animals', 'Earth & Life', 'Body & Health'], ans: 0, explain: 'Bios = Life, Logos = Study.' },
          { id: 'b9_1_2', q: 'Histology is the study of:', opts: ['Cells', 'Tissues', 'Fossils', 'Organs'], ans: 1, explain: 'Microscopic study of tissues.' },
          { id: 'b9_1_3', q: 'The branch dealing with the classification of organisms is:', opts: ['Ecology', 'Taxonomy', 'Genetics', 'Physiology'], ans: 1, explain: 'Taxonomy.' },
          { id: 'b9_1_4', q: 'Study of fossils is called:', opts: ['Paleontology', 'Entomology', 'Mycology', 'Phycology'], ans: 0, explain: 'Paleontology.' },
          { id: 'b9_1_5', q: 'Basic unit of biological organization and life is:', opts: ['Tissue', 'Organ', 'Cell', 'Molecule'], ans: 2, explain: 'Cell.' }
        ]
      }
    ]
  },

  // ==========================================
  // SSC PART 2 (10TH CLASS)
  // ==========================================
  {
    id: 'ssc10_english',
    name: 'English (Grammar)',
    category: 'ssc10',
    hasChapters: false,
    chapters: [
      {
        id: 1,
        title: 'English 10th - Advanced Grammar',
        questions: [
          { id: 'e10_1', q: 'Identify the correct passive sentence: "She has completed the project."', opts: ['The project was completed by her.', 'The project has been completed by her.', 'The project is completed by her.', 'The project had completed by her.'], ans: 1, explain: 'Has been completed.' },
          { id: 'e10_2', q: 'Choose the correct word: "Neither Ali nor his friends _____ arrived."', opts: ['has', 'have', 'is', 'was'], ans: 1, explain: 'In neither..nor, verb agrees with nearer subject ("friends").' },
          { id: 'e10_3', q: 'What is the antonym of "Transparent"?', opts: ['Opaque', 'Clear', 'Translucent', 'Bright'], ans: 0, explain: 'Opaque.' },
          { id: 'e10_4', q: 'Fill in with suitable preposition: "He is senior _____ me in service."', opts: ['than', 'from', 'to', 'by'], ans: 2, explain: 'Senior takes "to".' },
          { id: 'e10_5', q: 'What is the noun form of the verb "Perform"?', opts: ['Performing', 'Performance', 'Performed', 'Performer'], ans: 1, explain: 'Performance.' }
        ]
      }
    ]
  },
  {
    id: 'ssc10_maths',
    name: 'Mathematics',
    category: 'ssc10',
    hasChapters: true,
    chapters: [
      {
        id: 1,
        title: 'Chapter 1: Quadratic Equations',
        questions: [
          { id: 'm10_1_1', q: 'Standard form of a quadratic equation is:', opts: ['ax + b = 0', 'ax² + bx + c = 0', 'ax³ + bx + c = 0', 'ax² + c = 0'], ans: 1, explain: 'ax² + bx + c = 0.' },
          { id: 'm10_1_2', q: 'The roots of x² - 5x + 6 = 0 are:', opts: ['2 and 3', '-2 and -3', '1 and 6', '2 and -3'], ans: 0, explain: '(x-2)(x-3)=0 => x=2,3.' },
          { id: 'm10_1_3', q: 'The Discriminant of ax² + bx + c = 0 is:', opts: ['b² + 4ac', 'b² - 4ac', '4ac - b²', '√(b² - 4ac)'], ans: 1, explain: 'D = b² - 4ac.' },
          { id: 'm10_1_4', q: 'Sum of roots of ax² + bx + c = 0 is:', opts: ['c/a', '-b/a', 'b/a', '-c/a'], ans: 1, explain: 'α + β = -b/a.' },
          { id: 'm10_1_5', q: 'Product of roots of ax² + bx + c = 0 is:', opts: ['c/a', '-b/a', 'b/a', '-c/a'], ans: 0, explain: 'αβ = c/a.' }
        ]
      }
    ]
  },
  {
    id: 'ssc10_physics',
    name: 'Physics',
    category: 'ssc10',
    hasChapters: true,
    chapters: [
      {
        id: 1,
        title: 'Chapter 1: Simple Harmonic Motion & Waves',
        questions: [
          { id: 'p10_1_1', q: 'Time period of a simple pendulum is given by:', opts: ['T = 2π √(g/L)', 'T = 2π √(L/g)', 'T = 2π √(m/k)', 'T = 2π (L/g)'], ans: 1, explain: 'T = 2π √(L/g).' },
          { id: 'p10_1_2', q: 'The SI unit of Frequency is:', opts: ['Second', 'Meter', 'Hertz (Hz)', 'Joule'], ans: 2, explain: 'Hertz (Hz).' },
          { id: 'p10_1_3', q: 'Wave speed formula relating v, f, and λ is:', opts: ['v = f / λ', 'v = f × λ', 'v = λ / f', 'v = f + λ'], ans: 1, explain: 'v = fλ.' },
          { id: 'p10_1_4', q: 'Sound waves are:', opts: ['Transverse waves', 'Longitudinal waves', 'Electromagnetic waves', 'Radio waves'], ans: 1, explain: 'Longitudinal waves.' },
          { id: 'p10_1_5', q: 'Distance between two consecutive crests is called:', opts: ['Amplitude', 'Frequency', 'Wavelength', 'Time Period'], ans: 2, explain: 'Wavelength.' }
        ]
      }
    ]
  },
  {
    id: 'ssc10_chemistry',
    name: 'Chemistry',
    category: 'ssc10',
    hasChapters: true,
    chapters: [
      {
        id: 1,
        title: 'Chapter 1: Chemical Equilibrium',
        questions: [
          { id: 'c10_1_1', q: 'In a reversible reaction, dynamic equilibrium is reached when:', opts: ['Reaction stops', 'Forward and reverse rates become equal', 'Reactants are completely used', 'Products evaporate'], ans: 1, explain: 'Forward and reverse rates equal.' },
          { id: 'c10_1_2', q: 'The expression for Equilibrium Constant K_c is:', opts: ['[Reactants] / [Products]', '[Products] / [Reactants]', '[Products] × [Reactants]', '[Products] + [Reactants]'], ans: 1, explain: '[Products] / [Reactants].' },
          { id: 'c10_1_3', q: 'Haber process is used for the industrial synthesis of:', opts: ['Sulfuric acid', 'Ammonia (NH₃)', 'Nitric acid', 'Fertilizer'], ans: 1, explain: 'Synthesis of Ammonia.' },
          { id: 'c10_1_4', q: 'Reversible reactions occur in _____ vessels.', opts: ['Open', 'Closed', 'Insulated', 'Vacuum'], ans: 1, explain: 'Closed vessels.' },
          { id: 'c10_1_5', q: 'Adding a catalyst to a system at equilibrium:', opts: ['Shifts equilibrium right', 'Shifts equilibrium left', 'Speeds up both rates equally without shifting position', 'Changes K_c'], ans: 2, explain: 'Accelerates both rates.' }
        ]
      }
    ]
  },
  {
    id: 'ssc10_biology',
    name: 'Biology',
    category: 'ssc10',
    hasChapters: true,
    chapters: [
      {
        id: 1,
        title: 'Chapter 1: Gaseous Exchange',
        questions: [
          { id: 'b10_1_1', q: 'The primary site of gaseous exchange in human lungs is:', opts: ['Trachea', 'Bronchi', 'Alveoli', 'Pharynx'], ans: 2, explain: 'Alveoli.' },
          { id: 'b10_1_2', q: 'In plants, gaseous exchange mainly takes place through:', opts: ['Stomata', 'Lenticels', 'Roots', 'Cuticle'], ans: 0, explain: 'Stomata.' },
          { id: 'b10_1_3', q: 'The voice box in humans is called the:', opts: ['Pharynx', 'Larynx', 'Trachea', 'Esophagus'], ans: 1, explain: 'Larynx.' },
          { id: 'b10_1_4', q: 'The flap of tissue that prevents food from entering the trachea is the:', opts: ['Glottis', 'Epiglottis', 'Uvula', 'Vocal cord'], ans: 1, explain: 'Epiglottis.' },
          { id: 'b10_1_5', q: 'The respiratory pigment in red blood cells that carries Oxygen is:', opts: ['Chlorophyll', 'Hemoglobin', 'Myoglobin', 'Hemocyanin'], ans: 1, explain: 'Hemoglobin.' }
        ]
      }
    ]
  },

  // ==========================================
  // GENERAL KNOWLEDGE & IQ / INTELLIGENCE
  // ==========================================
  {
    id: 'gk_iq_test',
    name: 'General Knowledge & Intelligence Test',
    category: 'gk_iq',
    hasChapters: true,
    chapters: [
      {
        id: 1,
        title: 'General Knowledge (World & Pakistan)',
        questions: [
          { id: 'gk1', q: 'What is the capital city of Pakistan?', opts: ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi'], ans: 2, explain: 'Islamabad became capital in 1967.' },
          { id: 'gk2', q: 'Which is the longest river in the world?', opts: ['Amazon River', 'Nile River', 'Indus River', 'Yangtze River'], ans: 1, explain: 'The Nile in Africa is the longest (~6,650 km).' },
          { id: 'gk3', q: 'Which planet is known as the Red Planet?', opts: ['Venus', 'Mars', 'Jupiter', 'Saturn'], ans: 1, explain: 'Mars has iron oxide on its surface giving it a reddish hue.' },
          { id: 'gk4', q: 'Who is known as the Founder of Pakistan?', opts: ['Allama Iqbal', 'Quaid-e-Azam Muhammad Ali Jinnah', 'Liaquat Ali Khan', 'Sir Syed Ahmad Khan'], ans: 1, explain: 'Quaid-e-Azam led the movement for Pakistan.' },
          { id: 'gk5', q: 'Which organ in the human body pumps blood?', opts: ['Brain', 'Lungs', 'Heart', 'Liver'], ans: 2, explain: 'The heart pumps blood throughout the circulatory system.' },
          { id: 'gk6', q: 'What is the national flower of Pakistan?', opts: ['Rose', 'Jasmine (Chambeli)', 'Tulip', 'Sunflower'], ans: 1, explain: 'Jasmine is the national flower of Pakistan.' },
          { id: 'gk7', q: 'How many continents are there on Earth?', opts: ['5', '6', '7', '8'], ans: 2, explain: '7 Continents.' },
          { id: 'gk8', q: 'Which element is most abundant in Earth\'s atmosphere?', opts: ['Oxygen', 'Nitrogen', 'Carbon Dioxide', 'Hydrogen'], ans: 1, explain: 'Nitrogen makes up approx 78% of air.' },
          { id: 'gk9', q: 'Which is the largest ocean in the world?', opts: ['Atlantic Ocean', 'Indian Ocean', 'Pacific Ocean', 'Arctic Ocean'], ans: 2, explain: 'Pacific Ocean.' },
          { id: 'gk10', q: 'Who discovered Gravity?', opts: ['Albert Einstein', 'Isaac Newton', 'Galileo Galilei', 'Nikola Tesla'], ans: 1, explain: 'Sir Isaac Newton.' }
        ]
      },
      {
        id: 2,
        title: 'Intelligence & IQ (Verbal & Analytical Reasoning)',
        questions: [
          { id: 'iq1', q: 'Complete the number series: 2, 4, 8, 16, 32, _____?', opts: ['48', '64', '50', '60'], ans: 1, explain: 'Each number is multiplied by 2.' },
          { id: 'iq2', q: 'Which word does NOT belong with the others?', opts: ['Apple', 'Banana', 'Carrot', 'Mango'], ans: 2, explain: 'Carrot is a vegetable; others are fruits.' },
          { id: 'iq3', q: 'If CAT is coded as 3120, how is DOG coded in alphabetical order?', opts: ['4157', '4147', '3157', '4158'], ans: 0, explain: 'Positions: D=4, O=15, G=7.' },
          { id: 'iq4', q: 'Which number completes the pattern? 5, 10, 15, 20, _____?', opts: ['22', '25', '30', '35'], ans: 1, explain: 'Adding 5 at each step.' },
          { id: 'iq5', q: 'Doctor is to Hospital as Teacher is to _____?', opts: ['Office', 'School', 'Library', 'Student'], ans: 1, explain: 'School.' },
          { id: 'iq6', q: 'Find the odd one out:', opts: ['Square', 'Triangle', 'Rectangle', 'Sphere'], ans: 3, explain: 'Sphere is 3D; others are 2D.' },
          { id: 'iq7', q: 'If 3 + 3 = 6, 4 + 4 = 12, 5 + 5 = 20, then 6 + 6 = ?', opts: ['30', '24', '36', '12'], ans: 0, explain: 'Pattern n * (n - 1): 6 * 5 = 30.' },
          { id: 'iq8', q: 'Look at this series: 36, 34, 30, 28, 24, ... What number comes next?', opts: ['20', '22', '23', '26'], ans: 1, explain: 'Subtract 2, subtract 4... 24 - 2 = 22.' },
          { id: 'iq9', q: 'Which shape has 5 sides?', opts: ['Hexagon', 'Pentagon', 'Heptagon', 'Nonagon'], ans: 1, explain: 'Pentagon.' },
          { id: 'iq10', q: 'Light is to Eye as Sound is to _____?', opts: ['Nose', 'Ear', 'Mouth', 'Hand'], ans: 1, explain: 'Ear.' }
        ]
      }
    ]
  }
];

const LOCAL_STORAGE_KEY = 'FCPS_MCQ_HUB_QUESTION_BANK_V2';

export function getStoredQuestions(): Subject[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to parse questions from local storage:', err);
  }
  return INITIAL_QUESTION_BANK;
}

export function saveStoredQuestions(bank: Subject[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(bank));
    // Also sync to server API if available
    fetch('/api/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questionsData: bank }),
    }).catch(() => {});
  } catch (err) {
    console.error('Failed to save questions to local storage:', err);
  }
}
