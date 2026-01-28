# 🎡 Sobek Play: The Immersive Arcade UX
*Design Specification Document*

## 1. The Core Concept: "The Phantom Arcade"
The user isn't visiting a webpage; they are entering a **night-time digital amusement park**. 
*   **Vibe**: Dark, Neon, Alive, buzzing with potential energy.
*   **Perspective**: Mobile-first, vertical, one-handed.
*   **Interaction**: Tactile – buttons feel clickable, cards feel heavy.

---

## 2. Page Architecture (The Walkway)
The layout is a single vertical column (The Walkway). Games are booths/attractions along this path.

*   **Background**: `#050505` (Near Black).
*   **Ambient Light**: Fixed colored blurs behind zones (Purple for mystery, Red for danger) to give depth without clutter.
*   **Spacing**: Huge breathing room between cards (`gap-6` or `gap-8`). No cramping.

---

## 3. The Zone System
Games are not listed alphabetically; they are grouped by **ENERGY**.

### 🟡 ZONE A: Hype & Movement (Laughter)
*Vibe: High Energy, Loud, Physical.*
*   **Games**:
    *   **مثّلها لو قدّك (Charades)**: Visual Cue = A mask or motion lines. Color = `Amber/Yellow`.
    *   **كان قصده إيه؟ (Meaning)**: Visual Cue = A thought bubble or silhouette. Color = `Blue/Indigo`.

### 🟢 ZONE B: Adrenaline (Speed)
*Vibe: Fast, Ticking Clock, Rush.*
*   **Games**:
    *   **كمّل المثل (Proverbs)**: Visual Cue = An hourglass or lightning. Color = `Emerald/Green`.
    *   **قول بسرعة (Panic)**: Visual Cue = A bomb or explosion. Color = `Rose/Red`.
    *   **كمّل الآية (Verses)**: Visual Cue = An open scroll or beam of light. Color = `Cyan/Sky`.

### 🟣 ZONE C: Mind Games (Social Intelligence)
*Vibe: Cool, Calculated, Revealing.*
*   **Games**:
    *   **إنتو شايفينه إزاي؟ (Perception)**: Visual Cue = An eye or pointing finger. Color = `Violet/Purple`.
    *   **مين ده؟ (Characters)**: Visual Cue = A magnifying glass or question mark. Color = `Gold/Amber`.

### 🌑 ZONE D: The Dark Zone (Heavy/Forbidden)
*Vibe: Serious, Risky, Deep.*
*   **Games**:
    *   **سؤال ملوش هزار (Soul)**: Visual Cue = A moon or balance scale. Color = `Slate/Grey`.
    *   **ممنوعات (Forbidden)**: Visual Cue = A "Do Not Enter" sign or skull. Color = `Deep Red/Black`.

---

## 4. The Card Anatomy (Visual Attraction)
A game card is not a rectangle with text. It is a **neon sign**.

**Layers:**
1.  **Base Layer**: Dark glass morphism (`bg-white/5`, `backdrop-blur`).
2.  **Color Injection**: A gradient wash that defines the game's mood (e.g., Red wash for Forbidden).
3.  **The Hook (Copy)**:
    *   **Title**: 900-weight Bold Egyptian Font.
    *   **Brief**: 1 short sentence, usually a challenge (e.g., "جسمك بس اللي يتكلم").
4.  **The Visual Cue**: A large, abstract, watermark-style icon/shape positioned off-center or behind text to create depth.
5.  **The Trigger**: A Pill-shaped CTA button at the bottom right.
    *   Label is ACTION-based: "ابدأ" / "سمّع" / "انجز" (Not just "Play").

---

## 5. Interaction Design (Feel)
*   **Tap**: The card subtly scales down (`scale(0.98)`).
*   **Scroll**: As cards enter the viewport, they slide up and fade in (`FadeInUp`).
*   **Haptics (Concept)**: The UI should visually suggest weight. Heavy games feel heavier (slower transition), fast games feel snappy.

---

## 6. Color Psychology Palette
*   **Fun**: `from-yellow-400 to-orange-600` (Warmth, Energy).
*   **Speed**: `from-green-400 to-emerald-600` (Go, safe but fast).
*   **Holy/Memory**: `from-cyan-400 to-blue-600` (Clarity, Divine).
*   **Mystery**: `from-purple-500 to-indigo-900` (Deep, Royal).
*   **Danger**: `from-red-900 to-black` (Alert, Caution).

---

## 7. The User Story
"I open the app. The background is dark. I see a glowing yellow card inviting me to move. I scroll down. The colors shift to green—it feels faster. I scroll deeper. It gets purple, then dark red. I feel like I'm exploring a venue, choosing which door to open."
