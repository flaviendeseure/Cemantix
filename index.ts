import {serve} from "https://deno.land/std@0.119.0/http/server.ts";

const similarity = async (word1: string, word2: string): Promise<string> => {
    const body = {
        sim1: word1,
        sim2: word2,
        lang: "fr",
        type: "General Word2Vec",
    };
    const similarityResponse = await fetch("http://nlp.polytechnique.fr/similarityscore", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    });
    const similarityResponseJson = await similarityResponse.json();
    return similarityResponseJson.simscore;
}

async function handler(_req: Request): Promise<Response> {
    return new Response(await similarity("hello", "world"));
}


serve(handler);