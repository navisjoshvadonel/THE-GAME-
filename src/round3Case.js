/**
 * ROUND 3 FINALS — THE KENSINGTON CRESCENT AFFAIR
 *
 * Shared by every finalist squad. Five evidence files are solved in turn by the
 * squad members, then the leader files the arrest warrant.
 *
 * Design rule: every evidence answer is a single word or a time, and none of them
 * names the killer. The culprit only falls out when the squad combines:
 *   time of death (Exhibit B) + verified alibis  -> Arun, Rahul, Priya are cleared
 *   balcony prints made after the rain (Exhibit C) -> the thief Joshva came AFTER the death
 *   hall door bolted, route was the servants' passage (Exhibit E) -> only Graves or Sharma hold keys
 *   Graves is vouched for by Cook; Sharma's cellar alibi is impossible (cellar key locked away)
 *   motive from the burnt letter (Exhibit D) -> the forged household ledger
 * Solution: SHARMA : CYANIDE : LEDGER (motive synonyms accepted).
 */

const ROUND3_CASE = {
  setId: 'r3_kensington_affair',
  theme: 'Sher"unlocking" Homies: The Kensington Crescent Affair',
  fileNumber: 'C.I.D. FILE No. 1891/KC-114',
  dossierTitle: 'The Kensington Crescent Affair',
  incidentDate: 'Saturday, 14 November 1891 • found 11:22 PM',
  location: 'Blackwood House, 221B Kensington Crescent, London',
  caseSummary:
    'Lord Alistair Blackwood (62), antiquarian, was found dead at his desk at 11:22 PM by the butler and Constable Hale, ' +
    'who had to force the study door: it was bolted from the inside. On the desk stood a half-finished glass of port smelling ' +
    'of bitter almonds. A beeswax candle lay snuffed out on the carpet. The balcony window had been cut open and muddy prints ' +
    'crossed the balcony. The velvet case of the "Eye of Bengal" sapphire was empty, and charred paper was still smouldering ' +
    'in the grate. Five persons of interest are held for questioning. Somebody in this file is lying.',

  suspects: [
    {
      id: 'suspect_arun',
      name: 'Arun Kumar',
      occupation: 'Retired army marksman, heavy gambler',
      bootsGait: 'Size 10 army boots; drags his right leg (old wound)',
      motive: 'Owes £8,000 to East End bookmakers; His Lordship refused him a loan last week',
      weaponPossession: 'Cane air-rifle, hunting knife',
      alibi: 'Playing billiards at the Anglo-Indian Club, 9:00 PM to 1:00 AM.',
      alibiStatus: 'VERIFIED — club register signed for every frame; two members confirm.'
    },
    {
      id: 'suspect_rahul',
      name: 'Dr. Rahul Verma',
      occupation: 'Physician, His Lordship\'s former protégé',
      bootsGait: 'Size 8 oxfords; quick, light step',
      motive: 'Cut out of the Blackwood collection after a public quarrel',
      weaponPossession: 'Medical bag: strychnine, morphine, chloroform',
      alibi: 'Running the night vaccination clinic at St Bartholomew\'s, 10:00 PM to 12:30 AM.',
      alibiStatus: 'VERIFIED — hospital night register and the matron.'
    },
    {
      id: 'suspect_priya',
      name: 'Priya Nair',
      occupation: 'His Lordship\'s niece and heir',
      bootsGait: 'Size 5 silk evening slippers',
      motive: 'Inherits £50,000 before a new will could be signed on Monday',
      weaponPossession: 'Perfume atomiser (lavender and ether)',
      alibi: 'At the opera "Faust", Covent Garden, 8:00 PM to 11:30 PM, in Countess Morcar\'s box.',
      alibiStatus: 'VERIFIED — the Countess sat beside her all evening.'
    },
    {
      id: 'suspect_joshva',
      name: 'Joshva Peter',
      occupation: 'Theatre acrobat, suspected jewel thief',
      bootsGait: 'Size 7 riding boots with heel spurs; very nimble',
      motive: 'Hired by a foreign collector to obtain the "Eye of Bengal" sapphire',
      weaponPossession: 'Diamond glass-cutter, lock picks, smoke pellets',
      alibi: 'Dining at the Savoy until 10:45 PM, then "walking by the river".',
      alibiStatus: 'PARTLY VERIFIED — maître d\' saw him pay and leave in a hurry at 10:45 PM.'
    },
    {
      id: 'suspect_sharma',
      name: 'Rohan Sharma',
      occupation: 'Head valet, twelve years in service',
      bootsGait: 'Size 10 leather boots; steady, even stride',
      motive: 'Keeps the household accounts; His Lordship had been checking them all week',
      weaponPossession: 'Silver-plating kit in his pantry; keys to the servants\' passage',
      alibi: 'Alone in the wine cellar doing bottle inventory, 10:15 PM to 11:35 PM.',
      alibiStatus: 'UNCONFIRMED — nobody saw him.'
    }
  ],

  witnessStatements: [
    {
      speaker: 'Meera Iyer, housemaid',
      text: 'At nine o\'clock I lit a brand-new twelve-inch beeswax candle on His Lordship\'s desk and left him reading. His glass of port was already poured.'
    },
    {
      speaker: 'Mr. Graves, butler',
      text: 'At nine, on His Lordship\'s orders, I locked the wine cellar and put its only key in his desk drawer. That is where we found it at 11:22. Only Mr. Sharma and I carry keys to the servants\' passage behind the study bookcase. I spent the evening polishing silver in the kitchen.'
    },
    {
      speaker: 'Mrs. Pillai, cook',
      text: 'Mr. Graves never left my kitchen between nine and twenty past eleven. I would swear to it.'
    },
    {
      speaker: 'Constable Hale, beat log',
      text: 'Heavy rain from 9:30 PM; it stopped sharply at 10:55 PM. At 11:10 PM I saw a slight figure drop from the garden wall and run toward the Strand.'
    },
    {
      speaker: 'Mr. Abbott, chemist, Fleet Street (poison register)',
      text: 'On 10 November I sold two ounces of potassium cyanide "for silver plating" to a man who said he was in service at a great house in Kensington.'
    }
  ],

  steps: [
    {
      id: 'r3_kc_exhibit_a',
      title: 'Exhibit A — The Police Surgeon\'s Report',
      category: '🔬 Toxicology',
      exhibit: [
        'Subject: Lord A. Blackwood. Death within minutes of drinking.',
        'Skin flushed cherry-pink. Strong odour of bitter almonds from the glass.',
        'NOT strychnine — no arched back, no convulsions.',
        'NOT arsenic — no sign of a slow illness.',
        'Margin note: "salt of element No. 19 joined to the C≡N group".'
      ],
      prompt: 'Identify the poison that killed Lord Blackwood.',
      clue: 'Element No. 19 on the periodic table is potassium (K).',
      hint: 'K + C + N. A bitter-almond poison also used for silver plating.',
      expectedFragment: 'CYANIDE',
      acceptedAnswers: ['cyanide', 'potassium cyanide', 'kcn', 'prussic acid', 'hydrogen cyanide']
    },
    {
      id: 'r3_kc_exhibit_b',
      title: 'Exhibit B — The Snuffed Candle',
      category: '🕯️ Time of Death',
      exhibit: [
        'Candle: new 12-inch beeswax, lit at 9:00 PM by the housemaid (see witness statements).',
        'Chandler\'s note: this make burns exactly 1 inch every 20 minutes.',
        'When the poison struck, His Lordship knocked it to the floor and it went out at once.',
        'Length of candle remaining: 7 inches.'
      ],
      prompt: 'At what time did Lord Blackwood die? Answer like 10:15.',
      clue: 'Inches burnt × 20 minutes, counted from 9:00 PM.',
      hint: '12 − 7 = 5 inches burnt. 5 × 20 = 100 minutes after 9:00 PM.',
      expectedFragment: '10:40 PM',
      acceptedAnswers: ['10:40', '10:40 pm', '10.40', '22:40', 'twenty to eleven']
    },
    {
      id: 'r3_kc_exhibit_c',
      title: 'Exhibit C — The Balcony Prints',
      category: '👣 Footprints',
      exhibit: [
        'Prints on the balcony: 26 cm, narrow, a spur scrape at every heel (riding boot, size 7).',
        'Edges sharp; mud dry-set; NO rainwater pooled in any print.',
        'Balcony window glass cut in a neat circle with a diamond.',
        'Rain stopped at 10:55 PM (see Constable Hale\'s beat log).'
      ],
      prompt: 'Whose boots made the balcony prints? Give the surname.',
      clue: 'Match boot size and type against the suspect board.',
      hint: 'Size 7 riding boots, and the only suspect carrying a diamond glass-cutter.',
      expectedFragment: 'PETER',
      acceptedAnswers: ['peter', 'joshva', 'joshva peter']
    },
    {
      id: 'r3_kc_exhibit_d',
      title: 'Exhibit D — The Burnt Letter',
      category: '📜 Cipher',
      exhibit: [
        'Charred letter in His Lordship\'s hand, to Inspector Lestrade, dated 14 Nov:',
        '"…I now hold proof that the household accounts are false. Come at dawn and bring the',
        '  O H G J H U  so the guilty one cannot deny it."',
        'His private cipher key = the number of words in the family motto carved over the',
        'fireplace: "TRUTH ABOVE ALL".'
      ],
      prompt: 'Decode the enciphered word.',
      clue: 'The motto has 3 words. Move every letter 3 places back in the alphabet (O → L).',
      hint: 'The book in which household accounts are kept.',
      expectedFragment: 'LEDGER',
      acceptedAnswers: ['ledger', 'the ledger', 'account ledger']
    },
    {
      id: 'r3_kc_exhibit_e',
      title: 'Exhibit E — The Bolted Study',
      category: '🚪 Locked Room',
      exhibit: [
        'Hall door: bolted on the INSIDE when Graves and Hale forced it at 11:22 PM.',
        'Balcony entry: made only after the rain stopped at 10:55 PM (Exhibit C), after the death (Exhibit B).',
        'Behind the bookcase: the servants\' passage door was UNLOCKED, though it is always kept locked.',
        'Fresh scuff marks on the passage floor lead toward the pantry.'
      ],
      prompt: 'How did the poisoner reach His Lordship before he died? Name the route.',
      clue: 'Rule out every way in that was closed, or only used after 10:40 PM.',
      hint: 'Read the butler\'s statement: a hidden way into the study behind the bookcase.',
      expectedFragment: 'PASSAGE',
      acceptedAnswers: ['passage', 'servants passage', 'servant passage', 'the servants passage', 'secret passage', 'bookcase', 'servants door']
    }
  ],

  leaderTask: {
    title: 'Scotland Yard Arrest Warrant',
    instructions:
      'Chief Inspector (Squad Leader): your detectives have the facts, but not the name. Combine the five exhibits, ' +
      'the witness statements and the alibis to charge the killer. Format: SURNAME : POISON : MOTIVE (motive in one word).',
    hint: 'Who had a key to the route, no confirmed alibi at the time of death, and a reason to fear the letter?',
    culprit: ['sharma', 'rohan sharma', 'rohansharma'],
    weapon: ['cyanide', 'potassium cyanide', 'potassiumcyanide', 'kcn', 'prussic acid', 'prussicacid'],
    motive: ['ledger', 'forgery', 'forged', 'fraud', 'accounts', 'exposure', 'silence', 'blackmail', 'coverup', 'embezzlement', 'theft of accounts'],
    expectedMasterCode: 'SHARMA:CYANIDE:LEDGER'
  },

  verdict: {
    culprit: 'ROHAN SHARMA (the head valet)',
    weapon: 'POTASSIUM CYANIDE in the port glass',
    motive: 'To silence His Lordship before he exposed the forged household ledger'
  }
};

module.exports = { ROUND3_CASE };
