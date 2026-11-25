/* ==========================================================================
   CONTENT — edit this file to update the portfolio.
   Everything on the site is rendered from SITE, SERIES and PROJECTS below.
   ========================================================================== */
(function () {
  /* Image helper — keeps the real proportions so artwork is never cropped.
     Smaller copies live in assets/work/opt/<name>-<width>.jpg (only widths at least
     100px narrower than the original); the browser picks the smallest one that is
     still sharp for the space it fills. */
  const VARIANTS = [480, 640, 800, 1000, 1200, 1400];
  const img = (file, width, height, alt) => {
    const src = `assets/work/${file}`;
    const base = file.replace(/\.[^.]+$/, "");
    // WebP copies (about a quarter smaller) are offered first; the JPG stays as the fallback src
    const set = VARIANTS.filter((w) => w <= width - 100).map((w) => `assets/work/opt/${base}-${w}.webp ${w}w`);
    return { src, width, height, alt, srcset: [...set, `assets/work/${base}.webp ${width}w`].join(", ") };
  };

  window.SITE = {
    /* COLOURS — the whole site and the 3D scene take their colours from here. */
    theme: {
      paper: "#FAFAFA",   // background
      ink: "#413935",     // text, lines, the cursor
      // soft washes in the 3D mist: mist blue, sage, blush, lavender grey, slate
      washes: ["#AFC3D6", "#BCC9B4", "#EBCFCB", "#CEC8DE", "#8FA6B5"],
      // the fine dots drifting between the layers
      dots: ["#4F6FA8", "#C46A6A", "#413935", "#7FA08A"],
    },

    name: "Neda Varbanova",
    role: "Designer & Visual Artist",
    location: "Sofia, Bulgaria",
    timezone: "Europe/Sofia",
    years: "2024—2027",
    email: "neda.varbanova@gmail.com",
    phone: { label: "+359 882874452", href: "tel:+359882874452" },
    description: "Neda Varbanova — designer and visual artist from Sofia, Bulgaria. Watercolour, linocut, posters, illustration and brand design.",

    availability: { available: true, label: "Available for projects and work" },

    /* 1. HERO */
    hero: {
      lines: ["Neda", "Varbanova"],                  // one entry per line of the big headline
      kicker: "Designer & visual artist",
      intro: "Watercolour, printmaking, posters, illustration and brand design, from Sofia, Bulgaria.",
      hint: "Scroll to explore",
      paintHint: "Move to paint",                    // shown when painting is possible; "" hides it
    },

    /* 2. INTRO STATEMENT — revealed word by word as you scroll */
    statement:
      "Inspired by nature, music, people and the experiences that shape me, I weave fragments of my life into every piece I make, from a single watercolour to a whole brand.",

    /* 4. CLIENTS — the endless marquee. Replace the placeholders with real names. */
    marquee: {
      label: "Clients & collaborators",
      items: ["Puldin", "Red Beard Studio", "Robin", "UNIART", "Client Name", "Studio Name", "Gallery Name"],
    },

    /* 5. ACHIEVEMENTS — numbers count up when they scroll into view. Placeholders: edit freely. */
    stats: [
      { value: 40, suffix: "+", label: "Artworks painted and printed" },
      { value: 7, suffix: "", label: "Projects in this portfolio" },
      { value: 3, suffix: "", label: "Brand clients" },
      { value: 1, suffix: "", label: "Exhibition" },
    ],

    /* 6. SERVICES — each opens to show its list */
    services: [
      { title: "Watercolour & painting", items: ["Still life & landscape", "Commissioned paintings", "Ink & wash sketches", "Mixed media"] },
      { title: "Printmaking", items: ["Linocut", "Limited edition prints", "Exhibition series"] },
      { title: "Illustration & characters", items: ["Character design", "Editorial illustration", "T-shirt & merchandise artwork"] },
      { title: "Brand & packaging", items: ["Logo design", "Packaging illustration", "Posters & campaigns", "Brand applications"] },
    ],

    /* 7. CLOSING CALL TO ACTION */
    cta: { lines: ["Let’s work", "together"], button: "Start a project" },

    /* The closing line at the very bottom of the page, set over a photo */
    credit: "This portfolio website was designed and built by me as part of my creative work :)",
    creditImage: img("neda-portrait.jpg", 1214, 802, "Neda Varbanova smiling and looking down, on film, in soft blue and pink light"),

    ticker: "Neda Varbanova",

    about: {
      intro:
        "Inspired by nature, music, people, and the experiences that shape me, I weave fragments of my life into every piece of art I create.",
      paragraphs: [
        "My practice often combines these approaches through mixed media, photography, collage and illustration.",
        "Inspired by nature, personal experiences and everyday moments, I use art as a way to explore and express my inner world. I am drawn to experimentation, discovering new ways of working and translating emotions and observations into visual forms.",
        "I travel a lot and love exploring the world. I started by travelling around my own country, meeting the clients I was working with and taking inspiration from the world around me, and I keep doing so as I continue to study and express myself.",
      ],
      whatIDo: ["Watercolour", "Linocut & printmaking", "Poster design", "Illustration & character design", "Logo, packaging & merchandise", "Mixed media, photography & collage"],
      clients: ["Puldin", "Red Beard Studio", "Robin"],
    },

    contact: {
      headline: ["Let’s make", "something together"],
      note: "Commissions, illustration, posters, logos or a collaboration: I'm available for projects and work.",
    },

    socials: [{ label: "Instagram", handle: "@nedavarbanova", url: "https://instagram.com/nedavarbanova" }],
  };

  /* SERIES — the numbered projects on the home page, in order.
     reveal: how its works appear on scroll ("wash" | "print" | "spray" | "sketch").
     accent: the colour of the watercolour bloom when you open one of its works. */
  window.SERIES = [
    {
      id: "watercolour", year: 2025, title: "Watercolour Studies", reveal: "wash", accent: "#c9577a",
      meta: [["Medium", "Watercolour"], ["Size", "A4 (21 × 29.7 cm)"]],
      text: [
        "A series of watercolour studies exploring the qualities and expressive possibilities of the medium. Developed during a dedicated study session, the collection features a variety of still-life compositions and landscapes, each painted exclusively with a square brush.",
        "By limiting my tools and techniques, I focused on texture, colour interaction, layering and the spontaneous nature of watercolour. The square brush became the defining element of the process. Its distinct marks and shapes created their own visual language.",
        "The brush also kept me from getting lost in fine detail. At the same time, I pushed myself to see how much detail I could still get out of it.",
      ],
    },
    {
      id: "i-want", year: 2025, title: "I Want — Linocut Prints", reveal: "print", accent: "#4f6f99",
      meta: [["Medium", "Linocut / Printmaking"], ["Exhibition", "UNIART, New Bulgarian University"]],
      text: [
        "A two-part linocut series, Безпределност (Boundlessness) and Прибой (Surf), created for and shown in the UNIART exhibition at New Bulgarian University, under the theme I Want.",
        "The works explore desire, longing and the search for a sense of belonging. Through the imagery of a boat lost at sea and a fender drifting alongside it, I wanted to express a particular emotional state — one of uncertainty, displacement and introspection.",
        "Both objects exist within the same vast, unfamiliar sea, appearing lost while simultaneously navigating their own way towards self-discovery. The two prints reflect a personal longing for a state of being that is difficult to define, somewhere between feeling lost and finding oneself.",
      ],
      // a link shown with the series text (home page and each work's page)
      link: { label: "See the exhibition on UNIART", url: "https://www.uniart.bg/%D0%9E%D0%B1%D1%80%D0%B0%D0%B7%D0%B8+%D0%B8+%D0%BE%D1%82%D0%BF%D0%B5%D1%87%D0%B0%D1%82%D1%8A%D1%86%D0%B8%2B%2B%2B%2B%D0%A1%D1%8A%D0%B1%D0%B8%D1%82%D0%B8%D1%8F/1/MNevctKHY5KHcZOHYNWvcBe3Y1KLcBe-YVafMBebMZeXctKbcBafMJefYFefI5KHcNKT" },
    },
    {
      id: "posters", year: 2025, title: "Poster Design", subtitle: "Frightening, Obscene Gesture & Power", reveal: "spray", accent: "#e0452e",
      meta: [["Context", "Academic Project / Poster Design"]],
      text: [
        "A collection of three posters developed as part of a university assignment, exploring different visual interpretations of assigned themes through graphic communication and conceptual imagery.",
      ],
    },
    {
      id: "sketches", year: 2025, title: "Sketches & Studies", subtitle: "Dry chalk and pencil", reveal: "sketch", accent: "#5a5552",
      meta: [["Medium", "Dry black chalk / Pencil"], ["Size", "50 × 70 cm"], ["Context", "Life drawing"]],
      text: [
        "A series of life drawings made in dry black chalk and pencil, each completed in twenty minutes to an hour, directly from the model.",
        "Working with dry chalk, I studied both the material itself and drawing from life, aiming to capture each model with their own character.",
      ],
    },
    {
      id: "puldin", year: 2024, title: "Puldin — Дивите козлета", subtitle: "The Wild Goats · Logo Design & T-Shirt Illustrations", reveal: "sketch", accent: "#5f7040",
      meta: [["Client", "Puldin — Дивите козлета (The Wild Goats)"], ["Project", "Brand Identity / Logo Design / T-shirt Illustration"]],
      text: [
        "Three projects for Puldin — Дивите козлета (The Wild Goats), a tourism company inspired by the spirit of adventure, nature and mountain exploration: the company’s logo, a commemorative T-shirt for its marathon event, and a T-shirt for its trip to the Pyrenees.",
      ],
    },
    {
      id: "robin-identity", year: 2026, title: "Red Beard Studio — Brand Logo", reveal: "sketch", accent: "#b0262c",
      meta: [["Client", "Red Beard Studio"], ["Project", "Logo Design / Brand Applications"]],
      text: [
        "A logo designed for RB Studio (Red Beard Studio), a catering studio named after the robin bird, whose work brings together food, fashion and visual culture. The studio is closely connected to Robin, the café and bakery whose Easter packaging appears later in this portfolio, so the same robin carries through both projects.",
        "The mark is a loose, brush-drawn robin with the letters R and B doodled into the bird itself, so that the studio’s initials and its namesake form a single image. The hand-drawn line gives the identity a personal, handmade character.",
      ],
    },
    {
      id: "robin-characters", year: 2026, title: "Leak — Character Illustrations", reveal: "sketch", accent: "#a9532f", phonePairs: true,
      meta: [["Client", "Leak — coffee, bakery & film projections (opening soon)"], ["Project", "Character Design / Illustration"]],
      text: [
        "A set of illustrated characters for Leak, a coffee place, bakery and film-projection space that two friends are preparing to open. The two girls behind the project shared their vision with me, and I developed the characters to fit their whole concept: one carries a coffee cup, the other a film reel, bringing both sides of the venue together.",
        "We worked closely together, refining the characters as they described the atmosphere and personality they wanted Leak to have. The designs are made to be worn by the staff as T-shirts, and to grow with the brand later through stickers and other branded pieces.",
        "The result is a playful, approachable character language that gives Leak a recognisable personality before its doors even open.",
      ],
    },
    {
      id: "robin-kozunak", year: 2026, title: "Robin — Easter Kozunak Packaging", reveal: "sketch", accent: "#8a5330",
      meta: [["Client", "Robin"], ["Project", "Packaging Illustration / Poster Design"]],
      text: [
        "An illustrated visual identity developed for Robin's seasonal Easter packaging, featuring the robin bird alongside an elongated illustrative composition.",
        "The artwork was created for a special bucket packaging design for kozunak, a traditional Bulgarian sweet Easter bread.",
        "The robin appears in two versions. The dotted bird from Robin’s logo is used on the buckets themselves, while for the flyers I sketched a looser, more playful bird by hand. A flyer was placed inside every bucket: one side carries the sketched bird and the words “better when shared”, the other a step-by-step illustration I drew to show how to enjoy the kozunak, from unwrapping and slicing it to spreading the jam and taking the first bite.",
        "The project combines illustration and seasonal storytelling to create a distinctive visual presentation for a traditional product, connecting cultural heritage with contemporary brand design.",
      ],
    },
  ];

  /* WORKS — each belongs to a series. span = columns out of 12 on desktop; start = optional start column.
     description (optional) is the work's own text; otherwise its page shows the series text. */
  window.PROJECTS = [
    /* 01 Watercolour Studies */
    { slug: "roses-and-cherries", series: "watercolour", span: 8, title: "Roses & Cherries", category: "Watercolour", cover: img("roses-and-cherries.jpg", 1568, 1137, "Watercolour of pink roses above a bowl of red cherries") },
    { slug: "preserved", series: "watercolour", span: 4, title: "Preserved", category: "Watercolour", cover: img("preserved.jpg", 1143, 1533, "Watercolour of fruit inside a glass jar with a red lid") },
    { slug: "rock-by-the-sea", series: "watercolour", span: 4, title: "Rock by the Sea", category: "Watercolour", cover: img("rock-by-the-sea.jpg", 1560, 1079, "Watercolour of a large rock by the sea under pink clouds") },
    { slug: "persimmons", series: "watercolour", span: 4, title: "Persimmons", category: "Watercolour", cover: img("persimmons.jpg", 1568, 1141, "Watercolour of three persimmons with blue ornaments") },
    { slug: "figs-and-blueberries", series: "watercolour", span: 4, title: "Figs & Blueberries", category: "Watercolour", cover: img("figs-and-blueberries.jpg", 1568, 1135, "Watercolour of a halved fig on a blue patterned plate with blueberries") },
    { slug: "harvest", series: "watercolour", span: 4, title: "Harvest", category: "Watercolour", cover: img("harvest.jpg", 1074, 1552, "Watercolour still life of pumpkins, corn and a blue bowl") },
    {
      slug: "plovdiv-musicians", series: "watercolour", span: 8, title: "Plovdiv Musicians", category: "Ink & wash",
      description: [
        "Unlike the rest of the series, this piece was made with a fine black liner marker. I then spread its ink with water, softening the lines into grey washes for a watercolour effect.",
      ],
      cover: img("plovdiv-musicians.jpg", 1488, 1071, "Ink and wash sketch of two guitarists in hats, Plovdiv 2025"),
    },

    /* 02 I Want — Linocut Prints */
    {
      slug: "bezpredelnost", series: "i-want", span: 7, lang: "bg", title: "Безпределност", category: "Linocut",
      summary: "Boundlessness: the boat, lost at sea.",
      process: [{ image: img("proc-bezpredelnost.jpg", 1047, 895, "Pencil sketchbook study of the boat's mast and the fender against mountains"), caption: "First sketch of the composition" }], cover: img("bezpredelnost.jpg", 1556, 1190, "Two-colour linocut print titled Bezpredelnost"),
    },
    {
      slug: "priboy", series: "i-want", span: 5, lang: "bg", title: "Прибой", category: "Linocut",
      summary: "Surf: the fender, drifting alongside it.",
      process: [{ image: img("proc-priboy.jpg", 765, 1550, "Sketchbook page with two framed sketches of a fender at sea and handwritten notes"), caption: "Sketchbook notes and early ideas" }], cover: img("priboy.jpg", 1141, 1552, "Two-colour linocut of a rope knot and netted fender over water"),
    },

    /* 03 Poster Design */
    {
      slug: "frightening", series: "posters", span: 4, title: "Frightening", category: "Poster",
      summary: "The visual language of fear.",
      description: [
        "Exploring the visual language of fear, this poster uses unsettling imagery and atmosphere to communicate a sense of unease. The composition translates the abstract idea of something frightening into a visual statement.",
      ],
      cover: img("uzhas.jpg", 1200, 1600, "Black and white poster of a face made of framed fragments with red accents"),
    },
    {
      slug: "obscene-gesture", series: "posters", span: 4, title: "Obscene Gesture", category: "Poster",
      summary: "Street art and non-verbal communication.",
      meta: [["Theme", "Street Art & Non-verbal Communication"]],
      description: [
        "A poster exploring alternative forms of communication within street culture and graffiti communities.",
        "The concept examines how gestures can become a visual language through which individuals and street artists express themselves, communicate attitudes and establish connections without relying on verbal exchange or physical confrontation.",
        "Using an obscene hand gesture as the central visual element, I reinterpreted an otherwise provocative symbol through the aesthetics of street art and wall painting. The intention was to transform the gesture into a graphic statement, exploring the relationship between rebellion, identity, expression and urban visual culture.",
      ],
      cover: img("gestures.jpg", 1200, 1600, "Colourful street-art poster of hand gestures in speech bubbles"),
    },
    {
      slug: "power-and-strength", series: "posters", span: 4, title: "Power & Strength", category: "Poster",
      summary: "The physical and mental intensity of free solo climbing.",
      description: [
        "Focusing on the physical and mental intensity of free solo climbing, this poster depicts a climber relying entirely on their own strength and instincts.",
        "The central visual element is a hand gripping a rock face with such force that it appears to crush the surface. The hand becomes a symbol of determination, physical endurance and the extraordinary strength required when putting one's life on the line. The composition explores the relationship between human capability, vulnerability and the will to overcome physical limits.",
      ],
      cover: img("hold.jpg", 1200, 1600, "Black and white poster of a hand gripping rock above pine trees"),
    },

    /* 04 Sketches & Studies */
    { slug: "study-seated", series: "sketches", span: 4, title: "Seated Figure", category: "Dry chalk", cover: img("study-seated.jpg", 1114, 1600, "Dry chalk drawing of a woman sitting on a chair in an off-the-shoulder top, looking into the distance") },
    { slug: "study-pencil", series: "sketches", span: 4, title: "Lost in Thought", category: "Pencil", cover: img("study-pencil.jpg", 999, 1600, "Pencil sketch of an older woman sitting forward on a stool, her chin resting on her hand") },
    { slug: "study-portrait", series: "sketches", span: 4, title: "Portrait Study", category: "Dry chalk", cover: img("study-portrait.jpg", 1194, 1600, "Dry chalk portrait of a young woman with a ponytail, leaning on her arm and looking to the side") },

    /* 05 Puldin — Дивите козлета */
    {
      slug: "puldin-10th-season", series: "puldin", span: 4, lang: "bg", title: "Дивите козлета", category: "T-shirt design",
      summary: "Дивите козлета, The Wild Goats: ten seasons in love with the mountains.",
      description: [
        "This T-shirt for Дивите козлета (The Wild Goats) was created to celebrate the brand’s tenth season. Designed for both children and adults, it reflects the organisation’s inclusive spirit and its invitation to people of all ages to explore nature and challenge themselves.",
        "The illustration captures the energy of the participants, children and adults alike, who become like wild goats as they climb and connect with nature. I turned that spirit into a playful, wearable graphic.",
      ],
      cover: img("divite-kozleta.jpg", 1336, 1280, "Three cartoon goats with backpacks in front of pine trees, with the text Divite kozleta, 10 seasons in love with the mountains"),
    },
    {
      slug: "wild-goats-logo", series: "puldin", span: 4, lang: "bg", title: "Дивите козлета", category: "Logo",
      description: [
        "A logo for the event itself, Дивите козлета (The Wild Goats), which was later adapted into a medal design awarded to participants after certain trips.",
        "For the logo, I combined the silhouette of a goat with a mountain-inspired form, reflecting the company’s connection to the mountains and its adventurous character.",
      ],
      cover: img("wild-goats.jpg", 846, 891, "Line-drawn logo of a goat silhouette inside a mountain shape"),
    },

    {
      slug: "puldin-pyrenees", series: "puldin", span: 4, title: "Les Pyrénées", category: "T-shirt design",
      summary: "A T-shirt for the Wild Goats’ trip to the Pyrenees.",
      description: [
        "The final artwork was printed on the official event T-shirts, giving participants of every age a shared visual identity.",
        "For the group’s trip to the Pyrenees, I designed a second T-shirt. It shows animals typical of the mountains stacked into a playful totem. The hand-lettered words “Les Pyrénées” wind between them and tie them all together, so the animals seem to form the mountain themselves.",
      ],
      cover: img("pyrenees.jpg", 1200, 1600, "A sheep, a goat with a bell, a marmot and a white mountain dog stacked around the green lettering Les Pyrénées"),
      // shown only on this work's own page, as a sideways-scrolling strip
      scroll: {
        label: "Les Pyrénées — two versions",
        items: [
          { image: img("pyrenees.jpg", 1200, 1600, "The Les Pyrénées T-shirt design"), caption: "The T-shirt design" },
          { image: img("pyrenees-mountain.jpg", 1200, 1600, "The same animals and lettering in front of hand-drawn mountain peaks"), caption: "With the mountains" },
        ],
      },
    },

    /* 06 Red Beard Studio — Brand Logo */
    { slug: "robin-logo-bird", series: "robin-identity", span: 6, start: 4, title: "Robin — Bird Mark", category: "Logo", cover: img("rb-studio.jpg", 1600, 1600, "Logo drawn as a single brush-stroke bird with the word studio") },

    /* 07 Leak — Character Illustrations */
    { slug: "robin-characters-front", series: "robin-characters", span: 6, title: "The Baristas — Front", category: "Character design", process: [{ image: img("proc-baristas-side.jpg", 1600, 808, "Sketchbook spread exploring the characters' poses, a film canister and details"), caption: "Exploring poses and details" }], cover: img("winter-walk-1.jpg", 1445, 1117, "Line illustration of two girls walking, one carrying a cup, one a film reel, front view") },
    { slug: "robin-characters-side", series: "robin-characters", span: 6, title: "The Baristas — Side", category: "Character design", process: [{ image: img("proc-baristas-front.jpg", 1600, 783, "Sketchbook spread of two girls walking in winter clothes, one carrying a bowl, one a film reel"), caption: "Early sketches of the two characters" }], cover: img("winter-walk-2.jpg", 1480, 1141, "Line illustration of the same two girls walking, side view") },
    { slug: "moka-break", series: "robin-characters", span: 6, title: "Moka Break", category: "Character design", cover: img("moka-break.jpg", 1600, 1200, "Line illustration of a man with a moka pot coffee maker"), gallery: [{ image: img("leak-tshirts.jpg", 1536, 1024, "Three cream T-shirts printed with the line illustrations: the man lying down pouring coffee, the man crouching with a moka pot, and the man hugging a moka pot"), size: "full", caption: "How the characters would look on the staff T-shirts" }] },
    { slug: "slow-morning", series: "robin-characters", span: 6, title: "Slow Morning", category: "Character design", process: [{ image: img("proc-slow-morning.jpg", 1600, 784, "Sketchbook spread with the first drafts of the coffee characters"), caption: "First drafts of the characters" }], cover: img("slow-morning.jpg", 1600, 1200, "Line illustration of a man lying down pouring coffee"), gallery: [{ image: img("leak-tshirts.jpg", 1536, 1024, "Three cream T-shirts printed with the line illustrations: the man lying down pouring coffee, the man crouching with a moka pot, and the man hugging a moka pot"), size: "full", caption: "How the characters would look on the staff T-shirts" }] },

    /* 08 Robin — Easter Kozunak Packaging */
    {
      slug: "robin-kozunak", series: "robin-kozunak", span: 12, title: "Kozunak Packaging", category: "Packaging illustration",
      cover: img("robin-lab.jpg", 1600, 428, "Two bakers carrying kozunak bread with a robin, and a scribbled robin with the line better when shared"),
      // on the work's own page: the back of the flyer, then the packaging in use
      gallery: [
        { image: img("kozunak-flyer.jpg", 1699, 526, "Five numbered sketches on a grid: unwrapping the kozunak from its cloth, slicing it, a jar of jam, spreading the jam on a slice, and a woman in a beret taking a bite"), size: "full", caption: "The other side of the flyer: how to enjoy the kozunak" },
        { image: img("kozunak-flyer-coloured.jpg", 622, 804, "The instructions flyer coloured in with pencils, with coloured pencils lying on a wooden table"), size: "third-center", caption: "Drawn in outline, so children could colour it in" },
        { image: img("kozunak-bucket.jpg", 625, 825, "A metal kozunak bucket wrapped in the Robin Lab label, with the two bakers carrying bread"), size: "third", caption: "The kozunak bucket" },
        { image: img("kozunak-buckets.jpg", 619, 745, "Stacked kozunak buckets in a bakery kitchen, alternating the bakers illustration and the Better when shared side"), size: "third", caption: "In the kitchen" },
        { image: img("kozunak-buckets-stack.jpg", 660, 822, "A tall stack of kozunak buckets showing both sides of the label"), size: "third", caption: "Both sides of the label" },
      ],
    },

  ];
})();
