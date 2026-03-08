import { env } from "~/env";

const MOCK_RESPONSE = `## Code review summary

- **Style**: Changes look consistent with the codebase.
- **Potential issues**: Consider adding tests for the new logic.
- **Suggestions**: Extract repeated logic into a helper if it grows.

*This is a placeholder review. Set \`OPENAI_API_KEY\` in .env for real AI analysis.*`;

export async function runAiReview(params: {
	prTitle: string | null;
	prNumber: number;
	diffText: string | null;
}): Promise<string> {
	const apiKey = env.OPENAI_API_KEY;
	const diff = params.diffText?.trim() ?? "";
	const context = `PR #${params.prNumber}${params.prTitle ? `: ${params.prTitle}` : ""}`;

	if (!apiKey || !diff) {
		// Simulate short delay for UX
		await new Promise((r) => setTimeout(r, 800));
		return MOCK_RESPONSE;
	}

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
					{
						role: "system",
						content:
							"You are a code reviewer. Analyze the provided diff and return a concise review in Markdown: summary, potential issues, and suggestions. Be constructive.",
					},
					{
						role: "user",
						content: `Review this pull request (${context}):\n\n\`\`\`diff\n${diff.slice(0, 12000)}\n\`\`\``,
					},
				],
				max_tokens: 1500,
			}),
		});

		if (!res.ok) {
			const err = (await res.json()) as { error?: { message?: string } };
			throw new Error(err?.error?.message ?? res.statusText);
		}

		const data = (await res.json()) as {
			choices?: Array<{ message?: { content?: string } }>;
		};
		const text =
			data.choices?.[0]?.message?.content?.trim() ?? MOCK_RESPONSE;
		return text;
	} catch (e) {
		const msg = e instanceof Error ? e.message : "AI review failed";
		return `## Review could not be completed\n\n${msg}`;
	}
}
