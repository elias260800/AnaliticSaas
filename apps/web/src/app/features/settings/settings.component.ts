import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthStore } from '../../core/auth/store/auth.store';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="max-w-3xl mx-auto space-y-6">
      <!-- Title -->
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-white">Configuración</h1>
        <p class="text-sm text-slate-400 mt-2">Ajusta los detalles principales de tu organización y configuraciones generales.</p>
      </div>

      <!-- Settings Form -->
      <form [formGroup]="settingsForm" (ngSubmit)="onSubmit()" class="space-y-6">
        <!-- Card -->
        <div class="backdrop-blur-xl bg-slate-900/40 border border-slate-800/80 p-6 rounded-2xl shadow-xl space-y-6">
          <h2 class="text-lg font-bold text-slate-200 border-b border-slate-800/60 pb-2">Información de la Organización</h2>
          
          <!-- Success Notification -->
          @if (showSuccessMessage()) {
            <div class="bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs px-4 py-2.5 rounded-xl">
              ✅ Configuración actualizada con éxito.
            </div>
          }

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Org Name -->
            <div>
              <label for="orgName" class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Nombre de la Organización *</label>
              <input
                id="orgName"
                type="text"
                formControlName="orgName"
                class="w-full bg-slate-950/60 border border-slate-800 focus:border-purple-500 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder:text-slate-600 outline-none transition-colors"
              />
            </div>

            <!-- Org Slug -->
            <div>
              <label for="orgSlug" class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Slug del Tenant (Identificador URL) *</label>
              <input
                id="orgSlug"
                type="text"
                formControlName="orgSlug"
                [readonly]="true"
                class="w-full bg-slate-900 border border-slate-900 rounded-xl px-4 py-2.5 text-xs text-slate-500 outline-none cursor-not-allowed font-mono"
              />
            </div>

            <!-- Language -->
            <div>
              <label for="language" class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Idioma por Defecto</label>
              <select
                id="language"
                formControlName="language"
                class="w-full bg-slate-950/60 border border-slate-800 focus:border-purple-500 rounded-xl px-4 py-2.5 text-xs text-slate-200 outline-none transition-colors"
              >
                <option value="es">Español (ES)</option>
                <option value="en">English (EN)</option>
              </select>
            </div>

            <!-- Timezone -->
            <div>
              <label for="timezone" class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Zona Horaria</label>
              <select
                id="timezone"
                formControlName="timezone"
                class="w-full bg-slate-950/60 border border-slate-800 focus:border-purple-500 rounded-xl px-4 py-2.5 text-xs text-slate-200 outline-none transition-colors"
              >
                <option value="America/Mexico_City">America/Mexico_City (GMT-6)</option>
                <option value="America/Bogota">America/Bogota (GMT-5)</option>
                <option value="Europe/Madrid">Europe/Madrid (GMT+1)</option>
                <option value="UTC">Universal Coordinated Time (UTC)</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex items-center justify-end space-x-4">
          <button
            type="submit"
            [disabled]="settingsForm.invalid || isSubmitting()"
            class="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:from-purple-900/50 disabled:to-indigo-900/50 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-medium rounded-xl px-6 py-2.5 text-xs transition-all focus:outline-none focus:ring-2 focus:ring-purple-500/20 active:scale-[0.98]"
          >
            @if (isSubmitting()) {
              <span class="inline-block animate-spin border-2 border-slate-300 border-t-transparent rounded-full w-3.5 h-3.5 mr-2 vertical-middle"></span>
              Guardando...
            } @else {
              Guardar Cambios
            }
          </button>
        </div>
      </form>
    </div>
  `
})
export class SettingsComponent {
  private fb = inject(FormBuilder);
  readonly authStore = inject(AuthStore);

  isSubmitting = signal<boolean>(false);
  showSuccessMessage = signal<boolean>(false);

  settingsForm!: FormGroup;

  constructor() {
    const tenant = this.authStore.user()?.tenant;
    this.settingsForm = this.fb.group({
      orgName: [tenant?.name || 'ACME Corporation', [Validators.required]],
      orgSlug: [tenant?.slug || 'acme-corp', [Validators.required]],
      language: ['es'],
      timezone: ['America/Mexico_City']
    });
  }

  onSubmit() {
    if (this.settingsForm.invalid) return;

    this.isSubmitting.set(true);
    this.showSuccessMessage.set(false);

    // Simulate server delay and success saving settings
    setTimeout(() => {
      this.isSubmitting.set(false);
      this.showSuccessMessage.set(true);
      
      // Clear message after 4s
      setTimeout(() => {
        this.showSuccessMessage.set(false);
      }, 4000);
    }, 1200);
  }
}
export default SettingsComponent;
