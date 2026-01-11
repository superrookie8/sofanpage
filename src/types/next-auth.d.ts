// src/types/next-auth.d.ts
import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
	interface Session {
		accessToken?: string;
		user: {
			id: string;
			email?: string | null;
			name?: string | null;
		};
	}

	interface User {
		id: string;
		accessToken?: string;
	}
}

declare module "next-auth/jwt" {
	interface JWT {
		accessToken?: string;
		id?: string;
	}
}
