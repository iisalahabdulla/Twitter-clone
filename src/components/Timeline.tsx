import React, { useEffect } from 'react'
import { CreateTweet } from './CreateTweet'
import { api, RouterOutputs } from '../utils/api'
import Image from 'next/image'
import reletiveTime from 'dayjs/plugin/relativeTime'
import updateLocale from 'dayjs/plugin/updateLocale'
import dayjs from 'dayjs'
import { AiFillHeart } from 'react-icons/ai'
import { QueryClient } from '@tanstack/react-query'

dayjs.extend(reletiveTime)
dayjs.extend(updateLocale)
dayjs.updateLocale('en', {
  relativeTime: {
    future: 'in %s',
    past: '%s ago',
    s: 'a few seconds',
    m: '1m',
    mm: '%dm',
    h: '1h',
    hh: '%dh',
    d: '1d',
    dd: '%dd',
    M: '1m',
    MM: '%dm',
    y: '1y',
    yy: '%dy',
  },
})

const useScrollPosition = () => {
  const [scrollPosition, setScrollPosition] = React.useState(0)

  const handleScroll = () => {
    const height =
      document.documentElement.scrollHeight -
      document.documentElement.clientHeight

    const winScroll =
      document.body.scrollTop || document.documentElement.scrollTop

    const scrolled = (winScroll / height) * 100

    setScrollPosition(scrolled)
  }
  React.useEffect(() => {
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return scrollPosition
}

const updateCache = (
  client: QueryClient,
  data: {
    userId: string
  },
  vaiables: {
    tweetId: string
  },
  action: 'like' | 'unlike',
) => {}
client.setQueryData(['tweet', 'timeline', { limit: 10 }], (oldData: any) => {
    const newPages = oldData.pages.map(
      (page: { tweets: { id: string; likes: { id: string }[] }[] }) => {
        const newTweets = page.tweets.map((tweet) => {
          if (tweet.id === vaiables.tweetId) {
            if (action === 'like') {
              return {
                ...tweet,
                likes: [...tweet.likes, { id: data.userId }],
              }
            } else {
              return {
                ...tweet,
                likes: tweet.likes.filter((like) => like.id !== data.userId),
              }
            }
          }
          return tweet
        })
        return {
          ...page,
          tweets: newTweets,
        }
      }
    );
    return {
      ...oldData,
      pages: newPages,
    }
  })
}


const Tweet = ({
  tweet,
}: {
  tweet: RouterOutputs['tweet']['timeline']['tweets'][number]
}) => {
  const likeMutation = api.tweet.like.useMutation().mutateAsync
  const unlikeMutation = api.tweet.unlike.useMutation().mutateAsync
  const hasLiked = tweet.likes.length > 0
  return (
    <div className="mb-4 border-b-2 border-gray-500">
      <div className="flex p-2">
        {tweet.author.image && tweet.author.name && (
          <Image
            src={tweet.author.image}
            alt={`${tweet.author.name} profile picture`}
            width={48}
            height={48}
            className="rounded-full"
          />
        )}
        <div className="ml-2">
          <div className="flex items-center ">
            <p className="font-bold">{tweet.author.name}</p>
            <p className="text-sm text-gray400">
              - {dayjs(tweet.createdAt).fromNow()}
            </p>
          </div>
          <div>
            <p>{tweet.text}</p>
          </div>
        </div>
      </div>
      <div className="flex items-center p-2 mt-4">
        <AiFillHeart
          color={hasLiked ? 'red' : 'gray'}
          size="1.5rem"
          onClick={() =>
            hasLiked
              ? unlikeMutation({
                  tweetId: tweet.id,
                })
              : likeMutation({
                  tweetId: tweet.id,
                })
          }
        />
        <span className="text-sm text-gray-500">
          {10}
          {/* {tweet.likes.length} {tweet.likes.length === 1 ? 'like' : 'likes'} */}
        </span>
      </div>
    </div>
  )
}

const Timeline = () => {
  const {
    data,
    hasNextPage,
    fetchNextPage,
    isFetching,
  } = api.tweet.timeline.useInfiniteQuery(
    {
      limit: 10,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    },
  )

  const scrollPosition = useScrollPosition()
  const tweets = data?.pages.flatMap((page) => page.tweets) ?? []

  useEffect(() => {
    if (scrollPosition > 90 && hasNextPage && !isFetching) {
      fetchNextPage()
    }
  }, [scrollPosition, hasNextPage, isFetching, fetchNextPage])

  return (
    <div>
      <CreateTweet />
      <div className="border-t-2 border-l-2 border-r-2 border-gray-500 ">
        {tweets.map((tweet) => {
          return <Tweet key={tweet.id} tweet={tweet} />
        })}
        {!hasNextPage && (
          <div className="text-center text-gray-400">No more tweets</div>
        )}
      </div>
    </div>
  )
}

export default Timeline
