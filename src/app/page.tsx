/**
 * Root page (/) — immediately redirects to /login.
 *
 * This is a Server Component. Since the app doesn't have a landing page,
 * the root route simply sends users to the login screen. proxy.ts handles
 * redirecting already-authenticated users to /dashboard instead.
 */

import { redirect } from "next/navigation";

export default function Home() {
  redirect("/login");
}
