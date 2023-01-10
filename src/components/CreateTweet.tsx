import React, { useState } from 'react'
import { api } from '../utils/api'
import * as z from 'zod'

export const tweetSchema = z.object({
  text: z
    .string({
      required_error: 'Tweet must be at least 10 characters long',
    })
    .min(10, {
      message: 'Tweet must be at least 10 characters long',
    })
    .max(280, {
      message: 'Tweet must be at most 280 characters long',
    }),
})

export function CreateTweet() {
  const [text, setText] = useState<string>('')
  const [error, setError] = useState<string>('')

  const { mutateAsync } = api.tweet.create.useMutation()

  const handleTweet = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    try {
      tweetSchema.parse({ text })
    } catch (error) {
      error && setError('error')
      return
    }
    await mutateAsync({ text })
    setText('')
  }

  return (
    <>
      {error && JSON.stringify(error)}
      <form
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onSubmit={handleTweet}
        className="flex flex-col w-full p-4 mb-4 border-2 rounded-md"
      >
        <textarea
          onChange={(e) => setText(e.target.value)}
          value={text}
          className="w-full p-4 shadow"
        />
        <div className="flex justify-end mt-4">
          <button
            type="submit"
            className="px-4 py-2 text-white rounded-md bg-primary"
          >
            Tweet
          </button>
        </div>
      </form>
    </>
  )
}
