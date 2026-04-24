'use client'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/lib/auth/auth.provider'
import { cn } from '@/lib/utils'
import { useForm } from '@tanstack/react-form'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import z from 'zod'
// import { login } from './login.action'

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
})

const RegisterForm = ({
  className,
  ...props
}: Readonly<{
  className?: string
}>) => {
  const router = useRouter()
  const { register } = useAuth()
  const defaultValues = {
    email: '',
    password: '',
  }
  const form = useForm({
    defaultValues,
    onSubmit: async (data) => {
      await register(data.value.email, data.value.password)
      toast.success('Sign-up successful ', {
        description: `Welcome ${data.value.email.split('@')[0]}`,
      })
      router.push('/dashboard')
    },
    validators: {
      onSubmit: loginSchema,
    },
  })

  return (
    <div
      className={cn('flex flex-col gap-6', className)}
      {...props}
    >
      <Card>
        <CardHeader>
          <CardTitle>Register a new account</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
          <CardDescription>
            {' '}
            Don't forget to complete your info in profile page.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              e.stopPropagation()
              form.handleSubmit()
            }}
            className=''
          >
            <FieldGroup>
              <form.Field
                name='email'
                children={(field) => {
                  return (
                    <Field>
                      <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                      <Input
                        id={field.name}
                        type='email'
                        placeholder='m@example.com'
                        required
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                      />
                    </Field>
                  )
                }}
              />
              <form.Field
                name='password'
                children={(field) => {
                  return (
                    <Field>
                      <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                      <Input
                        id={field.name}
                        type='password'
                        placeholder='******'
                        required
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                      />
                    </Field>
                  )
                }}
              />
            </FieldGroup>
            <FieldGroup>
              <Field className='mt-6'>
                <Button type='submit'>Sign Up</Button>

                <FieldDescription className='mt-6 float-end text-xs'>
                  you have an account? <Link href='/login'>Sign in</Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default RegisterForm
