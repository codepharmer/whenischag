import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

// ── Types ──────────────────────────────────────────────────────────

interface WeekCell {
  dow: number;
  active: boolean;
  first: boolean;
}

interface CatStyle {
  color: string;
  bg: string;
  label: string;
}

interface Sizing {
  barH: number;
  inactiveH: number;
}

// ── Constants ──────────────────────────────────────────────────────

const COLORS = {
  textTer: '#A0A0A6',
  border: '#E6E4DF',
  jewish: '#2C3E6B',
  us: '#7A4419',
  fast: '#8B3A3A',
  modern: '#2D6B4F',
  accentLight: '#E6EAF3',
  usLight: '#FDF4EC',
  fastLight: '#FDF0F0',
  modernLight: '#EDF7F2',
};

const CAT_STYLES: Record<string, CatStyle> = {
  major: { color: COLORS.jewish, bg: COLORS.accentLight, label: 'Major' },
  minor: { color: COLORS.jewish, bg: COLORS.accentLight, label: 'Minor' },
  fast: { color: COLORS.fast, bg: COLORS.fastLight, label: 'Fast Day' },
  modern: { color: COLORS.modern, bg: COLORS.modernLight, label: 'Modern' },
  'us-federal': { color: COLORS.us, bg: COLORS.usLight, label: 'US Federal' },
};

const CONFIG = {
  barW: 6,
  barGap: 1.5,
  rowGap: 1.5,
  singleWeek: { barH: 12, inactiveH: 5 } as Sizing,
  multiWeek: { barH: 7, inactiveH: 3 } as Sizing,
  labels: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  labelSize: 6.5,
};

// ── Helpers ────────────────────────────────────────────────────────

function parseDate(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function daySpan(start: string, end: string): number {
  return (
    Math.round(
      (parseDate(end).getTime() - parseDate(start).getTime()) / 86400000,
    ) + 1
  );
}

function buildWeekRows(startDate: string, endDate: string): WeekCell[][] {
  const s = parseDate(startDate);
  const e = parseDate(endDate);

  // Find Sunday of the start week
  const startSunday = new Date(s);
  startSunday.setDate(startSunday.getDate() - startSunday.getDay());

  const weeks: WeekCell[][] = [];
  const cursor = new Date(startSunday);
  while (cursor <= e) {
    const week: WeekCell[] = [];
    for (let d = 0; d < 7; d++) {
      week.push({
        dow: d,
        active: cursor >= s && cursor <= e,
        first: cursor.getTime() === s.getTime(),
      });
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(week);
  }
  return weeks;
}

// ── Component ──────────────────────────────────────────────────────

@Component({
  selector: 'app-week-strip',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="week-strip">
      <!-- Day-of-week headers -->
      <div class="header-row" [style.gap.px]="cfg.barGap">
        <div
          *ngFor="let label of cfg.labels"
          class="header-label"
          [style.width.px]="cfg.barW"
          [style.fontSize.px]="cfg.labelSize"
        >
          {{ label }}
        </div>
      </div>

      <!-- Week rows -->
      <div
        *ngFor="let week of weeks; let last = last"
        class="week-row"
        [style.gap.px]="cfg.barGap"
        [style.marginBottom.px]="last ? 0 : cfg.rowGap"
      >
        <div
          *ngFor="let cell of week"
          class="bar"
          [style.width.px]="cfg.barW"
          [style.height.px]="cell.active ? sizing.barH : sizing.inactiveH"
          [style.background]="cell.active ? catStyle.color : borderColor"
          [style.opacity]="cell.active ? (cell.first ? 1 : 0.5) : 0.2"
        ></div>
      </div>
    </div>
  `,
  styles: [
    `
      .week-strip {
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      .header-row {
        display: flex;
        margin-bottom: 2px;
      }

      .header-label {
        text-align: center;
        font-family: 'Manrope', system-ui, sans-serif;
        font-weight: 700;
        color: #87878C;
        line-height: 1;
        overflow: visible;
        white-space: nowrap;
      }

      .week-row {
        display: flex;
      }

      .bar {
        border-radius: 1.5px;
        align-self: flex-end;
      }
    `,
  ],
})
export class WeekStripComponent implements OnChanges {
  /** Start date in "YYYY-MM-DD" format */
  @Input() startDate!: string;

  /** End date in "YYYY-MM-DD" format */
  @Input() endDate!: string;

  /** Holiday category: "major" | "minor" | "fast" | "modern" | "us-federal" */
  @Input() cat: string = 'major';

  cfg = CONFIG;
  weeks: WeekCell[][] = [];
  sizing: Sizing = CONFIG.singleWeek;
  catStyle: CatStyle = CAT_STYLES['major'];
  borderColor = COLORS.border;

  ngOnChanges(): void {
    if (!this.startDate || !this.endDate) {
      this.weeks = [];
      return;
    }

    this.catStyle = CAT_STYLES[this.cat] || CAT_STYLES['minor'];

    const totalDays = daySpan(this.startDate, this.endDate);
    this.sizing = totalDays <= 7 ? CONFIG.singleWeek : CONFIG.multiWeek;
    this.weeks = buildWeekRows(this.startDate, this.endDate);
  }
}
