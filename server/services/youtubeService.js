import axios from "axios";

const YOUTUBE_BASE_URL = "https://www.googleapis.com/youtube/v3";

// ── Duration boundaries ──
const MIN_DURATION_SECONDS = 600;    // 10 minutes hard minimum
const MAX_DURATION_SECONDS = 72000;  // 20 hours hard maximum

// ── Preferred channel IDs (verified) ──
// Using channelId for post-fetch boosting, NOT injected into search query
const PREFERRED_CHANNEL_IDS = new Set([
    "UCeVMnSShP_Iviwkknt83cww",  // CodeWithHarry
    "UCBwmMxybNva6P_5VmxjzwqA",  // Apna College
    "UCvjgXvBlCQM4mW1Z3rOSIIg",  // Sheryians Coding School
    "UCWv7vMbMWH4-V0ZXdmDpPBA",  // Programming with Mosh
    "UCFKE7WVJfvaHW5q283SxchA",  // Kunal Kushwaha
    "UC59K-uG2A5ogwIrHw4bmlEg",  // Telusko
    "UCnz-ZXXER4jOvuED5trXfEA",  // techTFQ
    "UCvjgXvBlCQM4mW1Z3rOSIIg",  // BroCode
    "UC8butISFwT-Wl7EV0hUK0BQ",  // freeCodeCamp
    "UCW5YeuERMmlnqo4oq8vwUpg",  // Net Ninja
    "UC29ju8bIPH5as8OGnQzwJyA",  // Traversy Media
    "UCsBjURrPoezykLs9EqgamOA",  // Fireship
    "UCFbNIlppjAuEX4znoulh0Cw",  // Web Dev Simplified
    "UCVTlvUkGslCV_h-nSAId8Sw",  // LearnCodeOnline (Hitesh Choudhary / Chai aur Code)
]);

// ── Blocklist — titles containing any of these words are filtered out ──
const TITLE_BLOCKLIST = [
    "gameplay", "walkthrough", "playthrough", "let's play", "lets play",
    "movie review", "film review", "web series", "episode", "reaction",
    "trailer", "teaser", "unboxing", "vlog", "prank", "challenge",
    "ASMR", "mukbang", "cooking", "recipe", "workout",
    "shorts", "#shorts", "#short",
    "live stream", "livestream",
];

// Compiled regex from blocklist for fast matching
const BLOCKLIST_REGEX = new RegExp(TITLE_BLOCKLIST.join("|"), "i");

/**
 * Parse ISO 8601 duration (e.g. "PT1H12M30S") to total seconds.
 */
const parseDuration = (ptString) => {
    if (!ptString || ptString === "PT0S") return 0;
    const match = ptString.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 0;
    const h = parseInt(match[1]) || 0;
    const m = parseInt(match[2]) || 0;
    const s = parseInt(match[3]) || 0;
    return h * 3600 + m * 60 + s;
};

/**
 * Detect if query is a broad/general topic (1-2 words) vs a specific niche query.
 * Broad topics: "react", "python", "system design", "javascript"
 * Niche topics: "react useCallback hook", "python decorators explained", "binary search tree"
 */
const isBroadTopic = (query) => {
    const words = query.trim().split(/\s+/);
    // 1-2 words = broad, 3+ words = niche
    return words.length <= 2;
};

/**
 * Build clean query params based on whether the topic is broad or niche.
 * NO channel names are injected into the query — ever.
 */
const buildSearchParams = (query, fetchCount, apiKey) => {
    const broad = isBroadTopic(query);

    if (broad) {
        // Broad topic → search for full courses / crash courses
        return {
            part: "snippet",
            q: `${query} full course tutorial programming -movie -trailer -gameplay -reaction -vlog`,
            type: "video",
            videoDuration: "long",          // 20+ minutes — allows crash courses (1hr, 3hr, 10hr)
            videoType: "any",
            relevanceLanguage: "en",
            order: "relevance",
            maxResults: fetchCount,
            key: apiKey,
        };
    } else {
        // Niche topic → search for focused, targeted tutorials
        return {
            part: "snippet",
            q: `${query} explained tutorial programming -movie -trailer -gameplay -reaction -vlog`,
            type: "video",
            videoDuration: "medium",        // 4-20 minutes — focused explainers
            videoType: "any",
            relevanceLanguage: "en",
            order: "relevance",
            maxResults: fetchCount,
            key: apiKey,
        };
    }
};

/**
 * Search YouTube for educational programming videos.
 * 
 * Architecture:
 * 1. Detect broad vs niche query → use different videoDuration params
 * 2. Fetch via YouTube Data API (no channel names polluting query)
 * 3. Enrich with contentDetails + statistics
 * 4. Post-filter: duration range [10min, 20hr], title blocklist
 * 5. Post-boost: preferred educational channels get priority sorting
 */
export const searchVideos = async (query, maxResults = 12) => {
    try {
        const API_KEY = process.env.YOUTUBE_API_KEY;

        // Over-fetch 4x to compensate for aggressive post-filtering
        const fetchCount = Math.min(maxResults * 4, 50);

        const searchParams = buildSearchParams(query, fetchCount, API_KEY);

        const searchRes = await axios.get(`${YOUTUBE_BASE_URL}/search`, {
            params: searchParams
        });

        const items = searchRes.data.items;
        if (!items || items.length === 0) return [];

        // Get video IDs for detailed info
        const videoIds = items.map(item => item.id.videoId).join(",");

        const detailsRes = await axios.get(`${YOUTUBE_BASE_URL}/videos`, {
            params: {
                part: "contentDetails,statistics",
                id: videoIds,
                key: API_KEY
            }
        });

        // Build full video objects
        const allVideos = items.map(item => {
            const details = detailsRes.data.items.find(d => d.id === item.id.videoId);
            const durationSec = parseDuration(details?.contentDetails?.duration || "PT0S");
            return {
                videoId: item.id.videoId,
                title: item.snippet.title,
                description: item.snippet.description,
                thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
                channelTitle: item.snippet.channelTitle,
                channelId: item.snippet.channelId,
                publishedAt: item.snippet.publishedAt,
                duration: details?.contentDetails?.duration || "PT0S",
                durationSec,
                views: details?.statistics?.viewCount || "0"
            };
        });

        // ── Post-filtering pipeline ──
        const filtered = allVideos.filter(v => {
            // 1. Duration: must be between 10 min and 20 hours
            if (v.durationSec < MIN_DURATION_SECONDS) return false;
            if (v.durationSec > MAX_DURATION_SECONDS) return false;

            // 2. Title blocklist: reject gaming/movie/vlog content
            if (BLOCKLIST_REGEX.test(v.title)) return false;

            return true;
        });

        // ── Post-boost: sort preferred channels to top, then by views ──
        const sorted = filtered.sort((a, b) => {
            const aPreferred = PREFERRED_CHANNEL_IDS.has(a.channelId) ? 1 : 0;
            const bPreferred = PREFERRED_CHANNEL_IDS.has(b.channelId) ? 1 : 0;

            // Preferred channels first
            if (aPreferred !== bPreferred) return bPreferred - aPreferred;

            // Then by view count (higher = better for educational content)
            return parseInt(b.views) - parseInt(a.views);
        });

        // Remove internal fields and return
        return sorted.slice(0, maxResults).map(({ durationSec, channelId, ...rest }) => rest);

    } catch (error) {
        console.error("YouTube Service Error:", error.response?.data || error.message);
        throw new Error("Failed to fetch videos from YouTube");
    }
};

export const getTrendingVideos = async (maxResults = 10) => {
    try {
        const API_KEY = process.env.YOUTUBE_API_KEY;

        const response = await axios.get(`${YOUTUBE_BASE_URL}/videos`, {
            params: {
                part: "snippet,statistics,contentDetails",
                chart: "mostPopular",
                maxResults,
                key: API_KEY
            }
        });

        return response.data.items.map(video => ({
            videoId: video.id,
            title: video.snippet.title,
            description: video.snippet.description,
            thumbnail: video.snippet.thumbnails.medium?.url || video.snippet.thumbnails.high?.url || video.snippet.thumbnails.default?.url,
            channelTitle: video.snippet.channelTitle,
            publishedAt: video.snippet.publishedAt,
            views: video.statistics?.viewCount || "0",
            duration: video.contentDetails?.duration || "PT0S"
        }));
    } catch (error) {
        console.error("YouTube Trending Error:", error.response?.data || error.message);
        throw new Error("Failed to fetch trending videos");
    }
};