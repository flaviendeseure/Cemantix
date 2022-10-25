import { json, serve, validateRequest } from "https://deno.land/std@0.119.0/http/server.ts";

async function handler(_req: Request): Promise<Response> {
  const guess = await extractGuess(_req);
  const word_to_guess = await getRandomWord();
  const similarity_ = await similarity(guess, word_to_guess);
  return new Response(String(responseBuilder(similarity_, guess)));
}

// Read file a.txt with deno and take a word at random
const getRandomWord = async () => {
  const file = await Deno.readTextFile("a.txt");
  const words = file.split("\n");
  return words[Math.floor(Math.random() * words.length)];
};

/*
async function queryFauna(
  query: string,
  variables: { [key: string]: unknown },
): Promise<{
  data?: any;
  error?: any;
}> {
  // Grab the secret from the environment.
  const token = Deno.env.get("FAUNA_SECRET");
  if (!token) {
    throw new Error("environment variable FAUNA_SECRET not set");
  }

  try {
    // Make a POST request to fauna's graphql endpoint with body being
    // the query and its variables.
    const res = await fetch("https://graphql.fauna.com/graphql", {
      method: "POST",
      headers: {
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    const { data, errors } = await res.json();
    if (errors) {
      // Return the first error if there are any.
      return { data, error: errors[0] };
    }

    return { data };
  } catch (error) {
    return { error };
  }
}
*/


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

