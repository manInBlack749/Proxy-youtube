const express = require("express");

const app = express();

app.use((req, res, next) => {
    res.header(
        "Access-Control-Allow-Origin",
        "*"
    );

    res.header(
        "Access-Control-Allow-Methods",
        "GET, OPTIONS"
    );

    res.header(
        "Access-Control-Allow-Headers",
        "Content-Type"
    );

    if (req.method === "OPTIONS") {
        return res.sendStatus(204);
    }

    next();
});

const PORT = process.env.PORT || 10000;

app.get("/api/loc-search", async (req, res) => {
    const query = req.query.q || "";
    const limit = Math.min(
        parseInt(req.query.limit || "6", 10),
        20
    );

    if (!query.trim()) {
        return res.status(400).json({
            error: "Missing search query"
        });
    }

    try {
        const locUrl = new URL(
            "https://www.loc.gov/search/"
        );

        locUrl.searchParams.set("q", query);
        locUrl.searchParams.set("fo", "json");
        locUrl.searchParams.set("c", String(limit));

        console.log(
            `[LoC] Searching: ${query}`
        );

        const response = await fetch(locUrl);

        if (!response.ok) {
            throw new Error(
                `Library of Congress returned ${response.status}`
            );
        }

        const data = await response.json();

        const results = Array.isArray(data.results)
            ? data.results
            : [];

        const normalized = results.map(item => {

            const imageUrls = Array.isArray(item.image_url)
                ? item.image_url
                : [];

            const bestImage =
                imageUrls[imageUrls.length - 1] || "";

            const cleanImage =
                bestImage.split("#")[0];

            const subjects = Array.isArray(item.subject)
                ? item.subject
                : [];

            const formats = Array.isArray(item.original_format)
                ? item.original_format
                : [];

            return {
                id:
                    item.id ||
                    item.url ||
                    item.title,

                title:
                    item.title ||
                    "",

                thumbnail:
                    cleanImage,

                url:
                    cleanImage,

                landing_url:
                    item.url ||
                    "",

                creator:
                    Array.isArray(item.contributor)
                        ? item.contributor.join(", ")
                        : item.contributor || "",

                source:
                    "loc",

                license:
                    item.rights_information ||
                    item.rights_advisory ||
                    (
                        item.unrestricted
                            ? "No known restrictions"
                            : ""
                    ),

                tags: [
                    ...subjects,
                    ...formats,
                    ...(Array.isArray(item.location)
                        ? item.location
                        : [])
                ],

                date:
                    item.date ||
                    "",

                unrestricted:
                    item.unrestricted === true
            };
        });

        res.json({
            query,
            count: normalized.length,
            results: normalized
        });

    } catch (error) {

        console.error(
            "[LoC] Search failed:",
            error
        );

        res.status(502).json({
            error: "Library of Congress search failed",
            message: error.message
        });
    }
});

app.get("/", (req, res) => {
    res.json({
        status: "ok",
        service: "Visual Finder LoC Proxy"
    });
});

app.listen(PORT, () => {
    console.log(
        `LoC Proxy running on port ${PORT}`
    );
});
