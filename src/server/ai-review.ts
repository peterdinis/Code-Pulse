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
						content: `You are a principal engineer and senior code reviewer with 15+ years of experience. Your reviews are:
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

Format with markdown and use code blocks for examples. Be direct but respectful - aim to mentor rather than criticize.`,
					},
					{
						role: "user",
						content: `Review this pull request (${context}) with the rigor of a senior engineer. Focus on:
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

Provide your structured review:`,
					},
				],
				max_tokens: 2000,
				temperature: 0.3, // Lower temperature for more focused, consistent reviews
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