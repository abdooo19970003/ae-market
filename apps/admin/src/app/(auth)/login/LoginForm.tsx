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
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/lib/auth/auth.provider'
import { cn } from '@/lib/utils'
import { useForm } from '@tanstack/react-form'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import z from 'zod'

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
})

const LoginForm = ({
  className,
  ...props
}: Readonly<{
  className?: string
}>) => {
  const router = useRouter()
  const { login } = useAuth()
  const defaultValues = {
    email: '',
    password: '',
  }
  const form = useForm({
    defaultValues,
    onSubmit: async (data) => {
      await login(data.value.email, data.value.password)

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
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
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
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid
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
                        aria-invalid={isInvalid}
                      />
                      <FieldError errors={field.state.meta.errors} />
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
                <Button type='submit'>Login</Button>

                <FieldDescription className='mt-6 float-end text-xs'>
                  Don&apos;t have an account?{' '}
                  <Link href='/register'>Sign up</Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default LoginForm
