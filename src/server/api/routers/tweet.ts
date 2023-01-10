import { z } from 'zod'
import { tweetSchema } from '../../../components/CreateTweet';
import {createTRPCRouter as router, protectedProcedure, publicProcedure } from '../trpc'


export const tweetRouter =  router({

    create: protectedProcedure
    .input(tweetSchema )
    .mutation(({ctx,input})=> {
        const {prisma, session} = ctx;
        const {text } = input;
        const userId = session.user.id;
        return prisma.tweet.create({
            data: {
                text,
                author:{
                    connect:{
                        id: userId
                    }
                }
            }
        })
    }),
    timeline: publicProcedure.input(
        z.object({
            cursor: z.string().nullish(),
            limit: z.number().min(1).max(100).default(10),
        })
    ).query( async ({ctx, input}) => {
        const {prisma} = ctx;
        const {cursor, limit} = input;
        const userId = ctx.session?.user?.id;
        const tweets = await prisma.tweet.findMany({
            take:limit+1,
            orderBy: [
                {
                    createdAt: 'desc'
                }
            ],
            cursor: cursor ? {
                id: cursor
            } : undefined,

            include: {
                likes: {
                    where: {
                        userId: userId
                    },
                    select: {
                        id: true
                    }
                },
                author:{
                    select: {
                        name:true,
                        image:true,
                        id:true
                    }
                }
            }

        });

        let nextCursor: typeof cursor | undefined = undefined;

        if(tweets.length > limit){
            const nextItem = tweets.pop() as typeof tweets[number];
            nextCursor = nextItem.id;
        }
        return {tweets, nextCursor};
    }),
    like: protectedProcedure.input(
        z.object({
            tweetId: z.string()
        })
    ).mutation(async ({ctx, input}) => {
        const {prisma, session} = ctx;
        const {tweetId} = input;
        const userId = session.user.id;
        const tweet = await prisma.tweet.findUnique({
            where:{
                id: tweetId
            }
        });
        if(!tweet){
            throw new Error('Tweet not found');
        }
        const like = await prisma.like.findUnique({
            where:{
                tweetId_userId:{
                    tweetId,
                    userId
                }
            }
        });
        if(like){
            throw new Error('Already liked');
        }
        return prisma.like.create({
            data:{
                tweet:{
                    connect:{
                        id: tweetId
                    }
                },
                user:{
                    connect:{
                        id: userId
                    }
                }
            }
        })
    }),
      
    unlike: protectedProcedure.input(
        z.object({
            tweetId: z.string()

        })
    ).mutation(async ({ctx, input}) => {

        const {prisma, session} = ctx;
        const {tweetId} = input;
        const userId = session.user.id;
        const tweet = await prisma.tweet.findUnique({
            where:{
                id: tweetId
            }
        });
        if(!tweet){
            throw new Error('Tweet not found');
        }
        const like = await prisma.like.findUnique({
            where:{
                tweetId_userId:{
                    tweetId,
                    userId
                }
            }
        });
        if(!like){
            throw new Error('Not liked');
        }
        return prisma.like.delete({
            where:{
                tweetId_userId:{
                    tweetId,
                    userId
                }
            }
        })
    }
    ), 

            
})