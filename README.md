# Leticia

Leticia validates your data with a developer experience inspired by Zod. You define schemas once, then parse unknown data safely. It handles objects, arrays, strings, numbers, and booleans with clear error messages.

## Quick start

```typescript
import { l } from "leticia";

const userSchema = l.object({
  name: l.string().min(2).max(50),
  email: l.string().email(),
  age: l.number().min(18).max(120),
  isActive: l.boolean(),
  tags: l.array(l.string()).min(1),
});

try {
  const user = userSchema.parse({
    name: "Ruan",
    email: "dev.ruangustavo@gmail.com",
    age: 25,
    isActive: true,
    tags: ["developer", "typescript"],
  });
  console.log(user.name); // TypeScript knows this is a string
} catch (error) {
  console.error(error.message); // "Missing required key: email"
}
```

## API

### Basic schemas

```typescript
// Strings
const nameSchema = l.string().min(1).max(100);
const emailSchema = l.string().email();
const customString = l.string().regex("^[A-Z]+$");

// Numbers
const ageSchema = l.number().min(0).max(150);
const ratingSchema = l.number().min(1).max(5);

// Booleans
const isActiveSchema = l.boolean();

// Arrays
const tagsSchema = l.array(l.string()).min(1).max(10);
const numbersSchema = l.array(l.number());
```

### Objects

```typescript
const personSchema = l.object({
  firstName: l.string().min(1),
  lastName: l.string().min(1),
  email: l.string().email(),
  age: l.optional(l.number().min(0)),
});

const person = personSchema.parse({
  firstName: "Ruan",
  lastName: "Gustavo",
  email: "dev.ruangustavo@gmail.com",
  // age is optional
});
```

### Nested validation

```typescript
const teamSchema = l.object({
  name: l.string().min(1),
  members: l
    .array(
      l.object({
        name: l.string().min(1),
        role: l.string(),
        skills: l.array(l.string()).min(1),
      })
    )
    .min(1),
});

const team = teamSchema.parse({
  name: "Frontend Team",
  members: [
    {
      name: "Ruan",
      role: "Senior Developer",
      skills: ["React", "TypeScript"],
    },
  ],
});
```

## Error handling

Leticia throws descriptive errors when validation fails:

```typescript
try {
  const schema = l.object({
    email: l.string().email(),
    age: l.number().min(18),
  });

  schema.parse({
    email: "invalid-email",
    age: 16,
  });
} catch (error) {
  // Error: Invalid email format: invalid-email
  // Or: Number must be >= 18, got 16
}
```

## Type inference

Leticia infers TypeScript types automatically using `InferObjectType`:

```typescript
const userSchema = l.object({
  id: l.number(),
  name: l.string(),
  isAdmin: l.boolean(),
});

type User = InferObjectType<typeof userSchema>;
// TypeScript knows: { id: number, name: string, isAdmin: boolean }

function createUser(data: unknown): User {
  const user = userSchema.parse(data); // user is fully typed
  return user;
}
```

## Why Leticia?

You get a familiar API if you've used Zod, but with a focus on learning. I built Leticia to understand validation libraries deeply. The code shows how schema validation works internally, making it easier to customize for your specific needs.

It validates objects, arrays, and primitive types reliably. You chain methods to build complex validations, and get clear errors when things go wrong.
