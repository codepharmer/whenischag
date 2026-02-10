import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HolidayDataService, Holiday, Occurrence, HolidayCat } from './holiday-data.service';
import { WeekStripComponent } from './week-strip.component';

type View = 'search' | 'detail' | 'settings' | 'about';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, WeekStripComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit, AfterViewInit {
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  svc = HolidayDataService;
  view: View = 'search';
  query = '';
  diaspora = true;
  holidays: Holiday[] = [];
  filtered: Holiday[] = [];
  upcoming: Holiday[] = [];
  selected: Holiday | null = null;
  copiedId: string | null = null;

  constructor(private holidayData: HolidayDataService) {}

  ngOnInit() {
    this.rebuildHolidays();
  }

  ngAfterViewInit() {
    // Best-effort: some mobile browsers will open the soft keyboard when an input is focused on load,
    // but iOS Safari generally requires a user gesture. This at least puts the cursor in the field.
    this.focusInput();
  }

  rebuildHolidays() {
    this.holidays = this.holidayData.buildHolidays(this.diaspora);
    this.upcoming = this.holidays.filter(h => h.daysUntil >= 0).slice(0, 5);
    this.onQueryChange();
  }

  onQueryChange() {
    this.filtered = this.holidayData.filterHolidays(this.holidays, this.query);
  }

  focusInput() {
    const attempt = () => {
      const el = this.searchInput?.nativeElement;
      if (!el || this.view !== 'search' || !el.isConnected) return;

      // `preventScroll` isn't supported everywhere; fall back to plain focus.
      try {
        el.focus({ preventScroll: true });
      } catch {
        el.focus();
      }
    };

    // Try immediately (helps on initial load), then again after the view settles.
    attempt();
    setTimeout(attempt, 80);
  }

  goSearch() {
    this.view = 'search';
    this.selected = null;
    this.focusInput();
  }

  goDetail(h: Holiday) {
    this.selected = h;
    this.view = 'detail';
  }

  goSettings() { this.view = 'settings'; }
  goAbout() { this.view = 'about'; }

  setDiaspora(val: boolean) {
    this.diaspora = val;
    this.rebuildHolidays();
  }

  formatDate(s: string) { return HolidayDataService.formatDate(s); }
  formatDateShort(s: string) { return HolidayDataService.formatDateShort(s); }
  formatDateCompact(s: string) { return HolidayDataService.formatDateCompact(s); }
  daysUntil(s: string) { return HolidayDataService.daysUntil(s); }
  daySpan(start: string, end: string) { return HolidayDataService.daySpan(start, end); }
  jewishSunsetShift(cat: HolidayCat) { return HolidayDataService.jewishSunsetShift(cat); }
  isJewish(cat: HolidayCat) { return HolidayDataService.isJewish(cat); }
  getCatStyle(cat: string) { return HolidayDataService.CAT_STYLES[cat] || HolidayDataService.CAT_STYLES['minor']; }

  occDisplayDays(occ: Occurrence) { return this.daySpan(occ.displayStart, occ.displayEnd); }
  occDaysUntil(occ: Occurrence) { return this.daysUntil(occ.displayStart); }
  occIsPast(occ: Occurrence) { return this.daysUntil(occ.end) < 0; }
  occIsCurrent(occ: Occurrence) { return this.daysUntil(occ.start) <= 0 && this.daysUntil(occ.end) >= 0; }

  daysLabel(h: Holiday): string {
    const isCurr = h.daysUntil <= 0 && h.daysUntilEnd >= 0;
    if (isCurr) return 'Happening now';
    if (h.daysUntil === 0) return 'Today';
    if (h.daysUntil === 1) return 'Tomorrow';
    if (h.daysUntil < 0) return 'Past';
    return `${h.daysUntil} days away`;
  }

  occDaysLabel(occ: Occurrence): string {
    const du = this.occDaysUntil(occ);
    if (du === 0) return 'Today';
    if (du === 1) return 'Tomorrow';
    return `${du} days`;
  }

  isCurrent(h: Holiday): boolean { return h.daysUntil <= 0 && h.daysUntilEnd >= 0; }
  isAccentDate(h: Holiday): boolean { return h.daysUntil <= 7 && h.daysUntil >= 0; }
  isAccentDaysLabel(h: Holiday): boolean { return this.isCurrent(h) || h.daysUntil === 0; }
  isBoldDaysLabel(h: Holiday): boolean { return this.isCurrent(h) || h.daysUntil <= 1; }

  copyDate(text: string, id: string) {
    navigator.clipboard?.writeText(text);
    this.copiedId = id;
    setTimeout(() => this.copiedId = null, 1500);
  }

  downloadIcs(title: string, start: string, end: string) {
    const ics = HolidayDataService.icsContent(title, start, end);
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = this.icsFilename(title, start, end);
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    a.remove();

    // Cleanup after the download has been triggered.
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }

  private icsFilename(title: string, start: string, end: string): string {
    const datePart = start === end ? start : `${start}_to_${end}`;
    const base = `${title}-${datePart}`;
    const safe = base
      .toLowerCase()
      .replace(/['"]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 80);
    return `${safe || 'calendar-event'}.ics`;
  }

  getCopyText(occ: Occurrence, title: string): string {
    const days = this.occDisplayDays(occ);
    return days > 1
      ? `${title}: ${this.formatDateCompact(occ.displayStart)} – ${this.formatDateCompact(occ.displayEnd)}`
      : `${title}: ${this.formatDate(occ.displayStart)}`;
  }

  upcomingLabel(h: Holiday): string {
    if (h.daysUntil === 0) return 'Today';
    if (h.daysUntil === 1) return 'Tomorrow';
    return `${h.daysUntil}d`;
  }
}
