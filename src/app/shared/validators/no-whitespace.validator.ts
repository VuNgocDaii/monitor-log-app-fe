import { AbstractControl, ValidatorFn } from "@angular/forms";

export function NoWhitespaceValidator(): ValidatorFn {
    // console.log('NoWhitespaceValidator')
  return (control: AbstractControl): { [key: string]: any } | null => {

    // console.log('control.value :', control.value)
    let controlVal = control.value;
    if (typeof controlVal === "number") {
      controlVal = `${controlVal}`;
    }
    let isWhitespace = (controlVal || "").trim().length === 0;
    // let isWhitespace = (controlVal || "").includes(' ');
    // console.log('isWhitespace :', isWhitespace)
    let isValid = !isWhitespace;
    // console.log('isValid :', isValid)
    return isValid ? null : { whitespace: "*Value is only whitespace. " };
  };
}
