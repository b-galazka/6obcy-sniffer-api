import { registerDecorator, ValidationOptions } from 'class-validator';

export function IsStringOrNumber(
  validationOptions?: ValidationOptions
): (obj: object, propertyName: string) => void {
  return (obj: object, propertyName: string): void => {
    registerDecorator({
      name: 'isStringOrNumber',
      target: obj.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: string | number): boolean {
          return typeof value === 'string' || typeof value === 'number';
        },

        defaultMessage(): string {
          return 'value must be either a string or a number';
        }
      }
    });
  };
}
