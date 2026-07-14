import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { ClientsService } from '../../services/clients.service';
import { requirePrimaryContact, userLimitByPlan, taxIdExistsValidator, domainExistsValidator } from '../../validators/client.validators';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-client-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="max-w-4xl mx-auto space-y-6">
      <!-- Title Header -->
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-white">
          {{ isEditMode() ? 'Editar Cliente Corporativo' : 'Nuevo Cliente Corporativo' }}
        </h1>
        <p class="text-sm text-slate-400 mt-2">
          {{ isEditMode() ? 'Modifica los datos del cliente corporativo y su configuración de plan.' : 'Registra una nueva empresa en el CRM, asocia contactos y define límites de uso.' }}
        </p>
      </div>

      <!-- Main Form -->
      <form [formGroup]="clientForm" (ngSubmit)="onSubmit()" class="space-y-6">
        <!-- SECCIÓN 1: DATOS DE EMPRESA -->
        <div class="backdrop-blur-xl bg-slate-900/40 border border-slate-800/80 p-6 rounded-2xl shadow-xl space-y-4" formGroupName="company">
          <h2 class="text-lg font-bold text-slate-200 border-b border-slate-800/60 pb-2">Sección 1: Datos de Empresa</h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Legal Name -->
            <div>
              <label for="legalName" class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Nombre Legal *</label>
              <input
                id="legalName"
                type="text"
                formControlName="legalName"
                placeholder="ej. Tech Solutions S.A. de C.V."
                class="w-full bg-slate-950/60 border border-slate-800 focus:border-purple-500 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder:text-slate-600 outline-none transition-colors"
              />
              @if (showError('company.legalName', 'required')) {
                <p class="text-rose-400 text-[10px] mt-1">El nombre legal es requerido</p>
              }
            </div>

            <!-- Trade Name -->
            <div>
              <label for="tradeName" class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Nombre Comercial</label>
              <input
                id="tradeName"
                type="text"
                formControlName="tradeName"
                placeholder="ej. TechSol"
                class="w-full bg-slate-950/60 border border-slate-800 focus:border-purple-500 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder:text-slate-600 outline-none transition-colors"
              />
            </div>

            <!-- Tax ID (RFC / CIF) -->
            <div>
              <label for="taxId" class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">ID Fiscal (RFC / CIF / Tax ID) *</label>
              <input
                id="taxId"
                type="text"
                formControlName="taxId"
                placeholder="ej. TSO210315AB9"
                class="w-full bg-slate-950/60 border border-slate-800 focus:border-purple-500 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder:text-slate-600 outline-none transition-colors font-mono"
              />
              @if (clientForm.get('company.taxId')?.pending) {
                <p class="text-indigo-400 text-[10px] mt-1 flex items-center">
                  <span class="animate-spin border border-indigo-400 border-t-transparent rounded-full w-3 h-3 mr-1"></span>
                  🔍 Verificando disponibilidad...
                </p>
              }
              @if (clientForm.get('company.taxId')?.hasError('taxIdExists')) {
                <p class="text-amber-400 text-[10px] mt-1">
                  ⚠️ Ya está registrado para: {{ clientForm.get('company.taxId')?.getError('taxIdExists').clientName }}
                </p>
              }
              @if (showError('company.taxId', 'required')) {
                <p class="text-rose-400 text-[10px] mt-1">El ID fiscal es requerido</p>
              }
            </div>

            <!-- Website -->
            <div>
              <label for="website" class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Sitio Web</label>
              <input
                id="website"
                type="text"
                formControlName="website"
                placeholder="https://techsol.mx"
                class="w-full bg-slate-950/60 border border-slate-800 focus:border-purple-500 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder:text-slate-600 outline-none transition-colors font-mono"
              />
              @if (showError('company.website', 'pattern')) {
                <p class="text-rose-400 text-[10px] mt-1">El formato de la URL debe ser válido (ej. http:// o https://)</p>
              }
            </div>

            <!-- Country -->
            <div>
              <label for="country" class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">País *</label>
              <select
                id="country"
                formControlName="country"
                (change)="onCountryChange()"
                class="w-full bg-slate-950/60 border border-slate-800 focus:border-purple-500 rounded-xl px-4 py-2.5 text-xs text-slate-200 outline-none transition-colors"
              >
                <option value="">Selecciona un país...</option>
                @for (country of countries(); track country.code) {
                  <option [value]="country.code">{{ country.name }}</option>
                }
              </select>
              @if (showError('company.country', 'required')) {
                <p class="text-rose-400 text-[10px] mt-1">El país es requerido</p>
              }
            </div>

            <!-- Region (Auto-filled) -->
            <div>
              <label for="region" class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Región (Autocompletado)</label>
              <input
                id="region"
                type="text"
                formControlName="region"
                [readonly]="true"
                class="w-full bg-slate-900 border border-slate-900 focus:border-purple-500 rounded-xl px-4 py-2.5 text-xs text-slate-400 outline-none cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        <!-- SECCIÓN 2: FACTURACIÓN -->
        <div class="backdrop-blur-xl bg-slate-900/40 border border-slate-800/80 p-6 rounded-2xl shadow-xl space-y-4" formGroupName="billing">
          <h2 class="text-lg font-bold text-slate-200 border-b border-slate-800/60 pb-2">Sección 2: Facturación</h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Billing Email -->
            <div class="md:col-span-2">
              <label for="billingEmail" class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Email de Facturación *</label>
              <input
                id="billingEmail"
                type="email"
                formControlName="billingEmail"
                placeholder="facturas@techsol.mx"
                class="w-full bg-slate-950/60 border border-slate-800 focus:border-purple-500 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder:text-slate-600 outline-none transition-colors"
              />
              @if (clientForm.get('billing.billingEmail')?.pending) {
                <p class="text-indigo-400 text-[10px] mt-1 flex items-center">
                  <span class="animate-spin border border-indigo-400 border-t-transparent rounded-full w-3 h-3 mr-1"></span>
                  🔍 Verificando dominio de email corporativo...
                </p>
              }
              @if (clientForm.get('billing.billingEmail')?.hasError('domainExists')) {
                <p class="text-amber-400 text-[10px] mt-1">
                  ⚠️ Dominio ya registrado para la organización: {{ clientForm.get('billing.billingEmail')?.getError('domainExists').clientName }}
                </p>
              }
              @if (showError('billing.billingEmail', 'required')) {
                <p class="text-rose-400 text-[10px] mt-1">El email de facturación es requerido</p>
              }
              @if (showError('billing.billingEmail', 'email')) {
                <p class="text-rose-400 text-[10px] mt-1">Ingresa un formato de correo electrónico válido</p>
              }
            </div>

            <!-- Billing Address -->
            <div class="md:col-span-2">
              <label for="billingAddress" class="block text-xs font-semibold text-slate-3 font-semibold text-slate-300 uppercase tracking-wider mb-2">Dirección Fiscal *</label>
              <textarea
                id="billingAddress"
                rows="2"
                formControlName="billingAddress"
                placeholder="Av. Paseo de la Reforma 505, Piso 12"
                class="w-full bg-slate-950/60 border border-slate-800 focus:border-purple-500 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder:text-slate-600 outline-none transition-colors"
              ></textarea>
              @if (showError('billing.billingAddress', 'required')) {
                <p class="text-rose-400 text-[10px] mt-1">La dirección fiscal es requerida</p>
              }
            </div>

            <!-- Currency -->
            <div>
              <label for="currency" class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Moneda *</label>
              <select
                id="currency"
                formControlName="currency"
                class="w-full bg-slate-950/60 border border-slate-800 focus:border-purple-500 rounded-xl px-4 py-2.5 text-xs text-slate-200 outline-none transition-colors"
              >
                <option value="USD">USD - Dólar Estadounidense</option>
                <option value="EUR">EUR - Euro</option>
                <option value="MXN">MXN - Peso Mexicano</option>
                <option value="COP">COP - Peso Colombiano</option>
              </select>
            </div>

            <!-- Payment Method -->
            <div>
              <label for="paymentMethod" class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Método de Pago</label>
              <select
                id="paymentMethod"
                formControlName="paymentMethod"
                class="w-full bg-slate-950/60 border border-slate-800 focus:border-purple-500 rounded-xl px-4 py-2.5 text-xs text-slate-200 outline-none transition-colors"
              >
                <option value="bank_transfer">Transferencia Bancaria</option>
                <option value="credit_card">Tarjeta de Crédito / Débito</option>
                <option value="ach">ACH</option>
                <option value="wire">Wire Transfer (Swift)</option>
              </select>
            </div>
          </div>
        </div>

        <!-- SECCIÓN 3: CONTACTOS -->
        <div class="backdrop-blur-xl bg-slate-900/40 border border-slate-800/80 p-6 rounded-2xl shadow-xl space-y-4">
          <div class="flex items-center justify-between border-b border-slate-800/60 pb-2">
            <h2 class="text-lg font-bold text-slate-200">Sección 3: Contactos Asociados</h2>
            <button
              type="button"
              (click)="addContact()"
              class="text-xs text-purple-400 hover:text-purple-300 font-semibold flex items-center space-x-1"
            >
              <span>➕ Agregar Contacto</span>
            </button>
          </div>

          @if (clientForm.get('contacts')?.hasError('noPrimaryContact')) {
            <div class="bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs px-4 py-2.5 rounded-lg">
              ⚠️ Debe registrar al menos un contacto con el rol **Principal** e **isPrimary** habilitado.
            </div>
          }

          <div formArrayName="contacts" class="space-y-4">
            @for (contact of contacts.controls; track $index; let i = $index) {
              <div class="bg-slate-950/40 border border-slate-900 p-4 rounded-xl relative space-y-4" [formGroupName]="i">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-semibold text-purple-400">Contacto #{{ i + 1 }}</span>
                  @if (contacts.length > 1) {
                    <button
                      type="button"
                      (click)="removeContact(i)"
                      class="text-rose-500 hover:text-rose-400 text-[10px] font-semibold"
                    >
                      🗑 Eliminar
                    </button>
                  }
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <!-- First Name -->
                  <div>
                    <label class="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Nombre *</label>
                    <input
                      type="text"
                      formControlName="firstName"
                      class="w-full bg-slate-950/60 border border-slate-900 focus:border-purple-500 rounded-lg px-3 py-2 text-xs text-slate-100 outline-none"
                    />
                  </div>

                  <!-- Last Name -->
                  <div>
                    <label class="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Apellido *</label>
                    <input
                      type="text"
                      formControlName="lastName"
                      class="w-full bg-slate-950/60 border border-slate-900 focus:border-purple-500 rounded-lg px-3 py-2 text-xs text-slate-100 outline-none"
                    />
                  </div>

                  <!-- Email -->
                  <div>
                    <label class="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Email *</label>
                    <input
                      type="email"
                      formControlName="email"
                      class="w-full bg-slate-950/60 border border-slate-900 focus:border-purple-500 rounded-lg px-3 py-2 text-xs text-slate-100 outline-none"
                    />
                  </div>

                  <!-- Phone -->
                  <div>
                    <label class="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Teléfono</label>
                    <input
                      type="text"
                      formControlName="phone"
                      placeholder="+52..."
                      class="w-full bg-slate-950/60 border border-slate-900 focus:border-purple-500 rounded-lg px-3 py-2 text-xs text-slate-100 outline-none"
                    />
                  </div>

                  <!-- Role -->
                  <div>
                    <label class="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Rol de Contacto *</label>
                    <select
                      formControlName="role"
                      class="w-full bg-slate-950/60 border border-slate-900 focus:border-purple-500 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none"
                    >
                      <option value="primary">Principal</option>
                      <option value="technical">Técnico</option>
                      <option value="billing">Facturación</option>
                      <option value="executive">Ejecutivo</option>
                    </select>
                  </div>

                  <!-- isPrimary checkbox -->
                  <div class="flex items-center space-x-2 pt-5">
                    <input
                      type="checkbox"
                      id="isPrimary-{{ i }}"
                      formControlName="isPrimary"
                      class="w-4 h-4 rounded bg-slate-950 text-purple-600 focus:ring-purple-500/20 border-slate-900 outline-none"
                    />
                    <label for="isPrimary-{{ i }}" class="text-xs text-slate-300 select-none">Contacto Primario</label>
                  </div>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- SECCIÓN 4: CONFIGURACIÓN DEL PLAN -->
        <div class="backdrop-blur-xl bg-slate-900/40 border border-slate-800/80 p-6 rounded-2xl shadow-xl space-y-4" formGroupName="planConfig">
          <h2 class="text-lg font-bold text-slate-200 border-b border-slate-800/60 pb-2">Sección 4: Configuración de Plan</h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Plan Name -->
            <div>
              <label for="planName" class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Plan *</label>
              <select
                id="planName"
                formControlName="planName"
                class="w-full bg-slate-950/60 border border-slate-800 focus:border-purple-500 rounded-xl px-4 py-2.5 text-xs text-slate-200 outline-none transition-colors"
              >
                <option value="starter">Starter (Límite: 10 usuarios)</option>
                <option value="professional">Professional (Límite: 50 usuarios)</option>
                <option value="enterprise">Enterprise (Límite: 500 usuarios)</option>
              </select>
            </div>

            <!-- User Limit -->
            <div>
              <label for="userLimit" class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Límite de Usuarios *</label>
              <input
                id="userLimit"
                type="number"
                formControlName="userLimit"
                class="w-full bg-slate-950/60 border border-slate-800 focus:border-purple-500 rounded-xl px-4 py-2.5 text-xs text-slate-100 outline-none transition-colors"
              />
              @if (clientForm.get('planConfig.userLimit')?.hasError('exceedsPlanLimit')) {
                <p class="text-rose-400 text-[10px] mt-1">
                  El plan {{ clientForm.get('planConfig.userLimit')?.getError('exceedsPlanLimit').plan.toUpperCase() }} permite un máximo de {{ clientForm.get('planConfig.userLimit')?.getError('exceedsPlanLimit').max }} usuarios.
                </p>
              }
              @if (showError('planConfig.userLimit', 'required')) {
                <p class="text-rose-400 text-[10px] mt-1">El límite de usuarios es requerido</p>
              }
            </div>

            <!-- Storage Limit -->
            <div>
              <label for="storageLimitGb" class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Almacenamiento (GB) *</label>
              <input
                id="storageLimitGb"
                type="number"
                formControlName="storageLimitGb"
                class="w-full bg-slate-950/60 border border-slate-800 focus:border-purple-500 rounded-xl px-4 py-2.5 text-xs text-slate-100 outline-none transition-colors"
              />
              @if (showError('planConfig.storageLimitGb', 'required')) {
                <p class="text-rose-400 text-[10px] mt-1">El límite de almacenamiento es requerido</p>
              }
            </div>

            <!-- Started At -->
            <div>
              <label for="startedAt" class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Fecha de Inicio *</label>
              <input
                id="startedAt"
                type="date"
                formControlName="startedAt"
                class="w-full bg-slate-950/60 border border-slate-800 focus:border-purple-500 rounded-xl px-4 py-2.5 text-xs text-slate-200 outline-none transition-colors"
              />
            </div>

            <!-- isTrial -->
            <div class="flex items-center space-x-2 pt-6 md:col-span-2">
              <input
                type="checkbox"
                id="isTrial"
                formControlName="isTrial"
                class="w-4 h-4 rounded bg-slate-950 text-purple-600 focus:ring-purple-500/20 border-slate-900 outline-none"
              />
              <label for="isTrial" class="text-xs text-slate-300 select-none">Establecer periodo de prueba (Trial)</label>
            </div>

            <!-- trialDays -->
            @if (clientForm.get('planConfig.isTrial')?.value) {
              <div class="md:col-span-2">
                <label for="trialDays" class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Días de Prueba</label>
                <input
                  id="trialDays"
                  type="number"
                  formControlName="trialDays"
                  class="w-48 bg-slate-950/60 border border-slate-800 focus:border-purple-500 rounded-xl px-4 py-2.5 text-xs text-slate-100 outline-none transition-colors"
                />
              </div>
            }
          </div>
        </div>

        <!-- Acciones Formulario -->
        <div class="flex items-center justify-end space-x-4 pt-4">
          <a
            routerLink="/clients"
            class="bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold px-5 py-2.5 rounded-xl text-xs transition-colors focus:outline-none"
          >
            Cancelar
          </a>
          <button
            type="submit"
            [disabled]="clientForm.invalid || clientForm.pending || isSubmitting()"
            class="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:from-purple-900/50 disabled:to-indigo-900/50 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-medium rounded-xl px-6 py-2.5 text-xs transition-all focus:outline-none focus:ring-2 focus:ring-purple-500/20 active:scale-[0.98]"
          >
            @if (isSubmitting()) {
              <span class="inline-block animate-spin border-2 border-slate-300 border-t-transparent rounded-full w-3.5 h-3.5 mr-2 vertical-middle"></span>
              Guardando...
            } @else {
              {{ isEditMode() ? 'Actualizar Cliente' : 'Registrar Cliente' }}
            }
          </button>
        </div>
      </form>
    </div>
  `
})
export class ClientFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private clientsService = inject(ClientsService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  isSubmitting = signal<boolean>(false);
  isEditMode = signal<boolean>(false);
  clientId = signal<string | null>(null);

  countries = signal([
    { code: 'MEX', name: 'México', region: 'latam' },
    { code: 'USA', name: 'Estados Unidos', region: 'north_america' },
    { code: 'COL', name: 'Colombia', region: 'latam' },
    { code: 'ESP', name: 'España', region: 'europe' },
    { code: 'ARG', name: 'Argentina', region: 'latam' },
  ]);

  clientForm!: FormGroup;

  get contacts(): FormArray {
    return this.clientForm.get('contacts') as FormArray;
  }

  ngOnInit() {
    // 1. Check if edit mode
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.clientId.set(id);
    }

    // 2. Build form groups
    this.buildForm();

    // 3. Load client data if in edit mode
    if (id) {
      this.loadClientData(id);
    }
  }

  private buildForm() {
    const id = this.clientId() || undefined;

    this.clientForm = this.fb.group({
      company: this.fb.group({
        legalName: ['', [Validators.required, Validators.minLength(3)]],
        tradeName: [''],
        taxId: [
          '',
          [Validators.required],
          [taxIdExistsValidator(this.clientsService, id)], // Async validation with debounce
        ],
        country: ['', [Validators.required]],
        region: [{ value: '', disabled: true }],
        website: ['', [Validators.pattern(/^https?:\/\/.+/)]],
      }),

      billing: this.fb.group({
        billingEmail: [
          '',
          [Validators.required, Validators.email],
          [domainExistsValidator(this.clientsService, id)], // Async validation with domain extraction & debounce
        ],
        billingAddress: ['', [Validators.required]],
        city: [''],
        state: [''],
        postalCode: [''],
        country: ['', [Validators.required]],
        currency: ['USD', [Validators.required]],
        paymentMethod: ['bank_transfer'],
      }),

      contacts: this.fb.array([this.createContactGroup()], [requirePrimaryContact()]), // Require at least one primary

      planConfig: this.fb.group({
        planName: ['professional', [Validators.required]],
        userLimit: [10, [Validators.required, Validators.min(1), userLimitByPlan()]], // cross field constraints check
        storageLimitGb: [50, [Validators.required, Validators.min(1)]],
        startedAt: [new Date().toISOString().split('T')[0], [Validators.required]],
        isTrial: [false],
        trialDays: [14],
      }),
    });

    // Revalidate userLimit when planName changes
    this.clientForm.get('planConfig.planName')?.valueChanges.subscribe(() => {
      this.clientForm.get('planConfig.userLimit')?.updateValueAndValidity();
    });
  }

  private createContactGroup(): FormGroup {
    return this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      role: ['primary', [Validators.required]],
      isPrimary: [true],
    });
  }

  addContact() {
    this.contacts.push(
      this.fb.group({
        firstName: ['', [Validators.required]],
        lastName: ['', [Validators.required]],
        email: ['', [Validators.required, Validators.email]],
        phone: [''],
        role: ['technical', [Validators.required]],
        isPrimary: [false],
      })
    );
  }

  removeContact(index: number) {
    this.contacts.removeAt(index);
  }

  onCountryChange() {
    const code = this.clientForm.get('company.country')?.value;
    const country = this.countries().find((c) => c.code === code);
    if (country) {
      this.clientForm.get('company.region')?.setValue(country.region);
      this.clientForm.get('billing.country')?.setValue(code);
    }
  }

  showError(path: string, errorKey: string): boolean {
    const control = this.clientForm.get(path);
    return !!control && control.hasError(errorKey) && (control.dirty || control.touched);
  }

  async loadClientData(id: string) {
    try {
      const client = await firstValueFrom(this.clientsService.getById(id));
      
      // Patch company info
      this.clientForm.patchValue({
        company: {
          legalName: client.legalName,
          tradeName: client.tradeName || '',
          taxId: client.taxId,
          country: client.country,
          region: client.region || '',
          website: client.website || '',
        },
        billing: {
          billingEmail: client.billing?.billingEmail || '',
          billingAddress: client.billing?.billingAddress || '',
          city: client.billing?.city || '',
          state: client.billing?.state || '',
          postalCode: client.billing?.postalCode || '',
          country: client.billing?.country || '',
          currency: client.billing?.currency || 'USD',
          paymentMethod: client.billing?.paymentMethod || 'bank_transfer',
        },
        planConfig: {
          planName: client.planConfig?.planName || 'professional',
          userLimit: client.planConfig?.userLimit || 10,
          storageLimitGb: client.planConfig?.storageLimitGb || 50,
          startedAt: client.planConfig?.startedAt ? client.planConfig.startedAt.split('T')[0] : new Date().toISOString().split('T')[0],
          isTrial: client.planConfig?.isTrial || false,
          trialDays: client.planConfig?.trialDays || 14,
        }
      });

      // Patch contacts Array
      this.contacts.clear();
      if (client.contacts && client.contacts.length > 0) {
        client.contacts.forEach((contact: any) => {
          const group = this.fb.group({
            firstName: [contact.firstName, [Validators.required]],
            lastName: [contact.lastName, [Validators.required]],
            email: [contact.email, [Validators.required, Validators.email]],
            phone: [contact.phone || ''],
            role: [contact.role, [Validators.required]],
            isPrimary: [contact.isPrimary || false],
          });
          this.contacts.push(group);
        });
      } else {
        this.contacts.push(this.createContactGroup());
      }

    } catch (err) {
      console.error('Error loading client:', err);
    }
  }

  async onSubmit() {
    if (this.clientForm.invalid || this.clientForm.pending) return;

    this.isSubmitting.set(true);
    const payload = this.clientForm.getRawValue();

    try {
      if (this.isEditMode()) {
        await firstValueFrom(this.clientsService.update(this.clientId()!, payload));
      } else {
        await firstValueFrom(this.clientsService.create(payload));
      }
      this.router.navigate(['/clients']);
    } catch (err: any) {
      console.error('Error submitting form:', err);
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
export default ClientFormComponent;
