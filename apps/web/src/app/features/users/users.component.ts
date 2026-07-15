import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UsersService } from './services/users.service';
import { AuthStore } from '../../core/auth/store/auth.store';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="space-y-6">
      <!-- Title & Create Button -->
      <div class="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 class="text-3xl font-bold tracking-tight text-white">Usuarios del Sistema</h1>
          <p class="text-sm text-slate-400 mt-2">Administra los accesos, roles y permisos de los miembros de tu organización.</p>
        </div>

        @if (authStore.hasPermission('users:write')) {
          <button
            (click)="openCreateModal()"
            class="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium rounded-xl px-5 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-purple-500/20 active:scale-[0.98] shadow-lg shadow-purple-500/10"
          >
            + Nuevo Usuario
          </button>
        }
      </div>

      <!-- Loading State -->
      @if (isLoading()) {
        <div class="backdrop-blur-xl bg-slate-900/40 border border-slate-800 p-8 rounded-2xl flex flex-col items-center justify-center space-y-3">
          <span class="inline-block animate-spin border-4 border-purple-500 border-t-transparent rounded-full w-8 h-8"></span>
          <span class="text-xs text-slate-400">Cargando miembros de la organización...</span>
        </div>
      } @else {
        <!-- Users Table -->
        <div class="backdrop-blur-xl bg-slate-900/40 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="border-b border-slate-800 bg-slate-950/50">
                  <th class="px-6 py-4 text-xs font-semibold uppercase text-slate-400 tracking-wider">Nombre Completo</th>
                  <th class="px-6 py-4 text-xs font-semibold uppercase text-slate-400 tracking-wider">Correo Electrónico</th>
                  <th class="px-6 py-4 text-xs font-semibold uppercase text-slate-400 tracking-wider">Rol Principal</th>
                  <th class="px-6 py-4 text-xs font-semibold uppercase text-slate-400 tracking-wider">Estado</th>
                  <th class="px-6 py-4 text-xs font-semibold uppercase text-slate-400 tracking-wider text-right">Acciones</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800/60">
                @for (user of users(); track user.id) {
                  <tr class="hover:bg-slate-900/20 transition-colors">
                    <td class="px-6 py-4 flex items-center space-x-3">
                      <div class="w-8 h-8 rounded-full bg-purple-500/10 border border-purple-500/15 flex items-center justify-center text-purple-400 font-bold text-xs">
                        {{ user.firstName[0] }}{{ user.lastName[0] }}
                      </div>
                      <div>
                        <div class="font-bold text-white text-sm">
                          {{ user.firstName }} {{ user.lastName }}
                        </div>
                        @if (user.id === authStore.user()?.id) {
                          <span class="text-[9px] bg-purple-500/10 text-purple-400 px-1.5 py-0.5 rounded-md font-semibold border border-purple-500/15">Tú</span>
                        }
                      </div>
                    </td>
                    <td class="px-6 py-4 text-slate-300 text-xs font-mono">{{ user.email }}</td>
                    <td class="px-6 py-4">
                      <span class="bg-indigo-500/10 text-indigo-400 border border-indigo-500/25 text-[10px] px-2.5 py-0.5 rounded-full font-semibold uppercase">
                        {{ getRoleLabel(user) }}
                      </span>
                    </td>
                    <td class="px-6 py-4">
                      <span
                        [ngClass]="user.isActive ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-800 text-slate-500 border-slate-700'"
                        class="text-[10px] px-2.5 py-0.5 rounded-full border font-medium uppercase"
                      >
                        {{ user.isActive ? 'Activo' : 'Inactivo' }}
                      </span>
                    </td>
                    <td class="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                      @if (authStore.hasPermission('users:write')) {
                        <button
                          (click)="openEditModal(user)"
                          class="text-xs text-purple-400 hover:text-purple-300 font-semibold px-2 py-1 hover:bg-purple-500/5 rounded-lg transition-all"
                        >
                          Editar
                        </button>
                        <button
                          (click)="toggleUserStatus(user)"
                          class="text-xs text-slate-400 hover:text-slate-300 font-semibold px-2 py-1 hover:bg-slate-800 rounded-lg transition-all"
                        >
                          {{ user.isActive ? 'Inhabilitar' : 'Habilitar' }}
                        </button>
                      }
                      @if (authStore.hasPermission('users:delete') && user.id !== authStore.user()?.id) {
                        <button
                          (click)="onDelete(user.id)"
                          class="text-xs text-rose-400 hover:text-rose-300 font-semibold px-2 py-1 hover:bg-rose-500/5 rounded-lg transition-all"
                        >
                          Eliminar
                        </button>
                      }
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      <!-- MODAL FORMULARIO (CREACIÓN / EDICIÓN) -->
      @if (isModalOpen()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <!-- Backdrop overlay -->
          <div (click)="closeModal()" class="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"></div>

          <!-- Modal box -->
          <div class="backdrop-blur-xl bg-slate-900 border border-slate-800/80 p-6 rounded-2xl shadow-2xl relative w-full max-w-md z-10 space-y-4">
            <h3 class="text-lg font-bold text-white">
              {{ editingUserId() ? 'Editar Miembro' : 'Nuevo Miembro de Organización' }}
            </h3>

            <!-- Server error -->
            @if (errorMessage()) {
              <div class="bg-red-500/10 border border-red-500/25 text-red-400 text-xs px-4 py-2.5 rounded-lg">
                {{ errorMessage() }}
              </div>
            }

            <form [formGroup]="userForm" (ngSubmit)="onSubmit()" class="space-y-4">
              <!-- Name fields -->
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label for="firstName" class="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Nombre *</label>
                  <input
                    id="firstName"
                    type="text"
                    formControlName="firstName"
                    class="w-full bg-slate-950/60 border border-slate-800 focus:border-purple-500 rounded-lg px-3 py-2 text-xs text-slate-100 outline-none"
                  />
                  @if (showError('firstName', 'required')) {
                    <p class="text-rose-400 text-[10px] mt-1">El nombre es requerido</p>
                  }
                </div>
                <div>
                  <label for="lastName" class="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Apellido *</label>
                  <input
                    id="lastName"
                    type="text"
                    formControlName="lastName"
                    class="w-full bg-slate-950/60 border border-slate-800 focus:border-purple-500 rounded-lg px-3 py-2 text-xs text-slate-100 outline-none"
                  />
                  @if (showError('lastName', 'required')) {
                    <p class="text-rose-400 text-[10px] mt-1">El apellido es requerido</p>
                  }
                </div>
              </div>

              <!-- Email -->
              <div>
                <label for="email" class="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Correo Electrónico *</label>
                <input
                  id="email"
                  type="email"
                  formControlName="email"
                  class="w-full bg-slate-950/60 border border-slate-800 focus:border-purple-500 rounded-lg px-3 py-2 text-xs text-slate-100 outline-none"
                />
                @if (showError('email', 'required')) {
                  <p class="text-rose-400 text-[10px] mt-1">El correo electrónico es requerido</p>
                }
                @if (showError('email', 'email')) {
                  <p class="text-rose-400 text-[10px] mt-1">El formato de correo no es válido</p>
                }
              </div>

              <!-- Password -->
              <div>
                <label for="password" class="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Contraseña {{ editingUserId() ? '(Dejar vacío para mantener)' : '*' }}
                </label>
                <input
                  id="password"
                  type="password"
                  formControlName="password"
                  placeholder="••••••••"
                  class="w-full bg-slate-950/60 border border-slate-800 focus:border-purple-500 rounded-lg px-3 py-2 text-xs text-slate-100 outline-none"
                />
                @if (showError('password', 'required')) {
                  <p class="text-rose-400 text-[10px] mt-1">La contraseña es requerida</p>
                }
                @if (showError('password', 'minlength')) {
                  <p class="text-rose-400 text-[10px] mt-1">Debe tener al menos 6 caracteres</p>
                }
              </div>

              <!-- Role -->
              <div>
                <label for="role" class="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Rol Principal *</label>
                <select
                  id="role"
                  formControlName="role"
                  class="w-full bg-slate-950/60 border border-slate-800 focus:border-purple-500 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none"
                >
                  <option value="admin">Administrador (Acceso total)</option>
                  <option value="manager">Gestor de Clientes (Acceso CRM)</option>
                  <option value="analyst">Analista de Datos (Dashboard de métricas)</option>
                </select>
              </div>

              <!-- Footer Buttons -->
              <div class="flex items-center justify-end space-x-3 pt-3">
                <button
                  type="button"
                  (click)="closeModal()"
                  class="bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold px-4 py-2 rounded-xl text-xs transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  [disabled]="userForm.invalid || isSaving()"
                  class="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:from-purple-900/50 disabled:to-indigo-900/50 text-white font-medium rounded-xl px-5 py-2.5 text-xs transition-all"
                >
                  @if (isSaving()) {
                    Guardando...
                  } @else {
                    {{ editingUserId() ? 'Actualizar' : 'Guardar' }}
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `
})
export class UsersComponent implements OnInit {
  private usersService = inject(UsersService);
  private fb = inject(FormBuilder);
  readonly authStore = inject(AuthStore);

  users = signal<any[]>([]);
  isLoading = signal<boolean>(true);
  isModalOpen = signal<boolean>(false);
  isSaving = signal<boolean>(false);
  editingUserId = signal<string | null>(null);
  errorMessage = signal<string | null>(null);

  userForm!: FormGroup;

  ngOnInit() {
    this.loadUsers();
    this.buildForm();
  }

  private buildForm() {
    this.userForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.minLength(6)]],
      role: ['admin', [Validators.required]],
    });
  }

  async loadUsers() {
    this.isLoading.set(true);
    try {
      const data = await firstValueFrom(this.usersService.getAll());
      this.users.set(data);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      this.isLoading.set(false);
    }
  }

  getRoleLabel(user: any): string {
    const roles = user.userRoles?.map((ur: any) => ur.role?.name) ?? [];
    if (roles.includes('admin')) return 'Administrador';
    if (roles.includes('manager')) return 'Gestor';
    if (roles.includes('analyst')) return 'Analista';
    return roles[0] || 'Miembro';
  }

  openCreateModal() {
    this.editingUserId.set(null);
    this.errorMessage.set(null);
    this.userForm.reset({ role: 'admin' });
    this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    this.userForm.get('password')?.updateValueAndValidity();
    this.isModalOpen.set(true);
  }

  openEditModal(user: any) {
    this.editingUserId.set(user.id);
    this.errorMessage.set(null);
    const roleName = user.userRoles?.[0]?.role?.name || 'admin';
    
    this.userForm.reset({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: roleName,
    });

    this.userForm.get('password')?.setValidators([Validators.minLength(6)]);
    this.userForm.get('password')?.updateValueAndValidity();
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
    this.editingUserId.set(null);
  }

  showError(field: string, errorKey: string): boolean {
    const control = this.userForm.get(field);
    return !!control && control.hasError(errorKey) && (control.dirty || control.touched);
  }

  async onSubmit() {
    if (this.userForm.invalid) return;

    this.isSaving.set(true);
    this.errorMessage.set(null);

    const formValues = this.userForm.value;
    const payload = {
      firstName: formValues.firstName,
      lastName: formValues.lastName,
      email: formValues.email,
      roles: [formValues.role],
      ...(formValues.password ? { password: formValues.password } : {}),
    };

    try {
      const editingId = this.editingUserId();
      if (editingId) {
        // Edit User
        const updated = await firstValueFrom(this.usersService.update(editingId, payload));
        this.users.update((list) =>
          list.map((u) => (u.id === editingId ? updated : u))
        );
      } else {
        // Create User
        const created = await firstValueFrom(this.usersService.create(payload));
        this.users.update((list) => [...list, created]);
      }
      this.closeModal();
    } catch (err: any) {
      this.errorMessage.set(err.error?.message ?? 'Ocurrió un error al guardar el usuario');
    } finally {
      this.isSaving.set(false);
    }
  }

  async toggleUserStatus(user: any) {
    try {
      const payload = { isActive: !user.isActive };
      const updated = await firstValueFrom(this.usersService.update(user.id, payload));
      this.users.update((list) =>
        list.map((u) => (u.id === user.id ? updated : u))
      );
    } catch (err) {
      console.error('Error toggling status:', err);
    }
  }

  async onDelete(id: string) {
    if (confirm('¿Estás seguro de que deseas eliminar este miembro?')) {
      try {
        await firstValueFrom(this.usersService.delete(id));
        this.users.update((list) => list.filter((u) => u.id !== id));
      } catch (err) {
        console.error('Error deleting user:', err);
      }
    }
  }
}
export default UsersComponent;
