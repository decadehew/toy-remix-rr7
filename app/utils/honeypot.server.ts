import { Honeypot, SpamError } from 'remix-utils/honeypot/server'

// Create a new Honeypot instance, the values here are the defaults, you can
// customize them

export const honeypot = new Honeypot({
  // randomizeNameFieldName: true,
  // nameFieldName: 'name__confirm',
  validFromFieldName: process.env.NODE_ENV === 'test' ? null : undefined, // null to disable it
  encryptionSeed: process.env.HONEYPOT_SECRET, // Ideally it should be unique even between processes
})

export async function checkHoneypot(formData: FormData) {
  try {
    await honeypot.check(formData)
  } catch (error) {
    if (error instanceof SpamError) {
      // handle spam requests here
      throw new Response('Form not submitted properly', { status: 400 })
    }

    throw error
  }
}
