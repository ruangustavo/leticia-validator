interface Schema<T> {
  parse(value: unknown): T;
  _isOptional?: boolean;
}

type InferSchemaType<TSchema> = TSchema extends Schema<infer T> ? T : never;

type InferObjectType<TShape extends Record<string, Schema<any>>> = {
  [K in keyof TShape]: InferSchemaType<TShape[K]>;
};

export function array<T>(schema: Schema<T>): Schema<T[]> {
  return {
    parse: (value: unknown) => {
      if (!Array.isArray(value)) {
        throw new Error(`Expected array, got ${typeof value}`);
      }
      return value.map((item) => schema.parse(item));
    },
  };
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

export function number(): Schema<number> {
  return {
    parse: (value: unknown) => {
      if (typeof value !== "number") {
        throw new Error(`Expected number, got ${typeof value}`);
      }
      return value;
    },
  };
}

export function string(): Schema<string> {
  return {
    parse: (value: unknown) => {
      if (typeof value !== "string") {
        throw new Error(`Expected string, got ${typeof value}`);
      }
      return value;
    },
  };
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
