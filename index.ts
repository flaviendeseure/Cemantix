import { serve } from "https://deno.land/std@0.119.0/http/server.ts";

async function handler(_req: Request): Promise<Response> {
  const guess = await extractGuess(_req);
  const similarity_ = await similarity(guess, "chien");
  return new Response(String(responseBuilder(similarity_, guess)));
}

function responseBuilder(similarity, word){
  const response = "Le mot " + word + " est proche à "+ Math.round(100*similarity) +"% du mot chien";
  return response
}

async function similarity(word1: string, word2:string){
  const body = {
    sim1: word1,
    sim2: word2,
    lang: "fr",
    type: "General Word2Vec",
  };
  const similarityResponse = await fetch(
    "http://nlp.polytechnique.fr/similarityscore",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );
  const similarityResponseJson = await similarityResponse.json();
  return Number(similarityResponseJson.simscore);
}

const extractGuess = async (req: Request) => {
  const slackPayload = await req.formData();
  const guess = await slackPayload.get("text")?.toString();
  if (!guess) {
    throw Error("Guess is empty or null");
  }
  return guess;
};

serve(handler);

