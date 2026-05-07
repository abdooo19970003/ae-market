'use client'
import { redirect } from 'next/navigation'
const page = () => {
  redirect('/dashboard')
  return null
}

export default page
