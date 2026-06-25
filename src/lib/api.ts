import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function ok<T>(data: T, init?: number) {
  return NextResponse.json({ data }, { status: init ?? 200 });
}

export function created<T>(data: T) {
  return NextResponse.json({ data }, { status: 201 });
}

export function fail(message: string, status = 400, extra?: Record<string, unknown>) {
  return NextResponse.json({ error: message, ...extra }, { status });
}

export function unauthorized() {
  return fail("Unauthorized", 401);
}

export function forbidden() {
  return fail("Forbidden", 403);
}

export function notFound(message = "Not found") {
  return fail(message, 404);
}

/** Wrap a route handler to translate common errors into responses. */
export function handleError(err: unknown) {
  if (err instanceof ZodError) {
    return fail("Validation failed", 422, { issues: err.flatten() });
  }
  if (err instanceof Error) {
    if (err.message === "UNAUTHENTICATED") return unauthorized();
    if (err.message === "FORBIDDEN") return forbidden();
    console.error(err);
    return fail(err.message || "Internal error", 500);
  }
  console.error(err);
  return fail("Internal error", 500);
}
