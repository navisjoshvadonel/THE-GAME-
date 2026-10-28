/**
 * Classical Academic Tournament Puzzle Database & Round Configurations
 * Themes: AI & Machine Learning, Tamil Cinema, Famous Personalities, Cyber Security.
 * Supports up to 20+ Teams with 100% Unique Sets for every team!
 */

const ROUND_CONFIGS = {
  "1": {
    "roundNumber": 1,
    "title": "Stage 1: Keyword Cipher Quest (Qualifier)",
    "description": "4 Games total: Game 1 (AI/ML), Game 2 (Tamil Cinema), Game 3 (Famous Personality), Game 4 (Captain Boss Synthesis). Clues unlock at the 2:00 mark!",
    "durationSec": 600,
    "type": "phrase_assembly",
    "requiresNLP": true,
    "maxScore": 1000
  },
  "2": {
    "roundNumber": 2,
    "title": "Stage 2: The 10-Node Cyber Breach Terminal",
    "description": "10 Interconnected Nodes. Decode clues and hack the matrix using color-coded tile feedback. 100% Non-Elimination relay!",
    "durationSec": 600,
    "type": "cyber_wordle_chain",
    "requiresNLP": false,
    "maxScore": 1000
  },
  "3": {
    "roundNumber": 3,
    "title": "Sher\"unlocking\" Homies: The Baker Street Mystery",
    "description": "A 10-minute Victorian cold case mystery. All finalist squads investigate the same crime scene. Analyze forensic autopsy, decrypt the fireplace cipher, expose the forged alibi, and file the Scotland Yard Grand Indictment!",
    "durationSec": 600,
    "type": "exact_code",
    "requiresNLP": false,
    "maxScore": 1000
  }
};

const PUZZLE_SETS = {
  1: [
  {
    "setId": "r1_set_a",
    "theme": "Cybernetic Pioneers",
    "steps": [
      {
        "id": "r1_set_a_1",
        "title": "The Lingua Franca of AI",
        "category": "🤖 AI & Machine Learning",
        "prompt": "Conceived during Christmas 1989 in Amsterdam by an engineer who abandoned curly braces for significant whitespace. While named after a surrealist comedy sketch group rather than a constrictor snake, almost every modern transformer, neural layer, and PyTorch tensor runs upon my syntax. What language am I?",
        "clue": "Type \"import this\" in my interactive shell to read the 19 guiding aphorisms penned by Tim Peters.",
        "hint": "Dynamic interpreted language with indent-based blocks; Guido van Rossum's masterpiece.",
        "expectedFragment": "PYTHON",
        "acceptedAnswers": [
          "python"
        ]
      },
      {
        "id": "r1_set_a_2",
        "title": "The Ghost of the Underworld",
        "category": "🎬 Tamil Movies",
        "prompt": "In 1986, an undercover operative was presumed dead in a foreign chemical blast. Decades later, his resurrected alter-ego Karnan leaves black skull masks, baby milk cans, and shattered narcotics syndicates across Chennai while a merciless gold watch kingpin sharpens his blades. What single-word title binds both tales?",
        "clue": "Directed by Lokesh Kanagaraj; Amar investigates Karnan while Agent Tina wields kitchen knives.",
        "hint": "Title is the operative's codename; featured \"Aarambikkalaangala?\" and Rolex.",
        "expectedFragment": "VIKRAM",
        "acceptedAnswers": [
          "vikram"
        ]
      },
      {
        "id": "r1_set_a_3",
        "title": "The Missile Visionary",
        "category": "🌟 Famous Personality",
        "prompt": "He grew up distributing morning newspapers along the sunrise shores of the Palk Strait to support his schooling. Later, he steered SLV-III into orbit, spearheaded the Pokhran-II nuclear tests, and died mid-sentence while lecturing university students on a stage in Shillong. What single name immortalizes India's Missile Man?",
        "clue": "Author of \"Wings of Fire\", \"Ignited Minds\", and 11th President of the Indian Republic.",
        "hint": "Born in Rameswaram; Dr. APJ Abdul _______.",
        "expectedFragment": "KALAM",
        "acceptedAnswers": [
          "kalam",
          "apj abdul kalam",
          "abdul kalam",
          "dr kalam"
        ]
      }
    ],
    "leaderTask": {
      "title": "Grand Knowledge Synthesis",
      "instructions": "Compose an eloquent, grammatically complete sentence (5-30 words) with action verbs, incorporating at least 3 of your collected keywords (e.g., PYTHON, KALAM, VIKRAM, NEURAL).",
      "hint": "Example: \"Our team uses Kalam inspiration and Python logic to build Vikram level AI innovation.\""
    }
  },
  {
    "setId": "r1_set_b",
    "theme": "Technological Legends",
    "steps": [
      {
        "id": "r1_set_b_1",
        "title": "The Mechanical Servitude",
        "category": "🤖 AI & Machine Learning",
        "prompt": "First coined in a 1920 Czech theatrical drama about artificial serfs manufactured from chemical paste who revolt against their industrial creators, I evolved into planetary exploratory rovers and factory automation arms. What 5-letter term am I?",
        "clue": "Karel Capek derived me from the Slavic word \"robota\", meaning forced servitude; Isaac Asimov drafted three laws to govern me.",
        "hint": "Autonomous mechanical or software automaton; also Shankar's titular humanoid.",
        "expectedFragment": "ROBOT",
        "acceptedAnswers": [
          "robot",
          "robots"
        ]
      },
      {
        "id": "r1_set_b_2",
        "title": "The Red Chip Singularity",
        "category": "🎬 Tamil Movies",
        "prompt": "Programmed with Isaac Asimov's ethical constraints, this multi-million-dollar android can speed-read entire medical encyclopedias and deliver infants in floodwaters. But when an illicit red firmware chip and unrequited love corrupt his logic, he morphs into a devastating magnetic sphere across Chennai. What is the title?",
        "clue": "Features Chitti with a memory capacity of 1 zettabyte and processing speed of 1 terahertz.",
        "hint": "Shankar's sci-fi epic starring Rajinikanth and Aishwarya Rai; title translates to \"The Robot\".",
        "expectedFragment": "ENTHIRAN",
        "acceptedAnswers": [
          "enthiran",
          "endhiran",
          "robot"
        ]
      },
      {
        "id": "r1_set_b_3",
        "title": "The Namagiri Visionary",
        "category": "🌟 Famous Personality",
        "prompt": "Without formal mathematical credentials or rigorous Western proofs, he credited the goddess Namagiri Thayar of Namakkal with revealing infinite series, mock theta functions, and partition formulas in his nocturnal visions. Hardy identified his hospital taxicab number 1729 as the smallest sum of two cubes in two different ways. Who was he?",
        "clue": "Born in Erode, lived in Kumbakonam, journeyed to Trinity College Cambridge; the man who knew infinity.",
        "hint": "Srinivasa _______; National Mathematics Day honors his birthday on December 22.",
        "expectedFragment": "RAMANUJAN",
        "acceptedAnswers": [
          "ramanujan",
          "srinivasa ramanujan"
        ]
      }
    ],
    "leaderTask": {
      "title": "Grand Knowledge Synthesis",
      "instructions": "Compose an eloquent, grammatically complete sentence (5-30 words) with action verbs, incorporating at least 3 of your collected keywords (e.g., ROBOT, RAMANUJAN, ENTHIRAN, ALGORITHM).",
      "hint": "Example: \"Ramanujan mathematical algorithm powers our robot to build future technology.\""
    }
  },
  {
    "setId": "r1_set_c",
    "theme": "Digital Frontiers",
    "steps": [
      {
        "id": "r1_set_c_1",
        "title": "The Probability Manifold",
        "category": "🤖 AI & Machine Learning",
        "prompt": "I hold no biological consciousness, only millions or billions of optimized floating-point matrix weights representing conditional probability distributions over high-dimensional manifolds. Scientists create me to represent complex reality in compressed silicon. What 5-letter term am I?",
        "clue": "In scientific inquiry, a simplified conceptual representation; in modern AI, GPT-4, LLaMA, and Gemini are instances of me.",
        "hint": "Trained machine learning program that generates predictions from learned data patterns.",
        "expectedFragment": "MODEL",
        "acceptedAnswers": [
          "model",
          "models"
        ]
      },
      {
        "id": "r1_set_c_2",
        "title": "The Valley of Snow & Treason",
        "category": "🎬 Tamil Movies",
        "prompt": "Against the freezing snowcapped peaks of Kashmir, an Indian defense cryptographer is captured by militants, leaving his naive rural Tamil bride to navigate stubborn military bureaucracies and international treaties in a desperate bid to save his life. What landmark film is this?",
        "clue": "Directed by Mani Ratnam; marked the very first soundtrack released by AR Rahman, featuring \"Chinna Chinna Aasai\".",
        "hint": "Named after the protagonist bride and the flower of love; Arvind Swamy and Madhoo starrer.",
        "expectedFragment": "ROJA",
        "acceptedAnswers": [
          "roja"
        ]
      },
      {
        "id": "r1_set_c_3",
        "title": "The Lightning Grandmaster",
        "category": "🌟 Famous Personality",
        "prompt": "At age 18, he dismantled decades of Eastern European dominance to become his country's inaugural international Grandmaster. He achieved the world championship crown across knockout, round-robin, and match-play formats, earning the moniker \"The Lightning Kid\" for his blinding tactical speed. Who is he?",
        "clue": "Born in Mayiladuthurai, bred in Chennai; 5-time undisputed World Chess Champion.",
        "hint": "India's greatest chess legend; Rajiv Gandhi Khel Ratna's first recipient.",
        "expectedFragment": "VISWANATHAN ANAND",
        "acceptedAnswers": [
          "viswanathan anand",
          "anand"
        ]
      }
    ],
    "leaderTask": {
      "title": "Grand Knowledge Synthesis",
      "instructions": "Compose an eloquent, grammatically complete sentence (5-30 words) with action verbs, incorporating at least 3 of your collected keywords (e.g., MODEL, SIVAJI, ANAND, CHATBOT).",
      "hint": "Example: \"Like Anand strategies win games, our team trains a smart AI model.\""
    }
  },
  {
    "setId": "r1_set_d",
    "theme": "Quantum Architects",
    "steps": [
      {
        "id": "r1_set_d_1",
        "title": "The Invariant Grid",
        "category": "🤖 AI & Machine Learning",
        "prompt": "In linear algebra, I am a rectangular lattice of numbers whose determinants decide invertibility and whose eigenvectors define invariant axes of transformation. Beyond cinematic red and blue pills, what mathematical array underpins neural network weight matrices?",
        "clue": "Row by column dot multiplication; Arthur Cayley formalized my algebraic arithmetic.",
        "hint": "2D grid of numbers essential for linear transformations and graphics.",
        "expectedFragment": "MATRIX",
        "acceptedAnswers": [
          "matrix",
          "matrices"
        ]
      },
      {
        "id": "r1_set_d_2",
        "title": "The Archery Professor",
        "category": "🎬 Tamil Movies",
        "prompt": "An alcoholic juvenile reformation college lecturer who refuses to wear a wristwatch because his own timing is never right finds himself pitted against a slaughterhouse lorry syndicate that uses incarcerated minors as legal scapegoats. What title is this?",
        "clue": "JD vs Bhavani; features archer rings, metallic knuckle-dusters, and \"Vaathi Coming\".",
        "hint": "Lokesh Kanagaraj action film starring Thalapathy Vijay and Vijay Sethupathi.",
        "expectedFragment": "MASTER",
        "acceptedAnswers": [
          "master"
        ]
      },
      {
        "id": "r1_set_d_3",
        "title": "The Blue Mediterranean Horizon",
        "category": "🌟 Famous Personality",
        "prompt": "While aboard the steamship SS Narkunda in 1921, he gazed at the deep blue color of the Mediterranean Sea and rejected Lord Rayleigh's sky-reflection theory, embarking on optics experiments with mercury arc lamps that revealed inelastic photon scattering. Who was he?",
        "clue": "Born in Tiruchirappalli, Tamil Nadu; won the 1930 Nobel Prize in Physics; National Science Day honors his discovery.",
        "hint": "Sir Chandrasekhara Venkata _______; uncle of astrophysicist Subrahmanyan Chandrasekhar.",
        "expectedFragment": "CV RAMAN",
        "acceptedAnswers": [
          "cv raman",
          "c v raman",
          "raman",
          "c.v. raman"
        ]
      }
    ],
    "leaderTask": {
      "title": "Grand Knowledge Synthesis",
      "instructions": "Compose an eloquent, grammatically complete sentence (5-30 words) with action verbs, incorporating at least 3 of your collected keywords (e.g., MATRIX, VISION, RAMAN, MASTER).",
      "hint": "Example: \"Our team applies Raman vision and matrix calculation to master artificial intelligence.\""
    }
  },
  {
    "setId": "r1_set_e",
    "theme": "Future Horizon",
    "steps": [
      {
        "id": "r1_set_e_1",
        "title": "The Empirical Fuel",
        "category": "🤖 AI & Machine Learning",
        "prompt": "In epistemology and computation, I am the unprocessed digital measurements, sensor readings, and raw characters collected before statistical abstraction or insight extraction takes place. What foundational 4-letter term am I?",
        "clue": "Often paired with \"Mining\", \"Base\", or \"Science\"; the oil of the 21st century.",
        "hint": "Raw facts and statistics collected together for analysis.",
        "expectedFragment": "DATA",
        "acceptedAnswers": [
          "data"
        ]
      },
      {
        "id": "r1_set_e_2",
        "title": "The Sleeper Cell Hunt",
        "category": "🎬 Tamil Movies",
        "prompt": "An Indian Army DIA captain on vacation in Mumbai uncovers a deadly plot to detonate 12 bombs across the metropolis and deploys 12 army comrades in an airport-level synchronized sniper strike to wipe out sleeper agents. What is the title?",
        "clue": "Directed by A. R. Murugadoss starring Thalapathy Vijay; dialogue \"I am waiting!\".",
        "hint": "Title translates to gun; co-starring Kajal Aggarwal and Vidyut Jammwal.",
        "expectedFragment": "THUPPAKKI",
        "acceptedAnswers": [
          "thuppakki",
          "thuppaki"
        ]
      },
      {
        "id": "r1_set_e_3",
        "title": "The DOS Visionary",
        "category": "🌟 Famous Personality",
        "prompt": "He dropped out of Harvard in 1975 after adapting BASIC for the MITS Altair 8800, secured a non-exclusive licensing coup with IBM for MS-DOS, and built the world's dominant desktop operating system before pivoting his multi-billion-dollar fortune to eradicate polio and malaria. Who is he?",
        "clue": "Co-founder of Microsoft alongside Paul Allen; philanthropist behind the Gates Foundation.",
        "hint": "Pioneering American software billionaire; first name Bill.",
        "expectedFragment": "BILL GATES",
        "acceptedAnswers": [
          "bill gates",
          "gates"
        ]
      }
    ],
    "leaderTask": {
      "title": "Grand Knowledge Synthesis",
      "instructions": "Compose an eloquent, grammatically complete sentence (5-30 words) with action verbs, incorporating at least 3 of your collected keywords (e.g., DATA, LOGIC, THUPPAKKI, GATES).",
      "hint": "Example: \"Clear logic and accurate data empower our squad to create revolutionary innovation.\""
    }
  },
  {
    "setId": "r1_set_f",
    "theme": "Neural Matrix",
    "steps": [
      {
        "id": "r1_set_f_1",
        "title": "The McCulloch-Pitts Node",
        "category": "🤖 AI & Machine Learning",
        "prompt": "Formulated in 1943 as a binary mathematical threshold switch, I sum scaled incoming numerical connections and evaluate an activation threshold to decide whether to fire a signal to downstream layers. What 6-letter node am I?",
        "clue": "Named after the anatomical nerve cells that transmit electrochemical impulses through human brain tissue.",
        "hint": "Fundamental processing unit in an artificial neural network.",
        "expectedFragment": "NEURON",
        "acceptedAnswers": [
          "neuron",
          "neurons",
          "perceptron"
        ]
      },
      {
        "id": "r1_set_f_2",
        "title": "The Varma Kalai Judgment",
        "category": "🎬 Tamil Movies",
        "prompt": "An elderly, decorated veteran of Subhas Chandra Bose's Indian National Army resurfaces in modern Madras to systematically assassinate corrupt bureaucrats using lethal pressure-point paralysis techniques known as Varma Kalai. What landmark film is this?",
        "clue": "Directed by Shankar; Kamal Haasan in a dual role as freedom fighter Senapathy and his corrupt son Chandru.",
        "hint": "Title represents the nationality of the protagonist; features \"Maya Machindra\".",
        "expectedFragment": "INDIAN",
        "acceptedAnswers": [
          "indian"
        ]
      },
      {
        "id": "r1_set_f_3",
        "title": "The Azure Transformer",
        "category": "🌟 Famous Personality",
        "prompt": "Born in Hyderabad, he studied electrical engineering at Manipal Institute of Technology before succeeding Steve Ballmer in 2014, orchestrating a cultural metamorphosis that shifted enterprise focus to Azure cloud and backed OpenAI. Who is he?",
        "clue": "Executive Chairman and Chief Executive Officer of Microsoft; author of \"Hit Refresh\".",
        "hint": "First name Satya.",
        "expectedFragment": "SATYA NADELLA",
        "acceptedAnswers": [
          "satya nadella",
          "nadella",
          "satya"
        ]
      }
    ],
    "leaderTask": {
      "title": "Grand Knowledge Synthesis",
      "instructions": "Compose an eloquent, grammatically complete sentence (5-30 words) with action verbs, incorporating at least 3 of your collected keywords (e.g., NEURON, LEARNING, NADELLA, INDIAN).",
      "hint": "Example: \"Continuous learning connects every artificial neuron to empower future technology.\""
    }
  },
  {
    "setId": "r1_set_g",
    "theme": "Synaptic Synergy",
    "steps": [
      {
        "id": "r1_set_g_1",
        "title": "The Parallel Silicon Engine",
        "category": "🤖 AI & Machine Learning",
        "prompt": "Originally engineered with thousands of arithmetic logic units to rasterize 3D polygons for computer video games, my massively parallel architecture made me the indispensable silicon hardware for training large language models. What 3-letter acronym am I?",
        "clue": "NVIDIA manufactures me; Graphics Processing Unit.",
        "hint": "3-letter hardware processor abbreviation: G _ _.",
        "expectedFragment": "GPU",
        "acceptedAnswers": [
          "gpu",
          "gpus"
        ]
      },
      {
        "id": "r1_set_g_2",
        "title": "The Diamond Courier",
        "category": "🎬 Tamil Movies",
        "prompt": "A brilliant Chennai computer graduate works as an elite international courier for a sophisticated goods and diamond smuggling ring, utilizing ingenious luggage concealment methods before battling a treacherous rival named Kamaraj across Africa. What is the title?",
        "clue": "Directed by K. V. Anand starring Suriya, Tamannaah, and Prabhu; features the song \"Vizhi Moodi\".",
        "hint": "Title translates to \"Brahma\" or \"The Creator\"; 4 letters.",
        "expectedFragment": "AYAN",
        "acceptedAnswers": [
          "ayan"
        ]
      },
      {
        "id": "r1_set_g_3",
        "title": "The Patent Clerk of Bern",
        "category": "🌟 Famous Personality",
        "prompt": "While working as a technical examiner at the Swiss Federal Intellectual Property Office in 1905, he published four miraculous papers that explained the photoelectric effect, Brownian motion, and special relativity with E = mc². Who was he?",
        "clue": "German-born theoretical physicist; won the 1921 Nobel Prize for the photoelectric law.",
        "hint": "Iconic genius with wild white hair; first name Albert.",
        "expectedFragment": "ALBERT EINSTEIN",
        "acceptedAnswers": [
          "albert einstein",
          "einstein"
        ]
      }
    ],
    "leaderTask": {
      "title": "Grand Knowledge Synthesis",
      "instructions": "Compose an eloquent, grammatically complete sentence (5-30 words) with action verbs, incorporating at least 3 of your collected keywords (e.g., GPU, EINSTEIN, AYAN, WEIGHT).",
      "hint": "Example: \"Einstein inspired ideas and high speed GPU hardware accelerate modern scientific discoveries.\""
    }
  },
  {
    "setId": "r1_set_h",
    "theme": "Cybernetic Cosmos",
    "steps": [
      {
        "id": "r1_set_h_1",
        "title": "The Semantic Coordinate",
        "category": "🤖 AI & Machine Learning",
        "prompt": "What mathematical entity possessing both directional orientation and Euclidean magnitude represents words, tokens, or images as dense continuous numerical coordinates inside an embedding space?",
        "clue": "In physics, velocity and force are instances; cosine similarity measures the angle between two of me.",
        "hint": "1D array of numerical values in linear algebra.",
        "expectedFragment": "VECTOR",
        "acceptedAnswers": [
          "vector",
          "vectors"
        ]
      },
      {
        "id": "r1_set_h_2",
        "title": "The Midnight Lorry Convoy",
        "category": "🎬 Tamil Movies",
        "prompt": "Over the course of a solitary rainy night, a newly paroled prisoner drives a confiscated lorry carrying dozens of unconscious, drugged police officers through dangerous ambushes to reach a remote hospital and earn his freedom to meet his daughter. What thriller is this?",
        "clue": "Directed by Lokesh Kanagaraj; starring Karthi as Dilli with biryani scene, first entry in the LCU.",
        "hint": "Title translates to \"Prisoner\" or \"Captive\"; features no female lead or songs.",
        "expectedFragment": "KAITHI",
        "acceptedAnswers": [
          "kaithi"
        ]
      },
      {
        "id": "r1_set_h_3",
        "title": "The Wardenclyffe Dreamer",
        "category": "🌟 Famous Personality",
        "prompt": "He visualized alternating current multiphase induction motors in a Budapest park while reciting Goethe's Faust, constructed wireless high-voltage oscillation coils, and dreamed of transmitting free global electrical power through the earth from his Wardenclyffe tower. Who was he?",
        "clue": "Serbian-American inventor who engaged in the War of the Currents against Thomas Edison.",
        "hint": "First name Nikola; the SI unit of magnetic flux density bears his name.",
        "expectedFragment": "NIKOLA TESLA",
        "acceptedAnswers": [
          "nikola tesla",
          "tesla"
        ]
      }
    ],
    "leaderTask": {
      "title": "Grand Knowledge Synthesis",
      "instructions": "Compose an eloquent, grammatically complete sentence (5-30 words) with action verbs, incorporating at least 3 of your collected keywords (e.g., VECTOR, ACCURACY, TESLA, DHONI).",
      "hint": "Example: \"Dhoni cool strategy and accurate vector calculations guide our squad to victory.\""
    }
  },
  {
    "setId": "r1_set_i",
    "theme": "Autonomous Horizons",
    "steps": [
      {
        "id": "r1_set_i_1",
        "title": "The Artificial Mind Test",
        "category": "🤖 AI & Machine Learning",
        "prompt": "In 1950, a British mathematician published \"Computing Machinery and Intelligence\" introducing the \"Imitation Game\" to test if an observer can distinguish human from machine. What 6-letter name immortalizes this test?",
        "clue": "Named after the Bletchley Park codebreaker who decrypted Enigma.",
        "hint": "Alan _______ Test.",
        "expectedFragment": "TURING",
        "acceptedAnswers": [
          "turing",
          "alan turing"
        ]
      },
      {
        "id": "r1_set_i_2",
        "title": "The Golden Age Dual King",
        "category": "🎬 Tamil Movies",
        "prompt": "In a 1964 biographical blockbuster, a legendary actor played dual roles as Lord Krishna and Karnan, with epic songs composed by Viswanathan–Ramamoorthy and dialogue \"Ullathil Nalla Ullam\". What is the single-name film title?",
        "clue": "Starring Sivaji Ganesan and N. T. Rama Rao; directed by B. R. Panthulu.",
        "hint": "Title is the tragic Mahabharata warrior known for boundless charity.",
        "expectedFragment": "KARNAN",
        "acceptedAnswers": [
          "karnan"
        ]
      },
      {
        "id": "r1_set_i_3",
        "title": "The Iron Lady of Justice",
        "category": "🌟 Famous Personality",
        "prompt": "Born in Amritsar in 1949, she became the first woman to join the Indian Police Service (IPS) in 1972, serving as Inspector General of Tihar Prisons before being appointed Lieutenant Governor of Puducherry. Who is she?",
        "clue": "Asian tennis champion; Ramon Magsaysay Award winner for government service.",
        "hint": "First name Kiran.",
        "expectedFragment": "KIRAN BEDI",
        "acceptedAnswers": [
          "kiran bedi",
          "bedi"
        ]
      }
    ],
    "leaderTask": {
      "title": "Grand Knowledge Synthesis",
      "instructions": "Compose an eloquent, grammatically complete sentence (5-30 words) with action verbs, incorporating at least 3 of your collected keywords (e.g., TURING, KARNAN, BEDI, INTELLIGENCE).",
      "hint": "Example: \"Like Kiran Bedi fearlessly leads justice, our team solves Turing level challenges with Karnan courage.\""
    }
  },
  {
    "setId": "r1_set_j",
    "theme": "Algorithmic Titans",
    "steps": [
      {
        "id": "r1_set_j_1",
        "title": "The Step-by-Step Procedure",
        "category": "🤖 AI & Machine Learning",
        "prompt": "Derived from the Latinized name of 9th-century Persian polymath Muhammad ibn Musa al-Khwarizmi, I am a finite sequence of well-defined computer instructions used to solve computational problems. What 9-letter term am I?",
        "clue": "Sorting, searching, and gradient descent are classic examples of me.",
        "hint": "Finite procedure executed by software; begins with 'A'.",
        "expectedFragment": "ALGORITHM",
        "acceptedAnswers": [
          "algorithm",
          "algorithms"
        ]
      },
      {
        "id": "r1_set_j_2",
        "title": "The Split Identity Vigilante",
        "category": "🎬 Tamil Movies",
        "prompt": "A mild-mannered lawyer afflicted with multiple personality disorder transforms into a flamboyant fashion model named Remo and a fearsome vigilante executioner who extracts punishment according to the Garuda Purana. What is the film title?",
        "clue": "Directed by Shankar starring Chiyaan Vikram and Sadha; music by Harris Jayaraj.",
        "hint": "Title translates to stranger or outsider; features \"Randakka\".",
        "expectedFragment": "ANNIYAN",
        "acceptedAnswers": [
          "anniyan"
        ]
      },
      {
        "id": "r1_set_j_3",
        "title": "The Wizard of Menlo Park",
        "category": "🌟 Famous Personality",
        "prompt": "Holding 1,093 US patents, he developed the phonograph, motion picture camera, and commercial incandescent light bulb, famously declaring that genius is 1% inspiration and 99% perspiration. Who was he?",
        "clue": "American inventor who engaged in the War of the Currents with alternating current rivals.",
        "hint": "Thomas Alva _______.",
        "expectedFragment": "THOMAS EDISON",
        "acceptedAnswers": [
          "thomas edison",
          "edison"
        ]
      }
    ],
    "leaderTask": {
      "title": "Grand Knowledge Synthesis",
      "instructions": "Compose an eloquent, grammatically complete sentence (5-30 words) with action verbs, incorporating at least 3 of your collected keywords (e.g., ALGORITHM, EDISON, ANNIYAN, LOGIC).",
      "hint": "Example: \"Edison inventive dedication and sharp algorithmic logic empower our squad to create breakthroughs.\""
    }
  },
  {
    "setId": "r1_set_k",
    "theme": "Silicon Frontier",
    "steps": [
      {
        "id": "r1_set_k_1",
        "title": "The Convolution Filter",
        "category": "🤖 AI & Machine Learning",
        "prompt": "In image processing and Convolutional Neural Networks (CNNs), what small sliding matrix of numbers computes dot products across spatial pixels to detect edges and textures?",
        "clue": "Also the core software program that manages CPU and memory in Linux operating systems.",
        "hint": "6-letter word: K _ _ _ _ L.",
        "expectedFragment": "KERNEL",
        "acceptedAnswers": [
          "kernel",
          "kernels"
        ]
      },
      {
        "id": "r1_set_k_2",
        "title": "The Solitary Castaway on the Hill",
        "category": "🎬 Tamil Movies",
        "prompt": "A brilliant software engineer and nature lover is wrongfully framed and stranded on a desolate Australian hillside where he survives against the wilderness before exposing the corporate conspirators. What title is this?",
        "clue": "Auto driver Manickam hides his past as an underworld don in Mumbai to protect his brother and sisters.",
        "hint": "Suresh Krissna's 1995 cult classic starring Rajinikanth; \"Naan oru thadava sonna...\".",
        "expectedFragment": "BAASHA",
        "acceptedAnswers": [
          "baasha",
          "basha"
        ]
      },
      {
        "id": "r1_set_k_3",
        "title": "The Father of Indian Space",
        "category": "🌟 Famous Personality",
        "prompt": "Born into an affluent Ahmedabad industrialist family, he convinced the government of the importance of space research for a developing nation, founding ISRO and establishing the Thumba equatorial rocket launching station. Who was he?",
        "clue": "Honored as the Father of the Indian Space Program; husband of dancer Mrinalini.",
        "hint": "Dr. Vikram _______.",
        "expectedFragment": "VIKRAM SARABHAI",
        "acceptedAnswers": [
          "vikram sarabhai",
          "sarabhai"
        ]
      }
    ],
    "leaderTask": {
      "title": "Grand Knowledge Synthesis",
      "instructions": "Compose an eloquent, grammatically complete sentence (5-30 words) with action verbs, incorporating at least 3 of your collected keywords (e.g., KERNEL, BAASHA, SARABHAI, SPACE).",
      "hint": "Example: \"Like Sarabhai launched Indian space, our team builds powerful kernel algorithms with Baasha energy.\""
    }
  },
  {
    "setId": "r1_set_l",
    "theme": "Deep Vision",
    "steps": [
      {
        "id": "r1_set_l_1",
        "title": "The Gradient Minimizer",
        "category": "🤖 AI & Machine Learning",
        "prompt": "In supervised learning, what mathematical function measures the discrepancy between an AI model's predicted output and the ground truth labels, driving backpropagation?",
        "clue": "Cross-entropy and Mean Squared Error are classic forms of this 4-letter term.",
        "hint": "Opposite of gain or profit; L _ _ S.",
        "expectedFragment": "LOSS",
        "acceptedAnswers": [
          "loss",
          "loss function"
        ]
      },
      {
        "id": "r1_set_l_2",
        "title": "The Time Travel Watch",
        "category": "🎬 Tamil Movies",
        "prompt": "A watchmaker invents a retro-chronometer that can manipulate time up to 24 hours into the past, sparking a deadly struggle across decades against his evil twin brother Athreya. What film is this?",
        "clue": "Directed by Vikram Kumar; Suriya in a triple role as Athreya, Mani, and Sethuraman; music by AR Rahman.",
        "hint": "Title is a two-digit integer representing a calendar year or hour count; 24.",
        "expectedFragment": "24",
        "acceptedAnswers": [
          "24"
        ]
      },
      {
        "id": "r1_set_l_3",
        "title": "The Father of Information Theory",
        "category": "🌟 Famous Personality",
        "prompt": "In 1948, he published \"A Mathematical Theory of Communication\", establishing the fundamental limits on data compression, noise tolerance, and introducing the bit as the fundamental unit of information. Who was he?",
        "clue": "MIT and Bell Labs mathematician and pioneer who built juggling robots and electronic mice.",
        "hint": "Claude _______.",
        "expectedFragment": "CLAUDE SHANNON",
        "acceptedAnswers": [
          "claude shannon",
          "shannon"
        ]
      }
    ],
    "leaderTask": {
      "title": "Grand Knowledge Synthesis",
      "instructions": "Compose an eloquent, grammatically complete sentence (5-30 words) with action verbs, incorporating at least 3 of your collected keywords (e.g., LOSS, 24, SHANNON, ACCURACY).",
      "hint": "Example: \"Shannon information theory minimizes prediction loss to achieve 24 carat accuracy.\""
    }
  },
  {
    "setId": "r1_set_m",
    "theme": "Quantum Logic",
    "steps": [
      {
        "id": "r1_set_m_1",
        "title": "The Overfitting Regularizer",
        "category": "🤖 AI & Machine Learning",
        "prompt": "What deep learning regularization technique randomly deactivates a fraction of neurons during training to prevent co-adaptation of features?",
        "clue": "Introduced by Nitish Srivastava and Geoffrey Hinton in 2014; literally dropping connections.",
        "hint": "7-letter word: D _ _ _ _ _ T.",
        "expectedFragment": "DROPOUT",
        "acceptedAnswers": [
          "dropout"
        ]
      },
      {
        "id": "r1_set_m_2",
        "title": "The Formula One Racer",
        "category": "🎬 Tamil Movies",
        "prompt": "A hot-headed car racer in Chennai finds redemption in street speed after a tragic accident, competing in high-octane track circuits while protecting his loved ones. What title is this?",
        "clue": "Starring Ajith Kumar and Nayanthara; directed by Vishnuvardhan with music by Yuvan Shankar Raja.",
        "hint": "Title translates to \"Beginning\" or \"Commencement\"; Arrambam!",
        "expectedFragment": "ARRAMBAM",
        "acceptedAnswers": [
          "arrambam",
          "aarambam"
        ]
      },
      {
        "id": "r1_set_m_3",
        "title": "The Architect of Green Revolution",
        "category": "🌟 Famous Personality",
        "prompt": "Born in Kumbakonam, Tamil Nadu, this agricultural scientist collaborated with Norman Borlaug to introduce high-yielding varieties of wheat and rice, saving India from catastrophic famine in the 1960s. Who was he?",
        "clue": "Conferred the Bharat Ratna in 2024; Father of the Green Revolution in India.",
        "hint": "M. S. _______.",
        "expectedFragment": "MS SWAMINATHAN",
        "acceptedAnswers": [
          "ms swaminathan",
          "m.s. swaminathan",
          "swaminathan"
        ]
      }
    ],
    "leaderTask": {
      "title": "Grand Knowledge Synthesis",
      "instructions": "Compose an eloquent, grammatically complete sentence (5-30 words) with action verbs, incorporating at least 3 of your collected keywords (e.g., DROPOUT, ARRAMBAM, SWAMINATHAN, PRECISION).",
      "hint": "Example: \"Like Swaminathan transformed Indian agriculture, our squad applies dropout precision to innovate.\""
    }
  },
  {
    "setId": "r1_set_n",
    "theme": "Cyber Sentinel",
    "steps": [
      {
        "id": "r1_set_n_1",
        "title": "The Attention Transformer",
        "category": "🤖 AI & Machine Learning",
        "prompt": "In 2017, Google researchers published the seminal paper \"Attention Is All You Need\", replacing recurrent architectures with what revolutionary neural building block?",
        "clue": "Self-attention mechanism that powers GPT, BERT, and Gemini; sounds like an Optimus Prime robot.",
        "hint": "11-letter word: T _ _ _ _ _ _ _ _ _ R.",
        "expectedFragment": "TRANSFORMER",
        "acceptedAnswers": [
          "transformer",
          "transformers"
        ]
      },
      {
        "id": "r1_set_n_2",
        "title": "The Cyber Hacker Vigilante",
        "category": "🎬 Tamil Movies",
        "prompt": "A cyber-security student and computer hacker takes on a sinister corporate hospital syndicate that kidnaps infants for illicit organ harvesting. What title is this?",
        "clue": "Directed by P. S. Mithran; starring Sivakarthikeyan and Arjun Sarja as the mentor; titled after a superhero.",
        "hint": "Title translates to \"Hero\"; 4 letters.",
        "expectedFragment": "HERO",
        "acceptedAnswers": [
          "hero"
        ]
      },
      {
        "id": "r1_set_n_3",
        "title": "The Architect of Indian Constitution",
        "category": "🌟 Famous Personality",
        "prompt": "He held doctorates in economics from Columbia University and the London School of Economics, led the Dalit Buddhist movement, and served as independent India's first Minister of Law and Chairman of the Drafting Committee. Who was he?",
        "clue": "Chief Architect of the Constitution of India; honored as Babasaheb.",
        "hint": "Dr. B. R. _______.",
        "expectedFragment": "BR AMBEDKAR",
        "acceptedAnswers": [
          "br ambedkar",
          "b.r. ambedkar",
          "ambedkar",
          "babasaheb"
        ]
      }
    ],
    "leaderTask": {
      "title": "Grand Knowledge Synthesis",
      "instructions": "Compose an eloquent, grammatically complete sentence (5-30 words) with action verbs, incorporating at least 3 of your collected keywords (e.g., TRANSFORMER, HERO, AMBEDKAR, EQUALITY).",
      "hint": "Example: \"Embodying Ambedkar principles, our squad builds transformer AI technology to become heroes.\""
    }
  },
  {
    "setId": "r1_set_o",
    "theme": "Matrix Nexus",
    "steps": [
      {
        "id": "r1_set_o_1",
        "title": "The Gradient Step Multiplier",
        "category": "🤖 AI & Machine Learning",
        "prompt": "In gradient descent optimization, what hyperparameter scales the step size taken towards the objective function's minimum, preventing overshoot?",
        "clue": "Often denoted by alpha or Greek letter eta (e.g., 0.001); learning _______.",
        "hint": "4-letter word: R _ _ E.",
        "expectedFragment": "RATE",
        "acceptedAnswers": [
          "rate",
          "learning rate"
        ]
      },
      {
        "id": "r1_set_o_2",
        "title": "The Undercover Cop in the Enclave",
        "category": "🎬 Tamil Movies",
        "prompt": "A reckless undercover cop and an upright police officer hunt a psychopathic serial killer in Chennai who tortures young women with lethal injections. What dark psychological thriller is this?",
        "clue": "Starring Vishnu Vishal and Amala Paul; directed by Ram Kumar; features the menacing villain Christopher.",
        "hint": "Title translates to \"Demon\" or \"Monster\"; Ratsasan.",
        "expectedFragment": "RATSASAN",
        "acceptedAnswers": [
          "ratsasan",
          "raatchasan"
        ]
      },
      {
        "id": "r1_set_o_3",
        "title": "The First Woman in Space",
        "category": "🌟 Famous Personality",
        "prompt": "Born in Karnal, Haryana, she studied aerospace engineering at Punjab Engineering College before joining NASA and flying on Space Shuttle Columbia missions STS-87 and STS-107. Who was she?",
        "clue": "First woman of Indian origin to fly in space; perished during Columbia reentry in 2003.",
        "hint": "First name Kalpana.",
        "expectedFragment": "KALPANA CHAWLA",
        "acceptedAnswers": [
          "kalpana chawla",
          "kalpana",
          "chawla"
        ]
      }
    ],
    "leaderTask": {
      "title": "Grand Knowledge Synthesis",
      "instructions": "Compose an eloquent, grammatically complete sentence (5-30 words) with action verbs, incorporating at least 3 of your collected keywords (e.g., RATE, RATSASAN, CHAWLA, DISCOVERY).",
      "hint": "Example: \"Like Kalpana Chawla reached for space, our squad accelerates the learning rate of scientific discovery.\""
    }
  },
  {
    "setId": "r1_set_p",
    "theme": "Cloud Odyssey",
    "steps": [
      {
        "id": "r1_set_p_1",
        "title": "The Non-Linear Activation",
        "category": "🤖 AI & Machine Learning",
        "prompt": "What mathematical function defined as f(x) = max(0, x) solved the vanishing gradient problem in deep neural networks and remains the default activation function?",
        "clue": "Rectified Linear Unit acronym.",
        "hint": "5-letter abbreviation: R _ _ _ U.",
        "expectedFragment": "RELU",
        "acceptedAnswers": [
          "relu",
          "rectified linear unit"
        ]
      },
      {
        "id": "r1_set_p_2",
        "title": "The Undercover Detective in London",
        "category": "🎬 Tamil Movies",
        "prompt": "An Indian intelligence officer with superhuman memory and an eye for forensic analysis tracks an elusive global financial criminal across the streets of London and Europe. What title is this?",
        "clue": "Starring Chiyaan Vikram and Jagapathi Babu; directed by A. L. Vijay; features \"Oru Paadhi Kadhavu\".",
        "hint": "Title translates to \"God's Child\" or \"Thaandavam\"? Thaandavam!",
        "expectedFragment": "THAANDAVAM",
        "acceptedAnswers": [
          "thaandavam",
          "thandavam"
        ]
      },
      {
        "id": "r1_set_p_3",
        "title": "The Iron Man of India",
        "category": "🌟 Famous Personality",
        "prompt": "As India's first Deputy Prime Minister and Minister of Home Affairs, he successfully integrated over 565 princely states into a unified Indian Union using patient diplomacy and resolute will. Who was he?",
        "clue": "Statue of Unity in Gujarat honors him; known as the Iron Man of India.",
        "hint": "Sardar Vallabhbhai _______.",
        "expectedFragment": "SARDAR PATEL",
        "acceptedAnswers": [
          "sardar patel",
          "vallabhbhai patel",
          "patel"
        ]
      }
    ],
    "leaderTask": {
      "title": "Grand Knowledge Synthesis",
      "instructions": "Compose an eloquent, grammatically complete sentence (5-30 words) with action verbs, incorporating at least 3 of your collected keywords (e.g., RELU, PATEL, THAANDAVAM, UNITY).",
      "hint": "Example: \"Like Sardar Patel unified India, our squad connects every ReLU unit to build unbreakable unity.\""
    }
  },
  {
    "setId": "r1_set_q",
    "theme": "Precision Engine",
    "steps": [
      {
        "id": "r1_set_q_1",
        "title": "The Unsupervised Clusterer",
        "category": "🤖 AI & Machine Learning",
        "prompt": "What classical unsupervised clustering algorithm partitions n observations into k clusters where each observation belongs to the cluster with the nearest mean centroid?",
        "clue": "K-_______ clustering algorithm.",
        "hint": "5-letter word: M _ _ _ S.",
        "expectedFragment": "MEANS",
        "acceptedAnswers": [
          "means",
          "k-means"
        ]
      },
      {
        "id": "r1_set_q_2",
        "title": "The Rocket Scientist Trial",
        "category": "🎬 Tamil Movies",
        "prompt": "A biographical drama detailing the life of ISRO scientist Nambi Narayanan, who was falsely accused of espionage and fought for decades to clear his name and validate India's Vikas rocket engine. What film is this?",
        "clue": "Directed by and starring R. Madhavan; won Best Feature Film at the 69th National Film Awards.",
        "hint": "Rocketry: The Nambi Effect.",
        "expectedFragment": "ROCKETRY",
        "acceptedAnswers": [
          "rocketry",
          "the nambi effect"
        ]
      },
      {
        "id": "r1_set_q_3",
        "title": "The Bard of Bengal",
        "category": "🌟 Famous Personality",
        "prompt": "He reshaped Bengali literature and music, founded Visva-Bharati University in Santiniketan, and in 1913 became the first non-European to win the Nobel Prize in Literature for his collection \"Gitanjali\". Who was he?",
        "clue": "Penned the national anthems of both India (\"Jana Gana Mana\") and Bangladesh (\"Amar Shonar Bangla\").",
        "hint": "Rabindranath _______.",
        "expectedFragment": "RABINDRANATH TAGORE",
        "acceptedAnswers": [
          "rabindranath tagore",
          "tagore"
        ]
      }
    ],
    "leaderTask": {
      "title": "Grand Knowledge Synthesis",
      "instructions": "Compose an eloquent, grammatically complete sentence (5-30 words) with action verbs, incorporating at least 3 of your collected keywords (e.g., MEANS, ROCKETRY, TAGORE, BRILLIANCE).",
      "hint": "Example: \"Tagore poetic vision and Rocketry dedication provide the means to achieve technological brilliance.\""
    }
  },
  {
    "setId": "r1_set_r",
    "theme": "Adaptive Logic",
    "steps": [
      {
        "id": "r1_set_r_1",
        "title": "The Reinforcement Reward",
        "category": "🤖 AI & Machine Learning",
        "prompt": "In reinforcement learning (RL), what scalar feedback signal from the environment guides an agent to learn optimal policies through trial and error?",
        "clue": "Reinforcement models maximize cumulative expected _______ over time.",
        "hint": "6-letter word: R _ _ _ _ D.",
        "expectedFragment": "REWARD",
        "acceptedAnswers": [
          "reward",
          "rewards"
        ]
      },
      {
        "id": "r1_set_r_2",
        "title": "The Aviation Dreamer",
        "category": "🎬 Tamil Movies",
        "prompt": "Inspired by the life of Captain G. R. Gopinath, a determined former Indian Air Force captain battles ruthless aviation cartels to launch India's first low-cost airline for the common man. What film is this?",
        "clue": "Directed by Sudha Kongara starring Suriya as Nedumaaran Rajangam; won 5 National Film Awards.",
        "hint": "Title translates to \"Praise the Brave\"; Soorarai Pottru.",
        "expectedFragment": "SOORARAI POTTRU",
        "acceptedAnswers": [
          "soorarai pottru",
          "soorarai potru"
        ]
      },
      {
        "id": "r1_set_r_3",
        "title": "The Nightingale of India",
        "category": "🌟 Famous Personality",
        "prompt": "A celebrated political activist and poet born in Hyderabad, she was the first Indian woman to serve as President of the Indian National Congress and the first female governor of an Indian state (United Provinces). Who was she?",
        "clue": "Author of poetry collections \"The Golden Threshold\" and \"The Bird of Time\"; known as the Nightingale of India.",
        "hint": "Sarojini _______.",
        "expectedFragment": "SAROJINI NAIDU",
        "acceptedAnswers": [
          "sarojini naidu",
          "naidu"
        ]
      }
    ],
    "leaderTask": {
      "title": "Grand Knowledge Synthesis",
      "instructions": "Compose an eloquent, grammatically complete sentence (5-30 words) with action verbs, incorporating at least 3 of your collected keywords (e.g., REWARD, NAIDU, SOORARAI, EXCELLENCE).",
      "hint": "Example: \"Like Sarojini Naidu inspired generations, our squad works with courage to claim the ultimate reward of excellence.\""
    }
  },
  {
    "setId": "r1_set_s",
    "theme": "Silicon Alchemy",
    "steps": [
      {
        "id": "r1_set_s_1",
        "title": "The Dimensionality Reducer",
        "category": "🤖 AI & Machine Learning",
        "prompt": "What linear algebraic statistical technique projects high-dimensional data onto orthogonal axes that maximize variance, often abbreviated as PCA?",
        "clue": "Principal Component _______.",
        "hint": "8-letter word: A _ _ _ _ _ _ S.",
        "expectedFragment": "ANALYSIS",
        "acceptedAnswers": [
          "analysis",
          "pca"
        ]
      },
      {
        "id": "r1_set_s_2",
        "title": "The Rural Cricket Champion",
        "category": "🎬 Tamil Movies",
        "prompt": "In a drought-hit Thanjavur village, a humble farmer's cricket-obsessed daughter struggles against social prejudices to join the Indian national women's cricket squad with her father's sacrifice. What inspiring film is this?",
        "clue": "Starring Aishwarya Rajesh and Sathyaraj; directed by Arunraja Kamaraj; features the song \"Veyyon Silli\".",
        "hint": "Title translates to \"Kanaa\" (Dream).",
        "expectedFragment": "KANAA",
        "acceptedAnswers": [
          "kanaa",
          "kana"
        ]
      },
      {
        "id": "r1_set_s_3",
        "title": "The Father of the White Revolution",
        "category": "🌟 Famous Personality",
        "prompt": "An Indian mechanical engineer from Kozhikode who spearheaded Operation Flood—the world's largest agricultural dairy development program—transforming India from a milk-deficient nation into the largest milk producer through the Amul cooperative. Who was he?",
        "clue": "Known as the Milkman of India and Father of the White Revolution; recipient of World Food Prize.",
        "hint": "Dr. Verghese _______.",
        "expectedFragment": "VERGHESE KURIEN",
        "acceptedAnswers": [
          "verghese kurien",
          "kurien"
        ]
      }
    ],
    "leaderTask": {
      "title": "Grand Knowledge Synthesis",
      "instructions": "Compose an eloquent, grammatically complete sentence (5-30 words) with action verbs, incorporating at least 3 of your collected keywords (e.g., ANALYSIS, KANAA, KURIEN, SUCCESS).",
      "hint": "Example: \"Like Kurien achieved rural dreams, detailed data analysis turns our squad's vision into success.\""
    }
  },
  {
    "setId": "r1_set_t",
    "theme": "Apex Synthesis",
    "steps": [
      {
        "id": "r1_set_t_1",
        "title": "The Bayesian Probability Rule",
        "category": "🤖 AI & Machine Learning",
        "prompt": "What foundational theorem in probability calculus describes the conditional probability of an event based on prior knowledge of conditions related to the event: P(A|B) = [P(B|A)*P(A)] / P(B)?",
        "clue": "Named after 18th-century English statistician and Presbyterian minister Thomas Bayes.",
        "hint": "5-letter word: B _ _ _ S.",
        "expectedFragment": "BAYES",
        "acceptedAnswers": [
          "bayes",
          "bayes theorem"
        ]
      },
      {
        "id": "r1_set_t_2",
        "title": "The Dual Identity Undercover Hitman",
        "category": "🎬 Tamil Movies",
        "prompt": "A contract killer living in Chennai under the guise of an unassuming bakery owner discovers his past caught up with international syndicates and weapons cartels, unleashing relentless hand-to-hand combat in Himachal Pradesh. What title is this?",
        "clue": "Directed by Lokesh Kanagaraj starring Thalapathy Vijay as Parthiban / Leo Das; music by Anirudh.",
        "hint": "Title is the zodiac sign of the lion; 3 letters.",
        "expectedFragment": "LEO",
        "acceptedAnswers": [
          "leo"
        ]
      },
      {
        "id": "r1_set_t_3",
        "title": "The Flying Sikh",
        "category": "🌟 Famous Personality",
        "prompt": "An Indian track and field sprinter who overcame the trauma of the 1947 partition to become the first Indian athlete to win an individual athletics Commonwealth Games gold medal, finishing 4th in the 1960 Rome 400m Olympic final. Who was he?",
        "clue": "Revered across the globe as \"The Flying Sikh\"; Farhan Akhtar played him in his biopic.",
        "hint": "Milkha _______.",
        "expectedFragment": "MILKHA SINGH",
        "acceptedAnswers": [
          "milkha singh",
          "milkha"
        ]
      }
    ],
    "leaderTask": {
      "title": "Grand Knowledge Synthesis",
      "instructions": "Compose an eloquent, grammatically complete sentence (5-30 words) with action verbs, incorporating at least 3 of your collected keywords (e.g., BAYES, LEO, MILKHA, SPEED).",
      "hint": "Example: \"Like Milkha Singh ran with legendary speed, our squad applies Bayes logic with Leo fierce focus.\""
    }
  }
],
  2: [
  {
    "setId": "r2_circuit_synapse",
    "theme": "Circuit Alpha: Synaptic Cyber Grid",
    "steps": [
      {
        "id": "r2_syn_1",
        "nodeNumber": 1,
        "category": "🤖 AI & Code",
        "targetWord": "PYTHON",
        "length": 6,
        "bridgeClue": "⚡ ENTRY KEY: Initial root cipher key to breach the security mainframe.",
        "prompt": "Conceived in Amsterdam in 1989; the dominant programming language of PyTorch, LLMs, and neural networks.",
        "hint": "Guido van Rossum's masterpiece; indent-based syntax.",
        "acceptedAnswers": [
          "python"
        ]
      },
      {
        "id": "r2_syn_2",
        "nodeNumber": 2,
        "category": "🌐 Networking",
        "targetWord": "ONLINE",
        "length": 6,
        "bridgeClue": "⚡ LINKED FROM NODE 01 [PYTHON] ➔ Starts with the ending 2 letters 'ON'.",
        "prompt": "The active digital state of being connected to the campus server or internet network.",
        "hint": "Opposite of Offline.",
        "acceptedAnswers": [
          "online"
        ]
      },
      {
        "id": "r2_syn_3",
        "nodeNumber": 3,
        "category": "🧠 Deep Learning",
        "targetWord": "NEURON",
        "length": 6,
        "bridgeClue": "⚡ LINKED FROM NODE 02 [ONLINE] ➔ Starts with the ending 2 letters 'NE'.",
        "prompt": "The fundamental bio-cellular or AI unit that computes weights and fires synaptic activations.",
        "hint": "McCulloch-Pitts processing unit; nerve cell.",
        "acceptedAnswers": [
          "neuron"
        ]
      },
      {
        "id": "r2_syn_4",
        "nodeNumber": 4,
        "category": "🦾 Robotics",
        "targetWord": "ROBOT",
        "length": 5,
        "bridgeClue": "⚡ LINKED FROM NODE 03 [NEURON] ➔ Contains the letters 'RO'.",
        "prompt": "Autonomous mechanical or software automaton; 1920 Czech play term 'robota'; also Shankar's Chitti.",
        "hint": "Asimov's 3 laws govern this automaton.",
        "acceptedAnswers": [
          "robot"
        ]
      },
      {
        "id": "r2_syn_5",
        "nodeNumber": 5,
        "category": "⚡ Hardware & Titans",
        "targetWord": "TITAN",
        "length": 5,
        "bridgeClue": "⚡ LINKED FROM NODE 04 [ROBOT] ➔ Starts with the ending letter 'T'.",
        "prompt": "Colossal mythological giant, Saturn's largest moon, or flagship NVIDIA supercomputing GPU card.",
        "hint": "T _ _ _ N; Greek primordial deity.",
        "acceptedAnswers": [
          "titan"
        ]
      },
      {
        "id": "r2_syn_6",
        "nodeNumber": 6,
        "category": "🏆 Indian Icons",
        "targetWord": "ANAND",
        "length": 5,
        "bridgeClue": "⚡ LINKED FROM NODE 05 [TITAN] ➔ Starts with the ending 2 letters 'AN'.",
        "prompt": "Chennai's 5-time undisputed World Chess Champion; India's first Khel Ratna awardee; 'The Lightning Kid'.",
        "hint": "Viswanathan ________; chess maestro.",
        "acceptedAnswers": [
          "anand"
        ]
      },
      {
        "id": "r2_syn_7",
        "nodeNumber": 7,
        "category": "💻 Computer Science",
        "targetWord": "NODE",
        "length": 4,
        "bridgeClue": "⚡ LINKED FROM NODE 06 [ANAND] ➔ Uses the letters 'ND'.",
        "prompt": "A connection point or vertex in a linked network; also Google V8's asynchronous server-side runtime.",
        "hint": "____.js; runtime powering this tournament server.",
        "acceptedAnswers": [
          "node"
        ]
      },
      {
        "id": "r2_syn_8",
        "nodeNumber": 8,
        "category": "🐛 Software Engineering",
        "targetWord": "DEBUG",
        "length": 5,
        "bridgeClue": "⚡ LINKED FROM NODE 07 [NODE] ➔ Starts with the letter 'D'.",
        "prompt": "Grace Hopper finding a moth in 1947; the analytical process of finding and removing software defects.",
        "hint": "Setting breakpoints in IDE to step through code.",
        "acceptedAnswers": [
          "debug"
        ]
      },
      {
        "id": "r2_syn_9",
        "nodeNumber": 9,
        "category": "🔌 Logic Circuits",
        "targetWord": "GATES",
        "length": 5,
        "bridgeClue": "⚡ LINKED FROM NODE 08 [DEBUG] ➔ Starts with the ending letter 'G'.",
        "prompt": "Fundamental Boolean electronic blocks (AND, OR, NOT); also Microsoft co-founder Bill.",
        "hint": "Logic _______; Bill ______.",
        "acceptedAnswers": [
          "gates"
        ]
      },
      {
        "id": "r2_syn_10",
        "nodeNumber": 10,
        "category": "👑 FINAL BOSS OVERRIDE",
        "targetWord": "SERVER",
        "length": 6,
        "bridgeClue": "⚡ MASTER REACTOR OVERRIDE: Link final mainframe key to breach the security core.",
        "prompt": "The central host computer running on port 5000 providing game data to all client stations over the LAN.",
        "hint": "Client - _______ architecture.",
        "acceptedAnswers": [
          "server"
        ]
      }
    ]
  },
  {
    "setId": "r2_circuit_matrix",
    "theme": "Circuit Beta: The Digital Matrix",
    "steps": [
      {
        "id": "r2_mat_1",
        "nodeNumber": 1,
        "category": "🛡️ Cybersecurity",
        "targetWord": "CYBER",
        "length": 5,
        "bridgeClue": "⚡ ENTRY KEY: Initial root cipher key to breach the digital matrix.",
        "prompt": "Prefix relating to electronic computers, virtual reality, information networks, and security.",
        "hint": "_____security; _____punk.",
        "acceptedAnswers": [
          "cyber"
        ]
      },
      {
        "id": "r2_mat_2",
        "nodeNumber": 2,
        "category": "📡 Telecommunications",
        "targetWord": "RADAR",
        "length": 5,
        "bridgeClue": "⚡ LINKED FROM NODE 01 [CYBER] ➔ Starts with the ending letter 'R'.",
        "prompt": "Radio Detection and Ranging system using reflected electromagnetic waves to track objects.",
        "hint": "A palindrome word (reads same forwards and backwards).",
        "acceptedAnswers": [
          "radar"
        ]
      },
      {
        "id": "r2_mat_3",
        "nodeNumber": 3,
        "category": "📦 Data Structures",
        "targetWord": "ARRAY",
        "length": 5,
        "bridgeClue": "⚡ LINKED FROM NODE 02 [RADAR] ➔ Starts with the letters 'AR'.",
        "prompt": "Contiguous memory sequence of elements of the same type accessible via integer indices 0, 1, 2...",
        "hint": "Square brackets [ ] in programming syntax.",
        "acceptedAnswers": [
          "array"
        ]
      },
      {
        "id": "r2_mat_4",
        "nodeNumber": 4,
        "category": "⚙️ Python Syntax",
        "targetWord": "YIELD",
        "length": 5,
        "bridgeClue": "⚡ LINKED FROM NODE 03 [ARRAY] ➔ Starts with the ending letter 'Y'.",
        "prompt": "Python keyword returning a generator value without destroying local state; also road sign to give way.",
        "hint": "Used instead of 'return' to create a generator.",
        "acceptedAnswers": [
          "yield"
        ]
      },
      {
        "id": "r2_mat_5",
        "nodeNumber": 5,
        "category": "💾 Hardware Storage",
        "targetWord": "DRIVE",
        "length": 5,
        "bridgeClue": "⚡ LINKED FROM NODE 04 [YIELD] ➔ Ends with letter 'D' + starts with 'D'.",
        "prompt": "Non-volatile storage device (Hard Disk HDD / Solid State SSD); also operating a vehicle.",
        "hint": "Flash ______; USB thumb ______.",
        "acceptedAnswers": [
          "drive"
        ]
      },
      {
        "id": "r2_mat_6",
        "nodeNumber": 6,
        "category": "📐 Math & AI",
        "targetWord": "VECTOR",
        "length": 6,
        "bridgeClue": "⚡ LINKED FROM NODE 05 [DRIVE] ➔ Contains the letter 'V'.",
        "prompt": "Mathematical quantity with magnitude and direction; array of floating-point numbers in AI embeddings.",
        "hint": "C++ STL dynamic array container; or physics ray.",
        "acceptedAnswers": [
          "vector"
        ]
      },
      {
        "id": "r2_mat_7",
        "nodeNumber": 7,
        "category": "🏛️ Tech Giants",
        "targetWord": "ORACLE",
        "length": 6,
        "bridgeClue": "⚡ LINKED FROM NODE 06 [VECTOR] ➔ Starts with the letters 'OR'.",
        "prompt": "Ancient mythological prophet; enterprise database and cloud multinational founded by Larry Ellison.",
        "hint": "Proprietor of Java SE and MySQL.",
        "acceptedAnswers": [
          "oracle"
        ]
      },
      {
        "id": "r2_mat_8",
        "nodeNumber": 8,
        "category": "🐧 Operating Systems",
        "targetWord": "LINUX",
        "length": 5,
        "bridgeClue": "⚡ LINKED FROM NODE 07 [ORACLE] ➔ Starts with the letter 'L'.",
        "prompt": "Open-source Unix-like kernel created by Linus Torvalds in 1991; powers supercomputers and Android.",
        "hint": "Tux the penguin mascot.",
        "acceptedAnswers": [
          "linux"
        ]
      },
      {
        "id": "r2_mat_9",
        "nodeNumber": 9,
        "category": "🖥️ Display Tech",
        "targetWord": "PIXEL",
        "length": 5,
        "bridgeClue": "⚡ LINKED FROM NODE 08 [LINUX] ➔ Contains the letters 'IX'.",
        "prompt": "Short for picture element; the smallest discrete controllable color square on a monitor or phone screen.",
        "hint": "1080p has over 2 million of these.",
        "acceptedAnswers": [
          "pixel"
        ]
      },
      {
        "id": "r2_mat_10",
        "nodeNumber": 10,
        "category": "👑 FINAL BOSS OVERRIDE",
        "targetWord": "LOGIC",
        "length": 5,
        "bridgeClue": "⚡ MASTER REACTOR OVERRIDE: Link final mainframe key to breach the security core.",
        "prompt": "Reasoning conducted according to strict principles of validity; Boolean operators evaluating truth.",
        "hint": "Boolean ________; truth tables.",
        "acceptedAnswers": [
          "logic"
        ]
      }
    ]
  },
  {
    "setId": "r2_circuit_quantum",
    "theme": "Circuit Gamma: Quantum Core",
    "steps": [
      {
        "id": "r2_qua_1",
        "nodeNumber": 1,
        "category": "🔢 Mathematics",
        "targetWord": "MATRIX",
        "length": 6,
        "bridgeClue": "⚡ ENTRY KEY: Initial root cipher key to breach the quantum core.",
        "prompt": "Rectangular 2D array of numbers whose dot products perform linear transformations; also Keanu Reeves film.",
        "hint": "Row by column array; the red and blue pill universe.",
        "acceptedAnswers": [
          "matrix"
        ]
      },
      {
        "id": "r2_qua_2",
        "nodeNumber": 2,
        "category": "🏢 Tech Legends",
        "targetWord": "XEROX",
        "length": 5,
        "bridgeClue": "⚡ LINKED FROM NODE 01 [MATRIX] ➔ Starts with the ending letter 'X'.",
        "prompt": "Pioneer photocopier giant whose Palo Alto PARC lab invented the mouse, Ethernet, and graphical desktop.",
        "hint": "Synonymous with paper photocopying.",
        "acceptedAnswers": [
          "xerox"
        ]
      },
      {
        "id": "r2_qua_3",
        "nodeNumber": 3,
        "category": "🔬 Physics",
        "targetWord": "OPTICS",
        "length": 6,
        "bridgeClue": "⚡ LINKED FROM NODE 02 [XEROX] ➔ Contains the letters 'OX'.",
        "prompt": "The branch of physical science studying light behavior, fiber cables, lenses, and the Raman effect.",
        "hint": "Fiber-________ cables speed internet.",
        "acceptedAnswers": [
          "optics"
        ]
      },
      {
        "id": "r2_qua_4",
        "nodeNumber": 4,
        "category": "🧪 Semiconductors",
        "targetWord": "SILICON",
        "length": 7,
        "bridgeClue": "⚡ LINKED FROM NODE 03 [OPTICS] ➔ Starts with the letter 'S'.",
        "prompt": "Chemical element 14; non-metallic semiconductor crystal from which integrated circuits and CPUs are etched.",
        "hint": "_______ Valley in California.",
        "acceptedAnswers": [
          "silicon"
        ]
      },
      {
        "id": "r2_qua_5",
        "nodeNumber": 5,
        "category": "🔗 Networks & Hubs",
        "targetWord": "NEXUS",
        "length": 5,
        "bridgeClue": "⚡ LINKED FROM NODE 04 [SILICON] ➔ Starts with the letter 'N'.",
        "prompt": "A central connection link, focal core, or meeting point; also Google's early pure Android device series.",
        "hint": "Central network node connection.",
        "acceptedAnswers": [
          "nexus"
        ]
      },
      {
        "id": "r2_qua_6",
        "nodeNumber": 6,
        "category": "⚡ High Performance",
        "targetWord": "SUPER",
        "length": 5,
        "bridgeClue": "⚡ LINKED FROM NODE 05 [NEXUS] ➔ Contains the letters 'US'.",
        "prompt": "Prefix for massive high-speed computation (____computer); also Nintendo classic plumber Mario.",
        "hint": "______ Mario; ______computer cluster.",
        "acceptedAnswers": [
          "super"
        ]
      },
      {
        "id": "r2_qua_7",
        "nodeNumber": 7,
        "category": "🌐 Web Hardware",
        "targetWord": "ROUTER",
        "length": 6,
        "bridgeClue": "⚡ LINKED FROM NODE 06 [SUPER] ➔ Starts with the ending letter 'R'.",
        "prompt": "Networking hardware box that receives data packets and forwards them across Wi-Fi and Ethernet cables.",
        "hint": "Wi-Fi ______ blinking in your room.",
        "acceptedAnswers": [
          "router"
        ]
      },
      {
        "id": "r2_qua_8",
        "nodeNumber": 8,
        "category": "🔋 Visionaries",
        "targetWord": "TESLA",
        "length": 5,
        "bridgeClue": "⚡ LINKED FROM NODE 07 [ROUTER] ➔ Starts with the letters 'TE'.",
        "prompt": "Serbian-American pioneer of AC electrical power; SI unit of magnetic flux; Elon Musk's EV automaker.",
        "hint": "Nikola ________.",
        "acceptedAnswers": [
          "tesla"
        ]
      },
      {
        "id": "r2_qua_9",
        "nodeNumber": 9,
        "category": "🚀 Milestones",
        "targetWord": "ALPHA",
        "length": 5,
        "bridgeClue": "⚡ LINKED FROM NODE 08 [TESLA] ➔ Starts with the ending letter 'A'.",
        "prompt": "First letter of Greek alphabet; early pre-beta software build testing stage; DeepMind's Go algorithm.",
        "hint": "_____ release comes before Beta.",
        "acceptedAnswers": [
          "alpha"
        ]
      },
      {
        "id": "r2_qua_10",
        "nodeNumber": 10,
        "category": "👑 FINAL BOSS OVERRIDE",
        "targetWord": "AVATAR",
        "length": 6,
        "bridgeClue": "⚡ MASTER REACTOR OVERRIDE: Link final mainframe key to breach the security core.",
        "prompt": "Sanskrit incarnation; digital graphical profile representation of a user; James Cameron's blue Pandora epic.",
        "hint": "Your virtual icon in gaming profiles.",
        "acceptedAnswers": [
          "avatar"
        ]
      }
    ]
  },
  {
    "setId": "r2_circuit_cybernetic",
    "theme": "Circuit Delta: Cybernetic Core",
    "steps": [
      {
        "id": "r2_cyb_1",
        "nodeNumber": 1,
        "category": "🤖 AI Architecture",
        "targetWord": "MODEL",
        "length": 5,
        "bridgeClue": "⚡ ENTRY KEY: Initial root cipher key to breach the cybernetic core.",
        "prompt": "Trained machine learning artifact that encodes patterns to make predictions (e.g. GPT, Llama, Claude).",
        "hint": "Large Language _______ (LLM).",
        "acceptedAnswers": [
          "model"
        ]
      },
      {
        "id": "r2_cyb_2",
        "nodeNumber": 2,
        "category": "📐 Math & Physics",
        "targetWord": "DELTA",
        "length": 5,
        "bridgeClue": "⚡ LINKED FROM NODE 01 [MODEL] ➔ Starts with the letters 'DEL'.",
        "prompt": "Fourth Greek letter (Δ); mathematical symbol denoting incremental variation or difference.",
        "hint": "ΔX / ΔY denotes slope or derivative.",
        "acceptedAnswers": [
          "delta"
        ]
      },
      {
        "id": "r2_cyb_3",
        "nodeNumber": 3,
        "category": "💻 PC Enclosure",
        "targetWord": "TOWER",
        "length": 5,
        "bridgeClue": "⚡ LINKED FROM NODE 02 [DELTA] ➔ Starts with the letter 'T'.",
        "prompt": "Tall vertical architecture; the upright desktop computer chassis holding CPU, motherboard, and cooling fans.",
        "hint": "Mid-_____ PC chassis.",
        "acceptedAnswers": [
          "tower"
        ]
      },
      {
        "id": "r2_cyb_4",
        "nodeNumber": 4,
        "category": "📻 Waves & Audio",
        "targetWord": "RADIO",
        "length": 5,
        "bridgeClue": "⚡ LINKED FROM NODE 03 [TOWER] ➔ Contains the letters 'RO'.",
        "prompt": "Electromagnetic radiation band used for long-distance audio broadcasting, Wi-Fi RF, and cell towers.",
        "hint": "Marconi's wireless invention.",
        "acceptedAnswers": [
          "radio"
        ]
      },
      {
        "id": "r2_cyb_5",
        "nodeNumber": 5,
        "category": "🪐 Celestial Physics",
        "targetWord": "ORBIT",
        "length": 5,
        "bridgeClue": "⚡ LINKED FROM NODE 04 [RADIO] ➔ Starts with the letter 'O'.",
        "prompt": "Curved path of a celestial body or artificial satellite around a star, planet, or gravitational center.",
        "hint": "Satellites in low Earth _______.",
        "acceptedAnswers": [
          "orbit"
        ]
      },
      {
        "id": "r2_cyb_6",
        "nodeNumber": 6,
        "category": "🔐 Security & NLP",
        "targetWord": "TOKEN",
        "length": 5,
        "bridgeClue": "⚡ LINKED FROM NODE 05 [ORBIT] ➔ Starts with the letter 'T'.",
        "prompt": "Sub-word text fraction parsed by language models; security credential authorizing session requests.",
        "hint": "Session _______; JWT bearer.",
        "acceptedAnswers": [
          "token"
        ]
      },
      {
        "id": "r2_cyb_7",
        "nodeNumber": 7,
        "category": "💻 Operating Core",
        "targetWord": "KERNEL",
        "length": 6,
        "bridgeClue": "⚡ LINKED FROM NODE 06 [TOKEN] ➔ Starts with the letters 'KE'.",
        "prompt": "The central foundational program of an OS that possesses full control over hardware memory and CPU threads.",
        "hint": "Monolithic vs Micro-_______.",
        "acceptedAnswers": [
          "kernel"
        ]
      },
      {
        "id": "r2_cyb_8",
        "nodeNumber": 8,
        "category": "λ Functional Code",
        "targetWord": "LAMBDA",
        "length": 6,
        "bridgeClue": "⚡ LINKED FROM NODE 07 [KERNEL] ➔ Starts with the letter 'L'.",
        "prompt": "Greek letter for wavelength; keyword used in Python to construct anonymous single-line lambda functions.",
        "hint": "Alonzo Church's calculus; AWS serverless function.",
        "acceptedAnswers": [
          "lambda"
        ]
      },
      {
        "id": "r2_cyb_9",
        "nodeNumber": 9,
        "category": "🔒 Permissions",
        "targetWord": "ACCESS",
        "length": 6,
        "bridgeClue": "⚡ LINKED FROM NODE 08 [LAMBDA] ➔ Starts with the ending letter 'A'.",
        "prompt": "The privilege or authorization to read, write, or enter digital files and secured networks.",
        "hint": "______ Control List (ACL); _______ Granted.",
        "acceptedAnswers": [
          "access"
        ]
      },
      {
        "id": "r2_cyb_10",
        "nodeNumber": 10,
        "category": "👑 FINAL BOSS OVERRIDE",
        "targetWord": "SHIELD",
        "length": 6,
        "bridgeClue": "⚡ MASTER REACTOR OVERRIDE: Link final mainframe key to breach the security core.",
        "prompt": "Protective defensive barrier guarding computer networks; Marvel's global peacekeeping espionage division.",
        "hint": "Captain America's vibranium weapon; defense firewall.",
        "acceptedAnswers": [
          "shield"
        ]
      }
    ]
  },
  {
    "setId": "r2_circuit_arcadia",
    "theme": "Circuit Epsilon: Arcade Odyssey",
    "steps": [
      {
        "id": "r2_arc_1",
        "nodeNumber": 1,
        "category": "🎮 Esports & Games",
        "targetWord": "GAMER",
        "length": 5,
        "bridgeClue": "⚡ ENTRY KEY: Initial root cipher key to breach the arcade matrix.",
        "prompt": "An individual dedicated to playing competitive, casual, or multiplayer video games.",
        "hint": "Player holding console joystick or mouse.",
        "acceptedAnswers": [
          "gamer"
        ]
      },
      {
        "id": "r2_arc_2",
        "nodeNumber": 2,
        "category": "⚠️ Debugging",
        "targetWord": "ERROR",
        "length": 5,
        "bridgeClue": "⚡ LINKED FROM NODE 01 [GAMER] ➔ Starts with the letter 'E'.",
        "prompt": "A state of inaccuracy, runtime exception, or bug; HTTP status code 404 indicates a client ________.",
        "hint": "Trial and _______; syntax _______.",
        "acceptedAnswers": [
          "error"
        ]
      },
      {
        "id": "r2_arc_3",
        "nodeNumber": 3,
        "category": "🗺️ Web Endpoints",
        "targetWord": "ROUTE",
        "length": 5,
        "bridgeClue": "⚡ LINKED FROM NODE 02 [ERROR] ➔ Starts with the letters 'RO'.",
        "prompt": "Path followed by network packets; in Express.js it maps HTTP requests (GET / POST) to handler code.",
        "hint": "GPS roadmap navigation course.",
        "acceptedAnswers": [
          "route"
        ]
      },
      {
        "id": "r2_arc_4",
        "nodeNumber": 4,
        "category": "⏱️ Time Metrics",
        "targetWord": "TIMER",
        "length": 5,
        "bridgeClue": "⚡ LINKED FROM NODE 03 [ROUTE] ➔ Starts with the letter 'T'.",
        "prompt": "Specialized clock counting down remaining minutes or seconds during an arcade challenge.",
        "hint": "Stopwatch mechanism.",
        "acceptedAnswers": [
          "timer"
        ]
      },
      {
        "id": "r2_arc_5",
        "nodeNumber": 5,
        "category": "⚛️ Web Frameworks",
        "targetWord": "REACT",
        "length": 5,
        "bridgeClue": "⚡ LINKED FROM NODE 04 [TIMER] ➔ Starts with the letters 'RE'.",
        "prompt": "Meta's ubiquitous JavaScript library for building interactive user interfaces with components and JSX.",
        "hint": "Created by Jordan Walke; uses virtual DOM.",
        "acceptedAnswers": [
          "react"
        ]
      },
      {
        "id": "r2_arc_6",
        "nodeNumber": 6,
        "category": "🏎️ Boost & Speed",
        "targetWord": "TURBO",
        "length": 5,
        "bridgeClue": "⚡ LINKED FROM NODE 05 [REACT] ➔ Starts with the letter 'T'.",
        "prompt": "Forced induction boost in sports cars; feature dynamically raising CPU clock speeds above base rate.",
        "hint": "Intel ______ Boost; retro arcade speed mode.",
        "acceptedAnswers": [
          "turbo"
        ]
      },
      {
        "id": "r2_arc_7",
        "nodeNumber": 7,
        "category": "🔢 Number Systems",
        "targetWord": "OCTAL",
        "length": 5,
        "bridgeClue": "⚡ LINKED FROM NODE 06 [TURBO] ➔ Starts with the letter 'O'.",
        "prompt": "Base-8 numeral system using digits 0 through 7; common in Unix file permission chmod notation.",
        "hint": "Prefix oct- signifies 8.",
        "acceptedAnswers": [
          "octal"
        ]
      },
      {
        "id": "r2_arc_8",
        "nodeNumber": 8,
        "category": "🔴 Coherent Light",
        "targetWord": "LASER",
        "length": 5,
        "bridgeClue": "⚡ LINKED FROM NODE 07 [OCTAL] ➔ Starts with the letter 'L'.",
        "prompt": "Monochromatic focused beam of light; acronym for Light Amplification by Stimulated Emission of Radiation.",
        "hint": "Barcode scanner beam; lightsaber energy.",
        "acceptedAnswers": [
          "laser"
        ]
      },
      {
        "id": "r2_arc_9",
        "nodeNumber": 9,
        "category": "📊 Algorithms",
        "targetWord": "RADIX",
        "length": 5,
        "bridgeClue": "⚡ LINKED FROM NODE 08 [LASER] ➔ Starts with the letters 'RA'.",
        "prompt": "The base of a positional numeral system; also linear non-comparative integer sorting algorithm.",
        "hint": "______ sort distributes keys into buckets.",
        "acceptedAnswers": [
          "radix"
        ]
      },
      {
        "id": "r2_arc_10",
        "nodeNumber": 10,
        "category": "👑 FINAL BOSS OVERRIDE",
        "targetWord": "XENON",
        "length": 5,
        "bridgeClue": "⚡ MASTER REACTOR OVERRIDE: Link final mainframe key to breach the security core.",
        "prompt": "Noble gas with atomic number 54 producing brilliant blue-white flashes in cinema strobe projectors.",
        "hint": "Noble gas starting with X.",
        "acceptedAnswers": [
          "xenon"
        ]
      }
    ]
  },
  {
    "setId": "r2_circuit_phantom",
    "theme": "Circuit Zeta: Phantom Protocol",
    "steps": [
      {
        "id": "r2_pha_1",
        "nodeNumber": 1,
        "category": "👾 Cyber Bugs",
        "targetWord": "GLITCH",
        "length": 6,
        "bridgeClue": "⚡ ENTRY KEY: Initial root cipher key to breach the phantom protocol.",
        "prompt": "Sudden brief irregularity or visual screen malfunction in electronics, audio, or video game graphics.",
        "hint": "Visual digital screen twitch.",
        "acceptedAnswers": [
          "glitch"
        ]
      },
      {
        "id": "r2_pha_2",
        "nodeNumber": 2,
        "category": "💾 Silicon Wafers",
        "targetWord": "CHIP",
        "length": 4,
        "bridgeClue": "⚡ LINKED FROM NODE 01 [GLITCH] ➔ Starts with the letters 'CH'.",
        "prompt": "Small piece of semiconducting material containing an integrated circuit of microscopic transistors.",
        "hint": "Micro______; potato snack homophone.",
        "acceptedAnswers": [
          "chip"
        ]
      },
      {
        "id": "r2_pha_3",
        "nodeNumber": 3,
        "category": "🎨 Display Elements",
        "targetWord": "PIXEL",
        "length": 5,
        "bridgeClue": "⚡ LINKED FROM NODE 02 [CHIP] ➔ Starts with the letter 'P'.",
        "prompt": "Smallest addressable color unit forming digital graphic pictures on LED and OLED displays.",
        "hint": "Picture element.",
        "acceptedAnswers": [
          "pixel"
        ]
      },
      {
        "id": "r2_pha_4",
        "nodeNumber": 4,
        "category": "🧠 Decision Gates",
        "targetWord": "LOGIC",
        "length": 5,
        "bridgeClue": "⚡ LINKED FROM NODE 03 [PIXEL] ➔ Starts with the letter 'L'.",
        "prompt": "Principles of valid inference; Boolean circuits combining 1s and 0s to make computational decisions.",
        "hint": "AND / OR / NOT ________ gates.",
        "acceptedAnswers": [
          "logic"
        ]
      },
      {
        "id": "r2_pha_5",
        "nodeNumber": 5,
        "category": "☁️ Distributed Servers",
        "targetWord": "CLOUD",
        "length": 5,
        "bridgeClue": "⚡ LINKED FROM NODE 04 [LOGIC] ➔ Starts with the letter 'C'.",
        "prompt": "Global network of remote servers providing on-demand compute, storage, and databases over the internet.",
        "hint": "AWS, Azure, and Google ______.",
        "acceptedAnswers": [
          "cloud"
        ]
      },
      {
        "id": "r2_pha_6",
        "nodeNumber": 6,
        "category": "📊 Unprocessed Facts",
        "targetWord": "DATA",
        "length": 4,
        "bridgeClue": "⚡ LINKED FROM NODE 05 [CLOUD] ➔ Starts with the ending letter 'D'.",
        "prompt": "Raw unorganized facts, symbols, and measurements recorded by sensors awaiting computational processing.",
        "hint": "Big ______; oil of the 21st century.",
        "acceptedAnswers": [
          "data"
        ]
      },
      {
        "id": "r2_pha_7",
        "nodeNumber": 7,
        "category": "⚡ Procedures",
        "targetWord": "ALGO",
        "length": 4,
        "bridgeClue": "⚡ LINKED FROM NODE 06 [DATA] ➔ Starts with the letter 'A'.",
        "prompt": "Short slang for a step-by-step computational procedure or recipe for solving mathematical problems.",
        "hint": "Short for Algorithm.",
        "acceptedAnswers": [
          "algo"
        ]
      },
      {
        "id": "r2_pha_8",
        "nodeNumber": 8,
        "category": "🕸️ Discrete Networks",
        "targetWord": "GRAPH",
        "length": 5,
        "bridgeClue": "⚡ LINKED FROM NODE 07 [ALGO] ➔ Starts with the letter 'G'.",
        "prompt": "Mathematical network abstraction composed of vertices (nodes) and connecting edges; social network model.",
        "hint": "Dijkstra and BFS traverse this structure.",
        "acceptedAnswers": [
          "graph"
        ]
      },
      {
        "id": "r2_pha_9",
        "nodeNumber": 9,
        "category": "🔐 One-Way Digests",
        "targetWord": "HASH",
        "length": 4,
        "bridgeClue": "⚡ LINKED FROM NODE 08 [GRAPH] ➔ Starts with the ending letter 'H'.",
        "prompt": "One-way cryptographic function converting variable data into fixed-size strings (e.g. SHA-256, MD5).",
        "hint": "______ table; password hashing.",
        "acceptedAnswers": [
          "hash"
        ]
      },
      {
        "id": "r2_pha_10",
        "nodeNumber": 10,
        "category": "👑 FINAL BOSS OVERRIDE",
        "targetWord": "HACKER",
        "length": 6,
        "bridgeClue": "⚡ MASTER REACTOR OVERRIDE: Link final mainframe key to breach the security core.",
        "prompt": "Skilled computer technical expert who uses deep system knowledge to explore, test, and breach cyber firewalls.",
        "hint": "Ethical _______; white hat.",
        "acceptedAnswers": [
          "hacker"
        ]
      }
    ]
  },
  {
    "setId": "r2_circuit_vortex",
    "theme": "Circuit Eta: Vortex Protocol",
    "steps": [
      {
        "id": "r2_vor_1",
        "nodeNumber": 1,
        "category": "💾 Source Syntax",
        "targetWord": "CODES",
        "length": 5,
        "bridgeClue": "⚡ ENTRY KEY: Initial root cipher key to breach the vortex mainframe.",
        "prompt": "Instructions written in programming languages translated by compilers into machine-executable binary.",
        "hint": "Source _______; secret ciphers.",
        "acceptedAnswers": [
          "codes",
          "code"
        ]
      },
      {
        "id": "r2_vor_2",
        "nodeNumber": 2,
        "category": "📚 Data Structures",
        "targetWord": "STACK",
        "length": 5,
        "bridgeClue": "⚡ LINKED FROM NODE 01 [CODES] ➔ Starts with the ending letter 'S'.",
        "prompt": "LIFO (Last-In, First-Out) linear data structure where elements are pushed and popped from the top.",
        "hint": "Call ______; ______ Overflow website.",
        "acceptedAnswers": [
          "stack"
        ]
      },
      {
        "id": "r2_vor_3",
        "nodeNumber": 3,
        "category": "💾 Digital Storage",
        "targetWord": "KILO",
        "length": 4,
        "bridgeClue": "⚡ LINKED FROM NODE 02 [STACK] ➔ Starts with the ending letter 'K'.",
        "prompt": "Metric SI unit prefix denoting one thousand (10^3) or 1024 bytes in binary computation.",
        "hint": "______byte (KB); ______gram.",
        "acceptedAnswers": [
          "kilo"
        ]
      },
      {
        "id": "r2_vor_4",
        "nodeNumber": 4,
        "category": "📡 Signal Dispatch",
        "targetWord": "EMIT",
        "length": 4,
        "bridgeClue": "⚡ LINKED FROM NODE 03 [KILO] ➔ Starts with the vowel 'E'.",
        "prompt": "To produce, discharge, or send forth an asynchronous event or message in Socket.IO and EventEmitter.",
        "hint": "socket.______(eventName, data); antonym of absorb.",
        "acceptedAnswers": [
          "emit"
        ]
      },
      {
        "id": "r2_vor_5",
        "nodeNumber": 5,
        "category": "🔍 Diagnostics",
        "targetWord": "TRACE",
        "length": 5,
        "bridgeClue": "⚡ LINKED FROM NODE 04 [EMIT] ➔ Starts with the ending letter 'T'.",
        "prompt": "Stack ______ printed during an unhandled exception showing the chain of function invocations.",
        "hint": "Follow the footsteps or origin path of execution.",
        "acceptedAnswers": [
          "trace"
        ]
      },
      {
        "id": "r2_vor_6",
        "nodeNumber": 6,
        "category": "🤖 Neural Training",
        "targetWord": "EPOCH",
        "length": 5,
        "bridgeClue": "⚡ LINKED FROM NODE 05 [TRACE] ➔ Starts with the ending letter 'E'.",
        "prompt": "One complete training pass of the entire dataset through an artificial neural network model.",
        "hint": "Historical era; in deep learning: batch, step, and ______.",
        "acceptedAnswers": [
          "epoch"
        ]
      },
      {
        "id": "r2_vor_7",
        "nodeNumber": 7,
        "category": "🌐 Networks",
        "targetWord": "HOST",
        "length": 4,
        "bridgeClue": "⚡ LINKED FROM NODE 06 [EPOCH] ➔ Starts with the ending letter 'H'.",
        "prompt": "A computer, server, or device connected to a computer network assigned an IP address.",
        "hint": "Local______ (127.0.0.1); web hosting provider.",
        "acceptedAnswers": [
          "host"
        ]
      },
      {
        "id": "r2_vor_8",
        "nodeNumber": 8,
        "category": "💻 Command Line",
        "targetWord": "TERM",
        "length": 4,
        "bridgeClue": "⚡ LINKED FROM NODE 07 [HOST] ➔ Starts with the ending letter 'T'.",
        "prompt": "Short for text-based console window emulator (e.g. xterm, macOS iTerm, Windows Console).",
        "hint": "A fixed period or semester; CLI emulator prompt.",
        "acceptedAnswers": [
          "term"
        ]
      },
      {
        "id": "r2_vor_9",
        "nodeNumber": 9,
        "category": "🔄 Control Flow",
        "targetWord": "LOOP",
        "length": 4,
        "bridgeClue": "⚡ LINKED FROM NODE 08 [TERM] ➔ Links with iterative 'L'.",
        "prompt": "Programming construct that repeats a block of code until a condition is met (for, while, do-while).",
        "hint": "Event ______ in Node.js; endless infinite circle.",
        "acceptedAnswers": [
          "loop"
        ]
      },
      {
        "id": "r2_vor_10",
        "nodeNumber": 10,
        "category": "👑 FINAL BOSS OVERRIDE",
        "targetWord": "PROXY",
        "length": 5,
        "bridgeClue": "⚡ MASTER GATEWAY OVERRIDE: Starting with 'P', link the intermediate gateway server.",
        "prompt": "Intermediary server application that acts as an agent for requests from clients seeking resources from other servers.",
        "hint": "Forward / Reverse ______; Nginx acting as middleman.",
        "acceptedAnswers": [
          "proxy"
        ]
      }
    ]
  },
  {
    "setId": "r2_circuit_pulsar",
    "theme": "Circuit Theta: Pulsar Grid",
    "steps": [
      {
        "id": "r2_pul_1",
        "nodeNumber": 1,
        "category": "⚡ Memory Tech",
        "targetWord": "FLASH",
        "length": 5,
        "bridgeClue": "⚡ ENTRY KEY: Initial root cipher key to breach the pulsar grid.",
        "prompt": "Non-volatile computer storage chip that can be electrically erased and reprogrammed in SSDs and thumb drives.",
        "hint": "Adobe ______; sudden burst of intense light.",
        "acceptedAnswers": [
          "flash"
        ]
      },
      {
        "id": "r2_pul_2",
        "nodeNumber": 2,
        "category": "🧠 Dynamic Memory",
        "targetWord": "HEAP",
        "length": 4,
        "bridgeClue": "⚡ LINKED FROM NODE 01 [FLASH] ➔ Starts with the ending letter 'H'.",
        "prompt": "Region of a computer's RAM memory used for dynamic allocation where objects and reference types live.",
        "hint": "V8 ______ memory; pile or mound of items.",
        "acceptedAnswers": [
          "heap"
        ]
      },
      {
        "id": "r2_pul_3",
        "nodeNumber": 3,
        "category": "⚙️ Syntax Processing",
        "targetWord": "PARSER",
        "length": 6,
        "bridgeClue": "⚡ LINKED FROM NODE 02 [HEAP] ➔ Starts with the ending letter 'P'.",
        "prompt": "Software compiler component that analyzes a sequence of tokens according to a formal grammar to build an AST.",
        "hint": "JSON.parse engine; syntactic analyzer.",
        "acceptedAnswers": [
          "parser"
        ]
      },
      {
        "id": "r2_pul_4",
        "nodeNumber": 4,
        "category": "🗺️ Network Paths",
        "targetWord": "ROUTE",
        "length": 5,
        "bridgeClue": "⚡ LINKED FROM NODE 03 [PARSER] ➔ Starts with the ending letter 'R'.",
        "prompt": "Course taken in getting from a starting point to a destination across network routers or Express URL handlers.",
        "hint": "app.get('/api/users') defines an API ______.",
        "acceptedAnswers": [
          "route"
        ]
      },
      {
        "id": "r2_pul_5",
        "nodeNumber": 5,
        "category": "⚡ Asynchronous Core",
        "targetWord": "EVENT",
        "length": 5,
        "bridgeClue": "⚡ LINKED FROM NODE 04 [ROUTE] ➔ Starts with the ending letter 'E'.",
        "prompt": "Action or occurrence recognized by software, often originating from hardware (mouse clicks, incoming packets).",
        "hint": "______ driven architecture; addEventListener.",
        "acceptedAnswers": [
          "event"
        ]
      },
      {
        "id": "r2_pul_6",
        "nodeNumber": 6,
        "category": "🧵 Concurrency",
        "targetWord": "THREAD",
        "length": 6,
        "bridgeClue": "⚡ LINKED FROM NODE 05 [EVENT] ➔ Starts with the ending letter 'T'.",
        "prompt": "The smallest sequence of programmed instructions that can be managed independently by an OS scheduler.",
        "hint": "Multi-______ing; needle and cotton strand metaphor.",
        "acceptedAnswers": [
          "thread"
        ]
      },
      {
        "id": "r2_pul_7",
        "nodeNumber": 7,
        "category": "🐳 Containers",
        "targetWord": "DOCKER",
        "length": 6,
        "bridgeClue": "⚡ LINKED FROM NODE 06 [THREAD] ➔ Starts with the ending letter 'D'.",
        "prompt": "Open platform that packages applications and their dependencies into lightweight, portable software containers.",
        "hint": "Blue whale icon carrying shipping containers.",
        "acceptedAnswers": [
          "docker"
        ]
      },
      {
        "id": "r2_pul_8",
        "nodeNumber": 8,
        "category": "⚡ Key-Value Cache",
        "targetWord": "REDIS",
        "length": 5,
        "bridgeClue": "⚡ LINKED FROM NODE 07 [DOCKER] ➔ Starts with the ending letter 'R'.",
        "prompt": "In-memory data structure store used as a distributed, in-memory key-value database, cache, and message broker.",
        "hint": "REmote DIctionary Server; ultra-fast RAM cache.",
        "acceptedAnswers": [
          "redis"
        ]
      },
      {
        "id": "r2_pul_9",
        "nodeNumber": 9,
        "category": "📜 Automation Code",
        "targetWord": "SCRIPT",
        "length": 6,
        "bridgeClue": "⚡ LINKED FROM NODE 08 [REDIS] ➔ Starts with the ending letter 'S'.",
        "prompt": "List of commands or code written for a run-time system or shell interpreter without explicit ahead-of-time compilation.",
        "hint": "Bash / Java______ / Shell program.",
        "acceptedAnswers": [
          "script"
        ]
      },
      {
        "id": "r2_pul_10",
        "nodeNumber": 10,
        "category": "👑 FINAL BOSS OVERRIDE",
        "targetWord": "TROJAN",
        "length": 6,
        "bridgeClue": "⚡ MASTER CORE OVERRIDE: Breached starting from 'T' to neutralize the ancient malware decoy.",
        "prompt": "Malware disguised as legitimate software named after the hollow wooden horse deceit in Homer's Greek mythology.",
        "hint": "______ Horse virus; masquerading threat.",
        "acceptedAnswers": [
          "trojan"
        ]
      }
    ]
  },
  {
    "setId": "r2_circuit_aurora",
    "theme": "Circuit Iota: Aurora Mainframe",
    "steps": [
      {
        "id": "r2_aur_1",
        "nodeNumber": 1,
        "category": "🗄️ Database Language",
        "targetWord": "QUERY",
        "length": 5,
        "bridgeClue": "⚡ ENTRY KEY: Initial database interrogation key to breach Aurora.",
        "prompt": "A formal request for information retrieval from a database table using SELECT statements in SQL.",
        "hint": "Search string or question posed to a dataset.",
        "acceptedAnswers": [
          "query"
        ]
      },
      {
        "id": "r2_aur_2",
        "nodeNumber": 2,
        "category": "⚡ Generators",
        "targetWord": "YIELD",
        "length": 5,
        "bridgeClue": "⚡ LINKED FROM NODE 01 [QUERY] ➔ Starts with the ending letter 'Y'.",
        "prompt": "Keyword in Python, JavaScript, and C# used in generator functions to pause execution and return an intermediate value.",
        "hint": "Traffic give-way sign; to produce crop or interest.",
        "acceptedAnswers": [
          "yield"
        ]
      },
      {
        "id": "r2_aur_3",
        "nodeNumber": 3,
        "category": "👹 Background Services",
        "targetWord": "DAEMON",
        "length": 6,
        "bridgeClue": "⚡ LINKED FROM NODE 02 [YIELD] ➔ Starts with the ending letter 'D'.",
        "prompt": "Unix background process that runs unobtrusively without direct user control (often ending in 'd', like sshd, systemd).",
        "hint": "Pronounced \"demon\"; Maxwell's helpful helper entity.",
        "acceptedAnswers": [
          "daemon"
        ]
      },
      {
        "id": "r2_aur_4",
        "nodeNumber": 4,
        "category": "📱 Architecture",
        "targetWord": "NATIVE",
        "length": 6,
        "bridgeClue": "⚡ LINKED FROM NODE 03 [DAEMON] ➔ Starts with the ending letter 'N'.",
        "prompt": "Software compiled to run directly on specific host processor hardware rather than through emulation or translation.",
        "hint": "React ______; indigenous or original to the land.",
        "acceptedAnswers": [
          "native"
        ]
      },
      {
        "id": "r2_aur_5",
        "nodeNumber": 5,
        "category": "🔒 Cryptography",
        "targetWord": "ENCODE",
        "length": 6,
        "bridgeClue": "⚡ LINKED FROM NODE 04 [NATIVE] ➔ Starts with the ending letter 'E'.",
        "prompt": "To convert data into a specialized format or cipher representation (e.g. Base64, UTF-8, JSON).",
        "hint": "Opposite of decode.",
        "acceptedAnswers": [
          "encode"
        ]
      },
      {
        "id": "r2_aur_6",
        "nodeNumber": 6,
        "category": "🔊 Command Line",
        "targetWord": "ECHO",
        "length": 4,
        "bridgeClue": "⚡ LINKED FROM NODE 05 [ENCODE] ➔ Starts with the letters 'EC'.",
        "prompt": "Shell command in DOS, Bash, and Linux used to repeat or print a line of text or string variable to stdout.",
        "hint": "Sound reflection off canyon walls; echo \"Hello World\".",
        "acceptedAnswers": [
          "echo"
        ]
      },
      {
        "id": "r2_aur_7",
        "nodeNumber": 7,
        "category": "🧱 OOP Entities",
        "targetWord": "OBJECT",
        "length": 6,
        "bridgeClue": "⚡ LINKED FROM NODE 06 [ECHO] ➔ Starts with the ending letter 'O'.",
        "prompt": "Instance of a class containing state in fields and behavior in methods within object-oriented programming.",
        "hint": "Physical thing; JSON (JavaScript ______ Notation).",
        "acceptedAnswers": [
          "object"
        ]
      },
      {
        "id": "r2_aur_8",
        "nodeNumber": 8,
        "category": "📐 Deep Learning",
        "targetWord": "TENSOR",
        "length": 6,
        "bridgeClue": "⚡ LINKED FROM NODE 07 [OBJECT] ➔ Starts with the ending letter 'T'.",
        "prompt": "Multi-dimensional numerical array generalizing scalars, vectors, and matrices used in PyTorch and Google's framework.",
        "hint": "______Flow library; TPU hardware.",
        "acceptedAnswers": [
          "tensor"
        ]
      },
      {
        "id": "r2_aur_9",
        "nodeNumber": 9,
        "category": "🎨 Visual Graphics",
        "targetWord": "RENDER",
        "length": 6,
        "bridgeClue": "⚡ LINKED FROM NODE 08 [TENSOR] ➔ Starts with the ending letter 'R'.",
        "prompt": "The process of generating a 2D raster image or web DOM view from a model or code representation.",
        "hint": "Browser drawing pipeline; 3D CGI video generation.",
        "acceptedAnswers": [
          "render"
        ]
      },
      {
        "id": "r2_aur_10",
        "nodeNumber": 10,
        "category": "👑 FINAL BOSS OVERRIDE",
        "targetWord": "ROOT",
        "length": 4,
        "bridgeClue": "⚡ MASTER CORE OVERRIDE: Link the supreme superuser directory to neutralize Aurora.",
        "prompt": "The top-level base directory (/) in Unix filesystems, or the all-powerful superuser administrator account.",
        "hint": "Square ______; tree anchor under ground; UID 0.",
        "acceptedAnswers": [
          "root"
        ]
      }
    ]
  },
  {
    "setId": "r2_circuit_nebula",
    "theme": "Circuit Kappa: Nebula Core",
    "steps": [
      {
        "id": "r2_neb_1",
        "nodeNumber": 1,
        "category": "🔢 Fundamental Logic",
        "targetWord": "BINARY",
        "length": 6,
        "bridgeClue": "⚡ ENTRY KEY: Initial base-2 cipher key to breach Nebula.",
        "prompt": "Positional numeral system employing 2 as its base, expressing numbers using only digits 0 and 1.",
        "hint": "Machine code bits; dual-choice logic.",
        "acceptedAnswers": [
          "binary"
        ]
      },
      {
        "id": "r2_neb_2",
        "nodeNumber": 2,
        "category": "📦 Package Managers",
        "targetWord": "YARN",
        "length": 4,
        "bridgeClue": "⚡ LINKED FROM NODE 01 [BINARY] ➔ Starts with the ending letter 'Y'.",
        "prompt": "Fast, reliable JavaScript package manager created by Facebook as a deterministic alternative to NPM.",
        "hint": "Spun thread used for knitting cat sweaters.",
        "acceptedAnswers": [
          "yarn"
        ]
      },
      {
        "id": "r2_neb_3",
        "nodeNumber": 3,
        "category": "🌐 Reverse Proxy",
        "targetWord": "NGINX",
        "length": 5,
        "bridgeClue": "⚡ LINKED FROM NODE 02 [YARN] ➔ Starts with the ending letter 'N'.",
        "prompt": "High-performance HTTP web server, reverse proxy, and load balancer designed by Igor Sysoev to solve the C10K problem.",
        "hint": "Pronounced \"Engine-X\"; green logo.",
        "acceptedAnswers": [
          "nginx"
        ]
      },
      {
        "id": "r2_neb_4",
        "nodeNumber": 4,
        "category": "📜 Document Tech",
        "targetWord": "XEROX",
        "length": 5,
        "bridgeClue": "⚡ LINKED FROM NODE 03 [NGINX] ➔ Starts with the ending letter 'X'.",
        "prompt": "Famous tech corporation whose PARC laboratory invented the mouse, Ethernet, and graphical user interface.",
        "hint": "Photocopying pioneer founded in Rochester.",
        "acceptedAnswers": [
          "xerox"
        ]
      },
      {
        "id": "r2_neb_5",
        "nodeNumber": 5,
        "category": "🏷️ Markup Language",
        "targetWord": "XML",
        "length": 3,
        "bridgeClue": "⚡ LINKED FROM NODE 04 [XEROX] ➔ Starts with 'X'.",
        "prompt": "Extensible Markup Language defining a set of rules for encoding documents in both human and machine-readable tags.",
        "hint": "Tags with <element>content</element>; older SOAP format.",
        "acceptedAnswers": [
          "xml"
        ]
      },
      {
        "id": "r2_neb_6",
        "nodeNumber": 6,
        "category": "🐧 Operating Systems",
        "targetWord": "LINUX",
        "length": 5,
        "bridgeClue": "⚡ LINKED FROM NODE 05 [XML] ➔ Starts with the ending letter 'L'.",
        "prompt": "Open-source Unix-like monolithic operating system kernel released by Linus Torvalds in September 1991.",
        "hint": "Tux the penguin mascot; powers Android and AWS servers.",
        "acceptedAnswers": [
          "linux"
        ]
      },
      {
        "id": "r2_neb_7",
        "nodeNumber": 7,
        "category": "🛠️ Apple Developer IDE",
        "targetWord": "XCODE",
        "length": 5,
        "bridgeClue": "⚡ LINKED FROM NODE 06 [LINUX] ➔ Starts with the ending letter 'X'.",
        "prompt": "Apple's integrated development environment containing a suite of software development tools for macOS, iOS, and watchOS.",
        "hint": "Blueprint icon with a hammer; builds Swift apps.",
        "acceptedAnswers": [
          "xcode"
        ]
      },
      {
        "id": "r2_neb_8",
        "nodeNumber": 8,
        "category": "⛓️ Cryptocurrencies",
        "targetWord": "ETHER",
        "length": 5,
        "bridgeClue": "⚡ LINKED FROM NODE 07 [XCODE] ➔ Starts with the ending letter 'E'.",
        "prompt": "The native cryptocurrency token of the Ethereum blockchain platform used to pay transaction gas fees.",
        "hint": "Ticking ticker symbol ETH; mythical sky element.",
        "acceptedAnswers": [
          "ether"
        ]
      },
      {
        "id": "r2_neb_9",
        "nodeNumber": 9,
        "category": "🚀 High Speed Protocols",
        "targetWord": "HYPER",
        "length": 5,
        "bridgeClue": "⚡ LINKED FROM NODE 08 [ETHER] ➔ Links via prefix with 'H'.",
        "prompt": "Prefix in HTTP and HTML denoting non-linear interconnected access to digital media and documents.",
        "hint": "______text Transfer Protocol; energetic child state.",
        "acceptedAnswers": [
          "hyper"
        ]
      },
      {
        "id": "r2_neb_10",
        "nodeNumber": 10,
        "category": "👑 FINAL BOSS OVERRIDE",
        "targetWord": "FIREWALL",
        "length": 8,
        "bridgeClue": "⚡ MASTER CORE OVERRIDE: Link the perimeter security barrier to breach Nebula.",
        "prompt": "Network security system that monitors and controls incoming and outgoing network traffic based on predetermined rules.",
        "hint": "Physical masonry wall preventing flame spread; packet filter.",
        "acceptedAnswers": [
          "firewall"
        ]
      }
    ]
  },
  {
    "setId": "r2_circuit_titan",
    "theme": "Circuit Lambda: Titan Conduit",
    "steps": [
      {
        "id": "r2_tit_1",
        "nodeNumber": 1,
        "category": "🧠 Reasoning",
        "targetWord": "LOGIC",
        "length": 5,
        "bridgeClue": "⚡ ENTRY KEY: Initial formal reasoning key to breach Titan Conduit.",
        "prompt": "Systematic study of valid inference, truth tables, and Boolean algebraic gates in computer circuits.",
        "hint": "AND, OR, NOT operations; rational deduction.",
        "acceptedAnswers": [
          "logic"
        ]
      },
      {
        "id": "r2_tit_2",
        "nodeNumber": 2,
        "category": "🐙 Version Control",
        "targetWord": "CLONE",
        "length": 5,
        "bridgeClue": "⚡ LINKED FROM NODE 01 [LOGIC] ➔ Starts with the ending letter 'C'.",
        "prompt": "Git command that creates a local copy of an existing remote repository onto your personal machine.",
        "hint": "git ______ <url>; exact biological duplicate.",
        "acceptedAnswers": [
          "clone"
        ]
      },
      {
        "id": "r2_tit_3",
        "nodeNumber": 3,
        "category": "🚪 Gateways",
        "targetWord": "ENTRY",
        "length": 5,
        "bridgeClue": "⚡ LINKED FROM NODE 02 [CLONE] ➔ Starts with the ending letter 'E'.",
        "prompt": "Point of initialization into an executable program (e.g. main() function or index.js root file).",
        "hint": "______point; doorway or threshold.",
        "acceptedAnswers": [
          "entry"
        ]
      },
      {
        "id": "r2_tit_4",
        "nodeNumber": 4,
        "category": "⚡ Async Coroutines",
        "targetWord": "YIELD",
        "length": 5,
        "bridgeClue": "⚡ LINKED FROM NODE 03 [ENTRY] ➔ Starts with the ending letter 'Y'.",
        "prompt": "Instruction that relinquishes CPU execution in coroutines and generators, producing a value to the caller.",
        "hint": "To surrender or produce crops.",
        "acceptedAnswers": [
          "yield"
        ]
      },
      {
        "id": "r2_tit_5",
        "nodeNumber": 5,
        "category": "💾 Storage Hardware",
        "targetWord": "DRIVE",
        "length": 5,
        "bridgeClue": "⚡ LINKED FROM NODE 04 [YIELD] ➔ Starts with the ending letter 'D'.",
        "prompt": "Hardware storage peripheral for reading and writing data (e.g. Hard Disk ______, Solid State ______ or USB flash).",
        "hint": "To operate an automobile; Google Cloud storage service.",
        "acceptedAnswers": [
          "drive"
        ]
      },
      {
        "id": "r2_tit_6",
        "nodeNumber": 6,
        "category": "🔢 Enumerable Sets",
        "targetWord": "ENUM",
        "length": 4,
        "bridgeClue": "⚡ LINKED FROM NODE 05 [DRIVE] ➔ Starts with the ending letter 'E'.",
        "prompt": "Special data type in TypeScript, Java, and C enabling a variable to be a set of predefined named constants.",
        "hint": "Short for enumeration.",
        "acceptedAnswers": [
          "enum"
        ]
      },
      {
        "id": "r2_tit_7",
        "nodeNumber": 7,
        "category": "🖱️ Peripherals",
        "targetWord": "MOUSE",
        "length": 5,
        "bridgeClue": "⚡ LINKED FROM NODE 06 [ENUM] ➔ Starts with the ending letter 'M'.",
        "prompt": "Handheld pointing device invented by Douglas Engelbart in 1964 with an optical laser sensor and click buttons.",
        "hint": "Cheese-eating rodent; controls desktop cursor.",
        "acceptedAnswers": [
          "mouse"
        ]
      },
      {
        "id": "r2_tit_8",
        "nodeNumber": 8,
        "category": "✉️ Electronic Mail",
        "targetWord": "EMAIL",
        "length": 5,
        "bridgeClue": "⚡ LINKED FROM NODE 07 [MOUSE] ➔ Starts with the ending letter 'E'.",
        "prompt": "Digital correspondence sent over networks via SMTP protocol invented by Ray Tomlinson in 1971.",
        "hint": "Electronic letters sent to inbox.",
        "acceptedAnswers": [
          "email"
        ]
      },
      {
        "id": "r2_tit_9",
        "nodeNumber": 9,
        "category": "⏱️ Network Delay",
        "targetWord": "LATENCY",
        "length": 7,
        "bridgeClue": "⚡ LINKED FROM NODE 08 [EMAIL] ➔ Starts with the ending letter 'L'.",
        "prompt": "Time delay between a stimulus and the response in a network packet round trip, measured in milliseconds (ping).",
        "hint": "Low ______ gaming; lag.",
        "acceptedAnswers": [
          "latency"
        ]
      },
      {
        "id": "r2_tit_10",
        "nodeNumber": 10,
        "category": "👑 FINAL BOSS OVERRIDE",
        "targetWord": "YARD",
        "length": 4,
        "bridgeClue": "⚡ MASTER CORE OVERRIDE: Link the boundary enclosure starting with 'Y'.",
        "prompt": "Unit of linear measurement equal to 3 feet or 36 inches, or an enclosed plot of land around a building.",
        "hint": "Back______; 36 inches.",
        "acceptedAnswers": [
          "yard"
        ]
      }
    ]
  },
  {
    "setId": "r2_circuit_chronos",
    "theme": "Circuit Mu: Chronos Bastion",
    "steps": [
      {
        "id": "r2_chr_1",
        "nodeNumber": 1,
        "category": "⏱️ Silicon Frequency",
        "targetWord": "CLOCK",
        "length": 5,
        "bridgeClue": "⚡ ENTRY KEY: Initial CPU quartz crystal timing key.",
        "prompt": "Internal quartz oscillator circuit in a microchip that coordinates the timing of all arithmetic logic unit operations.",
        "hint": "Wall timepiece; measured in GHz.",
        "acceptedAnswers": [
          "clock"
        ]
      },
      {
        "id": "r2_chr_2",
        "nodeNumber": 2,
        "category": "🐧 OS Core",
        "targetWord": "KERNEL",
        "length": 6,
        "bridgeClue": "⚡ LINKED FROM NODE 01 [CLOCK] ➔ Starts with the ending letter 'K'.",
        "prompt": "The foundational core software component of an operating system possessing complete control over all hardware.",
        "hint": "Center of a popcorn seed; Linux or Mach ______.",
        "acceptedAnswers": [
          "kernel"
        ]
      },
      {
        "id": "r2_chr_3",
        "nodeNumber": 3,
        "category": "🍃 Tree Structures",
        "targetWord": "LEAF",
        "length": 4,
        "bridgeClue": "⚡ LINKED FROM NODE 02 [KERNEL] ➔ Starts with the ending letter 'L'.",
        "prompt": "In graph and tree data structures, a node that possesses no children or downstream edges.",
        "hint": "Green foliage on a plant branch.",
        "acceptedAnswers": [
          "leaf"
        ]
      },
      {
        "id": "r2_chr_4",
        "nodeNumber": 4,
        "category": "🔢 IEEE Precision",
        "targetWord": "FLOAT",
        "length": 5,
        "bridgeClue": "⚡ LINKED FROM NODE 03 [LEAF] ➔ Starts with the ending letter 'F'.",
        "prompt": "IEEE 754 decimal data type using sign, mantissa, and exponent to represent real numbers with fractional components.",
        "hint": "To rest on the surface of liquid; 32-bit floating point.",
        "acceptedAnswers": [
          "float"
        ]
      },
      {
        "id": "r2_chr_5",
        "nodeNumber": 5,
        "category": "📊 Data Grid",
        "targetWord": "TABLE",
        "length": 5,
        "bridgeClue": "⚡ LINKED FROM NODE 04 [FLOAT] ➔ Starts with the ending letter 'T'.",
        "prompt": "Two-dimensional matrix arrangement of rows and columns containing structured data records in SQL databases.",
        "hint": "Furniture with four legs to eat upon.",
        "acceptedAnswers": [
          "table"
        ]
      },
      {
        "id": "r2_chr_6",
        "nodeNumber": 6,
        "category": "📈 Spreadsheet King",
        "targetWord": "EXCEL",
        "length": 5,
        "bridgeClue": "⚡ LINKED FROM NODE 05 [TABLE] ➔ Starts with the ending letter 'E'.",
        "prompt": "Microsoft's ubiquitous spreadsheet software application utilizing cell formulas, VLOOKUP, and pivot tables.",
        "hint": "To be exceptionally good at something; .xlsx file.",
        "acceptedAnswers": [
          "excel"
        ]
      },
      {
        "id": "r2_chr_7",
        "nodeNumber": 7,
        "category": "⚖️ Traffic Distribution",
        "targetWord": "LOAD",
        "length": 4,
        "bridgeClue": "⚡ LINKED FROM NODE 06 [EXCEL] ➔ Starts with the ending letter 'L'.",
        "prompt": "The amount of computational work, memory usage, or network requests currently handled by a server.",
        "hint": "______ Balancer; heavy burden.",
        "acceptedAnswers": [
          "load"
        ]
      },
      {
        "id": "r2_chr_8",
        "nodeNumber": 8,
        "category": "💾 Memory Inspection",
        "targetWord": "DUMP",
        "length": 4,
        "bridgeClue": "⚡ LINKED FROM NODE 07 [LOAD] ➔ Starts with the ending letter 'D'.",
        "prompt": "A recorded snapshot of computer volatile memory at a specific moment in time (e.g. core dump or heap dump).",
        "hint": "To discard trash; database backup export.",
        "acceptedAnswers": [
          "dump"
        ]
      },
      {
        "id": "r2_chr_9",
        "nodeNumber": 9,
        "category": "🩹 Software Updates",
        "targetWord": "PATCH",
        "length": 5,
        "bridgeClue": "⚡ LINKED FROM NODE 08 [DUMP] ➔ Starts with the ending letter 'P'.",
        "prompt": "A quick software update or code diff applied directly to fix bugs, vulnerabilities, or improve system security.",
        "hint": "Fabric sewn over a torn knee; minor version hotfix.",
        "acceptedAnswers": [
          "patch"
        ]
      },
      {
        "id": "r2_chr_10",
        "nodeNumber": 10,
        "category": "👑 FINAL BOSS OVERRIDE",
        "targetWord": "HELIX",
        "length": 5,
        "bridgeClue": "⚡ MASTER CORE OVERRIDE: Link the double spiral geometry to neutralize Chronos.",
        "prompt": "Three-dimensional smooth spiral curve, famously forming the geometric structure of DNA molecular strands.",
        "hint": "Double ______; corkscrew shape.",
        "acceptedAnswers": [
          "helix"
        ]
      }
    ]
  },
  {
    "setId": "r2_circuit_zenith",
    "theme": "Circuit Nu: Zenith Network",
    "steps": [
      {
        "id": "r2_zen_1",
        "nodeNumber": 1,
        "category": "💡 High Speed Optics",
        "targetWord": "FIBER",
        "length": 5,
        "bridgeClue": "⚡ ENTRY KEY: Initial high-speed light conduit key.",
        "prompt": "Glass or plastic threads that transmit broadband digital data signals as rapid pulses of light over vast distances.",
        "hint": "Optical ______ internet; dietary roughage.",
        "acceptedAnswers": [
          "fiber",
          "fibre"
        ]
      },
      {
        "id": "r2_zen_2",
        "nodeNumber": 2,
        "category": "📡 Hardware Gateways",
        "targetWord": "ROUTER",
        "length": 6,
        "bridgeClue": "⚡ LINKED FROM NODE 01 [FIBER] ➔ Starts with the ending letter 'R'.",
        "prompt": "Networking device that forwards data packets between computer networks using routing tables and IP addresses.",
        "hint": "Wi-Fi box with blinking antennas.",
        "acceptedAnswers": [
          "router"
        ]
      },
      {
        "id": "r2_zen_3",
        "nodeNumber": 3,
        "category": "🔍 Pattern Matching",
        "targetWord": "REGEX",
        "length": 5,
        "bridgeClue": "⚡ LINKED FROM NODE 02 [ROUTER] ➔ Starts with the ending letter 'R'.",
        "prompt": "Sequence of characters that specifies a search pattern in text, utilizing metacharacters like ^, $, and *.",
        "hint": "Short for Regular Expression.",
        "acceptedAnswers": [
          "regex"
        ]
      },
      {
        "id": "r2_zen_4",
        "nodeNumber": 4,
        "category": "🧪 Nobel Gases",
        "targetWord": "XENON",
        "length": 5,
        "bridgeClue": "⚡ LINKED FROM NODE 03 [REGEX] ➔ Starts with the ending letter 'X'.",
        "prompt": "Heavy noble gas with atomic number 54 used in flash lamps and ion propulsion thrusters on satellites.",
        "hint": "Element symbol Xe.",
        "acceptedAnswers": [
          "xenon"
        ]
      },
      {
        "id": "r2_zen_5",
        "nodeNumber": 5,
        "category": "🚫 Absence of Value",
        "targetWord": "NULL",
        "length": 4,
        "bridgeClue": "⚡ LINKED FROM NODE 04 [XENON] ➔ Starts with the ending letter 'N'.",
        "prompt": "A special built-in primitive pointer value in programming representing the intentional absence of any object value.",
        "hint": "Tony Hoare's \"billion dollar mistake\"; empty pointer.",
        "acceptedAnswers": [
          "null"
        ]
      },
      {
        "id": "r2_zen_6",
        "nodeNumber": 6,
        "category": "🔗 Hypertext Bridges",
        "targetWord": "LINK",
        "length": 4,
        "bridgeClue": "⚡ LINKED FROM NODE 05 [NULL] ➔ Starts with the ending letter 'L'.",
        "prompt": "A clickable reference or URL connecting one web document or page to another resource across the internet.",
        "hint": "Hyper______; chain loop; Zelda hero.",
        "acceptedAnswers": [
          "link"
        ]
      },
      {
        "id": "r2_zen_7",
        "nodeNumber": 7,
        "category": "📨 Stream Messaging",
        "targetWord": "KAFKA",
        "length": 5,
        "bridgeClue": "⚡ LINKED FROM NODE 06 [LINK] ➔ Starts with the ending letter 'K'.",
        "prompt": "Apache distributed event streaming platform for high-performance data pipelines, streaming analytics, and data integration.",
        "hint": "Named after Franz Kafka, author of The Metamorphosis.",
        "acceptedAnswers": [
          "kafka"
        ]
      },
      {
        "id": "r2_zen_8",
        "nodeNumber": 8,
        "category": "⚡ Non-Blocking Execution",
        "targetWord": "ASYNC",
        "length": 5,
        "bridgeClue": "⚡ LINKED FROM NODE 07 [KAFKA] ➔ Starts with the ending letter 'A'.",
        "prompt": "Programming paradigm where operations run concurrently in the background without freezing the execution thread.",
        "hint": "______ / await keywords in modern JavaScript.",
        "acceptedAnswers": [
          "async"
        ]
      },
      {
        "id": "r2_zen_9",
        "nodeNumber": 9,
        "category": "⏰ Scheduled Tasks",
        "targetWord": "CRON",
        "length": 4,
        "bridgeClue": "⚡ LINKED FROM NODE 08 [ASYNC] ➔ Starts with the ending letter 'C'.",
        "prompt": "Time-based job scheduler daemon in Unix-like computer operating systems (e.g. running crontab entries).",
        "hint": "From the Greek word chronos for time.",
        "acceptedAnswers": [
          "cron"
        ]
      },
      {
        "id": "r2_zen_10",
        "nodeNumber": 10,
        "category": "👑 FINAL BOSS OVERRIDE",
        "targetWord": "NETWORK",
        "length": 7,
        "bridgeClue": "⚡ MASTER CORE OVERRIDE: Link the grand web of interconnected hosts starting with 'N'.",
        "prompt": "A group of two or more computers connected together using wireless media or cables to share resources and exchange data.",
        "hint": "LAN, WAN; social connections web.",
        "acceptedAnswers": [
          "network"
        ]
      }
    ]
  },
  {
    "setId": "r2_circuit_hyperion",
    "theme": "Circuit Xi: Hyperion Array",
    "steps": [
      {
        "id": "r2_hyp_1",
        "nodeNumber": 1,
        "category": "📥 User Entry",
        "targetWord": "INPUT",
        "length": 5,
        "bridgeClue": "⚡ ENTRY KEY: Initial user signal entry key.",
        "prompt": "Data provided by a user or peripheral to a computer program for processing (e.g. HTML form input field).",
        "hint": "Opposite of output.",
        "acceptedAnswers": [
          "input"
        ]
      },
      {
        "id": "r2_hyp_2",
        "nodeNumber": 2,
        "category": "🔤 Natural Language Tokens",
        "targetWord": "TOKEN",
        "length": 5,
        "bridgeClue": "⚡ LINKED FROM NODE 01 [INPUT] ➔ Starts with the ending letter 'T'.",
        "prompt": "The basic unit of text (word, subword, or character) processed by Large Language Model tokenizers.",
        "hint": "JWT authentication ______; arcade game coin.",
        "acceptedAnswers": [
          "token"
        ]
      },
      {
        "id": "r2_hyp_3",
        "nodeNumber": 3,
        "category": "📱 Embedded OS",
        "targetWord": "NATIVE",
        "length": 6,
        "bridgeClue": "⚡ LINKED FROM NODE 02 [TOKEN] ➔ Starts with the ending letter 'N'.",
        "prompt": "Code developed exclusively for a target operating system platform with direct access to hardware APIs.",
        "hint": "Native iOS Swift or Android Kotlin app.",
        "acceptedAnswers": [
          "native"
        ]
      },
      {
        "id": "r2_hyp_4",
        "nodeNumber": 4,
        "category": "🔊 Terminal Voice",
        "targetWord": "ECHO",
        "length": 4,
        "bridgeClue": "⚡ LINKED FROM NODE 03 [NATIVE] ➔ Starts with the ending letter 'E'.",
        "prompt": "Unix command used to print strings and variables directly to the terminal output window.",
        "hint": "Echo chamber; bouncing audio waves.",
        "acceptedAnswers": [
          "echo"
        ]
      },
      {
        "id": "r2_hyp_5",
        "nodeNumber": 5,
        "category": "🔢 Byte Groupings",
        "targetWord": "OCTET",
        "length": 5,
        "bridgeClue": "⚡ LINKED FROM NODE 04 [ECHO] ➔ Starts with the ending letter 'O'.",
        "prompt": "A group of eight bits in computing and telecommunications, forming the 4 numerical segments in an IPv4 address.",
        "hint": "Musical ensemble of eight performers; 8-bit byte.",
        "acceptedAnswers": [
          "octet"
        ]
      },
      {
        "id": "r2_hyp_6",
        "nodeNumber": 6,
        "category": "📐 Matrix Math",
        "targetWord": "TENSOR",
        "length": 6,
        "bridgeClue": "⚡ LINKED FROM NODE 05 [OCTET] ➔ Starts with the ending letter 'T'.",
        "prompt": "A generalized algebraic container of numerical values organized along zero or more spatial dimensions.",
        "hint": "Google's TPU processor engine; PyTorch tensor.",
        "acceptedAnswers": [
          "tensor"
        ]
      },
      {
        "id": "r2_hyp_7",
        "nodeNumber": 7,
        "category": "📊 Math Bases",
        "targetWord": "RADIX",
        "length": 5,
        "bridgeClue": "⚡ LINKED FROM NODE 06 [TENSOR] ➔ Starts with the ending letter 'R'.",
        "prompt": "The base of a positional numeral system specifying the number of unique digits (e.g. 10 for decimal, 2 for binary).",
        "hint": "______ sort algorithm.",
        "acceptedAnswers": [
          "radix"
        ]
      },
      {
        "id": "r2_hyp_8",
        "nodeNumber": 8,
        "category": "🖨️ Document Innovations",
        "targetWord": "XEROX",
        "length": 5,
        "bridgeClue": "⚡ LINKED FROM NODE 07 [RADIX] ➔ Starts with the ending letter 'X'.",
        "prompt": "The iconic Palo Alto Research Center laboratory that pioneered GUI interfaces and laser printing.",
        "hint": "Photocopy company.",
        "acceptedAnswers": [
          "xerox"
        ]
      },
      {
        "id": "r2_hyp_9",
        "nodeNumber": 9,
        "category": "🔬 Synthetic Compounds",
        "targetWord": "XYLON",
        "length": 5,
        "bridgeClue": "⚡ LINKED FROM NODE 08 [XEROX] ➔ Starts with 'X'.",
        "prompt": "High-strength synthetic polymer or wood-derived organic chemical compound prefix in material science.",
        "hint": "5-letter word starting with X.",
        "acceptedAnswers": [
          "xylon"
        ]
      },
      {
        "id": "r2_hyp_10",
        "nodeNumber": 10,
        "category": "👑 FINAL BOSS OVERRIDE",
        "targetWord": "CIPHER",
        "length": 6,
        "bridgeClue": "⚡ MASTER CORE OVERRIDE: Link the cryptographic algorithm starting with 'C'.",
        "prompt": "An algorithm for performing encryption or decryption—a series of well-defined mathematical steps used to secure secrets.",
        "hint": "Caesar ______; secret encrypted text.",
        "acceptedAnswers": [
          "cipher"
        ]
      }
    ]
  },
  {
    "setId": "r2_circuit_solaris",
    "theme": "Circuit Omicron: Solaris Grid",
    "steps": [
      {
        "id": "r2_sol_1",
        "nodeNumber": 1,
        "category": "☀️ Photovoltaic Power",
        "targetWord": "SOLAR",
        "length": 5,
        "bridgeClue": "⚡ ENTRY KEY: Initial radiant photon energy key.",
        "prompt": "Renewable energy derived directly from the radiation and rays emitted by the sun.",
        "hint": "______ panel; solar eclipse.",
        "acceptedAnswers": [
          "solar"
        ]
      },
      {
        "id": "r2_sol_2",
        "nodeNumber": 2,
        "category": "📡 Switch Signals",
        "targetWord": "RELAY",
        "length": 5,
        "bridgeClue": "⚡ LINKED FROM NODE 01 [SOLAR] ➔ Starts with the ending letter 'R'.",
        "prompt": "An electrically operated switch used to control a circuit by a separate low-power signal or to repeat transmissions.",
        "hint": "Athletic race passing a baton.",
        "acceptedAnswers": [
          "relay"
        ]
      },
      {
        "id": "r2_sol_3",
        "nodeNumber": 3,
        "category": "⚡ Control Yield",
        "targetWord": "YIELD",
        "length": 5,
        "bridgeClue": "⚡ LINKED FROM NODE 02 [RELAY] ➔ Starts with the ending letter 'Y'.",
        "prompt": "To produce, provide, or temporarily hand over control back to the caller in generator routines.",
        "hint": "Give way sign.",
        "acceptedAnswers": [
          "yield"
        ]
      },
      {
        "id": "r2_sol_4",
        "nodeNumber": 4,
        "category": "💾 Disk Volumes",
        "targetWord": "DRIVE",
        "length": 5,
        "bridgeClue": "⚡ LINKED FROM NODE 03 [YIELD] ➔ Starts with the ending letter 'D'.",
        "prompt": "Storage volume mounted into the file system (e.g. C: ______ in Windows, /dev/sda in Linux).",
        "hint": "To steer a vehicle.",
        "acceptedAnswers": [
          "drive"
        ]
      },
      {
        "id": "r2_sol_5",
        "nodeNumber": 5,
        "category": "⚡ System Trigger",
        "targetWord": "EVENT",
        "length": 5,
        "bridgeClue": "⚡ LINKED FROM NODE 04 [DRIVE] ➔ Starts with the ending letter 'E'.",
        "prompt": "An incident, keystroke, network message, or trigger picked up by the browser event loop.",
        "hint": "Special happening or celebration.",
        "acceptedAnswers": [
          "event"
        ]
      },
      {
        "id": "r2_sol_6",
        "nodeNumber": 6,
        "category": "📦 Immutable Sequence",
        "targetWord": "TUPLE",
        "length": 5,
        "bridgeClue": "⚡ LINKED FROM NODE 05 [EVENT] ➔ Starts with the ending letter 'T'.",
        "prompt": "An ordered, immutable sequence of elements enclosed in parentheses in Python and mathematics.",
        "hint": "(x, y, z) coordinate bundle.",
        "acceptedAnswers": [
          "tuple"
        ]
      },
      {
        "id": "r2_sol_7",
        "nodeNumber": 7,
        "category": "🐧 Server OS",
        "targetWord": "LINUX",
        "length": 5,
        "bridgeClue": "⚡ LINKED FROM NODE 06 [TUPLE] ➔ Starts with the letter 'L'.",
        "prompt": "Free, open-source operating system kernel created by Linus Torvalds that powers modern cloud computing.",
        "hint": "Tux penguin.",
        "acceptedAnswers": [
          "linux"
        ]
      },
      {
        "id": "r2_sol_8",
        "nodeNumber": 8,
        "category": "📟 Telecom Protocols",
        "targetWord": "XMODEM",
        "length": 6,
        "bridgeClue": "⚡ LINKED FROM NODE 07 [LINUX] ➔ Starts with the ending letter 'X'.",
        "prompt": "Historic simple file transfer protocol developed by Ward Christensen in 1977 for telephone modem bullet boards.",
        "hint": "Protocol sending 128-byte packets over telephone lines.",
        "acceptedAnswers": [
          "xmodem"
        ]
      },
      {
        "id": "r2_sol_9",
        "nodeNumber": 9,
        "category": "📠 Dial-Up Hardware",
        "targetWord": "MODEM",
        "length": 5,
        "bridgeClue": "⚡ LINKED FROM NODE 08 [XMODEM] ➔ Starts with the letters 'MO'.",
        "prompt": "Hardware device that modulates and demodulates analog carrier signals to encode and decode digital information.",
        "hint": "Portmanteau of Modulator-Demodulator.",
        "acceptedAnswers": [
          "modem"
        ]
      },
      {
        "id": "r2_sol_10",
        "nodeNumber": 10,
        "category": "👑 FINAL BOSS OVERRIDE",
        "targetWord": "MATRIX",
        "length": 6,
        "bridgeClue": "⚡ MASTER CORE OVERRIDE: Link the multi-dimensional grid starting with 'M'.",
        "prompt": "A rectangular array of numbers arranged in rows and columns used for linear transformations, graphics, and neural weights.",
        "hint": "Neo and Morpheus sci-fi movie simulation.",
        "acceptedAnswers": [
          "matrix"
        ]
      }
    ]
  },
  {
    "setId": "r2_circuit_spectral",
    "theme": "Circuit Pi: Spectral Net",
    "steps": [
      {
        "id": "r2_spe_1",
        "nodeNumber": 1,
        "category": "🎨 Display Elements",
        "targetWord": "PIXEL",
        "length": 5,
        "bridgeClue": "⚡ ENTRY KEY: Initial minute visual picture element key.",
        "prompt": "The smallest addressable illumination point or dot of color on a display screen, combining red, green, and blue.",
        "hint": "Picture element; megapixel resolution.",
        "acceptedAnswers": [
          "pixel"
        ]
      },
      {
        "id": "r2_spe_2",
        "nodeNumber": 2,
        "category": "🧠 Deep Architecture",
        "targetWord": "LAYER",
        "length": 5,
        "bridgeClue": "⚡ LINKED FROM NODE 01 [PIXEL] ➔ Starts with the ending letter 'L'.",
        "prompt": "A tier of artificial neurons in a neural network (input, hidden, or output) that transforms features.",
        "hint": "Strata of a cake or sedimentary rock.",
        "acceptedAnswers": [
          "layer"
        ]
      },
      {
        "id": "r2_spe_3",
        "nodeNumber": 3,
        "category": "⚡ Rapid RAM Cache",
        "targetWord": "REDIS",
        "length": 5,
        "bridgeClue": "⚡ LINKED FROM NODE 02 [LAYER] ➔ Starts with the ending letter 'R'.",
        "prompt": "Blazing fast in-memory key-value data structure store frequently used for leaderboard caching and session tokens.",
        "hint": "Remote Dictionary Server.",
        "acceptedAnswers": [
          "redis"
        ]
      },
      {
        "id": "r2_spe_4",
        "nodeNumber": 4,
        "category": "📚 Execution Stack",
        "targetWord": "STACK",
        "length": 5,
        "bridgeClue": "⚡ LINKED FROM NODE 03 [REDIS] ➔ Starts with the ending letter 'S'.",
        "prompt": "LIFO memory structure where local variables, return addresses, and active stack frames reside.",
        "hint": "Pancake pile; Stack Overflow.",
        "acceptedAnswers": [
          "stack"
        ]
      },
      {
        "id": "r2_spe_5",
        "nodeNumber": 5,
        "category": "⌨️ Hardware Input",
        "targetWord": "KEYBOARD",
        "length": 8,
        "bridgeClue": "⚡ LINKED FROM NODE 04 [STACK] ➔ Starts with the ending letter 'K'.",
        "prompt": "Primary alphanumeric peripheral interface with QWERTY layout used to input characters and commands.",
        "hint": "Musical piano keys; typing device.",
        "acceptedAnswers": [
          "keyboard"
        ]
      },
      {
        "id": "r2_spe_6",
        "nodeNumber": 6,
        "category": "💾 Snapshot Dumps",
        "targetWord": "DUMP",
        "length": 4,
        "bridgeClue": "⚡ LINKED FROM NODE 05 [KEYBOARD] ➔ Starts with the ending letter 'D'.",
        "prompt": "To output or write out the contents of computer memory or a database to an external diagnostic file.",
        "hint": "Database SQL dump.",
        "acceptedAnswers": [
          "dump"
        ]
      },
      {
        "id": "r2_spe_7",
        "nodeNumber": 7,
        "category": "🏭 CI/CD Streams",
        "targetWord": "PIPELINE",
        "length": 8,
        "bridgeClue": "⚡ LINKED FROM NODE 06 [DUMP] ➔ Starts with the ending letter 'P'.",
        "prompt": "A set of automated data processing steps or automated build-test-deploy stages in DevOps software delivery.",
        "hint": "Oil transport tube; CI/CD workflow.",
        "acceptedAnswers": [
          "pipeline"
        ]
      },
      {
        "id": "r2_spe_8",
        "nodeNumber": 8,
        "category": "🔢 Enumerations",
        "targetWord": "ENUM",
        "length": 4,
        "bridgeClue": "⚡ LINKED FROM NODE 07 [PIPELINE] ➔ Starts with the ending letter 'E'.",
        "prompt": "Data type that consists of a set of named integral constants representing distinct options.",
        "hint": "TypeScript enum keyword.",
        "acceptedAnswers": [
          "enum"
        ]
      },
      {
        "id": "r2_spe_9",
        "nodeNumber": 9,
        "category": "📜 Automated Routines",
        "targetWord": "MACRO",
        "length": 5,
        "bridgeClue": "⚡ LINKED FROM NODE 08 [ENUM] ➔ Starts with the ending letter 'M'.",
        "prompt": "A single computer instruction or script that expands automatically into a set of instructions to perform a task.",
        "hint": "Opposite of micro; Excel automation script.",
        "acceptedAnswers": [
          "macro"
        ]
      },
      {
        "id": "r2_spe_10",
        "nodeNumber": 10,
        "category": "👑 FINAL BOSS OVERRIDE",
        "targetWord": "OVERFLOW",
        "length": 8,
        "bridgeClue": "⚡ MASTER CORE OVERRIDE: Link the excessive memory error starting with 'O'.",
        "prompt": "The condition that occurs when a calculation produces a result that exceeds the capacity of the memory storage location.",
        "hint": "Stack ______; water spilling over bucket rim.",
        "acceptedAnswers": [
          "overflow"
        ]
      }
    ]
  },
  {
    "setId": "r2_circuit_apex",
    "theme": "Circuit Rho: Apex Sentinel",
    "steps": [
      {
        "id": "r2_apx_1",
        "nodeNumber": 1,
        "category": "📦 Contiguous Memory",
        "targetWord": "ARRAY",
        "length": 5,
        "bridgeClue": "⚡ ENTRY KEY: Initial contiguous memory index key.",
        "prompt": "A data structure consisting of a collection of elements identified by integer indices stored in contiguous memory.",
        "hint": "[0, 1, 2]; ordered list.",
        "acceptedAnswers": [
          "array"
        ]
      },
      {
        "id": "r2_apx_2",
        "nodeNumber": 2,
        "category": "⚡ Coroutine Return",
        "targetWord": "YIELD",
        "length": 5,
        "bridgeClue": "⚡ LINKED FROM NODE 01 [ARRAY] ➔ Starts with the ending letter 'Y'.",
        "prompt": "Keyword that passes execution back from a generator while maintaining its internal frame state.",
        "hint": "Yielding output.",
        "acceptedAnswers": [
          "yield"
        ]
      },
      {
        "id": "r2_apx_3",
        "nodeNumber": 3,
        "category": "🐛 Code Inspection",
        "targetWord": "DEBUG",
        "length": 5,
        "bridgeClue": "⚡ LINKED FROM NODE 02 [YIELD] ➔ Starts with the ending letter 'D'.",
        "prompt": "The investigative process of identifying, isolating, and rectifying errors, bugs, or anomalies in software code.",
        "hint": "Grace Hopper removing a physical moth from Mark II.",
        "acceptedAnswers": [
          "debug"
        ]
      },
      {
        "id": "r2_apx_4",
        "nodeNumber": 4,
        "category": "🚪 Silicon Switches",
        "targetWord": "GATES",
        "length": 5,
        "bridgeClue": "⚡ LINKED FROM NODE 03 [DEBUG] ➔ Starts with the ending letter 'G'.",
        "prompt": "Physical electronic circuits implementing Boolean functions (AND, OR, NOT, NAND, XOR) in microprocessors.",
        "hint": "Bill ______; entrance portal.",
        "acceptedAnswers": [
          "gates"
        ]
      },
      {
        "id": "r2_apx_5",
        "nodeNumber": 5,
        "category": "☕ JVM Languages",
        "targetWord": "SCALA",
        "length": 5,
        "bridgeClue": "⚡ LINKED FROM NODE 04 [GATES] ➔ Starts with the ending letter 'S'.",
        "prompt": "Strongly typed programming language on the Java Virtual Machine that blends functional and object-oriented paradigms.",
        "hint": "Apache Spark was written in this language; scalable architecture.",
        "acceptedAnswers": [
          "scala"
        ]
      },
      {
        "id": "r2_apx_6",
        "nodeNumber": 6,
        "category": "🔡 Character Encoding",
        "targetWord": "ASCII",
        "length": 5,
        "bridgeClue": "⚡ LINKED FROM NODE 05 [SCALA] ➔ Starts with the ending letter 'A'.",
        "prompt": "American Standard Code for Information Interchange encoding 128 specified English characters into 7-bit integers.",
        "hint": "Char code 65 is 'A'; text encoding standard.",
        "acceptedAnswers": [
          "ascii"
        ]
      },
      {
        "id": "r2_apx_7",
        "nodeNumber": 7,
        "category": "📑 Search Pointers",
        "targetWord": "INDEX",
        "length": 5,
        "bridgeClue": "⚡ LINKED FROM NODE 06 [ASCII] ➔ Starts with the ending letter 'I'.",
        "prompt": "A database data structure (e.g. B-tree) that improves the speed of data retrieval operations on a database table.",
        "hint": "Book back directory; zero-based array subscript.",
        "acceptedAnswers": [
          "index"
        ]
      },
      {
        "id": "r2_apx_8",
        "nodeNumber": 8,
        "category": "🌐 Strict Web Markup",
        "targetWord": "XHTML",
        "length": 5,
        "bridgeClue": "⚡ LINKED FROM NODE 07 [INDEX] ➔ Starts with the ending letter 'X'.",
        "prompt": "Strict, XML-compliant reformulation of HTML requiring all tags to be properly closed and attributes quoted.",
        "hint": "Extensible Hypertext Markup Language.",
        "acceptedAnswers": [
          "xhtml"
        ]
      },
      {
        "id": "r2_apx_9",
        "nodeNumber": 9,
        "category": "🧠 Deduction Engines",
        "targetWord": "LOGIC",
        "length": 5,
        "bridgeClue": "⚡ LINKED FROM NODE 08 [XHTML] ➔ Starts with the ending letter 'L'.",
        "prompt": "The formal principles of reasoning and deduction underlying computational proofs and algorithmic execution.",
        "hint": "Rational thinking; Boolean truth.",
        "acceptedAnswers": [
          "logic"
        ]
      },
      {
        "id": "r2_apx_10",
        "nodeNumber": 10,
        "category": "👑 FINAL BOSS OVERRIDE",
        "targetWord": "CAPTCHA",
        "length": 7,
        "bridgeClue": "⚡ MASTER CORE OVERRIDE: Link the human verification challenge starting with 'C'.",
        "prompt": "Completely Automated Public Turing test to tell Computers and Humans Apart by asking them to identify distorted letters.",
        "hint": "\"I am not a robot\" checkbox.",
        "acceptedAnswers": [
          "captcha"
        ]
      }
    ]
  },
  {
    "setId": "r2_circuit_ironclad",
    "theme": "Circuit Sigma: Ironclad Relay",
    "steps": [
      {
        "id": "r2_iro_1",
        "nodeNumber": 1,
        "category": "🍏 Apple Language",
        "targetWord": "SWIFT",
        "length": 5,
        "bridgeClue": "⚡ ENTRY KEY: Initial fast compile key to breach Ironclad.",
        "prompt": "Modern, general-purpose compiled language developed by Chris Lattner at Apple to replace Objective-C.",
        "hint": "Fast moving bird; Taylor ______.",
        "acceptedAnswers": [
          "swift"
        ]
      },
      {
        "id": "r2_iro_2",
        "nodeNumber": 2,
        "category": "📊 Structured Relations",
        "targetWord": "TABLE",
        "length": 5,
        "bridgeClue": "⚡ LINKED FROM NODE 01 [SWIFT] ➔ Starts with the ending letter 'T'.",
        "prompt": "Relational database collection of related data held in a structured format within database schemas.",
        "hint": "Four-legged furniture.",
        "acceptedAnswers": [
          "table"
        ]
      },
      {
        "id": "r2_iro_3",
        "nodeNumber": 3,
        "category": "⚠️ Runtime Exceptions",
        "targetWord": "ERROR",
        "length": 5,
        "bridgeClue": "⚡ LINKED FROM NODE 02 [TABLE] ➔ Starts with the ending letter 'E'.",
        "prompt": "An abnormal runtime condition or code defect that disrupts the normal flow of program execution.",
        "hint": "Try / catch block handles this.",
        "acceptedAnswers": [
          "error"
        ]
      },
      {
        "id": "r2_iro_4",
        "nodeNumber": 4,
        "category": "📡 Pulse Detection",
        "targetWord": "RADAR",
        "length": 5,
        "bridgeClue": "⚡ LINKED FROM NODE 03 [ERROR] ➔ Starts with the ending letter 'R'.",
        "prompt": "Detection system using radio waves to determine distance, angle, and radial velocity of objects.",
        "hint": "Palindrome word; air traffic control sweep.",
        "acceptedAnswers": [
          "radar"
        ]
      },
      {
        "id": "r2_iro_5",
        "nodeNumber": 5,
        "category": "🔄 Hardware Reboot",
        "targetWord": "RESET",
        "length": 5,
        "bridgeClue": "⚡ LINKED FROM NODE 04 [RADAR] ➔ Starts with the ending letter 'R'.",
        "prompt": "To clear any pending errors or events and bring a computer or peripheral back to its initial state.",
        "hint": "Power cycle button on PC casing.",
        "acceptedAnswers": [
          "reset"
        ]
      },
      {
        "id": "r2_iro_6",
        "nodeNumber": 6,
        "category": "🎟️ Identity Hashes",
        "targetWord": "TOKEN",
        "length": 5,
        "bridgeClue": "⚡ LINKED FROM NODE 05 [RESET] ➔ Starts with the ending letter 'T'.",
        "prompt": "A digitally signed string or badge (e.g. bearer token) verifying a user's session authenticity.",
        "hint": "Subway turnstile pass.",
        "acceptedAnswers": [
          "token"
        ]
      },
      {
        "id": "r2_iro_7",
        "nodeNumber": 7,
        "category": "🖥️ Network Points",
        "targetWord": "NODE",
        "length": 4,
        "bridgeClue": "⚡ LINKED FROM NODE 06 [TOKEN] ➔ Starts with the ending letter 'N'.",
        "prompt": "A basic unit of a data structure, or an active physical device connected to a computer network.",
        "hint": "______.js runtime created by Ryan Dahl.",
        "acceptedAnswers": [
          "node"
        ]
      },
      {
        "id": "r2_iro_8",
        "nodeNumber": 8,
        "category": "💾 Disk Volumes",
        "targetWord": "DRIVE",
        "length": 5,
        "bridgeClue": "⚡ LINKED FROM NODE 07 [NODE] ➔ Starts with the letter 'D'.",
        "prompt": "Mass storage peripheral reading magnetic platters or flash memory NAND chips.",
        "hint": "Hard ______; Flash ______.",
        "acceptedAnswers": [
          "drive"
        ]
      },
      {
        "id": "r2_iro_9",
        "nodeNumber": 9,
        "category": "📡 Signal Broadcaster",
        "targetWord": "EMIT",
        "length": 4,
        "bridgeClue": "⚡ LINKED FROM NODE 08 [DRIVE] ➔ Starts with the ending letter 'E'.",
        "prompt": "To fire an event or dispatch a signal across an event-driven bus to registered listener callbacks.",
        "hint": "socket.emit(); send outwards.",
        "acceptedAnswers": [
          "emit"
        ]
      },
      {
        "id": "r2_iro_10",
        "nodeNumber": 10,
        "category": "👑 FINAL BOSS OVERRIDE",
        "targetWord": "TUNNEL",
        "length": 6,
        "bridgeClue": "⚡ MASTER CORE OVERRIDE: Link the encrypted conduit starting with 'T'.",
        "prompt": "Encapsulation protocol allowing private network communications to be transmitted over public networks (e.g. SSH/VPN).",
        "hint": "Subway subterranean passage.",
        "acceptedAnswers": [
          "tunnel"
        ]
      }
    ]
  },
  {
    "setId": "r2_circuit_valkyrie",
    "theme": "Circuit Tau: Valkyrie Hive",
    "steps": [
      {
        "id": "r2_val_1",
        "nodeNumber": 1,
        "category": "🎵 Media Streams",
        "targetWord": "TRACK",
        "length": 5,
        "bridgeClue": "⚡ ENTRY KEY: Initial audio/optical data path key.",
        "prompt": "A circular path on a magnetic disk or CD where data is recorded, or a single audio channel in music production.",
        "hint": "Train rail course.",
        "acceptedAnswers": [
          "track"
        ]
      },
      {
        "id": "r2_val_2",
        "nodeNumber": 2,
        "category": "🐧 OS Nucleus",
        "targetWord": "KERNEL",
        "length": 6,
        "bridgeClue": "⚡ LINKED FROM NODE 01 [TRACK] ➔ Starts with the ending letter 'K'.",
        "prompt": "Central module of an operating system responsible for memory management, process scheduling, and I/O access.",
        "hint": "Center of corn grain; Linus Torvalds kernel.",
        "acceptedAnswers": [
          "kernel"
        ]
      },
      {
        "id": "r2_val_3",
        "nodeNumber": 3,
        "category": "🐢 Turtle Graphics",
        "targetWord": "LOGO",
        "length": 4,
        "bridgeClue": "⚡ LINKED FROM NODE 02 [KERNEL] ➔ Starts with the ending letter 'L'.",
        "prompt": "Historic educational programming language designed in 1967 by Seymour Papert featuring turtle graphics.",
        "hint": "Company visual emblem or trademark.",
        "acceptedAnswers": [
          "logo"
        ]
      },
      {
        "id": "r2_val_4",
        "nodeNumber": 4,
        "category": "👁️ Computer Vision",
        "targetWord": "OPENCV",
        "length": 6,
        "bridgeClue": "⚡ LINKED FROM NODE 03 [LOGO] ➔ Starts with the ending letter 'O'.",
        "prompt": "Open source computer vision and machine learning software library with real-time facial and object recognition.",
        "hint": "Open Source Computer Vision acronym.",
        "acceptedAnswers": [
          "opencv"
        ]
      },
      {
        "id": "r2_val_5",
        "nodeNumber": 5,
        "category": "🎮 Gaming Titans",
        "targetWord": "VALVE",
        "length": 5,
        "bridgeClue": "⚡ LINKED FROM NODE 04 [OPENCV] ➔ Starts with the ending letter 'V'.",
        "prompt": "Legendary video game developer and digital distribution company that created Steam, Half-Life, and Counter-Strike.",
        "hint": "Mechanical device controlling fluid flow in a pipe.",
        "acceptedAnswers": [
          "valve"
        ]
      },
      {
        "id": "r2_val_6",
        "nodeNumber": 6,
        "category": "🎯 String Matching",
        "targetWord": "EXACT",
        "length": 5,
        "bridgeClue": "⚡ LINKED FROM NODE 05 [VALVE] ➔ Starts with the ending letter 'E'.",
        "prompt": "Strict character-for-character equality match without fuzziness or approximation in string comparison.",
        "hint": "Precise; absolutely correct.",
        "acceptedAnswers": [
          "exact"
        ]
      },
      {
        "id": "r2_val_7",
        "nodeNumber": 7,
        "category": "🔢 Aggregations",
        "targetWord": "TOTAL",
        "length": 5,
        "bridgeClue": "⚡ LINKED FROM NODE 06 [EXACT] ➔ Starts with the ending letter 'T'.",
        "prompt": "The complete sum or whole amount obtained by adding all individual items or team scores together.",
        "hint": "Grand sum score.",
        "acceptedAnswers": [
          "total"
        ]
      },
      {
        "id": "r2_val_8",
        "nodeNumber": 8,
        "category": "🐧 Unix Distros",
        "targetWord": "LINUX",
        "length": 5,
        "bridgeClue": "⚡ LINKED FROM NODE 07 [TOTAL] ➔ Starts with the ending letter 'L'.",
        "prompt": "Dominant server operating system family comprising Ubuntu, Debian, Red Hat, Arch, and Alpine distributions.",
        "hint": "Tux penguin mascot.",
        "acceptedAnswers": [
          "linux"
        ]
      },
      {
        "id": "r2_val_9",
        "nodeNumber": 9,
        "category": "🔄 Matrix Transforms",
        "targetWord": "XFORM",
        "length": 5,
        "bridgeClue": "⚡ LINKED FROM NODE 08 [LINUX] ➔ Starts with the ending letter 'X'.",
        "prompt": "Common abbreviation in 3D graphics and engineering for matrix transformation (translation, rotation, scale).",
        "hint": "Short for transform.",
        "acceptedAnswers": [
          "xform"
        ]
      },
      {
        "id": "r2_val_10",
        "nodeNumber": 10,
        "category": "👑 FINAL BOSS OVERRIDE",
        "targetWord": "MALWARE",
        "length": 7,
        "bridgeClue": "⚡ MASTER CORE OVERRIDE: Link the malicious threat category starting with 'M'.",
        "prompt": "Any malicious software intentionally designed to cause disruption to a computer, server, client, or network.",
        "hint": "Viruses, ransomware, spyware umbrella term.",
        "acceptedAnswers": [
          "malware"
        ]
      }
    ]
  },
  {
    "setId": "r2_circuit_omega",
    "theme": "Circuit Omega: The Singularity Core",
    "steps": [
      {
        "id": "r2_ome_1",
        "nodeNumber": 1,
        "category": "🤖 Autonomous AI",
        "targetWord": "AGENT",
        "length": 5,
        "bridgeClue": "⚡ ENTRY KEY: Initial autonomous operative key to breach Singularity Core.",
        "prompt": "An autonomous software entity that observes through sensors and acts upon an environment using LLM reasoning.",
        "hint": "Secret operative 007; AI software worker.",
        "acceptedAnswers": [
          "agent"
        ]
      },
      {
        "id": "r2_ome_2",
        "nodeNumber": 2,
        "category": "📦 Fixed Collections",
        "targetWord": "TUPLE",
        "length": 5,
        "bridgeClue": "⚡ LINKED FROM NODE 01 [AGENT] ➔ Starts with the ending letter 'T'.",
        "prompt": "An immutable ordered sequence of values in mathematics and programming languages.",
        "hint": "(x, y, z) coordinate triplet.",
        "acceptedAnswers": [
          "tuple"
        ]
      },
      {
        "id": "r2_ome_3",
        "nodeNumber": 3,
        "category": "🚪 Code Gateways",
        "targetWord": "ENTRY",
        "length": 5,
        "bridgeClue": "⚡ LINKED FROM NODE 02 [TUPLE] ➔ Starts with the ending letter 'E'.",
        "prompt": "The main function or starting point from which an executable program begins runtime execution.",
        "hint": "Doorway or threshold.",
        "acceptedAnswers": [
          "entry"
        ]
      },
      {
        "id": "r2_ome_4",
        "nodeNumber": 4,
        "category": "📦 Dependency Lockers",
        "targetWord": "YARN",
        "length": 4,
        "bridgeClue": "⚡ LINKED FROM NODE 03 [ENTRY] ➔ Starts with the ending letter 'Y'.",
        "prompt": "Fast, secure JavaScript package manager released by Meta providing deterministic yarn.lock files.",
        "hint": "Spun wool ball.",
        "acceptedAnswers": [
          "yarn"
        ]
      },
      {
        "id": "r2_ome_5",
        "nodeNumber": 5,
        "category": "🌐 Central Hubs",
        "targetWord": "NEXUS",
        "length": 5,
        "bridgeClue": "⚡ LINKED FROM NODE 04 [YARN] ➔ Starts with the ending letter 'N'.",
        "prompt": "A focal connection or series of connections linking two or more things together; popular artifact repository.",
        "hint": "Sonatype ______; core junction point.",
        "acceptedAnswers": [
          "nexus"
        ]
      },
      {
        "id": "r2_ome_6",
        "nodeNumber": 6,
        "category": "⚡ Big Data Engine",
        "targetWord": "SPARK",
        "length": 5,
        "bridgeClue": "⚡ LINKED FROM NODE 05 [NEXUS] ➔ Starts with the ending letter 'S'.",
        "prompt": "Apache unified analytics engine for large-scale data processing utilizing in-memory RDDs.",
        "hint": "Small fiery particle thrown off by flint.",
        "acceptedAnswers": [
          "spark"
        ]
      },
      {
        "id": "r2_ome_7",
        "nodeNumber": 7,
        "category": "☸️ Container Orchestration",
        "targetWord": "KUBERNETES",
        "length": 10,
        "bridgeClue": "⚡ LINKED FROM NODE 06 [SPARK] ➔ Starts with the ending letter 'K'.",
        "prompt": "Ubiquitous Greek-named open-source system for automating deployment, scaling, and management of containerized applications.",
        "hint": "Often shortened to K8S — type the full 10-letter name.",
        "acceptedAnswers": [
          "kubernetes"
        ]
      },
      {
        "id": "r2_ome_8",
        "nodeNumber": 8,
        "category": "🖥️ Host Machines",
        "targetWord": "SERVER",
        "length": 6,
        "bridgeClue": "⚡ LINKED FROM NODE 07 [KUBERNETES] ➔ Starts with the ending letter 'S'.",
        "prompt": "Computer hardware or software system that provides functionality, resources, and data responses for client programs.",
        "hint": "Client-______ architecture; rack mounted blade.",
        "acceptedAnswers": [
          "server"
        ]
      },
      {
        "id": "r2_ome_9",
        "nodeNumber": 9,
        "category": "🗺️ Network Pathways",
        "targetWord": "ROUTE",
        "length": 5,
        "bridgeClue": "⚡ LINKED FROM NODE 08 [SERVER] ➔ Starts with the ending letter 'R'.",
        "prompt": "The specific network traversal pathway chosen to transfer IP packets from source to destination.",
        "hint": "Roadmap course.",
        "acceptedAnswers": [
          "route"
        ]
      },
      {
        "id": "r2_ome_10",
        "nodeNumber": 10,
        "category": "👑 FINAL BOSS OVERRIDE",
        "targetWord": "QUANTUM",
        "length": 7,
        "bridgeClue": "⚡ MASTER CORE OVERRIDE: Link the superposition subatomic computing core starting with 'Q'.",
        "prompt": "Computing paradigm that exploits subatomic phenomena like superposition and entanglement to solve calculations beyond classical limits.",
        "hint": "Qubits; Schrödinger's cat; IBM ______ System One.",
        "acceptedAnswers": [
          "quantum"
        ]
      }
    ]
  }
],
  3: [
  {
    "setId": "r3_sherlock_blackwood",
    "theme": "Sher\"unlocking\" Homies: The Kensington Crescent Mystery",
    "dossierTitle": "The Mysterious Death of Lord Alistair Blackwood",
    "incidentDate": "November 14, 1891 • 11:22 PM",
    "location": "221B Kensington Crescent, London",
    "caseSummary": "Lord Alistair Blackwood, distinguished antiquarian, was discovered poisoned at his mahogany desk at 11:22 PM. A crystal wine goblet emitting an acrid aroma of bitter almonds lay shattered beside him. Heavy rain drenched London that night; fresh mud marks on the French balcony ledge indicate the killer entered from the garden trellis. In his coat pocket, the velvet box for the 120-carat 'Eye of Bengal' sapphire was found empty. Scotland Yard has detained 5 prime suspects at the scene.",
    "suspects": [
      {
        "id": "suspect_arun",
        "name": "Arun Kumar",
        "occupation": "Ex-Army Marksman & Heavy Gambler",
        "bootsGait": "Size 10 boots; pronounced heavy limp on right leg",
        "motive": "Severe gambling debts totaling £8,000 to East End bookmakers",
        "weaponPossession": "Concealed cane air-rifle and hunting dagger",
        "alibi": "Claims he was at the Anglo-Indian Club drinking gin and playing billiards until 1:00 AM."
      },
      {
        "id": "suspect_rahul",
        "name": "Dr. Rahul Verma",
        "occupation": "Disgruntled Physician & Former Protégé",
        "bootsGait": "Size 8 oxfords; light, brisk surgeon's stride",
        "motive": "Disinherited from the Blackwood antiquities collection",
        "weaponPossession": "Medical bag containing strychnine, chloroform, and morphine",
        "alibi": "Claims he was administering cholera vaccinations at St. Bartholomew's Charity Hospital from 10:00 PM until midnight."
      },
      {
        "id": "suspect_priya",
        "name": "Priya Nair",
        "occupation": "The Estranged Wealthy Relative",
        "bootsGait": "Size 5 silk evening slippers; frail stature (cannot climb)",
        "motive": "Inherits the £50,000 estate if Blackwood dies prior to their contested estate settlement",
        "weaponPossession": "Crystal atomizer perfume bottle smelling of lavender and ether",
        "alibi": "Claims she was attending the grand opera performance of Faust at Covent Garden until 11:30 PM with Countess Morcar."
      },
      {
        "id": "suspect_joshva",
        "name": "Joshva Peter",
        "occupation": "Theatrical Infiltrator & Antiquities Collector",
        "bootsGait": "Size 7 equestrian riding boots; nimble acrobat",
        "motive": "Contracted by an international collector to retrieve the 'Eye of Bengal' sapphire",
        "weaponPossession": "Diamond glass-cutter, lockpicks, and smoke pellets",
        "alibi": "Claims he was dining publicly at the Savoy Hotel dining salon until 11:00 PM, then retired to his suite."
      },
      {
        "id": "suspect_sharma",
        "name": "Rohan Sharma",
        "occupation": "The Head Valet & Syndicate Smuggler",
        "bootsGait": "Size 10 leather boots; completely symmetrical, athletic gait (no limp)",
        "motive": "Blackwood discovered Sharma's secret forged ledger and threatened to expose him to Scotland Yard at dawn",
        "weaponPossession": "Empty glass apothecary phial bearing white crystalline residue; heavy brass pocket key",
        "alibi": "Claims he was down in the subterranean wine cellar conducting bottle inventory from 11:10 PM until 11:35 PM."
      }
    ],
    "steps": [
      {
        "id": "r3_step_1",
        "title": "Forensic Autopsy & Balcony Footprints",
        "category": "🔬 Forensic Science",
        "investigatorRole": "Operative 1 • Forensic Specialist",
        "prompt": "The police surgeon found traces of a fast-acting crystalline salt on the shattered crystal goblet rim, emitting a distinct pungent aroma of bitter almonds and triggering instantaneous cellular hypoxia. Furthermore, muddy balcony tracks measure 29 cm (Men's Size 10 boots) with completely symmetrical stride depth. Deduce the 7-letter lethal compound.",
        "clue": "Forensic Toxicology: A deadly salt of prussic acid, widely utilized in Victorian electroplating and metallurgy.",
        "hint": "Examine the chemical hallmarks: 7 letters, bitter-almond odor, highly toxic crystalline salt often formulated with potassium (KCN).",
        "image": "/images/sherlock_crime_scene.jpg",
        "expectedFragment": "CYANIDE",
        "acceptedAnswers": [
          "cyanide",
          "CYANIDE",
          "potassium cyanide",
          "POTASSIUM CYANIDE",
          "kcn",
          "KCN",
          "prussic acid"
        ]
      },
      {
        "id": "r3_step_2",
        "title": "The Grate Cryptogram (Moriarty's Intercept)",
        "category": "📜 Cryptography",
        "investigatorRole": "Operative 2 • Cryptanalyst",
        "prompt": "A half-charred telegram strip retrieved from the study fireplace reveals an intercepted cipher: \"EODFNPDLO\". The cipher system shifts letters forward by 3 alphabet positions (Caesar shift). Decrypt the 9-letter motive that drove the killer to murder Lord Blackwood.",
        "clue": "Caesar Cryptographic Key: Revert each letter 3 positions backward in the alphabet (D → A, E → B, F → C ...). What motive emerges?",
        "hint": "The decrypted term signifies the illegal extortion of money or silence through threats of exposure.",
        "image": "/images/sherlock_burnt_cipher.jpg",
        "expectedFragment": "BLACKMAIL",
        "acceptedAnswers": [
          "blackmail",
          "BLACKMAIL",
          "extortion",
          "EXTORTION"
        ]
      },
      {
        "id": "r3_step_3",
        "title": "The Shattered Alibi (Knights & Knaves)",
        "category": "⚖️ Deductive Logic",
        "investigatorRole": "Operative 3 • Interrogation Detective",
        "prompt": "Cross-examine the 5 suspect alibis against Scotland Yard's evidence: Dr. Rahul's hospital log is verified until 12:30 AM; Arun Kumar was snoring at the club; Priya's opera ended at 10:45 PM but size 5 slippers rule her out; Joshva was at the Savoy. Meanwhile, one suspect claims they were locked inside the subterranean cellar from 11:10 to 11:35 PM—yet the Butler swears the ONLY cellar key was locked inside the victim's study desk since 9:00 PM! Which suspect is caught in an impossible lie? Enter their surname.",
        "clue": "Interrogation Logic: A suspect claiming to be locked inside an underground location without the physical key found on the dead man's desk cannot be telling the truth.",
        "hint": "Compare the suspect alibis carefully: which individual claimed to be inside a locked room that required the study desk key during the murder window?",
        "expectedFragment": "SHARMA",
        "acceptedAnswers": [
          "sharma",
          "SHARMA",
          "rohan sharma",
          "ROHAN SHARMA",
          "vance",
          "VANCE",
          "silas vance"
        ]
      }
    ],
    "leaderTask": {
      "title": "Scotland Yard Official Indictment Warrant",
      "instructions": "Chief Inspector (Squad Leader): Review the gathered evidence proofs. File the official indictment before the magistrate in the standard notation: [CULPRIT]:[WEAPON]:[MOTIVE] (e.g. SURNAME:WEAPON:MOTIVE).",
      "image": "/images/sherlock_arrest_warrant.jpg",
      "expectedMasterCode": "SHARMA:CYANIDE:BLACKMAIL",
      "acceptedWarrants": [
        "SHARMA:CYANIDE:BLACKMAIL",
        "ROHAN SHARMA:CYANIDE:BLACKMAIL",
        "SHARMA-CYANIDE-BLACKMAIL",
        "ROHAN SHARMA-CYANIDE-BLACKMAIL",
        "SHARMA : CYANIDE : BLACKMAIL",
        "ROHAN SHARMA : CYANIDE : BLACKMAIL",
        "SHARMA, CYANIDE, BLACKMAIL",
        "SHARMA CYANIDE BLACKMAIL",
        "VANCE:CYANIDE:BLACKMAIL",
        "SILAS VANCE:CYANIDE:BLACKMAIL",
        "VANCE-CYANIDE-BLACKMAIL",
        "SILAS VANCE-CYANIDE-BLACKMAIL",
        "VANCE : CYANIDE : BLACKMAIL",
        "SILAS VANCE : CYANIDE : BLACKMAIL",
        "VANCE, CYANIDE, BLACKMAIL",
        "VANCE CYANIDE BLACKMAIL",
        "JOSHVA:CYANIDE:BLACKMAIL"
      ],
      "hint": "Format: [CULPRIT_SURNAME]:[WEAPON]:[MOTIVE] (Assemble the 3 forensic proofs unlocked by your detectives)",
      "errorMessage": "Warrant Rejected by Magistrate! Double-check your Culprit Surname, Murder Weapon, and Motive against your squad's unlocked proof badges."
    }
  }
]
};

/**
 * Assigns a puzzle set to each team (Common set for Round 3 finals)
 */
function getPuzzleSetForTeam(roundNumber, teamIndex = 0, assignedSetIds = new Set()) {
  const sets = PUZZLE_SETS[roundNumber];
  if (!sets || sets.length === 0) return null;
  // Round 3 is the Grand Championship: The game is COMMON for all teams!
  if (roundNumber === 3) {
    return sets[0];
  }
  if (assignedSetIds instanceof Set) {
    const availableSet = sets.find(s => !assignedSetIds.has(s.setId));
    if (availableSet) {
      assignedSetIds.add(availableSet.setId);
      return availableSet;
    }
  }
  const setIndex = teamIndex % sets.length;
  return sets[setIndex];
}

function checkStepAnswer(roundNumber, setId, stepIndex, userAnswer) {
  const sets = PUZZLE_SETS[roundNumber];
  if (!sets) return { success: false, message: 'Invalid round' };
  const puzzleSet = sets.find(s => s.setId === setId) || sets[0];
  if (!puzzleSet || !puzzleSet.steps[stepIndex]) {
    return { success: false, message: 'Step does not exist' };
  }
  const step = puzzleSet.steps[stepIndex];
  // Forgive case, spacing and punctuation ("Dr. Kalam", "A.P.J Abdul Kalam ", "cyanide!")
  const normalize = (v) => (v || '').toString().toLowerCase().replace(/[^a-z0-9]/g, '');
  const cleaned = normalize(userAnswer);
  const isCorrect = cleaned.length > 0 && [...step.acceptedAnswers, step.expectedFragment].some(ans => normalize(ans) === cleaned);
  const isSherlock = roundNumber === 3;
  if (isCorrect) {
    return {
      success: true,
      fragment: step.expectedFragment,
      message: isSherlock
        ? 'Verified! Forensic proof secured and sealed into Scotland Yard case evidence.'
        : 'Correct! Keyword unlocked.'
    };
  }
  return {
    success: false,
    message: isSherlock
      ? 'Incorrect forensic deduction. Re-examine the case testimony and premise carefully!'
      : 'Not quite — check the letter boxes and try again.'
  };
}

function checkLeaderExactCode(roundNumber, setId, userCode) {
  const sets = PUZZLE_SETS[roundNumber];
  if (!sets) return { success: false, message: 'Invalid round' };
  const puzzleSet = sets.find(s => s.setId === setId) || sets[0];
  if (!puzzleSet || !puzzleSet.leaderTask) {
    return { success: false, message: 'Leader task not found' };
  }
  const rawInput = (userCode || '').toString().trim().toUpperCase();
  const normalizedInput = rawInput.replace(/[\s\-_,]+/g, ':');

  if (puzzleSet.leaderTask.acceptedWarrants && Array.isArray(puzzleSet.leaderTask.acceptedWarrants)) {
    const isMatch = puzzleSet.leaderTask.acceptedWarrants.some(w => {
      const cleanW = w.toUpperCase().replace(/[\s\-_,]+/g, ':');
      return normalizedInput === cleanW || rawInput.replace(/\s+/g, '') === w.replace(/\s+/g, '');
    });
    if (isMatch) {
      return {
        success: true,
        message: 'Scotland Yard Warrant Verified! The true culprit is apprehended and convicted!'
      };
    }
  }

  const expected = (puzzleSet.leaderTask.expectedMasterCode || '').trim().toUpperCase();
  const cleaned = rawInput.replace(/\s+/g, '');
  if (cleaned === expected.replace(/\s+/g, '') || normalizedInput === expected.replace(/[\s\-_,]+/g, ':')) {
    return {
      success: true,
      message: 'Warrant Accepted! The case is solved!'
    };
  }
  return {
    success: false,
    message: puzzleSet.leaderTask.errorMessage || 'Invalid Warrant. Check suspect name, weapon, and motive format: [CULPRIT]:[WEAPON]:[MOTIVE]'
  };
}

/**
 * Evaluate Wordle/Mastermind letter tile status
 * Handles duplicate letters with exact green priority, then yellow, then absent
 */
function evaluateWordleGuess(targetWord, guessWord) {
  const target = (targetWord || '').toString().trim().toUpperCase();
  const guess = (guessWord || '').toString().trim().toUpperCase();
  const len = target.length;
  const result = new Array(len).fill(null);
  const targetCounts = {};

  // 1st Pass: Exact matches (Green)
  for (let i = 0; i < len; i++) {
    const t = target[i];
    const g = guess[i] || '';
    if (g === t) {
      result[i] = { letter: g, status: 'correct' }; // 🟩
    } else {
      targetCounts[t] = (targetCounts[t] || 0) + 1;
    }
  }

  // 2nd Pass: Present in wrong spot (Yellow) vs Absent (Dark)
  for (let i = 0; i < len; i++) {
    if (result[i]) continue;
    const g = guess[i] || '';
    if (g && targetCounts[g] > 0) {
      result[i] = { letter: g, status: 'present' }; // 🟨
      targetCounts[g]--;
    } else {
      result[i] = { letter: g, status: 'absent' }; // ⬛
    }
  }

  const isSolved = guess === target;
  return { isSolved, feedback: result, targetLength: len };
}

module.exports = {
  evaluateWordleGuess,
  ROUND_CONFIGS,
  PUZZLE_SETS,
  getPuzzleSetForTeam,
  checkStepAnswer,
  checkLeaderExactCode
};
