import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'percentage',
  standalone: true,
})
export class PercentagePipe implements PipeTransform {
  /** Formats a numeric value as a percentage string.
   * @param value The numeric value.
   * @param decimals The number of decimal places.
   * @returns The formatted percentage string.
   */
  transform(value: number, decimals: number = 0): string {
    if (value === null || value === undefined) {
      return '0%';
    }
    const factor = Math.pow(10, decimals);
    const rounded = Math.round(value * factor) / factor;
    return `${rounded}%`;
  }
}
