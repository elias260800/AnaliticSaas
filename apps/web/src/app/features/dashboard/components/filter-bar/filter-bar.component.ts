import { Component, input, output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { KpiFilters } from '@analitic-saas/shared';

@Component({
  selector: 'app-filter-bar',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="backdrop-blur-xl bg-slate-900/30 border border-slate-900 px-6 py-4 rounded-2xl shadow-xl flex flex-wrap items-center justify-between gap-4 mb-6">
      <form [formGroup]="filterForm" class="flex flex-wrap items-center gap-4 w-full lg:w-auto">
        <!-- Date range from -->
        <div class="flex items-center space-x-2">
          <label for="from" class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Desde</label>
          <input
            id="from"
            type="date"
            formControlName="from"
            class="bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-xl px-3 py-1.5 text-xs text-slate-200 outline-none transition-colors"
          />
        </div>

        <!-- Date range to -->
        <div class="flex items-center space-x-2">
          <label for="to" class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Hasta</label>
          <input
            id="to"
            type="date"
            formControlName="to"
            class="bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-xl px-3 py-1.5 text-xs text-slate-200 outline-none transition-colors"
          />
        </div>

        <!-- Region selector -->
        <div class="flex items-center space-x-2">
          <label for="region" class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Región</label>
          <select
            id="region"
            formControlName="region"
            class="bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-xl px-3 py-1.5 text-xs text-slate-200 outline-none transition-colors"
          >
            <option [value]="null">Todas</option>
            <option value="latam">LATAM</option>
            <option value="north_america">Norteamérica</option>
            <option value="europe">Europa</option>
          </select>
        </div>

        <!-- Plan selector -->
        <div class="flex items-center space-x-2">
          <label for="plan" class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Plan</label>
          <select
            id="plan"
            formControlName="plan"
            class="bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-xl px-3 py-1.5 text-xs text-slate-200 outline-none transition-colors"
          >
            <option [value]="null">Todos</option>
            <option value="starter">Starter</option>
            <option value="professional">Professional</option>
            <option value="enterprise">Enterprise</option>
          </select>
        </div>
      </form>

      <!-- Clear filters / reset button -->
      <button
        (click)="resetFilters()"
        class="bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold px-4 py-2 rounded-xl text-xs transition-colors focus:outline-none"
      >
        Reestablecer Filtros
      </button>
    </div>
  `,
})
export class FilterBarComponent implements OnInit {
  filters = input.required<KpiFilters>();
  filtersChanged = output<Partial<KpiFilters>>();

  filterForm!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.buildForm();

    // Emit updates on form changes
    this.filterForm.valueChanges.subscribe((values) => {
      // Normalize null values for string fields
      const normalizedValues: Partial<KpiFilters> = {
        from: values.from || undefined,
        to: values.to || undefined,
        region: values.region === 'null' ? null : values.region,
        plan: values.plan === 'null' ? null : values.plan,
      };
      this.filtersChanged.emit(normalizedValues);
    });
  }

  private buildForm() {
    const currentFilters = this.filters();
    this.filterForm = this.fb.group({
      from: [currentFilters.from || ''],
      to: [currentFilters.to || ''],
      region: [currentFilters.region === null ? 'null' : currentFilters.region || 'null'],
      plan: [currentFilters.plan === null ? 'null' : currentFilters.plan || 'null'],
    });
  }

  resetFilters() {
    const defaultFilters: KpiFilters = {
      from: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
      to: new Date().toISOString().split('T')[0],
      region: null,
      plan: null,
    };
    this.filterForm.patchValue({
      from: defaultFilters.from,
      to: defaultFilters.to,
      region: 'null',
      plan: 'null',
    }, { emitEvent: false });
    this.filtersChanged.emit(defaultFilters);
  }
}
export default FilterBarComponent;
