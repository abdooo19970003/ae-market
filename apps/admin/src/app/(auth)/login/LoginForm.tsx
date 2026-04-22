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
import { cn } from '@/lib/utils'
import { useForm } from '@tanstack/react-form'
import { defaultValues, loginSchema } from './login.utils'
import { login } from './login.action'

const LoginForm = ({
  className,
  ...props
}: Readonly<{
  className?: string
}>) => {
  const form = useForm({
    defaultValues,
    onSubmit: async (data) => login(data.value),
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
              <Field>
                <Button type='submit'>Login</Button>
                <Button
                  variant='outline'
                  type='button'
                >
                  Login with Google
                </Button>
                <FieldDescription className='text-center'>
                  Don&apos;t have an account? <a href='#'>Sign up</a>
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
