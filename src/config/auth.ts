import { loadAuthEnvironment } from "@/features/auth/server/authEnvironment";
import { createAuthOptions } from "@/features/auth/server/createAuthOptions";

export const authEnvironment = loadAuthEnvironment(process.env);
export const authOptions = createAuthOptions(authEnvironment);
