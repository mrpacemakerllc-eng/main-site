import NextAuth, { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

const isDemoMode = process.env.DEMO_MODE === "true" ||
  (process.env.NODE_ENV === 'production' && process.env.DATABASE_URL?.includes('file:'))

// Demo mode auth - simple mock auth
const demoAuthOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Demo",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // In demo mode, accept any login
        if (credentials?.email) {
          return {
            id: "demo-user",
            email: credentials.email,
            name: "Demo User",
            role: "student",
          }
        }
        return null
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role || "student"
      }
      return token
    },
    async session({ session, token }) {
      if (session?.user) {
        (session.user as any).id = token.sub || "demo-user";
        (session.user as any).role = token.role || "student"
      }
      return session
    }
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET || "demo-secret-key",
}

// Use demo auth in demo mode, otherwise load full auth
let authOptions: NextAuthOptions

if (isDemoMode) {
  authOptions = demoAuthOptions
} else {
  // Dynamic import to avoid prisma initialization in demo mode
  const { authOptions: fullAuthOptions } = require("@/lib/auth")
  authOptions = fullAuthOptions
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
