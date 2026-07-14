import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-slate-950 px-4 relative overflow-hidden">
      <!-- Glow -->
      <div class="absolute w-[400px] h-[400px] rounded-full bg-red-600/10 blur-[100px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>

      <div class="max-w-md w-full text-center backdrop-blur-xl bg-slate-900/40 border border-slate-800 p-8 rounded-2xl relative z-10 shadow-xl">
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-500/10 text-red-500 mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.249-8.25-3.286Zm0 13.036h.008v.008H12v-.008Z" />
          </svg>
        </div>

        <h1 class="text-2xl font-bold text-slate-100 mb-3">Acceso Denegado</h1>
        <p class="text-slate-400 text-sm mb-8 leading-relaxed">
          No tienes los permisos necesarios para ver esta sección. Si consideras que esto es un error, por favor contacta al administrador de tu organización.
        </p>

        <div class="space-y-3">
          <button
            (click)="goBack()"
            class="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium rounded-xl py-3 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-purple-500/20"
          >
            Regresar al Dashboard
          </button>
        </div>
      </div>
    </div>
  `
})
export class UnauthorizedComponent {
  private router = inject(Router);

  goBack() {
    this.router.navigate(['/dashboard']);
  }
}
export default UnauthorizedComponent;
