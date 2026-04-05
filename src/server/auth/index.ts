import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { env } from "~/env";
import { db } from "../db";
import * as schema from "../db/schema";
import { getAuthBaseURLConfig } from "./base-url";
import { buildTrustedOrigins } from "./trusted-origins";

const baseURLConfig = getAuthBaseURLConfig();

/** Only when env is set — otherwise redirect_uri follows the incoming request (fixes localhost vs 127.0.0.1). */
const ghCallback = env.GITHUB_CALLBACK_URL?.trim();
const githubRedirectOverride = ghCallback
	? { redirectURI: ghCallback.replace(/\/$/, "") }
	: {};

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "pg",
		schema: {
			user: schema.user,
			session: schema.session,
			account: schema.account,
			verification: schema.verification,
		},
	}),
	secret: env.BETTER_AUTH_SECRET,
	baseURL: baseURLConfig,
	basePath: "/api/auth",
	emailAndPassword: {
		enabled: true,
	},
	socialProviders: {
		github: {
			clientId: env.GITHUB_CLIENT_ID,
			clientSecret: env.GITHUB_CLIENT_SECRET,
			...githubRedirectOverride,
			scope: ["user:email"],
			overrideUserInfoOnSignIn: true,
			mapProfileToUser: (_profile) => ({
				emailVerified: true,
			}),
		},
	},
	plugins: [nextCookies()],
	session: {
		expiresIn: 60 * 60 * 24 * 7,
		updateAge: 60 * 60 * 24,
		cookieCache: {
			enabled: true,
			maxAge: 60 * 5,
		},
	},
	trustedOrigins: buildTrustedOrigins(),
});

export type Session = typeof auth.$Infer.Session;
