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
    const set = VARIANTS.filter((w) => w <= width - 100).map((w) => `assets/work/opt/${base}-${w}.jpg ${w}w`);
    return { src, width, height, alt, srcset: set.length ? [...set, `${src} ${width}w`].join(", ") : undefined };
  };

  window.SITE = {
    name: "Neda Varbanova",
    role: "Multidisciplinary Visual Artist",
    location: "Sofia, Bulgaria",
    timezone: "Europe/Sofia",
    years: "2024—2027",
    email: "neda.varbanova@gmail.com",
    phone: { label: "+359 882874452", href: "tel:+359882874452" },
    description: "Neda Varbanova — multidisciplinary visual artist from Sofia, Bulgaria. Watercolour, linocut, posters, illustration and brand design.",

    availability: { available: true, label: "Available for projects and work" },

    hero: {
      lines: ["Neda", "Varbanova"],
      intro: "Multidisciplinary visual artist from Sofia, Bulgaria: watercolour, printmaking, posters, illustration and brand design.",
    },

    ticker: "Neda Varbanova",

    about: {
      intro:
        "I am a multidisciplinary artist who enjoys experimenting with different mediums, materials and techniques, both traditional and digital.",
      paragraphs: [
        "My practice often combines these approaches through mixed media, photography, collage and illustration.",
        "Inspired by nature, personal experiences and everyday moments, I use art as a way to explore and express my inner world. I am drawn to experimentation, discovering new ways of working and translating emotions and observations into visual forms.",
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
      id: "watercolour", title: "Watercolour Studies", reveal: "wash", accent: "#c9577a",
      meta: [["Medium", "Watercolour"]],
      text: [
        "A series of watercolour studies exploring the qualities and expressive possibilities of the medium. Developed during a dedicated study session, the collection features a variety of still-life compositions and landscapes, each painted exclusively using a square brush.",
        "By limiting the tools and techniques, the exercise focused on exploring texture, colour interaction, layering and the spontaneous nature of watercolour. The square brush became a defining element of the process, creating an interesting visual language through its distinct marks and shapes.",
      ],
    },
    {
      id: "i-want", title: "I Want — Linocut Prints", reveal: "print", accent: "#4f6f99",
      meta: [["Medium", "Linocut / Printmaking"], ["Exhibition", "UNIART, New Bulgarian University"]],
      text: [
        "A two-part linocut series created for the UNIART exhibition at New Bulgarian University, under the theme I Want.",
        "The works explore desire, longing and the search for a sense of belonging. Through the imagery of a boat lost at sea and a fender drifting alongside it, I wanted to express a particular emotional state — one of uncertainty, displacement and introspection.",
        "Both objects exist within the same vast, unfamiliar sea, appearing lost while simultaneously navigating their own way towards self-discovery. The two prints reflect a personal longing for a state of being that is difficult to define, somewhere between feeling lost and finding oneself.",
      ],
    },
    {
      id: "posters", title: "Poster Design", subtitle: "Frightening, Obscene Gesture & Power", reveal: "spray", accent: "#e0452e",
      meta: [["Context", "Academic Project / Poster Design"]],
      text: [
        "A collection of three posters developed as part of a university assignment, exploring different visual interpretations of assigned themes through graphic communication and conceptual imagery.",
      ],
    },
    {
      id: "puldin", title: "Puldin — Дивите козлета", subtitle: "Logo Design & Marathon T-Shirt", reveal: "sketch", accent: "#5f7040",
      meta: [["Client", "Puldin — Дивите козлета (The Wild Goats)"], ["Project", "Brand Identity / Logo Design / T-shirt Illustration"]],
      text: [
        "Two projects for Puldin — Дивите козлета (The Wild Goats), a tourism company inspired by the spirit of adventure, nature and mountain exploration: the company’s logo and a commemorative T-shirt for its marathon event.",
        "For the logo, I combined the silhouette of a goat with a mountain-inspired concept, representing the company’s connection to the mountains and its adventurous character. It was created in both black and white versions, allowing it to adapt to different backgrounds and branding applications while maintaining a strong and recognisable visual identity.",
        "The T-shirt was created to celebrate the tenth season of the marathon. Developed for both children and adults, it reflects the inclusive nature of the event and its invitation for participants of all ages to take part. The illustration translates the energy and spirit of the marathon into a playful, wearable graphic.",
        "The final artwork was produced and featured on the official event T-shirts, creating a shared visual identity for participants across different age groups.",
      ],
    },
    {
      id: "robin-identity", title: "Red Beard Studio — Robin Identity", reveal: "sketch", accent: "#b0262c",
      meta: [["Client", "Red Beard Studio"], ["Project", "Logo Design / Brand Applications"]],
      text: [
        "A logo designed for RB Studio, a catering studio named after the robin bird, whose work brings together food, fashion and visual culture.",
        "The mark is a loose, brush-drawn robin with the letters R and B doodled into the bird itself, so that the studio’s initials and its namesake form a single image. The hand-drawn line gives the identity a personal, handmade character.",
        "The logo is used across brand applications, including stickers and logo placements, helping establish a distinctive and versatile visual presence.",
      ],
    },
    {
      id: "robin-characters", title: "Robin — Character Illustrations", reveal: "sketch", accent: "#a9532f",
      meta: [["Client", "Robin"], ["Project", "Character Design / Illustration"]],
      text: [
        "A pair of illustrated characters developed as part of the visual identity of Robin, a coffee and bakery place that also hosts film projections. The two girls embody both sides of the venue: one carries a coffee cup, the other a film reel.",
        "Originally created as graphic concepts for T-shirts, the characters evolved into recognisable visual elements for the café and its team. They were incorporated into the brand's working environment and used to represent its baristas and staff.",
        "The illustrations establish a playful, approachable character language that contributes to the wider personality of the Robin brand.",
      ],
    },
    {
      id: "robin-kozunak", title: "Robin — Easter Kozunak Packaging", reveal: "sketch", accent: "#8a5330",
      meta: [["Client", "Robin"], ["Project", "Packaging Illustration / Poster Design"]],
      text: [
        "An illustrated visual identity developed for Robin's seasonal Easter packaging, featuring the robin bird alongside an elongated illustrative composition.",
        "The artwork was created for a special bucket packaging design for kozunak, a traditional Bulgarian sweet Easter bread. The illustration was also adapted for promotional posters, allowing the visual language to extend beyond the packaging itself.",
        "The project combines illustration and seasonal storytelling to create a distinctive visual presentation for a traditional product, connecting cultural heritage with contemporary brand design.",
      ],
    },
  ];

  /* WORKS — each belongs to a series. span = columns out of 12 on desktop; start = optional start column.
     description (optional) is the work's own text; otherwise its page shows the series text. */
  window.PROJECTS = [
    /* 01 Watercolour Studies */
    { slug: "roses-and-cherries", series: "watercolour", span: 8, title: "Roses & Cherries", category: "Watercolour", cover: img("roses-and-cherries.jpg", 1600, 1161, "Watercolour of pink roses above a bowl of red cherries") },
    { slug: "preserved", series: "watercolour", span: 4, title: "Preserved", category: "Watercolour", cover: img("preserved.jpg", 1185, 1600, "Watercolour of fruit inside a glass jar with a red lid") },
    { slug: "rock-by-the-sea", series: "watercolour", span: 4, title: "Rock by the Sea", category: "Watercolour", cover: img("rock-by-the-sea.jpg", 1600, 1130, "Watercolour of a large rock by the sea under pink clouds") },
    { slug: "persimmons", series: "watercolour", span: 4, title: "Persimmons", category: "Watercolour", cover: img("persimmons.jpg", 1600, 1165, "Watercolour of three persimmons with blue ornaments") },
    { slug: "figs-and-blueberries", series: "watercolour", span: 4, title: "Figs & Blueberries", category: "Watercolour", cover: img("figs-and-blueberries.jpg", 1600, 1159, "Watercolour of a halved fig on a blue patterned plate with blueberries") },
    { slug: "harvest", series: "watercolour", span: 4, title: "Harvest", category: "Watercolour", cover: img("harvest.jpg", 1148, 1600, "Watercolour still life of pumpkins, corn and a blue bowl") },
    { slug: "plovdiv-musicians", series: "watercolour", span: 8, year: 2025, title: "Plovdiv Musicians", category: "Ink & wash", cover: img("plovdiv-musicians.jpg", 1600, 1104, "Ink and wash sketch of two guitarists in hats, Plovdiv 2025") },

    /* 02 I Want — Linocut Prints */
    {
      slug: "bezpredelnost", series: "i-want", span: 7, year: 2026, lang: "bg", title: "Безпределност", category: "Linocut",
      summary: "The boat, lost at sea.",
      cover: img("bezpredelnost.jpg", 1600, 1214, "Two-colour linocut print titled Bezpredelnost"),
    },
    {
      slug: "priboy", series: "i-want", span: 5, lang: "bg", title: "Прибой", category: "Linocut",
      summary: "The fender, drifting alongside it.",
      cover: img("priboy.jpg", 1206, 1600, "Two-colour linocut of a rope knot and netted fender over water"),
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
      slug: "obscene-gesture", series: "posters", span: 4, year: 2026, title: "Obscene Gesture", category: "Poster",
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

    /* 04 Puldin — Дивите козлета */
    {
      slug: "puldin-10th-season", series: "puldin", span: 6, lang: "bg", title: "Дивите козлета", category: "T-shirt design",
      summary: "Ten seasons in love with the mountains.",
      cover: img("divite-kozleta.jpg", 1336, 1280, "Three cartoon goats with backpacks in front of pine trees, with the text Divite kozleta, 10 seasons in love with the mountains"),
    },
    { slug: "wild-goats-logo", series: "puldin", span: 6, lang: "bg", title: "Дивите козлета", category: "Logo", cover: img("wild-goats.jpg", 846, 891, "Line-drawn logo of a goat silhouette inside a mountain shape") },

    /* 05 Red Beard Studio — Robin Identity */
    { slug: "robin-logo-bird", series: "robin-identity", span: 6, start: 4, title: "Robin — Bird Mark", category: "Logo", cover: img("rb-studio.jpg", 1600, 1600, "Logo drawn as a single brush-stroke bird with the word studio") },

    /* 06 Robin — Character Illustrations */
    { slug: "robin-characters-front", series: "robin-characters", span: 6, title: "The Baristas — Front", category: "Character design", cover: img("winter-walk-1.jpg", 1445, 1117, "Line illustration of two girls walking, one carrying a cup, one a film reel, front view") },
    { slug: "robin-characters-side", series: "robin-characters", span: 6, title: "The Baristas — Side", category: "Character design", cover: img("winter-walk-2.jpg", 1480, 1141, "Line illustration of the same two girls walking, side view") },
    { slug: "moka-break", series: "robin-characters", span: 6, title: "Moka Break", category: "Character design", cover: img("moka-break.jpg", 1600, 1200, "Line illustration of a man with a moka pot coffee maker") },
    { slug: "slow-morning", series: "robin-characters", span: 6, title: "Slow Morning", category: "Character design", cover: img("slow-morning.jpg", 1600, 1200, "Line illustration of a man lying down pouring coffee") },

    /* 07 Robin — Easter Kozunak Packaging */
    { slug: "robin-kozunak", series: "robin-kozunak", span: 12, title: "Kozunak Packaging", category: "Packaging illustration", cover: img("robin-lab.jpg", 1600, 428, "Two bakers carrying kozunak bread with a robin, and a scribbled robin with the line better when shared") },
  ];
})();
