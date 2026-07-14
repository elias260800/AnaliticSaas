import { AbstractControl, ValidationErrors, AsyncValidatorFn, ValidatorFn, FormArray } from '@angular/forms';
import { Observable, of, timer } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';
import { ClientsService } from '../services/clients.service';

/**
 * Synchronous validator: checks that a FormArray contains at least one contact
 * with role === 'primary' AND isPrimary === true.
 */
export function requirePrimaryContact(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const formArray = control as FormArray;
    if (!formArray || formArray.length === 0) {
      return { noPrimaryContact: true };
    }

    const hasPrimary = formArray.controls.some((group) => {
      const role = group.get('role')?.value;
      const isPrimary = group.get('isPrimary')?.value;
      return role === 'primary' && isPrimary === true;
    });

    return hasPrimary ? null : { noPrimaryContact: true };
  };
}

/**
 * Synchronous validator: compares userLimit value against selected plan limits.
 */
export function userLimitByPlan(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const group = control.parent;
    if (!group) return null;

    const planName = group.get('planName')?.value;
    const userLimit = control.value;

    if (!planName || userLimit === null || userLimit === undefined) return null;

    const planLimits: Record<string, number> = {
      starter: 10,
      professional: 50,
      enterprise: 500,
    };

    const maxUsers = planLimits[planName];
    if (maxUsers && userLimit > maxUsers) {
      return {
        exceedsPlanLimit: {
          plan: planName,
          max: maxUsers,
          current: userLimit,
        },
      };
    }

    return null;
  };
}

/**
 * Asynchronous validator: queries backend to see if taxId already exists, using 500ms debounce.
 */
export function taxIdExistsValidator(clientsService: ClientsService, excludeClientId?: string): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    const val = control.value;
    if (!val || val.trim().length < 4) {
      return of(null);
    }

    // Debounce using timer(500)
    return timer(500).pipe(
      switchMap(() => clientsService.checkTaxId(val.trim(), excludeClientId)),
      map((res) => {
        return res.exists ? { taxIdExists: { clientName: res.clientName } } : null;
      }),
      catchError(() => of(null)) // fallback to null validation on error
    );
  };
}

/**
 * Asynchronous validator: checks if the email's domain is already registered, using 500ms debounce.
 */
export function domainExistsValidator(clientsService: ClientsService, excludeClientId?: string): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    const email = control.value;
    if (!email || !email.includes('@')) {
      return of(null);
    }

    const domain = email.split('@')[1];
    if (!domain || domain.trim() === '') {
      return of(null);
    }

    // Ignore generic domains to avoid false matches (gmail, outlook, etc.)
    const genericDomains = ['gmail.com', 'outlook.com', 'hotmail.com', 'yahoo.com', 'live.com', 'aol.com'];
    if (genericDomains.includes(domain.toLowerCase())) {
      return of(null);
    }

    // Debounce using timer(500)
    return timer(500).pipe(
      switchMap(() => clientsService.checkDomain(domain.trim(), excludeClientId)),
      map((res) => {
        return res.exists ? { domainExists: { clientName: res.clientName } } : null;
      }),
      catchError(() => of(null))
    );
  };
}
