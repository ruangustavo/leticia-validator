interface Schema<T> {
  parse(value: unknown): T;
  _isOptional?: boolean;
}

type InferSchemaType<TSchema> = TSchema extends Schema<infer T> ? T : never;

type InferObjectType<TShape extends Record<string, Schema<any>>> = {
  [K in keyof TShape]: InferSchemaType<TShape[K]>;
};

type ValidationFn<T> = (val: T) => void;

interface NumberSchema extends Schema<number> {
  min(value: number): NumberSchema;
  max(value: number): NumberSchema;
  _validations?: ValidationFn<number>[];
}

interface StringSchema extends Schema<string> {
  min(length: number): StringSchema;
  max(length: number): StringSchema;
  email(): StringSchema;
  regex(pattern: string): StringSchema;
  _validations?: ValidationFn<string>[];
}

interface ArraySchema<T> extends Schema<T[]> {
  min(length: number): ArraySchema<T>;
  max(length: number): ArraySchema<T>;
  _validations?: ValidationFn<T[]>[];
}

export function array<T>(itemSchema: Schema<T>): ArraySchema<T> {
  const validations: ValidationFn<T[]>[] = [];

  const arraySchema: ArraySchema<T> = {
    parse: (value: unknown) => {
      if (!Array.isArray(value)) {
        throw new Error(`Expected array, got ${typeof value}`);
      }

      const result = value.map((item) => itemSchema.parse(item));

      for (const validate of validations) {
        validate(result);
      }

      return result;
    },
    min: (minLength: number) => {
      validations.push((val: T[]) => {
        if (val.length < minLength) {
          throw new Error(
            `Array must have at least ${minLength} items, got ${val.length}`,
          );
        }
      });
      return arraySchema;
    },
    max: (maxLength: number) => {
      validations.push((val: T[]) => {
        if (val.length > maxLength) {
          throw new Error(
            `Array must have at most ${maxLength} items, got ${val.length}`,
          );
        }
      });
      return arraySchema;
    },
    _validations: validations,
  };

  return arraySchema;
}

export function optional<T>(schema: Schema<T>): Schema<T | undefined> {
  return {
    parse: (value: unknown) => {
      if (value === undefined) {
        return undefined;
      }
      return schema.parse(value);
    },
    _isOptional: true,
  };
}

export function number(): NumberSchema {
  const validations: ValidationFn<number>[] = [];

  const schema: NumberSchema = {
    parse: (value: unknown) => {
      if (typeof value !== "number") {
        throw new Error(`Expected number, got ${typeof value}`);
      }

      for (const validate of validations) {
        validate(value);
      }

      return value;
    },
    min: (minValue: number) => {
      validations.push((val: number) => {
        if (val < minValue) {
          throw new Error(`Number must be >= ${minValue}, got ${val}`);
        }
      });
      return schema;
    },
    max: (maxValue: number) => {
      validations.push((val: number) => {
        if (val > maxValue) {
          throw new Error(`Number must be <= ${maxValue}, got ${val}`);
        }
      });
      return schema;
    },
    _validations: validations,
  };

  return schema;
}

export function string(): StringSchema {
  const validations: ValidationFn<string>[] = [];

  const schema: StringSchema = {
    parse: (value: unknown) => {
      if (typeof value !== "string") {
        throw new Error(`Expected string, got ${typeof value}`);
      }

      for (const validate of validations) {
        validate(value);
      }

      return value;
    },
    min: (minLength: number) => {
      validations.push((val: string) => {
        if (val.length < minLength) {
          throw new Error(
            `String must have at least ${minLength} characters, got ${val.length}`,
          );
        }
      });
      return schema;
    },
    max: (maxLength: number) => {
      validations.push((val: string) => {
        if (val.length > maxLength) {
          throw new Error(
            `String must have at most ${maxLength} characters, got ${val.length}`,
          );
        }
      });
      return schema;
    },
    email: () => {
      const EMAIL_PATTERN =
        /^(?!\.)(?!.*\.\.)([A-Za-z0-9_'+\-\.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$/;

      validations.push((val: string) => {
        if (!EMAIL_PATTERN.test(val)) {
          throw new Error(`Invalid email format: ${val}`);
        }
      });

      return schema;
    },
    regex: (pattern: string) => {
      validations.push((val: string) => {
        if (!new RegExp(pattern).test(val)) {
          throw new Error(`String does not match pattern: ${pattern}`);
        }
      });

      return schema;
    },
    _validations: validations,
  };

  return schema;
}

export function boolean(): Schema<boolean> {
  return {
    parse: (value: unknown) => {
      if (typeof value !== "boolean") {
        throw new Error(`Expected boolean, got ${typeof value}`);
      }
      return value;
    },
  };
}

export function object<T extends Record<string, Schema<any>>>(
  shape: T,
): Schema<InferObjectType<T>> {
  return {
    parse: (value: unknown) => {
      if (typeof value !== "object" || value === null) {
        throw new Error(`Expected object, got ${typeof value}`);
      }

      const input = value as Record<string, unknown>;
      const result: any = {};

      for (const key in shape) {
        const schema = shape[key];
        const inputValue = input[key];

        if (inputValue === undefined && !schema?._isOptional) {
          throw new Error(`Missing required key: ${key}`);
        }

        result[key] = schema?.parse(inputValue);
      }

      return result as InferObjectType<T>;
    },
  };
}

export const l = {
  string,
  number,
  boolean,
  object,
  array,
  optional,
};
