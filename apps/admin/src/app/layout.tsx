import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/contexts/ThemeProvider'
import { ThemeToggle } from '@/components/ThemeToggler'
import { AuthProvider } from '@/lib/auth/auth.provider'
import { Toaster } from 'sonner'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'AE-Market | Admin',
  description: 'Admin Dashboard for AE-Market',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      suppressHydrationWarning
      lang='en'
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className='h-screen w-screen overflow-hidden'>
        <AuthProvider>
          <ThemeProvider
            attribute={'class'}
            defaultTheme='system'
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster
              position='top-right'
              richColors
            />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
