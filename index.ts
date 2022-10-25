import { serve } from "https://deno.land/std@0.119.0/http/server.ts";

async function handler(_req: Request): Promise<Response> {
  //await getStateGame();
  const guess = await extractGuess(_req);
  const word_to_guess = await getCurrentWord();
  const similarity_ = await similarity(guess, word_to_guess);
  const [state, word] = await getState();
  return new Response(String(await responseBuilder(similarity_, guess, state+word+String(state==="1"))));
}

// Read file a.txt with deno and take a word at random
const getRandomWord = async () => {
  const file = await Deno.readTextFile("liste_francais.txt");
  const words = file.split("\n");
  return words[Math.floor(Math.random() * words.length)];
};

// Set state,word in the state.txt file
const setState = async (state: string, word: string) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(state + "," + word);
  await Deno.writeTextFile("state.txt", data);
};

// Get state,word from the state.txt file
const getState = async () => {
  const decoder = new TextDecoder("utf-8");
  const data = await Deno.readFile("state.txt");
  return decoder.decode(data).split(",");
};

// Handle the case where the user wants to start a new game
const getStateGame = async () => {
  // if state equal to 1, the game is over
  const [state, word] = await getState();
  if (state === "1") {
    await setState("0", await getRandomWord());
  };
};

// Get current word
const getCurrentWord = async () => {
  const [state, word] = await getState();
  return word;
};

async function responseBuilder(similarity, word, sol){
  const response = "Le mot " + word + " est proche à "+ Math.round(100*similarity) +"% du mot à deviner ("+sol+")";
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

