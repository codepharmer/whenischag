import { Injectable } from '@angular/core';

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
// EMBEDDED HOLIDAY DATA — sourced from Hebcal (hebcal.com)
// ════════════════════════════════════════════════════════════════════
const JEWISH_HOLIDAYS_DIASPORA: RawHoliday[] = [
  // ── 5786 (2025-2026) ──
  { title: "Rosh Hashana", start: "2025-09-22", end: "2025-09-24", cat: "major", hebrew: "רֹאשׁ הַשָּׁנָה", desc: "The Jewish New Year" },
  { title: "Tzom Gedaliah", start: "2025-09-25", end: "2025-09-25", cat: "fast", hebrew: "צוֹם גְּדַלְיָה", desc: "Fast commemorating the assassination of Gedaliah ben Ahikam" },
  { title: "Yom Kippur", start: "2025-10-01", end: "2025-10-02", cat: "major", hebrew: "יוֹם כִּפּוּר", desc: "Day of Atonement" },
  { title: "Sukkot", start: "2025-10-06", end: "2025-10-13", cat: "major", hebrew: "סוּכּוֹת", desc: "Feast of Booths" },
  { title: "Shmini Atzeret", start: "2025-10-13", end: "2025-10-14", cat: "major", hebrew: "שְׁמִינִי עֲצֶרֶת", desc: "Eighth Day of Assembly" },
  { title: "Simchat Torah", start: "2025-10-14", end: "2025-10-15", cat: "major", hebrew: "שִׂמְחַת תּוֹרָה", desc: "Rejoicing with the Torah" },
  { title: "Chanukah", start: "2025-12-14", end: "2025-12-22", cat: "major", hebrew: "חֲנוּכָּה", desc: "Festival of Lights" },
  { title: "Asara B'Tevet", start: "2025-12-30", end: "2025-12-30", cat: "fast", hebrew: "עֲשָׂרָה בְּטֵבֵת", desc: "Fast commemorating the siege of Jerusalem" },
  { title: "Tu BiShvat", start: "2026-02-01", end: "2026-02-02", cat: "minor", hebrew: "ט\"וּ בִּשְׁבָט", desc: "New Year for Trees" },
  { title: "Ta'anit Esther", start: "2026-03-02", end: "2026-03-02", cat: "fast", hebrew: "תַּעֲנִית אֶסְתֵּר", desc: "Fast of Esther" },
  { title: "Purim", start: "2026-03-02", end: "2026-03-03", cat: "major", hebrew: "פּוּרִים", desc: "Celebration of Jewish deliverance as told by Megilat Esther" },
  { title: "Shushan Purim", start: "2026-03-03", end: "2026-03-04", cat: "minor", hebrew: "שׁוּשַׁן פּוּרִים", desc: "Purim as celebrated in walled cities" },
  { title: "Pesach", start: "2026-04-01", end: "2026-04-09", cat: "major", hebrew: "פֶּסַח", desc: "Passover — the Feast of Unleavened Bread" },
  { title: "Yom HaShoah", start: "2026-04-13", end: "2026-04-14", cat: "modern", hebrew: "יוֹם הַשּׁוֹאָה", desc: "Holocaust Remembrance Day" },
  { title: "Yom HaZikaron", start: "2026-04-20", end: "2026-04-21", cat: "modern", hebrew: "יוֹם הַזִּכָּרוֹן", desc: "Israeli Memorial Day" },
  { title: "Yom HaAtzmaut", start: "2026-04-21", end: "2026-04-22", cat: "modern", hebrew: "יוֹם הָעַצְמָאוּת", desc: "Israel Independence Day" },
  { title: "Pesach Sheni", start: "2026-04-30", end: "2026-05-01", cat: "minor", hebrew: "פֶּסַח שֵׁנִי", desc: "Second Passover" },
  { title: "Lag BaOmer", start: "2026-05-04", end: "2026-05-05", cat: "minor", hebrew: "ל\"ג בָּעוֹמֶר", desc: "33rd day of counting the Omer" },
  { title: "Yom Yerushalayim", start: "2026-05-14", end: "2026-05-15", cat: "modern", hebrew: "יוֹם יְרוּשָׁלַיִם", desc: "Jerusalem Day" },
  { title: "Shavuot", start: "2026-05-21", end: "2026-05-23", cat: "major", hebrew: "שָׁבוּעוֹת", desc: "Festival of Weeks" },
  { title: "Tzom Tammuz", start: "2026-07-02", end: "2026-07-02", cat: "fast", hebrew: "צוֹם תַּמּוּז", desc: "Fast of the 17th of Tammuz" },
  { title: "Tisha B'Av", start: "2026-07-22", end: "2026-07-23", cat: "fast", hebrew: "תִּשְׁעָה בְּאָב", desc: "Fast commemorating the destruction of the Temples" },
  { title: "Tu B'Av", start: "2026-07-28", end: "2026-07-29", cat: "minor", hebrew: "ט\"וּ בְּאָב", desc: "Minor holiday of love" },

  // ── 5787 (2026-2027) ──
  { title: "Rosh Hashana", start: "2026-09-11", end: "2026-09-13", cat: "major", hebrew: "רֹאשׁ הַשָּׁנָה", desc: "The Jewish New Year" },
  { title: "Tzom Gedaliah", start: "2026-09-14", end: "2026-09-14", cat: "fast", hebrew: "צוֹם גְּדַלְיָה", desc: "Fast commemorating the assassination of Gedaliah ben Ahikam" },
  { title: "Yom Kippur", start: "2026-09-20", end: "2026-09-21", cat: "major", hebrew: "יוֹם כִּפּוּר", desc: "Day of Atonement" },
  { title: "Sukkot", start: "2026-09-25", end: "2026-10-02", cat: "major", hebrew: "סוּכּוֹת", desc: "Feast of Booths" },
  { title: "Shmini Atzeret", start: "2026-10-02", end: "2026-10-03", cat: "major", hebrew: "שְׁמִינִי עֲצֶרֶת", desc: "Eighth Day of Assembly" },
  { title: "Simchat Torah", start: "2026-10-03", end: "2026-10-04", cat: "major", hebrew: "שִׂמְחַת תּוֹרָה", desc: "Rejoicing with the Torah" },
  { title: "Chanukah", start: "2026-12-04", end: "2026-12-12", cat: "major", hebrew: "חֲנוּכָּה", desc: "Festival of Lights" },
  { title: "Asara B'Tevet", start: "2026-12-20", end: "2026-12-20", cat: "fast", hebrew: "עֲשָׂרָה בְּטֵבֵת", desc: "Fast commemorating the siege of Jerusalem" },
  { title: "Tu BiShvat", start: "2027-01-22", end: "2027-01-23", cat: "minor", hebrew: "ט\"וּ בִּשְׁבָט", desc: "New Year for Trees" },
  { title: "Ta'anit Esther", start: "2027-03-22", end: "2027-03-22", cat: "fast", hebrew: "תַּעֲנִית אֶסְתֵּר", desc: "Fast of Esther" },
  { title: "Purim", start: "2027-03-22", end: "2027-03-23", cat: "major", hebrew: "פּוּרִים", desc: "Celebration of Jewish deliverance as told by Megilat Esther" },
  { title: "Shushan Purim", start: "2027-03-23", end: "2027-03-24", cat: "minor", hebrew: "שׁוּשַׁן פּוּרִים", desc: "Purim as celebrated in walled cities" },
  { title: "Pesach", start: "2027-04-21", end: "2027-04-29", cat: "major", hebrew: "פֶּסַח", desc: "Passover — the Feast of Unleavened Bread" },
  { title: "Yom HaShoah", start: "2027-05-03", end: "2027-05-04", cat: "modern", hebrew: "יוֹם הַשּׁוֹאָה", desc: "Holocaust Remembrance Day" },
  { title: "Yom HaZikaron", start: "2027-05-10", end: "2027-05-11", cat: "modern", hebrew: "יוֹם הַזִּכָּרוֹן", desc: "Israeli Memorial Day" },
  { title: "Yom HaAtzmaut", start: "2027-05-11", end: "2027-05-12", cat: "modern", hebrew: "יוֹם הָעַצְמָאוּת", desc: "Israel Independence Day" },
  { title: "Lag BaOmer", start: "2027-05-24", end: "2027-05-25", cat: "minor", hebrew: "ל\"ג בָּעוֹמֶר", desc: "33rd day of counting the Omer" },
  { title: "Shavuot", start: "2027-06-10", end: "2027-06-12", cat: "major", hebrew: "שָׁבוּעוֹת", desc: "Festival of Weeks" },
  { title: "Tzom Tammuz", start: "2027-07-22", end: "2027-07-22", cat: "fast", hebrew: "צוֹם תַּמּוּז", desc: "Fast of the 17th of Tammuz" },
  { title: "Tisha B'Av", start: "2027-08-11", end: "2027-08-12", cat: "fast", hebrew: "תִּשְׁעָה בְּאָב", desc: "Fast commemorating the destruction of the Temples" },
  { title: "Tu B'Av", start: "2027-08-17", end: "2027-08-18", cat: "minor", hebrew: "ט\"וּ בְּאָב", desc: "Minor holiday of love" },

  // ── 5788 (2027-2028) ──
  { title: "Rosh Hashana", start: "2027-10-01", end: "2027-10-03", cat: "major", hebrew: "רֹאשׁ הַשָּׁנָה", desc: "The Jewish New Year" },
  { title: "Yom Kippur", start: "2027-10-10", end: "2027-10-11", cat: "major", hebrew: "יוֹם כִּפּוּר", desc: "Day of Atonement" },
  { title: "Sukkot", start: "2027-10-15", end: "2027-10-22", cat: "major", hebrew: "סוּכּוֹת", desc: "Feast of Booths" },
  { title: "Shmini Atzeret", start: "2027-10-22", end: "2027-10-23", cat: "major", hebrew: "שְׁמִינִי עֲצֶרֶת", desc: "Eighth Day of Assembly" },
  { title: "Simchat Torah", start: "2027-10-23", end: "2027-10-24", cat: "major", hebrew: "שִׂמְחַת תּוֹרָה", desc: "Rejoicing with the Torah" },
  { title: "Chanukah", start: "2027-12-24", end: "2028-01-01", cat: "major", hebrew: "חֲנוּכָּה", desc: "Festival of Lights" },
  { title: "Tu BiShvat", start: "2028-02-11", end: "2028-02-12", cat: "minor", hebrew: "ט\"וּ בִּשְׁבָט", desc: "New Year for Trees" },
  { title: "Purim", start: "2028-03-11", end: "2028-03-12", cat: "major", hebrew: "פּוּרִים", desc: "Celebration of Jewish deliverance as told by Megilat Esther" },
  { title: "Pesach", start: "2028-04-10", end: "2028-04-18", cat: "major", hebrew: "פֶּסַח", desc: "Passover — the Feast of Unleavened Bread" },
  { title: "Lag BaOmer", start: "2028-05-13", end: "2028-05-14", cat: "minor", hebrew: "ל\"ג בָּעוֹמֶר", desc: "33rd day of counting the Omer" },
  { title: "Shavuot", start: "2028-05-30", end: "2028-06-01", cat: "major", hebrew: "שָׁבוּעוֹת", desc: "Festival of Weeks" },
  { title: "Tisha B'Av", start: "2028-07-31", end: "2028-08-01", cat: "fast", hebrew: "תִּשְׁעָה בְּאָב", desc: "Fast commemorating the destruction of the Temples" },

  // ── 5789 (2028-2029) ──
  { title: "Rosh Hashana", start: "2028-09-20", end: "2028-09-22", cat: "major", hebrew: "רֹאשׁ הַשָּׁנָה", desc: "The Jewish New Year" },
  { title: "Yom Kippur", start: "2028-09-29", end: "2028-09-30", cat: "major", hebrew: "יוֹם כִּפּוּר", desc: "Day of Atonement" },
  { title: "Sukkot", start: "2028-10-04", end: "2028-10-11", cat: "major", hebrew: "סוּכּוֹת", desc: "Feast of Booths" },
  { title: "Chanukah", start: "2028-12-12", end: "2028-12-20", cat: "major", hebrew: "חֲנוּכָּה", desc: "Festival of Lights" },
  { title: "Tu BiShvat", start: "2029-01-31", end: "2029-02-01", cat: "minor", hebrew: "ט\"וּ בִּשְׁבָט", desc: "New Year for Trees" },
  { title: "Purim", start: "2029-02-28", end: "2029-03-01", cat: "major", hebrew: "פּוּרִים", desc: "Celebration of Jewish deliverance as told by Megilat Esther" },
  { title: "Pesach", start: "2029-03-30", end: "2029-04-07", cat: "major", hebrew: "פֶּסַח", desc: "Passover — the Feast of Unleavened Bread" },
  { title: "Shavuot", start: "2029-05-19", end: "2029-05-21", cat: "major", hebrew: "שָׁבוּעוֹת", desc: "Festival of Weeks" },
  { title: "Tisha B'Av", start: "2029-07-21", end: "2029-07-22", cat: "fast", hebrew: "תִּשְׁעָה בְּאָב", desc: "Fast commemorating the destruction of the Temples" },

  // ── 5790 (2029-2030) ──
  { title: "Rosh Hashana", start: "2029-09-09", end: "2029-09-11", cat: "major", hebrew: "רֹאשׁ הַשָּׁנָה", desc: "The Jewish New Year" },
  { title: "Yom Kippur", start: "2029-09-18", end: "2029-09-19", cat: "major", hebrew: "יוֹם כִּפּוּר", desc: "Day of Atonement" },
  { title: "Sukkot", start: "2029-09-23", end: "2029-09-30", cat: "major", hebrew: "סוּכּוֹת", desc: "Feast of Booths" },
  { title: "Chanukah", start: "2029-12-01", end: "2029-12-09", cat: "major", hebrew: "חֲנוּכָּה", desc: "Festival of Lights" },
  { title: "Tu BiShvat", start: "2030-01-21", end: "2030-01-22", cat: "minor", hebrew: "ט\"וּ בִּשְׁבָט", desc: "New Year for Trees" },
  { title: "Purim", start: "2030-03-18", end: "2030-03-19", cat: "major", hebrew: "פּוּרִים", desc: "Celebration of Jewish deliverance as told by Megilat Esther" },
  { title: "Pesach", start: "2030-04-17", end: "2030-04-25", cat: "major", hebrew: "פֶּסַח", desc: "Passover — the Feast of Unleavened Bread" },
  { title: "Shavuot", start: "2030-06-06", end: "2030-06-08", cat: "major", hebrew: "שָׁבוּעוֹת", desc: "Festival of Weeks" },
];

const ISRAEL_OVERRIDES: Record<string, { daysDelta?: number; mergeSimchat?: boolean; removeInIsrael?: boolean }> = {
  "Pesach": { daysDelta: -1 },
  "Shavuot": { daysDelta: -1 },
  "Shmini Atzeret": { mergeSimchat: true },
  "Simchat Torah": { removeInIsrael: true },
};

// ── Transliteration aliases ────────────────────────────────────────
const ALIASES: Record<string, string[]> = {
  "chanukah": ["hanukkah", "hanukah", "hanuka", "chanuka", "channukah"],
  "sukkot": ["sukkos", "succot", "succos", "succoth"],
  "rosh hashana": ["rosh hashanah", "rosh hashona", "rosh hashonah"],
  "shavuot": ["shavuos", "shavuoth", "shevuot"],
  "simchat torah": ["simchas torah", "simhat torah", "simchat tora"],
  "shmini atzeret": ["shemini atzeret", "shmini atzeres", "shemini atzeres"],
  "yom kippur": ["yom kipur", "yom kippor"],
  "pesach": ["passover", "pessach", "pesah"],
  "purim": ["poorim"],
  "tisha b'av": ["tisha bav", "tisha beav", "tishah bav", "ninth of av"],
  "tu bishvat": ["tu b'shvat", "tu bshvat", "tu b'shevat", "tu beshvat"],
  "lag baomer": ["lag b'omer", "lag bomer"],
  "yom haatzmaut": ["yom ha'atzmaut", "israel independence"],
  "yom hazikaron": ["yom ha'zikaron", "israeli memorial"],
  "yom hashoah": ["yom ha'shoah", "holocaust remembrance"],
  "ta'anit esther": ["taanis esther", "fast of esther", "taanit esther"],
  "asara b'tevet": ["asara btevet", "10 tevet", "tenth of tevet"],
  "tzom gedaliah": ["tzom gedalia", "fast of gedaliah"],
  "tzom tammuz": ["17 tammuz", "seventeenth of tammuz", "fast of tammuz"],
  "shushan purim": ["shushan poorim"],
  "pesach sheni": ["second passover"],
  "tu b'av": ["tu bav", "15 av"],
  "yom yerushalayim": ["jerusalem day"],
  "martin luther king": ["mlk day", "mlk"],
  "presidents' day": ["presidents day", "washington's birthday"],
  "independence day": ["4th of july", "fourth of july", "july 4th", "july 4"],
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

  static fmtD(dt: Date): string { return dt.toISOString().split('T')[0]; }

  static addDay(s: string): string {
    const d = this.parseDate(s);
    d.setDate(d.getDate() + 1);
    return this.fmtD(d);
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
    const q = query.toLowerCase().trim();
    const terms = new Set<string>([q]);
    for (const [key, variants] of Object.entries(ALIASES)) {
      if (key.includes(q) || q.includes(key)) {
        terms.add(key);
        variants.forEach(v => terms.add(v));
      }
      for (const v of variants) {
        if (v.includes(q) || q.includes(v)) {
          terms.add(key);
          variants.forEach(v2 => terms.add(v2));
        }
      }
    }
    return [...terms];
  }

  // ── Build holiday index ──────────────────────────────────────────

  buildHolidays(diaspora: boolean): Holiday[] {
    const today = HolidayDataService.todayStr();
    let jewish: RawHoliday[] = JEWISH_HOLIDAYS_DIASPORA.map(h => ({ ...h }));

    if (!diaspora) {
      jewish = jewish.filter(h => !ISRAEL_OVERRIDES[h.title]?.removeInIsrael);
      jewish = jewish.map(h => {
        const ovr = ISRAEL_OVERRIDES[h.title];
        if (!ovr) return h;
        const copy = { ...h };
        if (ovr.daysDelta) {
          const endDt = HolidayDataService.parseDate(copy.end);
          endDt.setDate(endDt.getDate() + ovr.daysDelta);
          copy.end = HolidayDataService.fmtD(endDt);
        }
        if (ovr.mergeSimchat) copy.title = 'Shmini Atzeret / Simchat Torah';
        return copy;
      });
    }

    const us: RawHoliday[] = [];
    for (let y = 2025; y <= 2030; y++) us.push(...HolidayDataService.getUSHolidays(y));
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
    if (!query.trim()) return [];
    const terms = HolidayDataService.buildSearchTerms(query);
    return holidays.filter(h => {
      const t = h.title.toLowerCase();
      return terms.some(term => t.includes(term) || term.includes(t.split(' ')[0].toLowerCase()));
    }).sort((a, b) => {
      const wa = HolidayDataService.CAT_WEIGHT[a.cat] ?? 5;
      const wb = HolidayDataService.CAT_WEIGHT[b.cat] ?? 5;
      if (wa !== wb) return wa - wb;
      return a.daysUntil - b.daysUntil;
    }).slice(0, 15);
  }

  // ── Calendar URL ─────────────────────────────────────────────────

  static gcalUrl(title: string, start: string, end: string): string {
    const gcalStart = start.replace(/-/g, '');
    const endDt = new Date(this.parseDate(end));
    endDt.setDate(endDt.getDate() + 1);
    const gcalEnd = this.fmtD(endDt).replace(/-/g, '');
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${gcalStart}/${gcalEnd}`;
  }
}
