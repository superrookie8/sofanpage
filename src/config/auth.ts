// src/config/auth.ts
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { axiosConfig } from "@/config/http/axiosConfig";
import axios from "axios";

// 순환 참조 방지를 위한 임시 axios 인스턴스 생성 함수
const createAuthAxiosInstance = (token?: string) => {
	const instance = axios.create(axiosConfig);
	if (token) {
		instance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
	}
	return instance;
};

export const authOptions: NextAuthOptions = {
	...(process.env.NEXTAUTH_URL
		? {}
		: process.env.NODE_ENV === "development"
		? {
				// 개발 환경에서 자동으로 localhost URL 설정
				url:
					typeof window !== "undefined"
						? window.location.origin
						: process.env.VERCEL_URL
						? `https://${process.env.VERCEL_URL}`
						: "http://localhost:3000",
		  }
		: {}),
	providers: [
		// Credentials Provider (이메일/비밀번호)
		CredentialsProvider({
			name: "Credentials",
			credentials: {
				email: { label: "Email", type: "email" },
				password: { label: "Password", type: "password" },
			},
			async authorize(credentials) {
				if (!credentials?.email || !credentials?.password) {
					return null;
				}

				try {
					const authInstance = createAuthAxiosInstance();
					const response = await authInstance.post("/api/users/login", {
						email: credentials.email,
						password: credentials.password,
					});

					const data = response.data;

					if (data.token) {
						// 사용자 정보 가져오기
						const userInstance = createAuthAxiosInstance(data.token);
						const userResponse = await userInstance.get("/api/users/me");

						if (userResponse.data) {
							const userData = userResponse.data;
							return {
								id: data.userId || userData.userId,
								email: data.email || userData.email,
								name: data.nickname || userData.nickname,
								accessToken: data.token,
							};
						}
					}

					return null;
				} catch (error) {
					console.error("Login error:", error);
					return null;
				}
			},
		}),

		// Google Provider
		GoogleProvider({
			clientId: process.env.GOOGLE_CLIENT_ID || "",
			clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
			authorization: {
				params: {
					prompt: "consent",
					access_type: "offline",
					response_type: "code",
				},
			},
		}),
	],

	callbacks: {
		async jwt({ token, user, account }) {
			// 초기 로그인 시
			if (user) {
				token.accessToken = user.accessToken;
				token.id = user.id;
			}

			// OAuth 로그인 시
			if (account && account.provider === "google") {
				try {
					const authInstance = createAuthAxiosInstance();
					const response = await authInstance.post("/oauth2/callback/google", {
						code: account.access_token,
					});

					const data = response.data;
					if (data.token) {
						token.accessToken = data.token;
					}
				} catch (error) {
					console.error("OAuth callback error:", error);
				}
			}

			return token;
		},

		async session({ session, token }) {
			if (session.user) {
				session.user.id = token.id as string;
				session.accessToken = token.accessToken as string;
			}
			return session;
		},
	},

	pages: {
		signIn: "/login",
		error: "/login",
	},

	session: {
		strategy: "jwt",
		maxAge: 30 * 24 * 60 * 60, // 30일
	},

	// NEXTAUTH_SECRET이 없으면 경고하고 기본값 사용 (개발 환경)
	secret:
		process.env.NEXTAUTH_SECRET ||
		(process.env.NODE_ENV === "development"
			? "dev-secret-key-change-in-production"
			: undefined),

	// 개발 환경에서 쿠키 문제 해결
	cookies: {
		sessionToken: {
			name:
				process.env.NODE_ENV === "production"
					? `__Secure-next-auth.session-token`
					: `next-auth.session-token`,
			options: {
				httpOnly: true,
				sameSite: "lax",
				path: "/",
				secure: process.env.NODE_ENV === "production",
			},
		},
	},
};
