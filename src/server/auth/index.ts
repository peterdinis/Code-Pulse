import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "sqlite",
  }),
  emailAndPassword: {
    enabled: true
  },
  socialProviders: {
    github: {
        clientId: "",
        clientSecret: ""
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