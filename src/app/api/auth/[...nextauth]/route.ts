import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "dummy-client-id",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "dummy-client-secret",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials) return null;

        const expectedUsername = "admin";
        const expectedPassword = process.env.ADMIN_PASSWORD || "password";

        if (
          credentials.username === expectedUsername &&
          credentials.password === expectedPassword
        ) {
          return { id: "admin-id", name: "Administrator", email: "admin@example.com" };
        }
        return null;
      }
    })
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        const allowedEmail = process.env.ALLOWED_ADMIN_EMAIL || "";
        if (!user.email || user.email !== allowedEmail) {
          return false; // Blocks sign in if email does not match guardrail
        }
      }
      return true;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = "admin";
      }
      return session;
    }
  },
  pages: {
    signIn: "/admin/login",
  },
  secret: process.env.NEXTAUTH_SECRET || "dummy-secret-key-for-local-testing",
});

export { handler as GET, handler as POST };
