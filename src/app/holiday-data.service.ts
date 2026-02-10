import { Injectable } from '@angular/core';
import { HebrewCalendar, flags as HebcalFlags } from '@hebcal/core';

const SEARCH_WS_RE = /\s+/g;
const HEBREW_RE = /[\u0590-\u05FF]/;
const HEBREW_SKELETON_DROP_RE = /[וי]/g;

function normalizeForSearch(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFKD')
    // Remove diacritics (including Hebrew niqqud/cantillation) for forgiving search.
    .replace(/\p{M}+/gu, '')
    // Remove apostrophes/quotes so e.g. "New Year's" -> "new years" and ט״ו -> טו.
    .replace(/['"\u2018\u2019\u201C\u201D\u02BC\u2032\u0060\u00B4\u05F3\u05F4]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
    .replace(SEARCH_WS_RE, ' ');
}

function compactForSearch(normalized: string): string {
  return normalized.replace(SEARCH_WS_RE, '');
}

function hebrewSkeleton(normalized: string): string {
  const c = compactForSearch(normalized);
  return HEBREW_RE.test(c) ? c.replace(HEBREW_SKELETON_DROP_RE, '') : c;
}

// ════════════════════════════════════════════════════════════════════
// TYPES
// ════════════════════════════════════════════════════════════════════
export type HolidayCat = 'major' | 'minor' | 'fast' | 'modern' | 'us-federal';

export interface RawHoliday {
  title: string;
  start: string;
  end: string;
  cat: HolidayCat;
  hebrew?: string;
  desc?: string;
}

export interface Occurrence {
  start: string;
  end: string;
  displayStart: string;
  displayEnd: string;
}

export interface Holiday {
  title: string;
  cat: HolidayCat;
  hebrew: string;
  desc: string;
  occurrences: Occurrence[];
  nextStart: string;
  nextEnd: string;
  nextDisplayStart: string;
  nextDisplayEnd: string;
  dayCount: number;
  daysUntil: number;
  daysUntilEnd: number;
}

export interface CatStyle {
  color: string;
  bg: string;
  label: string;
}

// ════════════════════════════════════════════════════════════════════
// JEWISH HOLIDAY DEFINITIONS — dates computed locally via @hebcal/core
// ════════════════════════════════════════════════════════════════════
interface JewishHolidayDef {
  title: string;
  hebcalBasename: string | string[];
  cat: Exclude<HolidayCat, 'us-federal'>;
  hebrew: string;
  desc: string;
  includeInIsrael?: boolean;
  titleInIsrael?: string;
  hebrewInIsrael?: string;
}

function defBasenames(def: JewishHolidayDef): string[] {
  return Array.isArray(def.hebcalBasename) ? def.hebcalBasename : [def.hebcalBasename];
}

const JEWISH_HOLIDAY_DEFS: JewishHolidayDef[] = [
  { title: "Rosh Hashana", hebcalBasename: "Rosh Hashana", cat: "major", hebrew: "רֹאשׁ הַשָּׁנָה", desc: "The Jewish New Year" },
  { title: "Tzom Gedaliah", hebcalBasename: "Tzom Gedaliah", cat: "fast", hebrew: "צוֹם גְּדַלְיָה", desc: "Fast commemorating the assassination of Gedaliah ben Ahikam" },
  { title: "Yom Kippur", hebcalBasename: "Yom Kippur", cat: "major", hebrew: "יוֹם כִּפּוּר", desc: "Day of Atonement" },
  {
    title: "Sukkot",
    // Treat Sukkot, Shmini Atzeret, and Simchat Torah as a single holiday span.
    // This keeps one entry in the UI and makes searches for any of these names land on the same result.
    hebcalBasename: ["Sukkot", "Shmini Atzeret", "Simchat Torah"],
    cat: "major",
    hebrew: "סוּכּוֹת / שְׁמִינִי עֲצֶרֶת / שִׂמְחַת תּוֹרָה",
    desc: "Sukkot (includes Shmini Atzeret and Simchat Torah)",
  },
  { title: "Chanukah", hebcalBasename: "Chanukah", cat: "major", hebrew: "חֲנוּכָּה", desc: "Festival of Lights" },
  { title: "Asara B'Tevet", hebcalBasename: "Asara B'Tevet", cat: "fast", hebrew: "עֲשָׂרָה בְּטֵבֵת", desc: "Fast commemorating the siege of Jerusalem" },
  { title: "Tu BiShvat", hebcalBasename: "Tu BiShvat", cat: "minor", hebrew: "ט\"וּ בִּשְׁבָט", desc: "New Year for Trees" },
  { title: "Ta'anit Esther", hebcalBasename: "Ta'anit Esther", cat: "fast", hebrew: "תַּעֲנִית אֶסְתֵּר", desc: "Fast of Esther" },
  { title: "Purim", hebcalBasename: "Purim", cat: "major", hebrew: "פּוּרִים", desc: "Celebration of Jewish deliverance as told by Megilat Esther" },
  { title: "Shushan Purim", hebcalBasename: "Shushan Purim", cat: "minor", hebrew: "שׁוּשַׁן פּוּרִים", desc: "Purim as celebrated in walled cities" },
  { title: "Pesach", hebcalBasename: "Pesach", cat: "major", hebrew: "פֶּסַח", desc: "Passover — the Feast of Unleavened Bread" },
  { title: "Yom HaShoah", hebcalBasename: "Yom HaShoah", cat: "modern", hebrew: "יוֹם הַשּׁוֹאָה", desc: "Holocaust Remembrance Day" },
  { title: "Yom HaZikaron", hebcalBasename: "Yom HaZikaron", cat: "modern", hebrew: "יוֹם הַזִּכָּרוֹן", desc: "Israeli Memorial Day" },
  { title: "Yom HaAtzmaut", hebcalBasename: "Yom HaAtzma'ut", cat: "modern", hebrew: "יוֹם הָעַצְמָאוּת", desc: "Israel Independence Day" },
  { title: "Pesach Sheni", hebcalBasename: "Pesach Sheni", cat: "minor", hebrew: "פֶּסַח שֵׁנִי", desc: "Second Passover" },
  { title: "Lag BaOmer", hebcalBasename: "Lag BaOmer", cat: "minor", hebrew: "ל\"ג בָּעוֹמֶר", desc: "33rd day of counting the Omer" },
  { title: "Yom Yerushalayim", hebcalBasename: "Yom Yerushalayim", cat: "modern", hebrew: "יוֹם יְרוּשָׁלַיִם", desc: "Jerusalem Day" },
  { title: "Shavuot", hebcalBasename: "Shavuot", cat: "major", hebrew: "שָׁבוּעוֹת", desc: "Festival of Weeks" },
  { title: "Tzom Tammuz", hebcalBasename: "Tzom Tammuz", cat: "fast", hebrew: "צוֹם תַּמּוּז", desc: "Fast of the 17th of Tammuz" },
  { title: "Tisha B'Av", hebcalBasename: "Tish'a B'Av", cat: "fast", hebrew: "תִּשְׁעָה בְּאָב", desc: "Fast commemorating the destruction of the Temples" },
  { title: "Tu B'Av", hebcalBasename: "Tu B'Av", cat: "minor", hebrew: "ט\"וּ בְּאָב", desc: "Minor holiday of love" },
];
// ── Transliteration aliases ────────────────────────────────────────
const ALIASES: Record<string, string[]> = {
  "chanukah": ["hanukkah", "hanukah", "hanuka", "chanuka", "channukah", "chanukkah"],
  "sukkot": [
    "sukkos",
    "succot",
    "succos",
    "succoth",
    "sukkoth",
    "shmini atzeret",
    "shmini atzeres",
    "shemini atzeret",
    "shemini atzeres",
    "simchat torah",
    "simchas torah",
    "simhat torah",
    "simchat tora",
  ],
  "rosh hashana": ["rosh hashanah", "rosh hashona", "rosh hashonah"],
  "shavuot": ["shavuos", "shavuoth", "shevuot"],
  "yom kippur": ["yom kipur", "yom kippor"],
  "pesach": ["passover", "pessach", "pesah"],
  "purim": ["poorim"],
  "tisha b'av": ["tisha bav", "tisha beav", "tishah bav", "ninth of av", "9 av", "9th av", "9th of av"],
  "tu bishvat": ["tu b'shvat", "tu bshvat", "tu b'shevat", "tu beshvat"],
  "lag baomer": ["lag b'omer", "lag bomer"],
  "yom haatzmaut": ["yom ha'atzmaut", "israel independence"],
  "yom hazikaron": ["yom ha'zikaron", "israeli memorial"],
  "yom hashoah": ["yom ha'shoah", "holocaust remembrance"],
  "ta'anit esther": ["taanis esther", "fast of esther", "taanit esther"],
  "asara b'tevet": ["asara btevet", "asarah b'tevet", "asarah btevet", "10 tevet", "10th tevet", "10th of tevet", "tenth of tevet"],
  "tzom gedaliah": ["tzom gedalia", "fast of gedaliah"],
  "tzom tammuz": [
    "tzom tamuz",
    "17 tammuz",
    "17 tamuz",
    "17th tammuz",
    "17th tamuz",
    "17th of tammuz",
    "17th of tamuz",
    "seventeenth of tammuz",
    "fast of tammuz",
    "fast of tamuz",
    "shiva asar btammuz",
    "shiva asar btamuz",
    "shivah asar btammuz",
    "shivah asar btamuz",
    "sheva asar btammuz",
    "sheva asar btamuz",
    "shiva asar b'tammuz",
    "shiva asar b'tamuz",
    "shiva asar b tammuz",
    "shiva asar b tamuz",
    "shivah asar b tammuz",
    "shivah asar b tamuz",
    "sheva asar b tammuz",
    "sheva asar b tamuz",
  ],
  "shushan purim": ["shushan poorim"],
  "pesach sheni": ["second passover"],
  "tu b'av": ["tu bav", "15 av", "15th av", "15th of av"],
  "yom yerushalayim": ["jerusalem day"],
  "martin luther king": ["mlk day", "mlk"],
  "presidents' day": ["presidents day", "president's day", "washington's birthday", "washingtons birthday"],
  "independence day": ["4th of july", "fourth of july", "july 4th", "july 4"],
  "labor day": ["labour day"],
  "veterans day": ["veteran's day", "veterans' day"],
  "thanksgiving": ["turkey day"],
};

// ════════════════════════════════════════════════════════════════════
// SERVICE
// ════════════════════════════════════════════════════════════════════
@Injectable({ providedIn: 'root' })
export class HolidayDataService {

  static readonly DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  static readonly MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  static readonly CAT_STYLES: Record<string, CatStyle> = {
    major: { color: '#2C3E6B', bg: '#E6EAF3', label: 'Major' },
    minor: { color: '#2C3E6B', bg: '#E6EAF3', label: 'Minor' },
    fast: { color: '#8B3A3A', bg: '#FDF0F0', label: 'Fast Day' },
    modern: { color: '#2D6B4F', bg: '#EDF7F2', label: 'Modern' },
    'us-federal': { color: '#7A4419', bg: '#FDF4EC', label: 'US Federal' },
  };

  static readonly CAT_WEIGHT: Record<string, number> = {
    major: 0, fast: 1, modern: 2, minor: 3, 'us-federal': 4,
  };

  // ── Date helpers ─────────────────────────────────────────────────

  static parseDate(s: string): Date {
    const [y, m, d] = s.split('-').map(Number);
    return new Date(y, m - 1, d);
  }

  static fmtD(dt: Date): string {
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, '0');
    const d = String(dt.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  private static addDays(s: string, delta: number): string {
    const d = this.parseDate(s);
    d.setDate(d.getDate() + delta);
    return this.fmtD(d);
  }

  private static diffDays(a: string, b: string): number {
    return Math.round((this.parseDate(b).getTime() - this.parseDate(a).getTime()) / 86400000);
  }

  static addDay(s: string): string {
    return this.addDays(s, 1);
  }

  static formatDate(s: string): string {
    const d = this.parseDate(s);
    return `${this.DAYS[d.getDay()]}, ${this.MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  }

  static formatDateShort(s: string): string {
    const d = this.parseDate(s);
    return `${this.DAYS[d.getDay()].slice(0, 3)}, ${this.MONTHS[d.getMonth()]} ${d.getDate()}`;
  }

  static formatDateCompact(s: string): string {
    const d = this.parseDate(s);
    return `${this.MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  }

  static daysUntil(s: string): number {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    return Math.round((this.parseDate(s).getTime() - today.getTime()) / 86400000);
  }

  static daySpan(start: string, end: string): number {
    return Math.round((this.parseDate(end).getTime() - this.parseDate(start).getTime()) / 86400000) + 1;
  }

  static todayStr(): string {
    const d = new Date(); d.setHours(0, 0, 0, 0);
    return this.fmtD(d);
  }

  static jewishSunsetShift(cat: HolidayCat): boolean {
    return cat === 'major' || cat === 'minor' || cat === 'modern';
  }

  static isJewish(cat: HolidayCat): boolean {
    return cat !== 'us-federal';
  }

  private buildJewishHolidays(diaspora: boolean, startYear: number, numYears: number): RawHoliday[] {
    const basenames = new Set(JEWISH_HOLIDAY_DEFS.flatMap(d => defBasenames(d)));
    const byBasename = new Map<string, Map<string, boolean>>();

    const events = HebrewCalendar.calendar({
      year: startYear,
      isHebrewYear: false,
      numYears,
      il: !diaspora,
      noRoshChodesh: true,
      noSpecialShabbat: true,
    });

    for (const ev of events) {
      const base = ev.basename();
      if (!basenames.has(base)) continue;

      const date = HolidayDataService.fmtD(ev.greg());
      const isErev = (ev.getFlags() & HebcalFlags.EREV) !== 0;

      let dateMap = byBasename.get(base);
      if (!dateMap) {
        dateMap = new Map();
        byBasename.set(base, dateMap);
      }
      dateMap.set(date, (dateMap.get(date) ?? false) || isErev);
    }

    const il = !diaspora;
    const raw: RawHoliday[] = [];

    for (const def of JEWISH_HOLIDAY_DEFS) {
      if (il && def.includeInIsrael === false) continue;

      // Some holidays intentionally unify multiple Hebcal basenames (e.g., Sukkot+Shmini Atzeret+Simchat Torah).
      const dateMap = new Map<string, boolean>();
      for (const base of defBasenames(def)) {
        const dm = byBasename.get(base);
        if (!dm) continue;
        for (const [date, isErev] of dm.entries()) {
          dateMap.set(date, (dateMap.get(date) ?? false) || isErev);
        }
      }
      if (dateMap.size === 0) continue;

      const days = [...dateMap.entries()]
        .map(([date, isErev]) => ({ date, isErev }))
        .sort((a, b) => a.date.localeCompare(b.date));

      if (days.length === 0) continue;

      const segments: Array<Array<{ date: string; isErev: boolean }>> = [];
      let seg: Array<{ date: string; isErev: boolean }> = [];
      for (const day of days) {
        if (seg.length === 0) {
          seg = [day];
          continue;
        }
        const prev = seg[seg.length - 1].date;
        const delta = HolidayDataService.diffDays(prev, day.date);
        if (delta <= 1) {
          seg.push(day);
        } else {
          segments.push(seg);
          seg = [day];
        }
      }
      if (seg.length) segments.push(seg);

      for (const s of segments) {
        const earliest = s[0].date;
        const latest = s[s.length - 1].date;

        const shift = HolidayDataService.jewishSunsetShift(def.cat);
        const erev = s
          .filter(d => d.isErev)
          .map(d => d.date)
          .sort((a, b) => a.localeCompare(b))[0];

        let start = earliest;
        if (erev) start = erev;
        else if (shift) start = HolidayDataService.addDays(earliest, -1);

        raw.push({
          title: il ? (def.titleInIsrael || def.title) : def.title,
          start,
          end: latest,
          cat: def.cat,
          hebrew: il ? (def.hebrewInIsrael || def.hebrew) : def.hebrew,
          desc: def.desc,
        });
      }
    }

    return raw;
  }

  // ── US Federal Holidays ──────────────────────────────────────────

  private static getNthWeekday(year: number, month: number, dow: number, n: number): Date {
    let count = 0;
    for (let d = 1; d <= 31; d++) {
      const dt = new Date(year, month, d);
      if (dt.getMonth() !== month) break;
      if (dt.getDay() === dow) { count++; if (count === n) return dt; }
    }
    return new Date(year, month, 1);
  }

  private static getLastWeekday(year: number, month: number, dow: number): Date {
    let last: Date = new Date(year, month, 1);
    for (let d = 1; d <= 31; d++) {
      const dt = new Date(year, month, d);
      if (dt.getMonth() !== month) break;
      if (dt.getDay() === dow) last = dt;
    }
    return last;
  }

  private static getUSHolidays(year: number): RawHoliday[] {
    const f = (dt: Date) => this.fmtD(dt);
    return [
      { title: "New Year's Day", start: `${year}-01-01`, end: `${year}-01-01`, cat: 'us-federal' },
      { title: "Martin Luther King Jr. Day", start: f(this.getNthWeekday(year, 0, 1, 3)), end: f(this.getNthWeekday(year, 0, 1, 3)), cat: 'us-federal' },
      { title: "Presidents' Day", start: f(this.getNthWeekday(year, 1, 1, 3)), end: f(this.getNthWeekday(year, 1, 1, 3)), cat: 'us-federal' },
      { title: "Memorial Day", start: f(this.getLastWeekday(year, 4, 1)), end: f(this.getLastWeekday(year, 4, 1)), cat: 'us-federal' },
      { title: "Juneteenth", start: `${year}-06-19`, end: `${year}-06-19`, cat: 'us-federal' },
      { title: "Independence Day", start: `${year}-07-04`, end: `${year}-07-04`, cat: 'us-federal' },
      { title: "Labor Day", start: f(this.getNthWeekday(year, 8, 1, 1)), end: f(this.getNthWeekday(year, 8, 1, 1)), cat: 'us-federal' },
      { title: "Columbus Day", start: f(this.getNthWeekday(year, 9, 1, 2)), end: f(this.getNthWeekday(year, 9, 1, 2)), cat: 'us-federal' },
      { title: "Veterans Day", start: `${year}-11-11`, end: `${year}-11-11`, cat: 'us-federal' },
      { title: "Thanksgiving", start: f(this.getNthWeekday(year, 10, 4, 4)), end: f(this.getNthWeekday(year, 10, 4, 4)), cat: 'us-federal' },
      { title: "Christmas Day", start: `${year}-12-25`, end: `${year}-12-25`, cat: 'us-federal' },
    ];
  }

  // ── Search ───────────────────────────────────────────────────────

  static buildSearchTerms(query: string): string[] {
    const q = normalizeForSearch(query);
    if (!q) return [];

    const qc = compactForSearch(q);
    const terms = new Set<string>([q]);

    for (const [keyRaw, variantsRaw] of Object.entries(ALIASES)) {
      const key = normalizeForSearch(keyRaw);
      const variants = variantsRaw.map(v => normalizeForSearch(v)).filter(Boolean);

      const group = [key, ...variants].filter(Boolean);
      const groupCompacts = group.map(compactForSearch);

      let related = false;
      for (let i = 0; i < group.length; i++) {
        const t = group[i];
        const tc = groupCompacts[i];
        if (t.includes(q) || q.includes(t) || tc.includes(qc) || qc.includes(tc)) {
          related = true;
          break;
        }
      }
      if (!related) continue;

      group.forEach(t => terms.add(t));
    }

    return [...terms];
  }

  // ── Build holiday index ──────────────────────────────────────────

  buildHolidays(diaspora: boolean): Holiday[] {
    const today = HolidayDataService.todayStr();
    const currentYear = new Date().getFullYear();
    const startYear = currentYear - 1; // capture holidays spanning Gregorian years (e.g., Chanukah)
    const numYears = 8; // (currentYear-1)..(currentYear+6) to fully cover holidays spanning years
    const jewish: RawHoliday[] = this.buildJewishHolidays(diaspora, startYear, numYears);

    const us: RawHoliday[] = [];
    for (let y = startYear; y < startYear + numYears; y++) us.push(...HolidayDataService.getUSHolidays(y));
    const all = [...jewish, ...us];

    const grouped: Record<string, { raw: RawHoliday; occurrences: Occurrence[] }> = {};
    for (const h of all) {
      if (!grouped[h.title]) grouped[h.title] = { raw: h, occurrences: [] };
      const shift = HolidayDataService.jewishSunsetShift(h.cat);
      grouped[h.title].occurrences.push({
        start: h.start, end: h.end,
        displayStart: shift ? HolidayDataService.addDay(h.start) : h.start,
        displayEnd: h.end,
      });
    }

    const results: Holiday[] = [];
    for (const g of Object.values(grouped)) {
      const upcoming = g.occurrences
        .filter(o => o.end >= today)
        .sort((a, b) => a.start.localeCompare(b.start));
      if (upcoming.length === 0) continue;
      const next = upcoming[0];
      results.push({
        title: g.raw.title,
        cat: g.raw.cat,
        hebrew: g.raw.hebrew || '',
        desc: g.raw.desc || '',
        occurrences: upcoming,
        nextStart: next.start,
        nextEnd: next.end,
        nextDisplayStart: next.displayStart,
        nextDisplayEnd: next.displayEnd,
        dayCount: HolidayDataService.daySpan(next.displayStart, next.displayEnd),
        daysUntil: HolidayDataService.daysUntil(next.displayStart),
        daysUntilEnd: HolidayDataService.daysUntil(next.end),
      });
    }

    results.sort((a, b) => a.daysUntil - b.daysUntil);
    return results;
  }

  // ── Search filter ────────────────────────────────────────────────

  filterHolidays(holidays: Holiday[], query: string): Holiday[] {
    if (!normalizeForSearch(query)) return [];
    const terms = HolidayDataService.buildSearchTerms(query);
    return holidays.filter(h => {
      const title = normalizeForSearch(h.title);
      const titleC = compactForSearch(title);

      const heb = normalizeForSearch(h.hebrew || '');
      const hebC = compactForSearch(heb);
      const hebSkel = hebrewSkeleton(heb);

      return terms.some(term => {
        if (!term) return false;

        const termC = compactForSearch(term);
        const termSkel = hebrewSkeleton(term);

        // English/transliterated title
        if (title.includes(term) || term.includes(title)) return true;
        if (titleC.includes(termC) || termC.includes(titleC)) return true;

        // Hebrew name
        if (heb) {
          if (heb.includes(term) || term.includes(heb)) return true;
          if (hebC.includes(termC) || termC.includes(hebC)) return true;

          // Common Hebrew spelling differences: ignore optional ו/י (matres lectionis).
          if (HEBREW_RE.test(termSkel) && termSkel.length >= 3) {
            if (hebSkel.includes(termSkel) || termSkel.includes(hebSkel)) return true;
          }
        }

        return false;
      });
    }).sort((a, b) => {
      const wa = HolidayDataService.CAT_WEIGHT[a.cat] ?? 5;
      const wb = HolidayDataService.CAT_WEIGHT[b.cat] ?? 5;
      if (wa !== wb) return wa - wb;
      return a.daysUntil - b.daysUntil;
    }).slice(0, 15);
  }

  // ── Calendar URL ─────────────────────────────────────────────────

  private static icsEscapeText(input: string): string {
    return input
      .replace(/\\/g, '\\\\')
      .replace(/\r/g, '')
      .replace(/\n/g, '\\n')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,');
  }

  private static icsSafeId(input: string): string {
    const s = input
      .toLowerCase()
      .replace(/['"]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 40);
    return s || 'event';
  }

  private static icsDtstamp(): string {
    // Example: 20260209T173045Z
    return new Date()
      .toISOString()
      .replace(/[-:]/g, '')
      .replace(/\.\d{3}Z$/, 'Z');
  }

  static icsContent(title: string, start: string, end: string): string {
    const dtStart = start.replace(/-/g, '');

    const endDt = new Date(this.parseDate(end));
    endDt.setDate(endDt.getDate() + 1); // DTEND is exclusive for all-day events.
    const dtEnd = this.fmtD(endDt).replace(/-/g, '');

    const uid = `${dtStart}-${dtEnd}-${this.icsSafeId(title)}@whenischag.nosson.ai`;

    const lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//whenischag.nosson.ai//holiday-lookup//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${this.icsDtstamp()}`,
      `SUMMARY:${this.icsEscapeText(title)}`,
      `DTSTART;VALUE=DATE:${dtStart}`,
      `DTEND;VALUE=DATE:${dtEnd}`,
      'END:VEVENT',
      'END:VCALENDAR',
      '',
    ];

    return lines.join('\r\n');
  }

  static gcalUrl(title: string, start: string, end: string): string {
    const gcalStart = start.replace(/-/g, '');
    const endDt = new Date(this.parseDate(end));
    endDt.setDate(endDt.getDate() + 1);
    const gcalEnd = this.fmtD(endDt).replace(/-/g, '');
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${gcalStart}/${gcalEnd}`;
  }
}

