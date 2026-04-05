import type { LLMConfig, LLMResponse } from "../types";

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

/** Call the OpenAI Chat Completions API */
async function callOpenAI(
  config: LLMConfig,
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ] satisfies ChatMessage[],
      temperature: config.temperature,
      max_tokens: config.maxTokens,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`OpenAI API error ${response.status}: ${errorBody}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content ?? "";
}

/** Call the Anthropic Messages API */
async function callAnthropic(
  config: LLMConfig,
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": config.apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: config.model,
      max_tokens: config.maxTokens,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Anthropic API error ${response.status}: ${errorBody}`);
  }

  const data = await response.json();
  return data.content?.[0]?.text ?? "";
}

/** Parse the LLM response to extract rewrite and rationale */
function parseResponse(rawResponse: string): LLMResponse {
  const rewriteMarker = "---REWRITE---";
  const rationaleMarker = "---RATIONALE---";

  const rewriteIdx = rawResponse.indexOf(rewriteMarker);
  const rationaleIdx = rawResponse.indexOf(rationaleMarker);

  let rewrittenText: string;
  let rationale: string;

  if (rewriteIdx !== -1 && rationaleIdx !== -1) {
    rewrittenText = rawResponse
      .slice(rewriteIdx + rewriteMarker.length, rationaleIdx)
      .trim();
    rationale = rawResponse
      .slice(rationaleIdx + rationaleMarker.length)
      .trim();
  } else if (rewriteIdx !== -1) {
    rewrittenText = rawResponse.slice(rewriteIdx + rewriteMarker.length).trim();
    rationale = "No rationale provided.";
  } else {
    // No markers found — treat entire response as rewrite
    rewrittenText = rawResponse.trim();
    rationale = "Response format did not match expected markers.";
  }

  return {
    rewrittenText,
    rationale,
    tokensUsed: 0, // We don't have token count from raw response
  };
}

/** Main entry point: call LLM based on config provider */
export async function callLLM(
  config: LLMConfig,
  systemPrompt: string,
  userPrompt: string
): Promise<LLMResponse> {
  let rawResponse: string;

  if (config.provider === "anthropic") {
    rawResponse = await callAnthropic(config, systemPrompt, userPrompt);
  } else {
    rawResponse = await callOpenAI(config, systemPrompt, userPrompt);
  }

  return parseResponse(rawResponse);
}
