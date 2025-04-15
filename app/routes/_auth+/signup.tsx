import { Label } from '@radix-ui/react-label'
import { Form, redirect } from 'react-router'
import { HoneypotInputs } from 'remix-utils/honeypot/react'
import { type Route } from './+types/signup'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { checkHoneypot } from '~/utils/honeypot.server'

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData()

  await checkHoneypot(formData)

  return redirect('/')
}

export default function SignupRoute() {
  return (
    <div className="container flex min-h-full flex-col justify-center pt-20 pb-32">
      <div className="mx-auto w-full max-w-lg">
        <div className="flex flex-col gap-3 text-center">
          <h1 className="text-h1">Welcome aboard!</h1>
          <p className="text-body-md text-muted-foreground">
            Please enter your details.
          </p>
        </div>
        <Form
          method="POST"
          className="mx-auto flex max-w-sm min-w-[368px] flex-col gap-4"
        >
          <HoneypotInputs />
          <div>
            <Label htmlFor="email-input">Email</Label>
            <Input autoFocus id="email-input" name="email" type="email" />
          </div>
          <Button className="w-full" type="submit">
            Create an account
          </Button>
        </Form>
      </div>
    </div>
  )
}
