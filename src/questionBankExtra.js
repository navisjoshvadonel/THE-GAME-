/**
 * EXTRA QUESTION SETS (sets 21-30)
 *
 * Added so up to 30 squads each get their own Round 1 and Round 2 questions.
 * Sets are written compactly and expanded into the same shape as src/puzzles.js:
 *   - Round 1 (easy): three short riddles + the leader's victory sentence
 *   - Round 2 (medium): a 10-word chain; bridge clues are generated from the words,
 *     so a clue can never disagree with its answer.
 */

// ------------------------------------------------------------------ ROUND 1
// Each riddle: [title, category, prompt, clue (always shown), hint (after 45s), answer, ...other accepted answers]
const AI = '🤖 AI & Machine Learning';
const FILM = '🎬 Tamil Movies';
const PERSON = '🌟 Famous Personality';

const R1_SETS = [
  {
    letter: 'u', theme: 'Chatty Champions',
    riddles: [
      ['The Famous Chatbot', AI, 'Which AI chatbot made by OpenAI became famous worldwide in 2022 for answering questions and writing essays?', 'Its name ends with the letters "GPT".', 'Chat + GPT, written as one word.', 'CHATGPT', 'chat gpt'],
      ['The Tiger Jailer', FILM, 'In this 2023 Rajinikanth film, he plays Muthuvel Pandian, a retired prison officer who takes on an idol-smuggling gang. Name the film.', 'Directed by Nelson Dilipkumar; the song "Kaavaalaa" became a huge hit.', 'Another word for a prison warden.', 'JAILER'],
      ['The Master Blaster', PERSON, 'Which Indian cricketer was the first to score 100 international centuries and is called the "God of Cricket"?', 'He played for Mumbai and retired in 2013 after his 200th Test.', 'First name of Tendulkar.', 'SACHIN', 'sachin tendulkar', 'tendulkar']
    ],
    example: 'Like Sachin, our squad uses ChatGPT to plan and win as a Jailer guards the gate.'
  },
  {
    letter: 'v', theme: 'Captain Cool Code',
    riddles: [
      ['The Magic Words', AI, 'What do we call the text instruction you type into an AI tool like ChatGPT to tell it what to do?', 'Writing these well is called "_____ engineering".', 'Rhymes with "attempt"; 6 letters.', 'PROMPT'],
      ['Thalaivar\'s Swing', FILM, 'In this 1999 blockbuster, Rajinikanth faces the proud Neelambari, played by Ramya Krishnan. Name the film.', 'Famous for the line "En vazhi thani vazhi".', 'Starts with "Pada…".', 'PADAYAPPA'],
      ['Captain Cool', PERSON, 'Which Indian captain won the 2007 T20 World Cup, the 2011 ODI World Cup and the 2013 Champions Trophy?', 'Known for the helicopter shot; plays for Chennai Super Kings.', 'Mahendra Singh _____.', 'DHONI', 'ms dhoni', 'mahendra singh dhoni']
    ],
    example: 'Dhoni leads calmly, so our prompt helps the team plan smartly like Padayappa.'
  },
  {
    letter: 'w', theme: 'Mozart of Madras',
    riddles: [
      ['The Talking Helper', AI, 'What do we call a computer program that chats with people through text, like the help box on a website?', 'Chat + robot.', '7 letters, starts with CHAT.', 'CHATBOT', 'chat bot'],
      ['The Boss Returns', FILM, 'In this 2007 Shankar film, Rajinikanth plays a software engineer who returns from the USA to build free hospitals and colleges. Name the film.', 'Its subtitle is "The Boss".', 'Same name as a great Maratha king.', 'SIVAJI', 'sivaji the boss'],
      ['The Mozart of Madras', PERSON, 'Which Chennai composer won two Oscars for the music of "Slumdog Millionaire"?', 'He composed "Jai Ho" and "Chinna Chinna Aasai".', 'A. R. ______.', 'RAHMAN', 'ar rahman', 'a r rahman']
    ],
    example: 'Rahman composes music while our chatbot helps Sivaji build better schools.'
  },
  {
    letter: 'x', theme: 'Youth of Bharat',
    riddles: [
      ['The Training Library', AI, 'What is the name for a large collection of examples, like thousands of labelled photos, used to train an AI model?', 'Data + set.', 'Starts with DATA, 7 letters.', 'DATASET', 'data set'],
      ['The Kabaddi Hero', FILM, 'In this 2004 Vijay film, kabaddi player Velu rescues Dhanalakshmi from the villain Muthupandi. Name the film.', 'It is a remake of the Telugu film "Okkadu".', '6 letters, starts with GH.', 'GHILLI'],
      ['Arise, Awake', PERSON, 'Which Indian monk spoke at the 1893 Parliament of Religions in Chicago, starting with "Sisters and Brothers of America"?', 'National Youth Day is celebrated on his birthday, 12 January.', 'Swami ___________.', 'VIVEKANANDA', 'swami vivekananda']
    ],
    example: 'Vivekananda inspires youth, so we build a dataset and play like Ghilli.'
  },
  {
    letter: 'y', theme: 'Voice of Freedom',
    riddles: [
      ['The Voice in the Speaker', AI, 'What is the name of Amazon\'s voice assistant that answers when you say its name to an Echo speaker?', 'Its rivals are Siri and Google Assistant.', '5 letters, starts with AL.', 'ALEXA'],
      ['The Heist Movie', FILM, 'Ajith Kumar\'s 50th film (2011), where a suspended cop plans to steal betting money. Name the film.', 'Directed by Venkat Prabhu; Ajith played Vinayak Mahadevan.', 'Starts with MANK.', 'MANKATHA'],
      ['The Mahatma', PERSON, 'Who led the Salt March in 1930 and is called the Father of the Nation in India?', 'His birthday, 2 October, is a national holiday.', 'Surname of Mohandas Karamchand.', 'GANDHI', 'mahatma gandhi', 'mohandas gandhi']
    ],
    example: 'Gandhi walked for freedom while Alexa reads the plan to win Mankatha.'
  },
  {
    letter: 'z', theme: 'Poet of Fire',
    riddles: [
      ['The Apple Assistant', AI, 'What is the name of the voice assistant on the iPhone?', 'You can wake it by saying "Hey ____".', '4 letters, starts with S.', 'SIRI'],
      ['Superstar Style', FILM, 'In this 2019 Karthik Subbaraj film, Rajinikanth is a hostel warden named Kaali. Name the film.', 'Vijay Sethupathi and Nawazuddin Siddiqui played the villains.', '5 letters, starts with PE.', 'PETTA'],
      ['Mahakavi', PERSON, 'Which Tamil poet and freedom fighter from Ettayapuram wrote fiery patriotic songs and is called "Mahakavi"?', 'Full name: Subramania _______.', 'Starts with BHARA.', 'BHARATHI', 'bharathiyar', 'subramania bharati', 'bharati']
    ],
    example: 'Bharathi wrote brave songs, Siri helps us search, and Petta style inspires us.'
  },
  {
    letter: 'aa', theme: 'Search Leaders',
    riddles: [
      ['Teaching the Machine', AI, 'What is the stage where an AI model learns patterns from data before it is used?', 'Before you test a model, you do this to it.', '8 letters, starts with TRAIN.', 'TRAINING'],
      ['The Thalapathy Mass', FILM, 'In this 2017 Atlee film, Vijay plays three roles including a doctor who charges only five rupees. Name the film.', 'The song "Aalaporan Thamizhan" is from this film.', '6 letters, starts with ME.', 'MERSAL'],
      ['Google\'s Chief', PERSON, 'Which Chennai-born engineer, an IIT Kharagpur graduate, became the CEO of Google and Alphabet?', 'First name Sundar.', 'Surname: P _ _ _ _ _.', 'PICHAI', 'sundar pichai']
    ],
    example: 'Pichai leads Google, and our training plan will help us win like Mersal.'
  },
  {
    letter: 'bb', theme: 'Tryst with Destiny',
    riddles: [
      ['The Fake Face', AI, 'What do we call an AI-made video that swaps a real person\'s face so they appear to say things they never said?', 'Deep learning + fake.', '8 letters, starts with DEEP.', 'DEEPFAKE', 'deep fake'],
      ['Police Commissioner', FILM, 'In this 2020 A. R. Murugadoss film, Rajinikanth plays Aaditya Arunasalam, a tough police commissioner in Mumbai. Name the film.', 'Nayanthara is the heroine.', '6 letters, starts with DAR.', 'DARBAR'],
      ['First Prime Minister', PERSON, 'Who was India\'s first Prime Minister and gave the "Tryst with Destiny" speech?', 'Children\'s Day, 14 November, is his birthday.', 'Jawaharlal _____.', 'NEHRU', 'jawaharlal nehru']
    ],
    example: 'Nehru built a new nation, so we spot every deepfake and solve it like Darbar.'
  },
  {
    letter: 'cc', theme: 'Saint of the Streets',
    riddles: [
      ['Prove You Are Human', AI, 'What is the name of the test with wavy letters or "click all traffic lights" pictures that websites use to stop robots?', 'Its full form ends with "…tell Computers and Humans Apart".', '7 letters, starts with CAP.', 'CAPTCHA'],
      ['The Fearless Farmer', FILM, 'In this 2019 Vetrimaaran film, Dhanush plays Sivasaami, a farmer who fights a powerful landlord. Name the film.', 'Based on the novel "Vekkai" by Poomani.', '6 letters, starts with AS.', 'ASURAN'],
      ['Saint of Kolkata', PERSON, 'Which nun won the 1979 Nobel Peace Prize for caring for the poor and sick in Kolkata?', 'She founded the Missionaries of Charity.', 'Mother ______.', 'TERESA', 'mother teresa']
    ],
    example: 'Teresa served people kindly, so we solve each captcha with Asuran courage.'
  },
  {
    letter: 'dd', theme: 'Run Machine',
    riddles: [
      ['Google\'s Twin AI', AI, 'What is the name of Google\'s family of AI models that replaced Bard, named after a star sign?', 'The star sign of the twins.', '6 letters, starts with GEM.', 'GEMINI'],
      ['The Gangster Comeback', FILM, 'In this 2016 Pa. Ranjith film, Rajinikanth plays an ageing gangster in Malaysia. Name the film.', 'Famous line: "Kabali da!"', '6 letters, starts with KA.', 'KABALI'],
      ['King Kohli', PERSON, 'Which Indian batsman, nicknamed "King", has scored more than 50 ODI centuries?', 'First name Virat; plays for Royal Challengers Bengaluru.', 'Virat _____.', 'KOHLI', 'virat kohli', 'virat']
    ],
    example: 'Kohli chases every target, and Gemini helps us plan like Kabali.'
  }
];

// ------------------------------------------------------------------ ROUND 2
// Ten words per set; each word starts with the last letter of the previous one.
// Node 10 is the boss word. Entries: [word, category, prompt, hint]
const R2_SETS = [
  {
    id: 'r2_circuit_upsilon', theme: 'Circuit Upsilon: Frostbyte Grid',
    nodes: [
      ['BLOCK', '⛓️ Blockchain', 'A batch of transactions linked to the previous one in a blockchain.', 'Building ____ ; ____chain.'],
      ['KOTLIN', '📱 Android Dev', 'The modern language Google recommends for Android apps, made by JetBrains.', 'Named after an island near St Petersburg.'],
      ['NANO', '📝 Terminal Editors', 'A simple command-line text editor on Linux, easier than vim.', 'Also means one-billionth.'],
      ['OUTPUT', '🖨️ Data Flow', 'What a program produces after processing its input.', 'The opposite of input.'],
      ['TABLET', '📲 Devices', 'A flat touchscreen computer bigger than a phone, like an iPad.', 'Also a word for a medicine pill.'],
      ['TRIGGER', '🗄️ Databases', 'Code that runs automatically in a database when a row is inserted or updated.', 'Also the part you pull on a gun.'],
      ['RUBY', '💎 Languages', 'A programming language named after a red gemstone, used by Rails.', 'Birthstone of July.'],
      ['YAHOO', '🌐 Web Classics', 'A 1990s web portal and email service with a purple logo.', 'Ends with a cheer: "Yahoo!"'],
      ['OFFLINE', '📡 Connectivity', 'Not connected to the internet.', 'The opposite of online.'],
      ['ENCRYPT', '🔐 Security', 'To scramble data so only someone with the key can read it.', 'Opposite of decrypt.']
    ]
  },
  {
    id: 'r2_circuit_phi', theme: 'Circuit Phi: Glacier Mainframe',
    nodes: [
      ['SPAM', '📧 Email', 'Unwanted junk email sent in bulk.', 'Also a tinned meat.'],
      ['MONITOR', '🖥️ Hardware', 'The screen that displays a desktop computer\'s output.', 'Also means "to watch closely".'],
      ['REPO', '🗂️ Version Control', 'Short name for a Git repository.', 'First four letters of "repository".'],
      ['OPERA', '🌐 Browsers', 'A web browser from Norway, also a form of musical theatre.', 'Red "O" logo.'],
      ['ANDROID', '📱 Mobile OS', 'Google\'s mobile operating system with a green robot mascot.', 'Versions were named after desserts.'],
      ['DOMAIN', '🌍 Web', 'A website name like google.com.', '____ name system (DNS).'],
      ['NOKIA', '📞 Phones', 'Finnish phone maker famous for the 3310 and the Snake game.', '"Connecting People".'],
      ['ADMIN', '🛠️ Access', 'Short for administrator: the user with full control.', 'Sys____.'],
      ['NUMPY', '🐍 Python Libraries', 'The Python library for fast arrays and maths.', 'Num + Py.'],
      ['PHISHING', '🎣 Cyber Attacks', 'A fake email or site that tricks people into giving passwords.', 'Sounds like catching fish.']
    ]
  },
  {
    id: 'r2_circuit_chi', theme: 'Circuit Chi: Blizzard Relay',
    nodes: [
      ['CACHE', '⚡ Performance', 'Fast temporary storage that keeps recently used data close by.', 'Clear your browser ____.'],
      ['EMOJI', '😀 Messaging', 'Small pictures like 😂 used in text messages.', 'Japanese word for "picture character".'],
      ['INTEL', '🧠 Chip Makers', 'The company behind Core i5 and i7 processors.', '"___ Inside".'],
      ['LAPTOP', '💻 Devices', 'A portable computer you can carry and use on your lap.', 'What you are probably using now.'],
      ['PRINTER', '🖨️ Peripherals', 'A device that puts documents onto paper.', 'Inkjet or laser.'],
      ['RUST', '🦀 Languages', 'A memory-safe systems programming language with a crab mascot.', 'What iron gets when it is wet.'],
      ['TWITTER', '🐦 Social Media', 'The social network with a blue bird logo, now renamed X.', 'Tweets came from here.'],
      ['REBOOT', '🔄 Troubleshooting', 'To switch a computer off and on again.', 'Re + boot.'],
      ['TERMINAL', '⌨️ Command Line', 'The text window where you type commands.', 'Also a bus or airport building.'],
      ['BLUETOOTH', '📶 Wireless', 'Short-range wireless used for earbuds and speakers.', 'Named after a Danish king.']
    ]
  },
  {
    id: 'r2_circuit_psi', theme: 'Circuit Psi: Aurora Datalink',
    nodes: [
      ['SCREEN', '🖥️ Display', 'The glass surface where you see a device\'s picture.', 'Touch______.'],
      ['NVIDIA', '🎮 GPUs', 'The company that makes GeForce graphics cards used for AI.', 'Green logo with an eye.'],
      ['APPLE', '🍎 Tech Giants', 'The company that makes the iPhone and the Mac.', 'A fruit with a bite taken out.'],
      ['EDGE', '🌐 Browsers', 'Microsoft\'s web browser that replaced Internet Explorer.', 'Also the border of something.'],
      ['ETHERNET', '🔌 Networking', 'Wired network connection using a cable plugged into a port.', 'Ether + net.'],
      ['TOUCH', '👆 Input', 'Screens that respond to your finger are called ____screens.', 'One of the five senses.'],
      ['HTML', '🌐 Web Basics', 'The markup language used to build web pages.', 'HyperText Markup Language.'],
      ['LINKEDIN', '💼 Social Media', 'The professional social network for jobs and résumés.', 'Linked + in.'],
      ['NOTEPAD', '📝 Windows Apps', 'The simple plain-text editor built into Windows.', 'Note + pad.'],
      ['DATABASE', '🗄️ Storage', 'An organised store of data, like MySQL or MongoDB.', 'Data + base.']
    ]
  },
  {
    id: 'r2_circuit_yeti', theme: 'Circuit Yeti: Snowcap Core',
    nodes: [
      ['WIFI', '📶 Wireless', 'Wireless internet at home or college.', 'Wireless fidelity.'],
      ['ICON', '🖼️ Interfaces', 'A small picture on screen that you click to open an app.', 'Also a famous, admired person.'],
      ['NINTENDO', '🎮 Gaming', 'The Japanese company behind Mario and the Switch console.', 'Super Mario\'s home.'],
      ['OUTLOOK', '📧 Email', 'Microsoft\'s email and calendar app.', 'Also means your view of the future.'],
      ['KEYWORD', '🔍 Search', 'A word you type into a search engine to find something.', 'Key + word.'],
      ['DIGITAL', '💡 Tech Basics', 'Using numbers (0s and 1s) rather than continuous signals.', '____ India campaign.'],
      ['LOGIN', '🔑 Access', 'The screen where you enter your username and password.', 'Log + in.'],
      ['NUMBER', '🔢 Data Types', 'Integers and floats are kinds of this.', 'Phone ______.'],
      ['ROBOTICS', '🤖 Engineering', 'The field of designing and building robots.', 'Robot + ics.'],
      ['SMARTPHONE', '📱 Devices', 'A mobile phone with apps and internet.', 'Smart + phone.']
    ]
  },
  {
    id: 'r2_circuit_sleet', theme: 'Circuit Sleet: Icefall Array',
    nodes: [
      ['GOOGLE', '🔍 Search', 'The most popular search engine in the world.', 'Named after a very large number.'],
      ['ENTER', '⌨️ Keyboard', 'The key you press to submit or start a new line.', 'Also means "to go in".'],
      ['RECYCLE', '🗑️ Desktop', 'Windows keeps deleted files in the ______ Bin.', 'Reuse waste.'],
      ['ESCAPE', '⌨️ Keyboard', 'The "Esc" key, used to cancel or exit.', 'To break free.'],
      ['ENGINE', '⚙️ Software', 'Unity and Unreal are game ______s.', 'Also powers a car.'],
      ['EBOOK', '📚 Reading', 'A book you read on a screen, like on a Kindle.', 'Electronic book.'],
      ['KILOBYTE', '💾 Storage Units', 'About 1,000 bytes; the unit before a megabyte.', 'Kilo + byte.'],
      ['EMBED', '🔗 Web', 'To place a video or map inside a web page.', 'Em + bed.'],
      ['DOWNLOAD', '⬇️ Internet', 'To copy a file from the internet to your device.', 'Opposite of upload.'],
      ['TELEGRAM', '✈️ Messaging', 'A messaging app with a paper-plane logo.', 'Also an old way to send short messages by wire.']
    ]
  },
  {
    id: 'r2_circuit_tundra', theme: 'Circuit Tundra: Polar Stack',
    nodes: [
      ['JAVA', '☕ Languages', 'A programming language named after Indonesian coffee.', '"Write once, run anywhere".'],
      ['ADOBE', '🎨 Software', 'The company that makes Photoshop and PDF Reader.', 'A red "A" logo.'],
      ['EXPORT', '📤 Files', 'To save your work in another format, like a PDF.', 'Opposite of import.'],
      ['TOOLBAR', '🧰 Interfaces', 'A row of buttons at the top of an app window.', 'Tool + bar.'],
      ['REFRESH', '🔄 Browsers', 'To reload a web page (F5).', 'Also means to make fresh again.'],
      ['HOTSPOT', '📶 Mobile Data', 'Sharing your phone\'s internet with other devices.', 'Hot + spot.'],
      ['TRASH', '🗑️ Desktop', 'Where deleted files go on a Mac.', 'Another word for rubbish.'],
      ['HEADPHONE', '🎧 Audio', 'A device worn over the ears to listen privately.', 'Head + phone.'],
      ['EMULATOR', '🕹️ Software', 'A program that lets one system act like another, e.g. playing old console games on a PC.', 'Starts with EMU, like the bird.'],
      ['RANSOMWARE', '💀 Cyber Attacks', 'Malware that locks your files and demands payment.', 'Ransom + ware.']
    ]
  },
  {
    id: 'r2_circuit_flurry', theme: 'Circuit Flurry: Crystal Mesh',
    nodes: [
      ['PASTE', '📋 Editing', 'Ctrl + V does this.', 'Copy and _____.'],
      ['EDITOR', '📝 Software', 'An app for writing and changing text or code, like VS Code.', 'Also the person who checks a newspaper.'],
      ['RESIZE', '📐 Images', 'To change the width and height of an image or window.', 'Re + size.'],
      ['ELEMENT', '🧩 Web Pages', 'In HTML, a tag like <p> or <div> creates an _______.', 'Also something on the periodic table.'],
      ['TEMPLATE', '📄 Documents', 'A ready-made layout you fill in, like a résumé format.', 'Starts with TEMP.'],
      ['ENTITY', '🗃️ Data Modelling', 'In a database diagram, a thing like "Student" or "Course".', 'E-R diagram: ______-Relationship.'],
      ['YOUTUBE', '▶️ Video', 'The video site owned by Google with a red play button.', 'You + Tube.'],
      ['EXECUTE', '▶️ Running Code', 'To run a program or command.', '.exe files are made to do this.'],
      ['EARBUDS', '🎧 Audio', 'Small wireless headphones that sit inside your ears.', 'Ear + buds.'],
      ['SPREADSHEET', '📊 Office Apps', 'A grid of rows and columns, like Excel or Google Sheets.', 'Spread + sheet.']
    ]
  },
  {
    id: 'r2_circuit_hailstone', theme: 'Circuit Hailstone: Frozen Kernel',
    nodes: [
      ['BROWSER', '🌐 Web', 'An app like Chrome or Firefox used to visit websites.', 'To look around casually is to ______.'],
      ['REMOTE', '🏠 Work', 'Working from home is called ______ work.', 'Also the TV controller.'],
      ['EXTENSION', '🧩 Browsers', 'An add-on that gives a browser extra features, like an ad blocker.', 'Also the part of a filename after the dot.'],
      ['NOTCH', '📱 Phone Design', 'The cut-out at the top of some phone screens for the camera.', 'A small V-shaped cut.'],
      ['HARDWARE', '🔩 Computers', 'The physical parts of a computer you can touch.', 'Opposite of software.'],
      ['EMAIL', '📧 Messaging', 'Electronic mail.', 'You have one with @ in it.'],
      ['LAPTOP', '💻 Devices', 'A portable folding computer.', 'Lap + top.'],
      ['PIXEL', '🖼️ Graphics', 'The tiny dot that makes up a digital image.', 'Also the name of Google\'s phones.'],
      ['LIBRARY', '📚 Code', 'A collection of ready-made code you can reuse, like NumPy.', 'Also a place full of books.'],
      ['YOUTUBER', '🎬 Creators', 'A person who makes videos for a living on YouTube.', 'YouTube + r.']
    ]
  },
  {
    id: 'r2_circuit_whiteout', theme: 'Circuit Whiteout: Avalanche Vault',
    nodes: [
      ['VIRUS', '🦠 Malware', 'Malicious code that spreads by copying itself into other files.', 'Also something that makes you sick.'],
      ['SOCKET', '🔌 Networking', 'An endpoint for sending data between two programs; also a wall plug.', 'Web______ for live chat.'],
      ['TORRENT', '📥 File Sharing', 'A peer-to-peer way to share big files.', 'Also a strong rush of water.'],
      ['TOGGLE', '🎚️ Interfaces', 'A switch that flips between on and off.', 'Rhymes with goggle.'],
      ['EXCEL', '📊 Office Apps', 'Microsoft\'s spreadsheet program.', 'Also means "to do very well".'],
      ['LAYOUT', '📐 Design', 'How things are arranged on a page or screen.', 'Lay + out.'],
      ['TOUCHPAD', '🖱️ Input', 'The flat area on a laptop you slide your finger on instead of a mouse.', 'Touch + pad.'],
      ['DESKTOP', '🖥️ Computers', 'A computer that stays on a table, or the main screen of your PC.', 'Desk + top.'],
      ['PLAYSTORE', '🛒 Apps', 'Google\'s app store for Android phones (written as one word).', 'Play + Store.'],
      ['ENCODER', '🔐 Data', 'A program or circuit that converts information into a code.', 'Opposite of decoder.']
    ]
  }
];

// ------------------------------------------------------------------ expansion
function buildRound1Set(def) {
  const id = `r1_set_${def.letter}`;
  const steps = def.riddles.map(([title, category, prompt, clue, hint, answer, ...others], i) => ({
    id: `${id}_${i + 1}`,
    title,
    category,
    prompt,
    clue,
    hint,
    expectedFragment: answer,
    acceptedAnswers: [answer.toLowerCase(), ...others]
  }));
  const keywords = steps.map(s => s.expectedFragment).join(', ');
  return {
    setId: id,
    theme: def.theme,
    steps,
    leaderTask: {
      title: 'Grand Knowledge Synthesis',
      instructions: `Compose a complete sentence (5-30 words) with an action verb that uses at least 3 of your collected keywords (${keywords}).`,
      hint: `Example: "${def.example}"`
    }
  };
}

function buildRound2Set(def) {
  const short = def.id.replace('r2_circuit_', '').slice(0, 3);
  const steps = def.nodes.map(([word, category, prompt, hint], i) => {
    const prev = i > 0 ? def.nodes[i - 1][0] : null;
    const pad = (n) => String(n).padStart(2, '0');
    let bridgeClue;
    if (i === 0) bridgeClue = '⚡ ENTRY KEY: The first password that opens this circuit.';
    else if (i === def.nodes.length - 1 && prev.slice(-1) !== word[0]) bridgeClue = `⚡ MASTER CORE OVERRIDE: The final password starts with '${word[0]}'.`;
    else bridgeClue = `⚡ LINKED FROM NODE ${pad(i)} [${prev}] ➔ Starts with the ending letter '${word[0]}'.`;
    return {
      id: `r2_${short}_${i + 1}`,
      nodeNumber: i + 1,
      category: i === def.nodes.length - 1 ? '👑 FINAL BOSS OVERRIDE' : category,
      targetWord: word,
      length: word.length,
      bridgeClue,
      prompt,
      hint,
      acceptedAnswers: [word.toLowerCase()]
    };
  });
  return { setId: def.id, theme: def.theme, steps };
}

const EXTRA_R1_SETS = R1_SETS.map(buildRound1Set);
const EXTRA_R2_SETS = R2_SETS.map(buildRound2Set);

module.exports = { EXTRA_R1_SETS, EXTRA_R2_SETS };
