// src/common/utils/time.utils.ts
export function convertToSeconds(time: string): number {
    const separateTime = parseTimeString(time);

    if (!separateTime) {
        throw new Error(
            `IllegalArgumentException: Invalid time format: ${time}`,
        );
    }

    const timeMap: Record<string, number> = {
        s: 1,
        m: 60,
        h: 3600,
        d: 86400,
        w: 604800,
    };

    const multiplier = timeMap[String(separateTime?.unit)];

    if (!multiplier) {
        throw new Error(`Unsupported type: ${separateTime?.unit}`);
    }

    return separateTime?.value * multiplier;
}

function parseTimeString(
    timeString: string,
): { value: number; unit: string } | null {
    const match = timeString.match(/^(\d+)([smhd])$/);

    if (!match) return null;

    return {
        value: parseInt(match[1], 10),
        unit: match[2],
    };
}
