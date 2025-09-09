import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  try {
    // Create a response object that we'll modify and return
    let response = NextResponse.next()

    // Create a Supabase client for the middleware
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name) {
            return request.cookies.get(name)?.value
          },
          set(name, value, options) {
            // If the cookie is updated, update the response headers
            response.cookies.set({
              name,
              value,
              ...options,
            })
          },
          remove(name, options) {
            // If the cookie is removed, update the response headers
            response.cookies.delete(name)
          },
        },
      }
    )

    // Get the user session
    const { data } = await supabase.auth.getSession()

    // Handle redirects for unauthenticated users
    if (
      !data.session &&
      request.nextUrl.pathname !== "/" &&
      !request.nextUrl.pathname.startsWith("/auth") &&
      !request.nextUrl.pathname.startsWith("/cars") &&
      !request.nextUrl.pathname.startsWith("/_next")
    ) {
      const redirectUrl = new URL("/auth/login", request.url)
      return NextResponse.redirect(redirectUrl)
    }

    return response
  } catch (error) {
    console.error("Middleware error:", error)
    // Return the original response if there's an error
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
