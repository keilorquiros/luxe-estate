import { createHash } from "crypto";
import content from "../data/property-detail-content.json";
import type { Locale } from "./i18n-config";

const locales: Locale[] = ["en", "es", "fr", "ja"];

export type PropertyDetailI18nInput = {
  slug: string;
  title: string;
  location: string;
  description_i18n?: Partial<Record<Locale, string>> | Record<string, string> | null;
  amenities_detail_i18n?: Partial<Record<Locale, string[]>> | Record<string, string[]> | null;
};

export function slugSeedUInt32(input: string): number {
  const hex = createHash("md5").update(input, "utf8").digest("hex").slice(0, 8);
  /* >>> 0 converts to unsigned 32-bit — must stay aligned with `scripts/build-property-i18n-migration.mjs` */
  return parseInt(hex, 16) >>> 0;
}

function interpolatePlaceholders(template: string, title: string, location: string): string {
  return template.replace(/\{\{title\}\}/g, title).replace(/\{\{location\}\}/g, location);
}

/** Deterministic subset of phrases; mirrors `scripts/build-property-i18n-migration.mjs` for Postgres backfills */
export function deterministicAmenityIndices(slug: string, poolSize: number, count = 4): number[] {
  const picked: number[] = [];
  let salt = 0;
  while (picked.length < Math.min(count, poolSize)) {
    const idx = slugSeedUInt32(`${slug}:${salt}`) % poolSize;
    if (!picked.includes(idx)) picked.push(idx);
    salt += 1;
    if (salt > 512) throw new Error("amenity permutation failed — increase salt bound");
  }
  return picked;
}

function localizedFromRecord<T>(
  bundle: Partial<Record<Locale, T>> | Record<string, T> | null | undefined,
  locale: Locale,
): T | null {
  if (!bundle || typeof bundle !== "object") return null;
  const preferred = bundle[locale] ?? (bundle as Record<string, unknown>).en;
  if (preferred !== undefined && preferred !== null) return preferred as T;
  for (const l of locales) {
    const v = bundle[l];
    if (v !== undefined && v !== null) return v as T;
  }
  return null;
}

function normalizeParagraphs(description: string): string[] {
  return description.split(/\n\n+/).map((s) => s.trim()).filter(Boolean);
}

export function resolvePropertyDescription(property: PropertyDetailI18nInput, locale: Locale): string {
  const raw = localizedFromRecord<string>(property.description_i18n as Partial<Record<Locale, string>> | undefined, locale);
  if (raw && typeof raw === "string" && raw.trim().length > 0) {
    return interpolatePlaceholders(raw.trim(), property.title, property.location);
  }

  const tpls = content.descriptionTemplates;
  const i = slugSeedUInt32(property.slug) % tpls.length;
  const tpl = tpls[i][locale as keyof (typeof tpls)[number]] ?? tpls[i].en;
  return interpolatePlaceholders(tpl as string, property.title, property.location);
}

export function resolvePropertyAmenities(property: PropertyDetailI18nInput, locale: Locale): string[] {
  const phrases = localizedFromRecord<string[]>(
    property.amenities_detail_i18n as Partial<Record<Locale, string[]>> | undefined,
    locale,
  );
  if (phrases?.length) return phrases.map((line) => String(line));

  const pool = content.amenityPhrases;
  const indices = deterministicAmenityIndices(property.slug, pool.length);
  return indices.map((idx) => {
    const row = pool[idx][locale as keyof typeof pool[typeof idx]] ?? pool[idx].en;
    return String(row);
  });
}

export function propertyDescriptionParagraphs(property: PropertyDetailI18nInput, locale: Locale): string[] {
  return normalizeParagraphs(resolvePropertyDescription(property, locale));
}
