import { smartSearch } from "../services/searchService.js";

export const smartSearchController = async (req, res) => {
    try {
        const { q } = req.query;

        if (!q || !q.trim()) {
            return res.status(400).json({ message: "Search query is required" });
        }

        const results = await smartSearch(q);
        res.status(200).json(results);

    } catch (err) {
        res.status(500).json({ message: "Search failed due to internal error." });
    }
};
