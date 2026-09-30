const DEFAULT_TTL = 30_000;

export const readCache = (key, ttl = DEFAULT_TTL) => {
    try {
        const raw = localStorage.getItem(key);
        if (!raw) return null;

        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== "object" || !("value" in parsed) || !("expiresAt" in parsed)) {
            return null;
        }

        if (Date.now() > parsed.expiresAt) {
            localStorage.removeItem(key);
            return null;
        }

        if (Date.now() > parsed.expiresAt) {
            localStorage.removeItem(key);
            return null;
        }

        return parsed.value;
    } catch (error) {
        return null;
    }
};

export const writeCache = (key, value, ttl = DEFAULT_TTL) => {
    try {
        const payload = {
            value,
            expiresAt: Date.now() + ttl,
        };
        localStorage.setItem(key, JSON.stringify(payload));
    } catch (error) {
        console.warn("Cache write failed", error);
    }
};

export const clearCacheKey = (key) => {
    try {
        localStorage.removeItem(key);
    } catch (error) {
        console.warn("Cache remove failed", error);
    }
};
