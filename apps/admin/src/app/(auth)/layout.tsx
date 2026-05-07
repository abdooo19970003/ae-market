import React from 'react'
const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className=' flex min-h-svh w-full items-center justify-center p-6 md:p-10'>
      <div className='w-full max-w-sm'>
        <h1 className='text-2xl text-center my-8 tracking-widest text-shadow-2xs text-shadow-secondary'>
          <span className='text-primary me-2 text-3xl font-bold'>AE</span>{' '}
          Market
        </h1>
        {children}
      </div>
    </main>
  )
}

export default AuthLayout
