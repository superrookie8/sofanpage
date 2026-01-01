import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
	providers: [
		GoogleProvider({
			clientId: process.env.GOOGLE_CLIENT_ID!,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
		}),
		CredentialsProvider({
			name: "Credentials",
			credentials: {
				nickname: { label: "Nickname", type: "text" },
				password: { label: "Password", type: "password" },
			},
			async authorize(credentials) {
				if (!credentials?.nickname || !credentials?.password) {
					return null;
				}

				try {
					const response = await fetch(
						`${process.env.NEXT_PUBLIC_BACKAPI_URL}/api/login`,
						{
							method: "POST",
							headers: { "Content-Type": "application/json" },
							body: JSON.stringify({
								nickname: credentials.nickname,
								password: credentials.password,
							}),
						}
					);

					if (!response.ok) return null;

					const data = await response.json();
					if (data.access_token) {
						return {
							id: credentials.nickname,
							name: credentials.nickname,
							email: `${credentials.nickname}@local`,
							accessToken: data.access_token,
						};
					}
					return null;
				} catch (error) {
					return null;
				}
			},
		}),
	],
	callbacks: {
		async jwt({ token, user }) {
			if (user) {
				token.accessToken = (user as any).accessToken;
			}
			return token;
		},
		async session({ session, token }) {
			(session as any).accessToken = token.accessToken;
			return session;
		},
	},
	session: {
		strategy: "jwt",
	},
};

export default NextAuth(authOptions);
