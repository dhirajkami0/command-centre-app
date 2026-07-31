"use strict";

const Embeddings = {};

/*----------------------------------------------------------
Configuration
----------------------------------------------------------*/

Embeddings.MODEL = "text-embedding-3-small";

/*----------------------------------------------------------
Create Embedding
----------------------------------------------------------*/

Embeddings.embed = async function (
    client,
    text
) {

    const response =
        await client.embeddings.create({

            model: Embeddings.MODEL,

            input: text

        });

    return (
        response.data?.[0]?.embedding ||
        []
    );

};

/*----------------------------------------------------------
Batch Embeddings
----------------------------------------------------------*/

Embeddings.embedBatch = async function (
    client,
    chunks = []
) {

    const results = [];

    for (const chunk of chunks) {

        const embedding =
            await Embeddings.embed(
                client,
                chunk.text
            );

        results.push({

            ...chunk,

            embedding

        });

    }

    return results;

};

/*----------------------------------------------------------
Cosine Similarity
----------------------------------------------------------*/

Embeddings.cosineSimilarity = function (
    a = [],
    b = []
) {

    if (
        !a.length ||
        !b.length ||
        a.length !== b.length
    ) {
        return 0;
    }

    let dot = 0;
    let magA = 0;
    let magB = 0;

    for (let i = 0; i < a.length; i++) {

        dot += a[i] * b[i];
        magA += a[i] * a[i];
        magB += b[i] * b[i];

    }

    magA = Math.sqrt(magA);
    magB = Math.sqrt(magB);

    if (magA === 0 || magB === 0) {
        return 0;
    }

    return dot / (magA * magB);

};

/*----------------------------------------------------------
Normalize Vector
----------------------------------------------------------*/

Embeddings.normalize = function (
    vector = []
) {

    if (!vector.length) {
        return [];
    }

    let magnitude = 0;

    for (const value of vector) {
        magnitude += value * value;
    }

    magnitude = Math.sqrt(magnitude);

    if (magnitude === 0) {
        return vector;
    }

    return vector.map(v => v / magnitude);

};

/*----------------------------------------------------------
Top Matches
----------------------------------------------------------*/

Embeddings.topMatches = function (
    queryEmbedding = [],
    documents = [],
    limit = 5
) {

    return documents

        .map(doc => ({

            ...doc,

            score: Embeddings.cosineSimilarity(
                queryEmbedding,
                doc.embedding || []
            )

        }))

        .sort((a, b) => b.score - a.score)

        .slice(0, limit);

};

/*----------------------------------------------------------
Exports
----------------------------------------------------------*/

module.exports = Embeddings;