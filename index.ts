interface Schema<T> {
  parse(value: unknown): T;
}

type InferSchemaType<TSchema> = TSchema extends Schema<infer T> ? T : never;

type InferObjectType<TShape extends Record<string, Schema<any>>> = {
  [K in keyof TShape]: InferSchemaType<TShape[K]>;
};

function number(): Schema<number> {
  return {
    parse: (value: unknown) => {
      if (typeof value !== "number") {
        throw new Error(`Expected number, got ${typeof value}`);
      }
      return value;
    },
  };
}

function string(): Schema<string> {
  return {
    parse: (value: unknown) => {
      if (typeof value !== "string") {
        throw new Error(`Expected string, got ${typeof value}`);
      }
      return value;
    },
  };
}

function boolean(): Schema<boolean> {
  return {
    parse: (value: unknown) => {
      if (typeof value !== "boolean") {
        throw new Error(`Expected boolean, got ${typeof value}`);
      }
      return value;
    },
  };
}

function object<T extends Record<string, Schema<any>>>(
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

        if (!(key in input)) {
          throw new Error(`Missing key: ${key}`);
        }

        result[key] = schema?.parse(inputValue);
      }

      return result as InferObjectType<T>;
    },
  };
}

const userSchema = object({
  age: number(),
  name: string(),
  active: boolean(),
});

const result = userSchema.parse({
  age: 20,
  name: "Ruan Gustavo",
  active: true,
});

console.log(result);
