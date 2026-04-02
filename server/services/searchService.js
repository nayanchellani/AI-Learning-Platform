import axios from "axios";
import { searchVideos } from "./youtubeService.js";
import SearchCache from "../models/SearchCache.js";

export const smartSearch = async (query) => {
    try {
        const normalizedQuery = query.toLowerCase().trim();

        const cachedSearch = await SearchCache.findOne({ query: normalizedQuery });
        if (cachedSearch) {
            return cachedSearch.results;
        }

        const videos = await searchVideos(query, 6);

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
        }

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

        const results = {
            videos: videos.slice(0, 6),
            docs: docs.slice(0, 6),
        };

        SearchCache.create({ query: normalizedQuery, results }).catch(err => console.error("Cache save error:", err));

        return results;

    } catch (err) {
        console.error("Smart Search Error:", err);
        throw new Error("Smart search failed");
    }
};
