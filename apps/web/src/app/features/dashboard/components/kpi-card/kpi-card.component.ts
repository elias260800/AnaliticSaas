import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-kpi-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="backdrop-blur-xl bg-slate-900/40 border border-slate-800/80 p-6 rounded-2xl shadow-xl flex flex-col justify-between hover:border-slate-700/80 transition-all duration-300 relative overflow-hidden group">
      <!-- Ambient Glow (Group Hover) -->
      <div class="absolute w-24 h-24 rounded-full bg-purple-500/5 blur-2xl -top-12 -right-12 group-hover:bg-purple-500/10 transition-all duration-300 pointer-events-none"></div>

      <!-- Header & Icon -->
      <div class="flex items-center justify-between mb-4">
        <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          {{ title() }}
        </span>
        <span class="text-lg text-purple-400 bg-purple-500/5 border border-purple-500/15 p-2 rounded-xl group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
          {{ iconSymbol() }}
        </span>
      </div>

      <!-- Value and Trend -->
      <div class="flex items-baseline justify-between">
        <span class="text-2xl font-bold text-white tracking-tight">
          {{ value() }}
        </span>

        <!-- Trend chip -->
        <span
          [ngClass]="trendClasses()"
          class="text-xs px-2.5 py-1 rounded-full font-semibold border flex items-center space-x-1"
        >
          <span>{{ trendArrow() }}</span>
          <span>{{ Math.abs(change()) }}%</span>
        </span>
      </div>
    </div>
  `,
})
export class KpiCardComponent {
  title = input.required<string>();
  value = input.required<string>();
  change = input.required<number>();
  invertColor = input<boolean>(false);
  icon = input.required<string>();

  Math = Math;

  // Custom mapping from string description to actual unicode/emoji icon symbol
  iconSymbol = computed(() => {
    switch (this.icon()) {
      case 'trending_up': return '📈';
      case 'people': return '👥';
      case 'cancel': return '🛑';
      case 'add_circle': return '➕';
      default: return '📊';
    }
  });

  isPositive = computed(() => this.change() >= 0);

  isBetter = computed(() => {
    // If it's a metric where positive is good (like MRR, users) -> positive is better.
    // If it's a metric where negative is good (like Churn) -> negative is better.
    return this.invertColor() ? !this.isPositive() : this.isPositive();
  });

  trendArrow = computed(() => {
    return this.isPositive() ? '▲' : '▼';
  });

  trendClasses = computed(() => {
    if (this.isBetter()) {
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    } else {
      return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
    }
  });
}
export default KpiCardComponent;
