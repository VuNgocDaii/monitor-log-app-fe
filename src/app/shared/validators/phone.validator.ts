import { AbstractControl, ValidatorFn,ValidationErrors  } from "@angular/forms";

export function validateVietnamesePhoneNumber(control: AbstractControl): ValidationErrors | null {
    const phoneNumberPattern = /^(0[1-9][0-9]{8}|84[1-9][0-9]{7})$/;

    if (!phoneNumberPattern.test(control.value)) {
      return { invalidPhoneNumber: true };
    }

    return null;
  }
