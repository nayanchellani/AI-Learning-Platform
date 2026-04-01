import axios from "axios";
import { searchVideos } from "./youtubeService.js";
import SearchCache from "../models/SearchCache.js";

export const smartSearch = async (query) => {
    try {
        const normalizedQuery = query.toLowerCase().trim();

        // 1. Check Cache first
        const cachedSearch = await SearchCache.findOne({ query: normalizedQuery });
        if (cachedSearch) {
            console.log(`[Cache Hit] Returning cached results for: ${normalizedQuery}`);
            return cachedSearch.results;
        }

        console.log(`[Cache Miss] Fetching fresh results for: ${normalizedQuery}`);

        // 2. Fetch from YouTube
        const videos = await searchVideos(query, 6); // Ask youtube logic for top 6

        // 3. Fetch from Serper API (Docs + Articles)
        let organic = [];
        try {
            const response = await axios.post(
                "https://google.serper.dev/search",
                { q: `${query} programming tutorial` },
                {
                    headers: {
                        "X-API-KEY": process.env.SERPER_API_KEY,
                        "Content-Type": "application/json"
                    },
                }
            );
            organic = response.data.organic || [];
        } catch (serperError) {
            console.error("Serper API failed to fetch:", serperError.response?.data || serperError.message);
            // Non-fatal, we'll just return videos and empty arrays for docs/articles
        }

        // 4. Filter Docs
        const docs = organic.filter(item => item?.link && (
            item.link.includes("w3schools.com") ||
            item.link.includes("geeksforgeeks.org") ||
            item.link.includes("developer.mozilla.org") ||
            item.link.includes("react.dev") ||
            item.link.includes("expressjs.com") ||
            item.link.includes("nodejs.org")
        )).map(item => ({
            title: item.title,
            snippet: item.snippet,
            link: item.link,
            source: new URL(item.link).hostname.replace('www.', '')
        }));

        // 5. Filter Articles
        const articles = organic.filter(item => item?.link && (
            item.link.includes("freecodecamp.org") ||
            item.link.includes("medium.com") ||
            item.link.includes("dev.to") ||
            item.link.includes("hashnode.com") || 
            item.link.includes("stackoverflow.com")
        )).map(item => ({
            title: item.title,
            snippet: item.snippet,
            link: item.link,
            source: new URL(item.link).hostname.replace('www.', '')
        }));

        const results = {
            videos: videos.slice(0, 6),
            docs: docs.slice(0, 6),
            articles: articles.slice(0, 6),
        };

        // 6. Save to Cache (Fire and forget, don't await blocking response if we don't have to)
        SearchCache.create({ query: normalizedQuery, results }).catch(err => console.error("Cache save error:", err));

        return results;

    } catch (err) {
        console.error("Smart Search Error:", err);
        throw new Error("Smart search failed");
    }
};
