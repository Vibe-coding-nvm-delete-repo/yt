/**
 * Leonardo.AI Constants & Data Library
 * Complete library of options, descriptions, and Leonardo-specific language
 */

import type {
  LeonardoStyle,
  LeonardoSubject,
  CompositionTechnique,
  LightingSource,
  TextureType,
  MoodDescriptor,
  SensoryLanguage,
  FocalPoint,
  LeonardoColorPalette,
} from "@/types/leonardo";

// ============================================================================
// STYLE OPTIONS
// ============================================================================

export interface StyleOption {
  value: LeonardoStyle;
  label: string;
  description: string;
  leonardoLanguage: string;
}

export const STYLE_OPTIONS: StyleOption[] = [
  {
    value: "photorealistic",
    label: "Photorealistic",
    description: "Lifelike, camera-quality imagery",
    leonardoLanguage:
      "photorealistic, hyper-detailed, professional photography, 8k resolution",
  },
  {
    value: "cinematic",
    label: "Cinematic",
    description: "Film-quality with dramatic composition",
    leonardoLanguage:
      "cinematic lighting, movie still, dramatic composition, depth of field",
  },
  {
    value: "illustration",
    label: "Illustration",
    description: "Hand-drawn artistic style",
    leonardoLanguage:
      "digital illustration, artistic rendering, detailed artwork",
  },
  {
    value: "anime",
    label: "Anime",
    description: "Japanese animation style",
    leonardoLanguage: "anime style, manga aesthetic, cel-shaded",
  },
  {
    value: "3d-render",
    label: "3D Render",
    description: "Computer-generated 3D imagery",
    leonardoLanguage:
      "3d rendering, octane render, blender, ray-traced lighting",
  },
  {
    value: "abstract",
    label: "Abstract",
    description: "Non-representational artistic forms",
    leonardoLanguage: "abstract art, non-representational, artistic expression",
  },
  {
    value: "minimalist",
    label: "Minimalist",
    description: "Simple, clean, essential elements only",
    leonardoLanguage: "minimalist design, clean composition, simple forms",
  },
  {
    value: "concept-art",
    label: "Concept Art",
    description: "Professional concept design",
    leonardoLanguage: "concept art, matte painting, professional illustration",
  },
];

// ============================================================================
// SUBJECT OPTIONS
// ============================================================================

export interface SubjectOption {
  value: LeonardoSubject;
  label: string;
  description: string;
  leonardoLanguage: string;
  typicalAppearances: string[];
}

export const SUBJECT_OPTIONS: SubjectOption[] = [
  {
    value: "landscape",
    label: "Landscape",
    description: "Natural or urban outdoor scenes",
    leonardoLanguage: "landscape photography, scenic vista, panoramic view",
    typicalAppearances: ["mountains", "valleys", "horizons", "skylines"],
  },
  {
    value: "nature-scene",
    label: "Nature Scene",
    description: "Natural environments and ecosystems",
    leonardoLanguage: "natural environment, wilderness, pristine nature",
    typicalAppearances: ["forests", "meadows", "rivers", "wildlife habitats"],
  },
  {
    value: "abstract-pattern",
    label: "Abstract Pattern",
    description: "Non-representational patterns and forms",
    leonardoLanguage: "abstract patterns, geometric forms, flowing shapes",
    typicalAppearances: ["fractals", "tessellations", "organic patterns"],
  },
  {
    value: "architecture",
    label: "Architecture",
    description: "Buildings and structural design",
    leonardoLanguage: "architectural photography, structural design, building",
    typicalAppearances: ["buildings", "monuments", "bridges", "structures"],
  },
  {
    value: "interior-space",
    label: "Interior Space",
    description: "Indoor environments and rooms",
    leonardoLanguage: "interior design, indoor space, room photography",
    typicalAppearances: ["rooms", "halls", "studios", "living spaces"],
  },
  {
    value: "still-life",
    label: "Still Life",
    description: "Arranged objects and compositions",
    leonardoLanguage: "still life composition, object arrangement",
    typicalAppearances: ["objects", "arrangements", "displays"],
  },
  {
    value: "cosmic-space",
    label: "Cosmic Space",
    description: "Celestial and astronomical scenes",
    leonardoLanguage: "space photography, cosmic scene, celestial bodies",
    typicalAppearances: ["stars", "nebulae", "galaxies", "planets"],
  },
  {
    value: "underwater",
    label: "Underwater",
    description: "Aquatic environments",
    leonardoLanguage: "underwater photography, aquatic scene, marine environment",
    typicalAppearances: ["ocean", "reef", "marine life", "water"],
  },
  {
    value: "weather-phenomenon",
    label: "Weather Phenomenon",
    description: "Atmospheric and weather events",
    leonardoLanguage: "atmospheric phenomenon, weather event, natural display",
    typicalAppearances: ["storms", "fog", "aurora", "clouds"],
  },
  {
    value: "geometric-forms",
    label: "Geometric Forms",
    description: "Mathematical and geometric shapes",
    leonardoLanguage: "geometric shapes, mathematical forms, precise geometry",
    typicalAppearances: ["cubes", "spheres", "polyhedra", "patterns"],
  },
  {
    value: "text-typography",
    label: "Text & Typography",
    description: "Lettering and typographic design",
    leonardoLanguage: "typography design, lettering art, textual composition",
    typicalAppearances: ["letters", "words", "calligraphy", "fonts"],
  },
  {
    value: "product",
    label: "Product",
    description: "Commercial product display",
    leonardoLanguage: "product photography, commercial display, studio shot",
    typicalAppearances: ["items", "merchandise", "goods"],
  },
  {
    value: "vehicle",
    label: "Vehicle",
    description: "Transportation and machines",
    leonardoLanguage: "vehicle photography, automotive, transportation",
    typicalAppearances: ["cars", "planes", "boats", "machines"],
  },
  {
    value: "animal",
    label: "Animal",
    description: "Wildlife and creatures (no people)",
    leonardoLanguage: "animal photography, wildlife, creature",
    typicalAppearances: ["mammals", "birds", "insects", "wildlife"],
  },
  {
    value: "plant-botanical",
    label: "Plant/Botanical",
    description: "Flora and vegetation",
    leonardoLanguage: "botanical photography, plant life, flora",
    typicalAppearances: ["flowers", "trees", "foliage", "vegetation"],
  },
];

// ============================================================================
// COMPOSITION TECHNIQUES
// ============================================================================

export interface CompositionOption {
  value: CompositionTechnique;
  label: string;
  description: string;
  leonardoLanguage: string;
  visualizationHint: string;
}

export const COMPOSITION_TECHNIQUES: CompositionOption[] = [
  {
    value: "rule-of-thirds",
    label: "Rule of Thirds",
    description: "Subject placed at intersection points",
    leonardoLanguage: "rule of thirds composition, balanced placement",
    visualizationHint: "Grid with subject at intersections",
  },
  {
    value: "golden-ratio",
    label: "Golden Ratio",
    description: "Natural, harmonious proportions (1:1.618)",
    leonardoLanguage: "golden ratio, fibonacci composition, harmonious layout",
    visualizationHint: "Spiral or rectangular divisions",
  },
  {
    value: "symmetrical",
    label: "Symmetrical",
    description: "Mirror balance across axis",
    leonardoLanguage: "perfect symmetry, mirrored composition, balanced",
    visualizationHint: "Reflected across center line",
  },
  {
    value: "asymmetrical",
    label: "Asymmetrical",
    description: "Dynamic imbalance for interest",
    leonardoLanguage: "asymmetrical balance, dynamic composition",
    visualizationHint: "Weighted to one side",
  },
  {
    value: "centered",
    label: "Centered",
    description: "Subject in the middle",
    leonardoLanguage: "centered composition, central focus",
    visualizationHint: "Subject in exact center",
  },
  {
    value: "diagonal",
    label: "Diagonal",
    description: "Elements along diagonal lines",
    leonardoLanguage: "diagonal composition, dynamic lines",
    visualizationHint: "Elements from corner to corner",
  },
  {
    value: "leading-lines",
    label: "Leading Lines",
    description: "Lines guide eye to subject",
    leonardoLanguage: "leading lines, directional composition, guided focus",
    visualizationHint: "Lines converging to focal point",
  },
  {
    value: "frame-within-frame",
    label: "Frame Within Frame",
    description: "Natural framing elements",
    leonardoLanguage: "framed composition, natural borders, layered depth",
    visualizationHint: "Subject framed by environment",
  },
  {
    value: "negative-space",
    label: "Negative Space",
    description: "Empty space emphasizes subject",
    leonardoLanguage: "negative space, minimalist composition, breathing room",
    visualizationHint: "Subject with lots of empty space",
  },
  {
    value: "depth-layers",
    label: "Depth Layers",
    description: "Distinct foreground, middle, background",
    leonardoLanguage: "layered depth, foreground to background, dimensional",
    visualizationHint: "Three distinct depth planes",
  },
  {
    value: "aerial-view",
    label: "Aerial View",
    description: "Top-down perspective",
    leonardoLanguage: "aerial perspective, bird's eye view, overhead shot",
    visualizationHint: "Looking straight down",
  },
  {
    value: "worms-eye-view",
    label: "Worm's Eye View",
    description: "Looking up from ground level",
    leonardoLanguage: "worm's eye view, upward angle, dramatic perspective",
    visualizationHint: "Looking up from below",
  },
  {
    value: "dutch-angle",
    label: "Dutch Angle",
    description: "Tilted horizon for tension",
    leonardoLanguage: "dutch angle, tilted composition, dynamic tension",
    visualizationHint: "Horizon at 15-45° angle",
  },
];

// ============================================================================
// LIGHTING OPTIONS
// ============================================================================

export interface LightingOption {
  value: LightingSource;
  label: string;
  description: string;
  leonardoLanguage: string;
  colorTemp: string;
  typicalDirection: string;
}

export const LIGHTING_SOURCES: LightingOption[] = [
  {
    value: "natural-daylight",
    label: "Natural Daylight",
    description: "Bright, even sunlight",
    leonardoLanguage: "natural daylight, bright sunlight, clear day",
    colorTemp: "5500K",
    typicalDirection: "top/side",
  },
  {
    value: "golden-hour",
    label: "Golden Hour",
    description: "Warm, soft light near sunrise/sunset",
    leonardoLanguage: "golden hour lighting, warm glow, magic hour",
    colorTemp: "3500K",
    typicalDirection: "side/low",
  },
  {
    value: "blue-hour",
    label: "Blue Hour",
    description: "Cool twilight after sunset",
    leonardoLanguage: "blue hour, twilight, dusk lighting",
    colorTemp: "7500K",
    typicalDirection: "ambient",
  },
  {
    value: "overcast-soft",
    label: "Overcast Soft",
    description: "Diffused, shadowless light",
    leonardoLanguage: "soft overcast light, diffused lighting, even illumination",
    colorTemp: "6500K",
    typicalDirection: "all",
  },
  {
    value: "studio-lighting",
    label: "Studio Lighting",
    description: "Controlled artificial setup",
    leonardoLanguage: "studio lighting, professional setup, controlled light",
    colorTemp: "5000K",
    typicalDirection: "multiple",
  },
  {
    value: "dramatic-spotlight",
    label: "Dramatic Spotlight",
    description: "Focused beam creating contrast",
    leonardoLanguage: "dramatic spotlight, focused beam, high contrast",
    colorTemp: "4000K",
    typicalDirection: "directional",
  },
  {
    value: "backlight-silhouette",
    label: "Backlight Silhouette",
    description: "Light from behind subject",
    leonardoLanguage: "backlit silhouette, rim lighting, glowing edges",
    colorTemp: "varies",
    typicalDirection: "back",
  },
  {
    value: "rim-lighting",
    label: "Rim Lighting",
    description: "Edge highlighting from behind/side",
    leonardoLanguage: "rim lighting, edge light, contour highlighting",
    colorTemp: "varies",
    typicalDirection: "back/side",
  },
  {
    value: "ambient-glow",
    label: "Ambient Glow",
    description: "Soft, omnidirectional illumination",
    leonardoLanguage: "ambient glow, soft illumination, gentle light",
    colorTemp: "varies",
    typicalDirection: "all",
  },
  {
    value: "neon-artificial",
    label: "Neon Artificial",
    description: "Colored artificial light sources",
    leonardoLanguage: "neon lighting, artificial glow, colored light",
    colorTemp: "varies",
    typicalDirection: "varies",
  },
];

// ============================================================================
// TEXTURE OPTIONS
// ============================================================================

export interface TextureOption {
  value: TextureType;
  label: string;
  description: string;
  leonardoLanguage: string;
  tactileFeeling: string;
}

export const TEXTURE_SPECIFICATIONS: TextureOption[] = [
  {
    value: "smooth-glossy",
    label: "Smooth & Glossy",
    description: "Reflective, polished surfaces",
    leonardoLanguage: "smooth glossy surface, polished, reflective finish",
    tactileFeeling: "slippery, mirror-like",
  },
  {
    value: "rough-matte",
    label: "Rough & Matte",
    description: "Non-reflective, textured surfaces",
    leonardoLanguage: "rough matte texture, non-reflective, textured surface",
    tactileFeeling: "coarse, absorbs light",
  },
  {
    value: "metallic",
    label: "Metallic",
    description: "Metal-like sheen and reflection",
    leonardoLanguage: "metallic surface, shiny metal, industrial finish",
    tactileFeeling: "cool, hard, reflective",
  },
  {
    value: "fabric-textile",
    label: "Fabric & Textile",
    description: "Cloth-like soft materials",
    leonardoLanguage: "fabric texture, textile material, woven surface",
    tactileFeeling: "soft, flexible, woven",
  },
  {
    value: "organic-natural",
    label: "Organic & Natural",
    description: "Natural material textures",
    leonardoLanguage: "organic texture, natural material, earth-like",
    tactileFeeling: "varied, natural, irregular",
  },
  {
    value: "weathered-aged",
    label: "Weathered & Aged",
    description: "Worn, time-affected surfaces",
    leonardoLanguage: "weathered texture, aged surface, time-worn patina",
    tactileFeeling: "rough, irregular, character",
  },
  {
    value: "crystalline",
    label: "Crystalline",
    description: "Glass-like, faceted surfaces",
    leonardoLanguage: "crystalline structure, faceted surface, gem-like",
    tactileFeeling: "sharp, geometric, transparent",
  },
  {
    value: "liquid-fluid",
    label: "Liquid & Fluid",
    description: "Water or fluid-like appearance",
    leonardoLanguage: "liquid surface, fluid texture, flowing material",
    tactileFeeling: "smooth, flowing, dynamic",
  },
  {
    value: "glass-transparent",
    label: "Glass & Transparent",
    description: "See-through or translucent",
    leonardoLanguage: "glass material, transparent surface, clear medium",
    tactileFeeling: "smooth, clear, fragile",
  },
  {
    value: "concrete-stone",
    label: "Concrete & Stone",
    description: "Hard, mineral surfaces",
    leonardoLanguage: "concrete texture, stone surface, mineral finish",
    tactileFeeling: "hard, cold, solid",
  },
  {
    value: "wood-grain",
    label: "Wood Grain",
    description: "Natural wood patterns",
    leonardoLanguage: "wood grain texture, natural wood, timber surface",
    tactileFeeling: "warm, organic, lined",
  },
];

// ============================================================================
// MOOD DESCRIPTORS
// ============================================================================

export interface MoodOption {
  value: MoodDescriptor;
  label: string;
  description: string;
  leonardoLanguage: string;
  emotionalResonance: string;
}

export const MOOD_DESCRIPTORS: MoodOption[] = [
  {
    value: "serene-calm",
    label: "Serene & Calm",
    description: "Peaceful, undisturbed atmosphere",
    leonardoLanguage: "serene atmosphere, calm mood, peaceful scene",
    emotionalResonance: "relaxation, tranquility",
  },
  {
    value: "energetic-vibrant",
    label: "Energetic & Vibrant",
    description: "Lively, dynamic energy",
    leonardoLanguage: "energetic vibe, vibrant atmosphere, dynamic energy",
    emotionalResonance: "excitement, vitality",
  },
  {
    value: "mysterious-enigmatic",
    label: "Mysterious & Enigmatic",
    description: "Unknown, intriguing quality",
    leonardoLanguage: "mysterious atmosphere, enigmatic mood, intriguing scene",
    emotionalResonance: "curiosity, wonder",
  },
  {
    value: "melancholic-somber",
    label: "Melancholic & Somber",
    description: "Sad, reflective tone",
    leonardoLanguage: "melancholic mood, somber atmosphere, reflective tone",
    emotionalResonance: "sadness, contemplation",
  },
  {
    value: "uplifting-joyful",
    label: "Uplifting & Joyful",
    description: "Happy, optimistic feeling",
    leonardoLanguage: "uplifting atmosphere, joyful mood, optimistic scene",
    emotionalResonance: "happiness, hope",
  },
  {
    value: "tense-dramatic",
    label: "Tense & Dramatic",
    description: "Suspenseful, intense emotion",
    leonardoLanguage: "dramatic tension, intense atmosphere, suspenseful mood",
    emotionalResonance: "anticipation, tension",
  },
  {
    value: "ethereal-dreamlike",
    label: "Ethereal & Dreamlike",
    description: "Otherworldly, surreal quality",
    leonardoLanguage: "ethereal atmosphere, dreamlike quality, surreal mood",
    emotionalResonance: "wonder, imagination",
  },
  {
    value: "gritty-raw",
    label: "Gritty & Raw",
    description: "Rough, unpolished authenticity",
    leonardoLanguage: "gritty atmosphere, raw mood, unfiltered scene",
    emotionalResonance: "authenticity, edge",
  },
  {
    value: "elegant-refined",
    label: "Elegant & Refined",
    description: "Sophisticated, tasteful quality",
    leonardoLanguage: "elegant atmosphere, refined mood, sophisticated scene",
    emotionalResonance: "sophistication, grace",
  },
  {
    value: "playful-whimsical",
    label: "Playful & Whimsical",
    description: "Light-hearted, fanciful tone",
    leonardoLanguage: "playful atmosphere, whimsical mood, light-hearted scene",
    emotionalResonance: "fun, lightheartedness",
  },
  {
    value: "majestic-grand",
    label: "Majestic & Grand",
    description: "Impressive, awe-inspiring scale",
    leonardoLanguage: "majestic atmosphere, grand scale, awe-inspiring scene",
    emotionalResonance: "awe, reverence",
  },
  {
    value: "intimate-cozy",
    label: "Intimate & Cozy",
    description: "Warm, personal, close feeling",
    leonardoLanguage: "intimate atmosphere, cozy mood, warm scene",
    emotionalResonance: "comfort, warmth",
  },
  {
    value: "futuristic-sci-fi",
    label: "Futuristic & Sci-Fi",
    description: "Advanced, technological feel",
    leonardoLanguage: "futuristic atmosphere, sci-fi mood, technological scene",
    emotionalResonance: "innovation, future",
  },
  {
    value: "nostalgic-vintage",
    label: "Nostalgic & Vintage",
    description: "Past-era, sentimental quality",
    leonardoLanguage: "nostalgic atmosphere, vintage mood, retro scene",
    emotionalResonance: "nostalgia, memory",
  },
  {
    value: "surreal-abstract",
    label: "Surreal & Abstract",
    description: "Reality-bending, non-literal",
    leonardoLanguage: "surreal atmosphere, abstract mood, non-literal scene",
    emotionalResonance: "confusion, imagination",
  },
  {
    value: "peaceful-tranquil",
    label: "Peaceful & Tranquil",
    description: "Still, undisturbed calmness",
    leonardoLanguage: "peaceful atmosphere, tranquil mood, still scene",
    emotionalResonance: "peace, stillness",
  },
  {
    value: "ominous-foreboding",
    label: "Ominous & Foreboding",
    description: "Threatening, dark anticipation",
    leonardoLanguage: "ominous atmosphere, foreboding mood, threatening scene",
    emotionalResonance: "fear, dread",
  },
  {
    value: "romantic-soft",
    label: "Romantic & Soft",
    description: "Gentle, affectionate feeling",
    leonardoLanguage: "romantic atmosphere, soft mood, gentle scene",
    emotionalResonance: "love, tenderness",
  },
  {
    value: "industrial-urban",
    label: "Industrial & Urban",
    description: "City, manufactured environment",
    leonardoLanguage: "industrial atmosphere, urban mood, city scene",
    emotionalResonance: "modernity, grit",
  },
  {
    value: "organic-natural",
    label: "Organic & Natural",
    description: "Earthy, nature-connected feel",
    leonardoLanguage: "organic atmosphere, natural mood, earthy scene",
    emotionalResonance: "connection, grounding",
  },
];

// ============================================================================
// SENSORY LANGUAGE
// ============================================================================

export interface SensoryOption {
  value: SensoryLanguage;
  label: string;
  description: string;
  leonardoLanguage: string;
}

export const SENSORY_LANGUAGE_OPTIONS: SensoryOption[] = [
  {
    value: "crisp-sharp",
    label: "Crisp & Sharp",
    description: "Clear, defined edges",
    leonardoLanguage: "crisp detail, sharp focus, defined edges",
  },
  {
    value: "soft-blurred",
    label: "Soft & Blurred",
    description: "Gentle, out-of-focus quality",
    leonardoLanguage: "soft focus, gentle blur, dreamy quality",
  },
  {
    value: "warm-inviting",
    label: "Warm & Inviting",
    description: "Welcoming, comfortable feeling",
    leonardoLanguage: "warm tones, inviting atmosphere, welcoming feel",
  },
  {
    value: "cool-distant",
    label: "Cool & Distant",
    description: "Detached, remote quality",
    leonardoLanguage: "cool tones, distant atmosphere, remote feel",
  },
  {
    value: "rich-saturated",
    label: "Rich & Saturated",
    description: "Deep, intense colors",
    leonardoLanguage: "rich colors, saturated tones, vibrant hues",
  },
  {
    value: "muted-desaturated",
    label: "Muted & Desaturated",
    description: "Subdued, low-intensity colors",
    leonardoLanguage: "muted colors, desaturated tones, subdued palette",
  },
  {
    value: "luminous-glowing",
    label: "Luminous & Glowing",
    description: "Light-emitting quality",
    leonardoLanguage: "luminous quality, glowing effect, radiant light",
  },
  {
    value: "shadowy-dark",
    label: "Shadowy & Dark",
    description: "Dark, mysterious shadows",
    leonardoLanguage: "deep shadows, dark tones, mysterious darkness",
  },
  {
    value: "textured-tactile",
    label: "Textured & Tactile",
    description: "Touch-inviting surface detail",
    leonardoLanguage: "tactile texture, detailed surface, tangible quality",
  },
  {
    value: "smooth-sleek",
    label: "Smooth & Sleek",
    description: "Polished, flowing surfaces",
    leonardoLanguage: "smooth surface, sleek finish, polished quality",
  },
  {
    value: "dynamic-motion",
    label: "Dynamic & Motion",
    description: "Movement, energy, flow",
    leonardoLanguage: "dynamic motion, flowing movement, energetic action",
  },
  {
    value: "static-still",
    label: "Static & Still",
    description: "Frozen, motionless quality",
    leonardoLanguage: "frozen moment, still composition, static scene",
  },
  {
    value: "expansive-vast",
    label: "Expansive & Vast",
    description: "Wide, open, limitless feeling",
    leonardoLanguage: "expansive space, vast scale, open atmosphere",
  },
  {
    value: "confined-intimate",
    label: "Confined & Intimate",
    description: "Close, personal, enclosed feeling",
    leonardoLanguage: "intimate space, confined area, close perspective",
  },
  {
    value: "delicate-fragile",
    label: "Delicate & Fragile",
    description: "Gentle, vulnerable quality",
    leonardoLanguage: "delicate detail, fragile quality, gentle touch",
  },
];

// ============================================================================
// FOCAL POINT OPTIONS
// ============================================================================

export interface FocalPointOption {
  value: FocalPoint;
  label: string;
  description: string;
}

export const FOCAL_POINT_OPTIONS: FocalPointOption[] = [
  {
    value: "center",
    label: "Center",
    description: "Dead center of frame",
  },
  {
    value: "left-third",
    label: "Left Third",
    description: "Left third line (rule of thirds)",
  },
  {
    value: "right-third",
    label: "Right Third",
    description: "Right third line (rule of thirds)",
  },
  {
    value: "top-third",
    label: "Top Third",
    description: "Upper third line (rule of thirds)",
  },
  {
    value: "bottom-third",
    label: "Bottom Third",
    description: "Lower third line (rule of thirds)",
  },
  {
    value: "golden-spiral",
    label: "Golden Spiral",
    description: "Following fibonacci spiral",
  },
  {
    value: "foreground",
    label: "Foreground",
    description: "Front layer of scene",
  },
  {
    value: "midground",
    label: "Midground",
    description: "Middle layer of scene",
  },
  {
    value: "background",
    label: "Background",
    description: "Back layer of scene",
  },
  {
    value: "multiple-points",
    label: "Multiple Points",
    description: "Several areas of interest",
  },
];

// ============================================================================
// COLOR PALETTES
// ============================================================================

export const COLOR_PALETTES: LeonardoColorPalette[] = [
  {
    name: "Warm Sunset",
    primaryFamily: "Orange",
    secondaryAccents: ["Red", "Yellow"],
    hexColors: ["#FF6B35", "#F7931E", "#FDC830"],
  },
  {
    name: "Cool Ocean",
    primaryFamily: "Blue",
    secondaryAccents: ["Teal", "Cyan"],
    hexColors: ["#0077BE", "#00B4D8", "#90E0EF"],
  },
  {
    name: "Earth Tones",
    primaryFamily: "Brown",
    secondaryAccents: ["Green", "Beige"],
    hexColors: ["#8B4513", "#6B8E23", "#D2B48C"],
  },
  {
    name: "Monochrome",
    primaryFamily: "Gray",
    secondaryAccents: ["Black", "White"],
    hexColors: ["#2C2C2C", "#808080", "#E0E0E0"],
  },
  {
    name: "Vibrant Neon",
    primaryFamily: "Magenta",
    secondaryAccents: ["Cyan", "Yellow"],
    hexColors: ["#FF00FF", "#00FFFF", "#FFFF00"],
  },
  {
    name: "Pastel Dream",
    primaryFamily: "Pink",
    secondaryAccents: ["Lavender", "Mint"],
    hexColors: ["#FFB6C1", "#E6E6FA", "#98FF98"],
  },
  {
    name: "Forest Green",
    primaryFamily: "Green",
    secondaryAccents: ["Brown", "Dark Green"],
    hexColors: ["#228B22", "#8B4513", "#006400"],
  },
  {
    name: "Desert Sand",
    primaryFamily: "Tan",
    secondaryAccents: ["Orange", "Brown"],
    hexColors: ["#D2B48C", "#FF8C00", "#A0522D"],
  },
];

// ============================================================================
// NEGATIVE PROMPTS
// ============================================================================

export const DEFAULT_NEGATIVE_PROMPTS = [
  "people",
  "person",
  "human",
  "man",
  "woman",
  "child",
  "face",
  "portrait",
  "hands",
  "fingers",
  "body",
  "skin",
  "eyes",
  "mouth",
  "hair",
  "clothing",
  "text",
  "words",
  "letters",
  "watermark",
  "signature",
  "blurry",
];
