import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class CustomValidators {
  // Nombres o Apellidos: minLength a maxLength caracteres
  static name(minLength = 2, maxLength = 30): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value?.trim();
      const valid = new RegExp(`^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ ]{${minLength},${maxLength}}$`).test(value);
      return valid ? null : { invalidName: true };
    };
  }

  // Solo digitos, minLength a maxLength caracteres
  static dni(minLength = 7, maxLength = 9): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value?.trim();
      const valid = new RegExp(`^\\d{${minLength},${maxLength}}$`).test(value);
      return valid ? null : { invalidDni: true };
    };
  }

  // Contraseña segura: minLength a maxLength caracteres, al menos una letra y un número
  static password(minLength = 8, maxLength = 50): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const valid = new RegExp(
        `^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d]{${minLength},${maxLength}}$`,
      ).test(control.value);
      return valid ? null : { invalidPassword: true };
    };
  }

  // Teléfono: solo números, minLength a maxLength dígitos
  static phoneOptional(minLength = 8, maxLength = 15): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      const valid = new RegExp(`^\\d{${minLength},${maxLength}}$`).test(control.value);
      return valid ? null : { invalidPhone: true };
    };
  }

  // Valida que el usuario ingrese solo números entre 1 y 100
  static vidaUtilCava(min = 1, max = 100): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      const val = Number(control.value);
      const isInteger = /^\d+$/.test(String(control.value));
      const valid = isInteger && val >= min && val <= max;
      return valid ? null : { invalidVidaUtilCava: true };
    };
  }

  // Valida que el usuario ingrese solo números entre 0 y 20
  static viajesRealizadosCava(min = 0, max = 20): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (control.value === null || control.value === undefined) return null;
      const val = Number(control.value);
      const isInteger = /^\d+$/.test(String(control.value));
      const valid = isInteger && val >= min && val <= max;
      return valid ? null : { invalidViajesRealizados: true };
    };
  }

  // Valida que el usuario ingrese solo números entre 1000 y 200000
  static costoCompraCava(min = 1000, max = 200000): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      const val = Number(control.value);
      const isInteger = /^\d+$/.test(String(control.value));
      const valid = isInteger && val >= min && val <= max;
      return valid ? null : { invalidCostoCompra: true };
    };
  }

  // Valida que el usuario ingrese solo números entre 1000 y 50000
  static costoPersonalizacionCava(min = 1000, max = 50000): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      const val = Number(control.value);
      const isInteger = /^\d+$/.test(String(control.value));
      const valid = isInteger && val >= min && val <= max;
      return valid ? null : { invalidCostoPersonalizacion: true };
    };
  }

  // Valida que el formato sea [A-Z]-[0000-9999]. (Ej: C-0000)
  static serialCava(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      const valid = /^[A-Z]-\d{4}$/.test(control.value);
      return valid ? null : { invalidSerialCava: true };
    };
  }
}
