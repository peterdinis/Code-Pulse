import {createAuthClient} from "better-auth/react"

export const client = createAuthClient({
    baseURL: process.env.BETTER_AUTH_URL,
})

export const {signIn, signOut, signUp, useSession, getSession} = client;