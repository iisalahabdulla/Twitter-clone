import { signIn, useSession } from 'next-auth/react'
import React from 'react'
import Container from './Container'

const LoggedOutBanner = () => {
  const { data: session } = useSession()
  if (session) return null

  return (
    <div className="fixed bottom-0 w-full p-4 bg-primary">
      <Container classNames="bg-transparent  flex items-center justify-between">
        <p className="text-white">Do not miss out .</p>
        <div>
          <button
            className="px-4 py-2 text-white shadow-md"
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            onClick={() => signIn()}
          >
            Login
          </button>
        </div>
      </Container>
    </div>
  )
}

export default LoggedOutBanner
