// import NextAuth from "next-auth";

// import { authConfig } from "@/app/(auth)/auth.config";

// export default NextAuth(authConfig).auth;

// export const config = {
//   matcher: ["/", "/:id", "/api/:path*", "/login", "/register"],
// };

import { NextResponse } from "next/server";
import { auth } from "./app/(auth)/auth"; // Ensure this path is correct

export default async function middleware(req: Request) {
  const session = await auth(); // Fetch the authentication session
  const url = new URL(req.url);

  const isLoggedIn = !!session?.user;
  const protectedRoutes = ["/in", "/study-material"]; // Routes requiring authentication

  console.log("Checking authentication for:", url.pathname);
  console.log("User logged in?", isLoggedIn);

  if (protectedRoutes.includes(url.pathname) && !isLoggedIn) {
    console.log("Redirecting to login...");
    return NextResponse.redirect(new URL("/login", req.url)); // Redirect to login if not signed in
  }

  return NextResponse.next(); // Continue request if authorized
}

// Apply middleware only to specific routes
export const config = {
  matcher: ["/in", "/study-material", "/api/:path*"], // Ensure it's applied correctly
};
