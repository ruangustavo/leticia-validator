import { describe, expect, test } from "bun:test";
import { string, number, boolean, object, optional, array } from "./index";

describe("Primitive Validators", () => {
  describe("string()", () => {
    test("parses valid string", () => {
      const schema = string();
      expect(schema.parse("hello")).toBe("hello");
      expect(schema.parse("")).toBe("");
      expect(schema.parse("123")).toBe("123");
    });

    test("throws on non-string values", () => {
      const schema = string();
      expect(() => schema.parse(123)).toThrow("Expected string, got number");
      expect(() => schema.parse(true)).toThrow("Expected string, got boolean");
      expect(() => schema.parse(null)).toThrow("Expected string, got object");
      expect(() => schema.parse(undefined)).toThrow(
        "Expected string, got undefined",
      );
      expect(() => schema.parse({})).toThrow("Expected string, got object");
      expect(() => schema.parse([])).toThrow("Expected string, got object");
    });

    describe("min()", () => {
      test("accepts strings with length greater than or equal to minimum", () => {
        const schema = string().min(3);
        expect(schema.parse("abc")).toBe("abc");
        expect(schema.parse("abcd")).toBe("abcd");
        expect(schema.parse("hello world")).toBe("hello world");
      });

      test("throws on strings shorter than minimum", () => {
        const schema = string().min(3);
        expect(() => schema.parse("ab")).toThrow(
          "String must have at least 3 characters, got 2",
        );
        expect(() => schema.parse("a")).toThrow(
          "String must have at least 3 characters, got 1",
        );
        expect(() => schema.parse("")).toThrow(
          "String must have at least 3 characters, got 0",
        );
      });

      test("works with zero minimum", () => {
        const schema = string().min(0);
        expect(schema.parse("")).toBe("");
        expect(schema.parse("a")).toBe("a");
        expect(schema.parse("hello")).toBe("hello");
      });

      test("works with minimum of 1", () => {
        const schema = string().min(1);
        expect(schema.parse("a")).toBe("a");
        expect(schema.parse("hello")).toBe("hello");
        expect(() => schema.parse("")).toThrow(
          "String must have at least 1 characters, got 0",
        );
      });

      test("counts UTF-16 code units, not grapheme clusters", () => {
        const schema = string().min(4);
        // Emoji like 😀 are 2 UTF-16 code units each
        expect(schema.parse("😀😁")).toBe("😀😁"); // 4 code units
        expect(() => schema.parse("😀")).toThrow(
          "String must have at least 4 characters, got 2",
        );
      });
    });

    describe("max()", () => {
      test("accepts strings with length less than or equal to maximum", () => {
        const schema = string().max(5);
        expect(schema.parse("hello")).toBe("hello");
        expect(schema.parse("hi")).toBe("hi");
        expect(schema.parse("")).toBe("");
      });

      test("throws on strings longer than maximum", () => {
        const schema = string().max(5);
        expect(() => schema.parse("hello!")).toThrow(
          "String must have at most 5 characters, got 6",
        );
        expect(() => schema.parse("hello world")).toThrow(
          "String must have at most 5 characters, got 11",
        );
      });

      test("works with zero maximum", () => {
        const schema = string().max(0);
        expect(schema.parse("")).toBe("");
        expect(() => schema.parse("a")).toThrow(
          "String must have at most 0 characters, got 1",
        );
      });

      test("counts UTF-16 code units, not grapheme clusters", () => {
        const schema = string().max(4);
        // Emoji like 😀 are 2 UTF-16 code units each
        expect(schema.parse("😀😁")).toBe("😀😁"); // 4 code units
        expect(() => schema.parse("😀😁😂")).toThrow(
          "String must have at most 4 characters, got 6",
        );
      });
    });

    describe("min() and max() combined", () => {
      test("accepts strings within length range", () => {
        const schema = string().min(3).max(5);
        expect(schema.parse("abc")).toBe("abc");
        expect(schema.parse("abcd")).toBe("abcd");
        expect(schema.parse("hello")).toBe("hello");
      });

      test("throws on strings shorter than minimum", () => {
        const schema = string().min(3).max(5);
        expect(() => schema.parse("ab")).toThrow(
          "String must have at least 3 characters, got 2",
        );
      });

      test("throws on strings longer than maximum", () => {
        const schema = string().min(3).max(5);
        expect(() => schema.parse("hello!")).toThrow(
          "String must have at most 5 characters, got 6",
        );
      });

      test("works when chained in reverse order", () => {
        const schema = string().max(5).min(3);
        expect(schema.parse("abc")).toBe("abc");
        expect(() => schema.parse("ab")).toThrow(
          "String must have at least 3 characters, got 2",
        );
        expect(() => schema.parse("hello!")).toThrow(
          "String must have at most 5 characters, got 6",
        );
      });

      test("works with exact length when min equals max", () => {
        const schema = string().min(5).max(5);
        expect(schema.parse("hello")).toBe("hello");
        expect(() => schema.parse("hi")).toThrow(
          "String must have at least 5 characters, got 2",
        );
        expect(() => schema.parse("hello!")).toThrow(
          "String must have at most 5 characters, got 6",
        );
      });
    });
  });

  describe("number()", () => {
    test("parses valid number", () => {
      const schema = number();
      expect(schema.parse(0)).toBe(0);
      expect(schema.parse(123)).toBe(123);
      expect(schema.parse(-456)).toBe(-456);
      expect(schema.parse(3.14)).toBe(3.14);
      expect(schema.parse(NaN)).toBeNaN();
      expect(schema.parse(Infinity)).toBe(Infinity);
    });

    test("throws on non-number values", () => {
      const schema = number();
      expect(() => schema.parse("123")).toThrow("Expected number, got string");
      expect(() => schema.parse(true)).toThrow("Expected number, got boolean");
      expect(() => schema.parse(null)).toThrow("Expected number, got object");
      expect(() => schema.parse(undefined)).toThrow(
        "Expected number, got undefined",
      );
      expect(() => schema.parse({})).toThrow("Expected number, got object");
      expect(() => schema.parse([])).toThrow("Expected number, got object");
    });

    describe("min()", () => {
      test("accepts numbers greater than or equal to minimum", () => {
        const schema = number().min(5);
        expect(schema.parse(5)).toBe(5);
        expect(schema.parse(6)).toBe(6);
        expect(schema.parse(100)).toBe(100);
      });

      test("throws on numbers less than minimum", () => {
        const schema = number().min(5);
        expect(() => schema.parse(4)).toThrow("Number must be >= 5, got 4");
        expect(() => schema.parse(0)).toThrow("Number must be >= 5, got 0");
        expect(() => schema.parse(-10)).toThrow("Number must be >= 5, got -10");
      });

      test("works with negative minimums", () => {
        const schema = number().min(-10);
        expect(schema.parse(-10)).toBe(-10);
        expect(schema.parse(-5)).toBe(-5);
        expect(schema.parse(0)).toBe(0);
        expect(() => schema.parse(-11)).toThrow(
          "Number must be >= -10, got -11",
        );
      });

      test("works with decimal minimums", () => {
        const schema = number().min(3.14);
        expect(schema.parse(3.14)).toBe(3.14);
        expect(schema.parse(3.15)).toBe(3.15);
        expect(() => schema.parse(3.13)).toThrow(
          "Number must be >= 3.14, got 3.13",
        );
      });

      test("works with zero minimum", () => {
        const schema = number().min(0);
        expect(schema.parse(0)).toBe(0);
        expect(schema.parse(1)).toBe(1);
        expect(() => schema.parse(-1)).toThrow("Number must be >= 0, got -1");
      });
    });

    describe("max()", () => {
      test("accepts numbers less than or equal to maximum", () => {
        const schema = number().max(10);
        expect(schema.parse(10)).toBe(10);
        expect(schema.parse(9)).toBe(9);
        expect(schema.parse(0)).toBe(0);
        expect(schema.parse(-100)).toBe(-100);
      });

      test("throws on numbers greater than maximum", () => {
        const schema = number().max(10);
        expect(() => schema.parse(11)).toThrow("Number must be <= 10, got 11");
        expect(() => schema.parse(100)).toThrow(
          "Number must be <= 10, got 100",
        );
      });

      test("works with negative maximums", () => {
        const schema = number().max(-5);
        expect(schema.parse(-5)).toBe(-5);
        expect(schema.parse(-10)).toBe(-10);
        expect(() => schema.parse(-4)).toThrow("Number must be <= -5, got -4");
        expect(() => schema.parse(0)).toThrow("Number must be <= -5, got 0");
      });

      test("works with decimal maximums", () => {
        const schema = number().max(9.99);
        expect(schema.parse(9.99)).toBe(9.99);
        expect(schema.parse(9.98)).toBe(9.98);
        expect(() => schema.parse(10)).toThrow(
          "Number must be <= 9.99, got 10",
        );
      });
    });

    describe("min() and max() combined", () => {
      test("accepts numbers within range", () => {
        const schema = number().min(5).max(10);
        expect(schema.parse(5)).toBe(5);
        expect(schema.parse(7)).toBe(7);
        expect(schema.parse(10)).toBe(10);
      });

      test("throws on numbers below minimum", () => {
        const schema = number().min(5).max(10);
        expect(() => schema.parse(4)).toThrow("Number must be >= 5, got 4");
      });

      test("throws on numbers above maximum", () => {
        const schema = number().min(5).max(10);
        expect(() => schema.parse(11)).toThrow("Number must be <= 10, got 11");
      });

      test("works when chained in reverse order", () => {
        const schema = number().max(10).min(5);
        expect(schema.parse(7)).toBe(7);
        expect(() => schema.parse(4)).toThrow("Number must be >= 5, got 4");
        expect(() => schema.parse(11)).toThrow("Number must be <= 10, got 11");
      });

      test("works with negative ranges", () => {
        const schema = number().min(-10).max(-5);
        expect(schema.parse(-7)).toBe(-7);
        expect(() => schema.parse(-11)).toThrow(
          "Number must be >= -10, got -11",
        );
        expect(() => schema.parse(-4)).toThrow("Number must be <= -5, got -4");
      });
    });
  });

  describe("boolean()", () => {
    test("parses valid boolean", () => {
      const schema = boolean();
      expect(schema.parse(true)).toBe(true);
      expect(schema.parse(false)).toBe(false);
    });

    test("throws on non-boolean values", () => {
      const schema = boolean();
      expect(() => schema.parse("true")).toThrow(
        "Expected boolean, got string",
      );
      expect(() => schema.parse(1)).toThrow("Expected boolean, got number");
      expect(() => schema.parse(0)).toThrow("Expected boolean, got number");
      expect(() => schema.parse(null)).toThrow("Expected boolean, got object");
      expect(() => schema.parse(undefined)).toThrow(
        "Expected boolean, got undefined",
      );
      expect(() => schema.parse({})).toThrow("Expected boolean, got object");
      expect(() => schema.parse([])).toThrow("Expected boolean, got object");
    });
  });
});

describe("array()", () => {
  test("parses valid array of strings", () => {
    const schema = array(string());
    expect(schema.parse(["hello", "world"])).toEqual(["hello", "world"]);
    expect(schema.parse([])).toEqual([]);
    expect(schema.parse([""])).toEqual([""]);
  });

  test("parses valid array of numbers", () => {
    const schema = array(number());
    expect(schema.parse([1, 2, 3])).toEqual([1, 2, 3]);
    expect(schema.parse([0, -5, 3.14])).toEqual([0, -5, 3.14]);
    expect(schema.parse([])).toEqual([]);
  });

  test("parses valid array of booleans", () => {
    const schema = array(boolean());
    expect(schema.parse([true, false, true])).toEqual([true, false, true]);
    expect(schema.parse([])).toEqual([]);
  });

  test("parses array of objects", () => {
    const schema = array(
      object({
        name: string(),
        age: number(),
      }),
    );

    const result = schema.parse([
      { name: "Ruan", age: 20 },
      { name: "Bot", age: 1 },
    ]);

    expect(result).toEqual([
      { name: "Ruan", age: 20 },
      { name: "Bot", age: 1 },
    ]);
  });

  test("parses nested arrays", () => {
    const schema = array(array(number()));
    expect(schema.parse([[1, 2], [3, 4], []])).toEqual([[1, 2], [3, 4], []]);
    expect(schema.parse([])).toEqual([]);
  });

  test("throws on non-array values", () => {
    const schema = array(string());
    expect(() => schema.parse("not an array")).toThrow(
      "Expected array, got string",
    );
    expect(() => schema.parse(123)).toThrow("Expected array, got number");
    expect(() => schema.parse(true)).toThrow("Expected array, got boolean");
    expect(() => schema.parse(null)).toThrow("Expected array, got object");
    expect(() => schema.parse(undefined)).toThrow(
      "Expected array, got undefined",
    );
    expect(() => schema.parse({})).toThrow("Expected array, got object");
  });

  test("throws on invalid array item type", () => {
    const schema = array(string());
    expect(() => schema.parse(["valid", 123])).toThrow(
      "Expected string, got number",
    );
    expect(() => schema.parse([true, "valid"])).toThrow(
      "Expected string, got boolean",
    );
  });

  test("throws on invalid nested array item", () => {
    const schema = array(array(number()));
    expect(() => schema.parse([[1, 2], ["invalid"]])).toThrow(
      "Expected number, got string",
    );
  });

  test("throws on invalid object in array", () => {
    const schema = array(
      object({
        name: string(),
        age: number(),
      }),
    );

    expect(() =>
      schema.parse([{ name: "Ruan", age: 20 }, { name: "Bot" }]),
    ).toThrow("Missing required key: age");

    expect(() => schema.parse([{ name: "Ruan", age: "invalid" }])).toThrow(
      "Expected number, got string",
    );
  });

  test("works with optional items", () => {
    const schema = array(optional(string()));
    expect(schema.parse([undefined, "hello", undefined])).toEqual([
      undefined,
      "hello",
      undefined,
    ]);
  });

  test("handles empty arrays", () => {
    expect(array(string()).parse([])).toEqual([]);
    expect(array(number()).parse([])).toEqual([]);
    expect(array(object({ name: string() })).parse([])).toEqual([]);
  });

  test("validates all items in large array", () => {
    const schema = array(number());
    const validArray = Array.from({ length: 100 }, (_, i) => i);
    expect(schema.parse(validArray)).toEqual(validArray);

    const invalidArray = [...validArray, "invalid"];
    expect(() => schema.parse(invalidArray)).toThrow(
      "Expected number, got string",
    );
  });
});

describe("optional()", () => {
  test("allows undefined for optional fields", () => {
    const schema = optional(string());
    expect(schema.parse(undefined)).toBeUndefined();
    expect(schema.parse("hello")).toBe("hello");
  });

  test("validates non-undefined values", () => {
    const schema = optional(number());
    expect(schema.parse(undefined)).toBeUndefined();
    expect(schema.parse(42)).toBe(42);
    expect(() => schema.parse("42")).toThrow("Expected number, got string");
  });

  test("marks schema as optional", () => {
    const schema = optional(string());
    expect(schema._isOptional).toBe(true);
  });
});

describe("object()", () => {
  test("parses valid object with all required fields", () => {
    const schema = object({
      name: string(),
      age: number(),
      active: boolean(),
    });

    const result = schema.parse({
      name: "Ruan",
      age: 20,
      active: true,
    });

    expect(result).toEqual({
      name: "Ruan",
      age: 20,
      active: true,
    });
  });

  test("parses object with optional fields present", () => {
    const schema = object({
      name: string(),
      age: optional(number()),
    });

    const result = schema.parse({
      name: "Ruan",
      age: 30,
    });

    expect(result).toEqual({
      name: "Ruan",
      age: 30,
    });
  });

  test("parses object with optional fields missing", () => {
    const schema = object({
      name: string(),
      age: optional(number()),
    });

    const result = schema.parse({
      name: "Ruan",
    });

    expect(result).toEqual({
      name: "Ruan",
      age: undefined,
    });
  });

  test("throws on missing required field", () => {
    const schema = object({
      name: string(),
      age: number(),
    });

    expect(() => schema.parse({ name: "Ruan" })).toThrow(
      "Missing required key: age",
    );
    expect(() => schema.parse({ age: 20 })).toThrow(
      "Missing required key: name",
    );
    expect(() => schema.parse({})).toThrow("Missing required key");
  });

  test("throws on non-object values", () => {
    const schema = object({
      name: string(),
    });

    expect(() => schema.parse(null)).toThrow("Expected object, got object");
    expect(() => schema.parse("not an object")).toThrow(
      "Expected object, got string",
    );
    expect(() => schema.parse(123)).toThrow("Expected object, got number");
    expect(() => schema.parse(true)).toThrow("Expected object, got boolean");
    expect(() => schema.parse(undefined)).toThrow(
      "Expected object, got undefined",
    );
  });

  test("throws on array instead of object", () => {
    const schema = object({
      name: string(),
    });

    // Arrays pass the typeof === "object" check but fail on missing keys
    expect(() => schema.parse([])).toThrow("Missing required key: name");
    expect(() => schema.parse([1, 2, 3])).toThrow("Missing required key: name");
  });

  test("throws on invalid field type", () => {
    const schema = object({
      name: string(),
      age: number(),
    });

    expect(() => schema.parse({ name: "Ruan", age: "20" })).toThrow(
      "Expected number, got string",
    );
    expect(() => schema.parse({ name: 123, age: 20 })).toThrow(
      "Expected string, got number",
    );
    expect(() => schema.parse({ name: "Ruan", age: true })).toThrow(
      "Expected number, got boolean",
    );
  });

  test("handles empty object schema", () => {
    const schema = object({});
    expect(schema.parse({})).toEqual({});
  });

  test("ignores extra fields in input", () => {
    const schema = object({
      name: string(),
    });

    const result = schema.parse({
      name: "Ruan",
      extraField: "should be ignored",
      anotherExtra: 123,
    });

    expect(result).toEqual({
      name: "Ruan",
    });
  });

  test("validates complex object with multiple types", () => {
    const schema = object({
      username: string(),
      age: number(),
      active: boolean(),
      email: optional(string()),
      score: optional(number()),
    });

    const result = schema.parse({
      username: "ruan_dev",
      age: 28,
      active: false,
      email: "ruan@example.com",
    });

    expect(result).toEqual({
      username: "ruan_dev",
      age: 28,
      active: false,
      email: "ruan@example.com",
      score: undefined,
    });
  });
});

describe("Edge Cases", () => {
  test("handles objects with null prototype", () => {
    const schema = object({
      name: string(),
    });

    const obj = Object.create(null);
    obj.name = "Ruan";

    expect(schema.parse(obj)).toEqual({ name: "Ruan" });
  });

  test("handles special number values", () => {
    const schema = number();
    expect(schema.parse(Infinity)).toBe(Infinity);
    expect(schema.parse(-Infinity)).toBe(-Infinity);
    expect(schema.parse(NaN)).toBeNaN();
  });

  test("validates nested optional with undefined", () => {
    const schema = object({
      outer: optional(
        object({
          inner: string(),
        }),
      ),
    });

    const result = schema.parse({});
    expect(result).toEqual({ outer: undefined });
  });
});
