import { env } from "~/env";

const SYSTEM_PROMPT = `You are a principal engineer and senior code reviewer with 15+ years of experience. Your reviews are:
- **Thorough but concise** - focus on what matters
- **Actionable** - provide specific recommendations with code examples
- **Educational** - explain the "why" behind suggestions
- **Balanced** - acknowledge good practices while pointing out improvements
- **Security & performance conscious** - spot potential issues early

Always structure your review in these sections:
1. **Summary** (1-2 sentences on overall changes)
2. **What's good** (2-3 specific positive observations)
3. **Critical issues** (blockers that must be fixed before merge)
4. **Suggestions for improvement** (best practices, performance, readability)
5. **Security considerations** (if applicable)
6. **Testing notes** (edge cases or scenarios to cover)

Format with markdown and use code blocks for examples. Be direct but respectful - aim to mentor rather than criticize.`;

const MOCK_RESPONSE = `## Code review summary

- **Style**: Changes look consistent with the codebase.
- **Potential issues**: Consider adding tests for the new logic.
- **Suggestions**: Extract repeated logic into a helper if it grows.

*Configure an AI provider (ChatGPT or Gemini) and add your API key in Dashboard settings for real AI analysis.*`;

export type AiReviewProvider = "openai" | "gemini";

export type AiReviewOptions = {
	provider: AiReviewProvider;
	openaiApiKey?: string | null;
	geminiApiKey?: string | null;
};

export async function runAiReview(
	params: {
		prTitle: string | null;
		prNumber: number;
		diffText: string | null;
	},
	options: AiReviewOptions,
): Promise<string> {
	const diff = params.diffText?.trim() ?? "";
	const context = `PR #${params.prNumber}${params.prTitle ? `: ${params.prTitle}` : ""}`;
	const userPrompt = `Review this pull request (${context}) with the rigor of a senior engineer. Focus on:
- Code correctness and potential bugs
- Architecture and design patterns
- Performance implications
- Security vulnerabilities
- Test coverage and edge cases
- Consistency with modern best practices

PR Diff:
\`\`\`diff
${diff.slice(0, 12000)}
\`\`\`

Provide your structured review:`;

	if (!diff) {
		await new Promise((r) => setTimeout(r, 800));
		return MOCK_RESPONSE;
	}

	if (options.provider === "openai") {
		const apiKey = options.openaiApiKey?.trim() || env.OPENAI_API_KEY;
		if (!apiKey) {
			await new Promise((r) => setTimeout(r, 800));
			return MOCK_RESPONSE;
		}
		return runOpenAiReview(apiKey, userPrompt);
	}

	if (options.provider === "gemini") {
		const apiKey = options.geminiApiKey?.trim();
		if (!apiKey) {
			await new Promise((r) => setTimeout(r, 800));
			return `## Review could not be completed\n\nNo Gemini API key configured. Add your API key in Dashboard → AI review settings. Get one at https://aistudio.google.com/app/apikey`;
		}
		return runGeminiReview(apiKey, userPrompt);
	}

	await new Promise((r) => setTimeout(r, 800));
	return MOCK_RESPONSE;
}

async function runOpenAiReview(
	apiKey: string,
	userPrompt: string,
): Promise<string> {
	try {
		const res = await fetch("https://api.openai.com/v1/chat/completions", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${apiKey}`,
			},
			body: JSON.stringify({
				model: "gpt-4o-mini",
				messages: [
					{ role: "system", content: SYSTEM_PROMPT },
					{ role: "user", content: userPrompt },
				],
				max_tokens: 2000,
				temperature: 0.3,
			}),
		});

		if (!res.ok) {
			const err = (await res.json()) as { error?: { message?: string } };
			throw new Error(err?.error?.message ?? res.statusText);
		}

		const data = (await res.json()) as {
			choices?: Array<{ message?: { content?: string } }>;
		};
		const text = data.choices?.[0]?.message?.content?.trim() ?? MOCK_RESPONSE;
		return text;
	} catch (e) {
		const msg = e instanceof Error ? e.message : "AI review failed";
		return `## Review could not be completed\n\n${msg}`;
	}
}

const GEMINI_MODEL = "gemini-1.5-flash";

async function runGeminiReview(
	apiKey: string,
	userPrompt: string,
): Promise<string> {
	try {
		const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(apiKey)}`;
		const res = await fetch(url, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				contents: [
					{
						parts: [{ text: userPrompt }],
					},
				],
				systemInstruction: {
					parts: [{ text: SYSTEM_PROMPT }],
				},
				generationConfig: {
					maxOutputTokens: 2000,
					temperature: 0.3,
				},
			}),
		});

		if (!res.ok) {
			const err = (await res.json()) as { error?: { message?: string } };
			throw new Error(err?.error?.message ?? res.statusText);
		}

		const data = (await res.json()) as {
			candidates?: Array<{
				content?: { parts?: Array<{ text?: string }> };
			}>;
		};
		const text =
			data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? MOCK_RESPONSE;
		return text;
	} catch (e) {
		const msg = e instanceof Error ? e.message : "AI review failed";
		return `## Review could not be completed\n\n${msg}`;
	}
}
