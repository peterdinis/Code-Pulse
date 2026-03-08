import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db";
import { env } from "~/env";
import * as schema from "../db/schema";

const baseURL = env.BETTER_AUTH_URL.replace(/\/$/, "");
const githubCallbackURL =
  env.GITHUB_CALLBACK_URL?.replace(/\/$/, "") ??
  `${baseURL}/api/auth/callback/github`;

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "sqlite",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification
    }
  }),
  secret: env.BETTER_AUTH_SECRET,
  baseURL,
  basePath: "/api/auth",
  emailAndPassword: {
    enabled: true
  },
  socialProviders: {
    github: {
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
      redirectURI: githubCallbackURL,
      scope: ["user:email"],
      overrideUserInfoOnSignIn: true,
      mapProfileToUser: (profile) => ({
        emailVerified: true
      })
    }
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5
    }
  },
  trustedOrigins: ["http://localhost:3000"]
});

export type Session = typeof auth.$Infer.Session;