import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { env } from "~/env";
import { db } from "../db";
import * as schema from "../db/schema";
import { buildTrustedOrigins } from "./trusted-origins";

const baseURL = env.BETTER_AUTH_URL.replace(/\/$/, "");
const githubCallbackURL =
	env.GITHUB_CALLBACK_URL?.replace(/\/$/, "") ??
	`${baseURL}/api/auth/callback/github`;

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
	baseURL,
	basePath: "/api/auth",
	emailAndPassword: {
		enabled: true,
	},
	socialProviders: {
		github: {
			clientId: env.GITHUB_CLIENT_ID,
			clientSecret: env.GITHUB_CLIENT_SECRET,
			redirectURI: githubCallbackURL,
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
