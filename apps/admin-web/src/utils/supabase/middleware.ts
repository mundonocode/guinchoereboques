import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { Database } from '@guincho-reboques/supabase'

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    // Adiciona o pathname nos headers para acesso em Server Components
    supabaseResponse.headers.set('x-pathname', request.nextUrl.pathname)

    const supabase = createServerClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder',
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // IMPORTANT: Avoid writing any logic between createServerClient and
    // supabase.auth.getUser(). A simple mistake can make it very hard to debug
    // issues with users being logged out.

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (
        !user &&
        request.nextUrl.pathname !== '/' &&
        !request.nextUrl.pathname.startsWith('/login') &&
        !request.nextUrl.pathname.startsWith('/auth') &&
        !request.nextUrl.pathname.startsWith('/cadastro-motorista') &&
        !request.nextUrl.pathname.startsWith('/para-empresas') &&
        !request.nextUrl.pathname.startsWith('/cadastro') &&
        !request.nextUrl.pathname.startsWith('/manifest.webmanifest') &&
        !request.nextUrl.pathname.startsWith('/icon')
    ) {
        // no user, potentially respond by redirecting the user to the login page
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        return NextResponse.redirect(url)
    }

    if (user) {
        // Fetch the user role to enforce RBAC
        const { data: profile } = await supabase
            .from('perfis')
            .select('role')
            .eq('id', user.id)
            .single()

        const role = profile?.role
        const pathname = request.nextUrl.pathname

        // Se é um cliente tentando acessar /motorista, manda de volta pro /cliente
        if (pathname.startsWith('/motorista') && role !== 'motorista' && role !== 'admin') {
            const url = request.nextUrl.clone()
            url.pathname = role === 'cliente' ? '/cliente' : '/'
            return NextResponse.redirect(url)
        }

        // Se é um motorista tentando acessar /cliente, manda de volta pro /motorista
        if (pathname.startsWith('/cliente') && role !== 'cliente' && role !== 'admin') {
            const url = request.nextUrl.clone()
            url.pathname = role === 'motorista' ? '/motorista' : '/'
            return NextResponse.redirect(url)
        }
    }

    // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
    // creating a new response object with NextResponse.next() make sure to:
    // 1. Pass the request in it, like so:
    //    const myNewResponse = NextResponse.next({ request })
    // 2. Copy over the cookies, like so:
    //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
    // 3. Change the myNewResponse object to fit your needs, but avoid changing
    //    the cookies!
    // 4. Finally:
    //    return myNewResponse
    // If this is not done, you may be causing the browser and server to go out
    // of sync and terminate the user's session.

    return supabaseResponse
}
