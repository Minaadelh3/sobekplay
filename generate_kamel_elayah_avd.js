/**
 * Generates 500+ AVD verses dataset as JSON.
 * Source: eBible Arabic Van Dyck (Public Domain).
 * NOTE: Run locally (node 18+).
 */

import fs from "fs";

const OUT = "public/data/kamel_elayah.avd.500.json";

/**
 * You provide a list of refs you consider "most popular".
 * Below: a good practical approach:
 * - Take popular chapters (Psalms 23, 91, 121; Matthew 5-7; John 3, 14-17; Romans 8; 1 Cor 13; etc.)
 * - Then fill the rest by sampling from Psalms/Proverbs/Gospels.
 *
 * IMPORTANT: Keep it deterministic for consistent builds.
 */
function buildVerseRefs() {
    const refs = [];

    // Helper
    const addRange = (bookKey, bookAr, chapter, fromV, toV) => {
        for (let v = fromV; v <= toV; v++) {
            refs.push({ bookKey, bookAr, chapter, verse: v });
        }
    };

    // “Popular blocks” (you can tweak)
    addRange("psa", "المزامير", 23, 1, 6);      // 6
    addRange("psa", "المزامير", 91, 1, 16);     // 16
    addRange("psa", "المزامير", 121, 1, 8);     // 8
    addRange("pro", "أمثال", 3, 1, 12);         // 12
    addRange("mat", "متى", 5, 1, 48);           // 48
    addRange("mat", "متى", 6, 1, 34);           // 34
    addRange("mat", "متى", 7, 1, 29);           // 29
    addRange("jhn", "يوحنا", 3, 1, 36);         // 36
    addRange("jhn", "يوحنا", 14, 1, 31);        // 31
    addRange("jhn", "يوحنا", 15, 1, 27);        // 27
    addRange("jhn", "يوحنا", 16, 1, 33);        // 33
    addRange("rom", "رومية", 8, 1, 39);         // 39
    addRange("1co", "كورنثوس الأولى", 13, 1, 13); // 13

    // Count so far:
    // 6+16+8+12+48+34+29+36+31+27+33+39+13 = 332

    // Fill to 520 by sampling more “commonly used” Psalms & Proverbs & short NT highlights
    // (Keeps "most popular vibe" while reaching the target)
    addRange("psa", "المزامير", 1, 1, 6);       // +6 => 338
    addRange("psa", "المزامير", 27, 1, 14);     // +14 => 352
    addRange("psa", "المزامير", 46, 1, 11);     // +11 => 363
    addRange("psa", "المزامير", 139, 1, 24);    // +24 => 387
    addRange("pro", "أمثال", 16, 1, 33);        // +33 => 420
    addRange("luk", "لوقا", 15, 1, 32);         // +32 => 452
    addRange("php", "فيلبي", 4, 1, 23);         // +23 => 475
    addRange("eph", "أفسس", 6, 1, 24);          // +24 => 499
    addRange("1pe", "بطرس الأولى", 5, 1, 14);   // +14 => 513

    // Ensure >= 500
    return refs;
}

/**
 * Fetch a chapter HTML page from eBible and extract verses.
 * eBible structure example: https://ebible.org/arb-vd/jhn/3.htm
 */
async function fetchChapter(bookKey, chapter) {
    // Fix URL structure:
    // eBible uses uppercase book keys (e.g. PSA, JHN)
    // Psalms uses 3-digit chapter (e.g. PSA023.htm), others 2-digit (e.g. JHN03.htm)

    const bk = bookKey.toUpperCase();
    let chapStr;
    if (bk === "PSA") {
        chapStr = String(chapter).padStart(3, "0");
    } else {
        chapStr = String(chapter).padStart(2, "0");
    }

    const url = `https://ebible.org/arb-vd/${bk}${chapStr}.htm`;
    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Failed ${url}: ${res.status}`);
        const html = await res.text();

        // Very lightweight parse: locate verse markers like id="v16" then capture text.
        // eBible HTML can vary; adjust if needed.
        // Robust parse for eBible structure (e.g. <span class="verse" id="V1">)
        const map = new Map();

        // Regex to find verse markers (start of verse)
        // Matches: <span ... id="V1" ... > ... </span>
        // We capture the Verse Number (1) and the end position of the span
        const regex = /<span[^>]*id=["']V(\d+)["'][^>]*>.*?<\/span>/gis;

        let match;
        const matches = [];
        while ((match = regex.exec(html)) !== null) {
            matches.push({
                v: Number(match[1]),
                start: match.index + match[0].length,
                index: match.index
            });
        }

        for (let i = 0; i < matches.length; i++) {
            const current = matches[i];
            if (current.v === 0) continue; // Skip title/intro

            let end;
            if (i < matches.length - 1) {
                // End is the start of the next verse marker
                end = matches[i + 1].index;
            } else {
                // For the last verse, look for the next significant container or end of content
                // Common footer markers in eBible: <div class="footnote">, <div class="copyright">
                const nextDiv = html.indexOf('<div', current.start);
                end = nextDiv !== -1 ? nextDiv : html.length;
            }

            const raw = html.substring(current.start, end);
            const clean = raw
                .replace(/<[^>]*>/g, " ") // Remove all tags
                .replace(/\s+/g, " ")     // Collapse whitespace
                .trim();

            if (clean) map.set(current.v, clean);
        }
        return map;
    } catch (error) {
        console.error(`Error fetching chapter ${bookKey} ${chapter}:`, error);
        return new Map();
    }
}

function difficultyFor(textLen) {
    if (textLen <= 65) return "easy";
    if (textLen <= 120) return "mid";
    return "hard";
}

function makeBlank(text) {
    // Remove last ~30-45% as answer (simple, consistent)
    const words = text.split(" ");
    if (words.length < 10) {
        const cut = Math.max(3, Math.floor(words.length * 0.4));
        return {
            type: "tail",
            prompt: words.slice(0, words.length - cut).join(" ") + "…",
            answer: words.slice(words.length - cut).join(" ")
        };
    }
    const cut = Math.max(6, Math.floor(words.length * 0.35));
    return {
        type: "tail",
        prompt: words.slice(0, words.length - cut).join(" ") + "…",
        answer: words.slice(words.length - cut).join(" ")
    };
}

async function main() {
    // Ensure directory exists
    const dir = OUT.substring(0, OUT.lastIndexOf("/"));
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    const refs = buildVerseRefs();

    // Group by (bookKey, chapter)
    const byChap = new Map();
    for (const r of refs) {
        const key = `${r.bookKey}:${r.chapter}`;
        if (!byChap.has(key)) byChap.set(key, []);
        byChap.get(key).push(r);
    }

    const verses = [];
    for (const [key, list] of byChap.entries()) {
        const [bookKey, chapStr] = key.split(":");
        const chapter = Number(chapStr);

        console.log(`Fetching ${bookKey} ${chapter}...`);
        const verseMap = await fetchChapter(bookKey, chapter);

        for (const r of list) {
            const text = verseMap.get(r.verse);
            if (!text) continue;

            const diff = difficultyFor(text.length);
            const blank = makeBlank(text);

            verses.push({
                id: `${bookKey.toUpperCase()}-${String(chapter).padStart(3, "0")}-${String(r.verse).padStart(3, "0")}`,
                book: r.bookAr,
                bookKey,
                chapter,
                verse: r.verse,
                refAr: `${r.bookAr} ${chapter}:${r.verse}`,
                text,
                difficulty: diff,
                mode: "typing",
                blank,
                hints: [
                    `أول حرف: ${blank.answer.trim().charAt(0)}`,
                    `عدد كلمات الإجابة: ${blank.answer.split(" ").length}`
                ],
                tags: []
            });
        }
    }

    // Ensure >= 500
    if (verses.length < 500) {
        console.warn(`Only generated ${verses.length}. Consider expanding ranges.`);
    }

    const out = {
        meta: {
            gameId: "kamel-elayah",
            titleAr: "كمل الآية",
            translation: "AVD",
            source: "https://ebible.org/arb-vd/ (Public Domain)",
            version: "1.0.0",
            generatedAt: new Date().toISOString(),
            count: verses.length
        },
        verses
    };

    fs.writeFileSync(OUT, JSON.stringify(out, null, 2), "utf8");
    console.log(`✅ Wrote ${OUT} with ${verses.length} verses`);
}

main().catch(e => {
    console.error(e);
    process.exit(1);
});
