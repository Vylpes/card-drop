import { CardRarity } from "../constants/CardRarity";
import { CardMetadata, SeriesMetadata } from "../contracts/SeriesMetadata";

export class CardMetadataValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "CardMetadataValidationError";
    }
}

/**
 * Validates parsed card metadata JSON.
 *
 * Policy:
 * - `type` / CardRarity must already be a JSON number in range — string values
 *   like `"1"` are rejected, never coerced (they would break under `===`).
 * - Series `id` may be a numeric string (`"28"`) and is coerced to an integer,
 *   matching legacy metadata files in the wild.
 *
 * Callers should treat a validation failure like a JSON parse failure: abort
 * the load for that file (which activates safe mode).
 */
export function validateSeriesMetadataFile(parsed: unknown, filePath: string): SeriesMetadata[] {
    if (!Array.isArray(parsed)) {
        throw new CardMetadataValidationError(
            `${filePath}: root value must be an array of series objects`,
        );
    }

    return parsed.map((series, index) => validateSeries(series, filePath, index));
}

function validateSeries(value: unknown, filePath: string, index: number): SeriesMetadata {
    if (value === null || typeof value !== "object" || Array.isArray(value)) {
        throw new CardMetadataValidationError(
            `${filePath}: series at index ${index} must be an object`,
        );
    }

    const series = value as Record<string, unknown>;
    const seriesLabel = describeSeries(series, index);
    const seriesId = coerceIntegerId(series.id);

    if (seriesId === undefined) {
        throw new CardMetadataValidationError(
            `${filePath}: ${seriesLabel}: id must be an integer or numeric string, got ${describeValue(series.id)}`,
        );
    }

    if (typeof series.name !== "string" || series.name.length === 0) {
        throw new CardMetadataValidationError(
            `${filePath}: ${seriesLabel}: name must be a non-empty string, got ${describeValue(series.name)}`,
        );
    }

    if (!Array.isArray(series.cards)) {
        throw new CardMetadataValidationError(
            `${filePath}: ${seriesLabel}: cards must be an array`,
        );
    }

    const cards = series.cards.map((card, cardIndex) =>
        validateCard(card, filePath, seriesId, cardIndex),
    );

    return {
        id: seriesId,
        name: series.name,
        cards,
    };
}

function validateCard(
    value: unknown,
    filePath: string,
    seriesId: number,
    cardIndex: number,
): CardMetadata {
    if (value === null || typeof value !== "object" || Array.isArray(value)) {
        throw new CardMetadataValidationError(
            `${filePath}: series ${seriesId}: card at index ${cardIndex} must be an object`,
        );
    }

    const card = value as Record<string, unknown>;
    const cardLabel = describeCard(card, seriesId, cardIndex);

    if (typeof card.id !== "string" || card.id.length === 0) {
        throw new CardMetadataValidationError(
            `${filePath}: ${cardLabel}: id must be a non-empty string, got ${describeValue(card.id)}`,
        );
    }

    if (typeof card.name !== "string" || card.name.length === 0) {
        throw new CardMetadataValidationError(
            `${filePath}: ${cardLabel}: name must be a non-empty string, got ${describeValue(card.name)}`,
        );
    }

    if (!isValidCardRarity(card.type)) {
        throw new CardMetadataValidationError(
            `${filePath}: ${cardLabel}: type must be an integer CardRarity (0–5), got ${describeValue(card.type)}`,
        );
    }

    if (typeof card.path !== "string" || card.path.length === 0) {
        throw new CardMetadataValidationError(
            `${filePath}: ${cardLabel}: path must be a non-empty string, got ${describeValue(card.path)}`,
        );
    }

    const result: CardMetadata = {
        id: card.id,
        name: card.name,
        type: card.type,
        path: card.path,
    };

    if (card.subseries !== undefined) {
        if (typeof card.subseries !== "string") {
            throw new CardMetadataValidationError(
                `${filePath}: ${cardLabel}: subseries must be a string when present, got ${describeValue(card.subseries)}`,
            );
        }
        result.subseries = card.subseries;
    }

    if (card.colour !== undefined) {
        if (typeof card.colour !== "string") {
            throw new CardMetadataValidationError(
                `${filePath}: ${cardLabel}: colour must be a string when present, got ${describeValue(card.colour)}`,
            );
        }
        result.colour = card.colour;
    }

    return result;
}

export function isValidCardRarity(value: unknown): value is CardRarity {
    return typeof value === "number"
        && Number.isInteger(value)
        && typeof CardRarity[value] === "string";
}

/** Accepts integers or digit-only strings (e.g. `"28"` → `28`). */
export function coerceIntegerId(value: unknown): number | undefined {
    if (typeof value === "number" && Number.isInteger(value)) {
        return value;
    }

    if (typeof value === "string" && /^-?\d+$/.test(value)) {
        return Number(value);
    }

    return undefined;
}

function describeSeries(series: Record<string, unknown>, index: number): string {
    if (typeof series.id === "number" || typeof series.id === "string") {
        return `series ${series.id}`;
    }

    return `series at index ${index}`;
}

function describeCard(card: Record<string, unknown>, seriesId: number, cardIndex: number): string {
    if (typeof card.id === "string" || typeof card.id === "number") {
        return `series ${seriesId} card ${card.id}`;
    }

    return `series ${seriesId} card at index ${cardIndex}`;
}

function describeValue(value: unknown): string {
    if (value === undefined) {
        return "undefined";
    }

    return JSON.stringify(value);
}
