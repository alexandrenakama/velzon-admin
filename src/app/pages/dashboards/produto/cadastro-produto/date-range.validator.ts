// src/app/pages/dashboards/ramo/novo-ramo/date-range.validator.ts
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const dateRangeValidator: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
  const start = group.get('inicioVigencia')?.value;
  const end   = group.get('fimVigencia')?.value;
  if (!start || !end) {
    return null;
  }
  return new Date(start) <= new Date(end)
    ? null
    : { dateRange: 'Data de início deve ser anterior ou igual à data de fim' };
};
