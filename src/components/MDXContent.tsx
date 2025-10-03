'use client'

import { MDXRemote } from 'next-mdx-remote'
import { serialize } from 'next-mdx-remote/serialize'
import { useEffect, useState } from 'react'
import rehypeHighlight from 'rehype-highlight'
import rehypePrettyCode from 'rehype-pretty-code'

// Custom components for MDX
const components = {
    h1: (props: any) => (
        <h1 className="text-3xl font-bold mt-8 mb-4 text-gray-900 dark:text-white" {...props} />
    ),
    h2: (props: any) => (
        <h2 className="text-2xl font-semibold mt-6 mb-3 text-gray-900 dark:text-white" {...props} />
    ),
    h3: (props: any) => (
        <h3 className="text-xl font-semibold mt-5 mb-2 text-gray-900 dark:text-white" {...props} />
    ),
    p: (props: any) => (
        <p className="mb-4 text-gray-700 dark:text-gray-300 leading-relaxed" {...props} />
    ),
    ul: (props: any) => (
        <ul className="mb-4 ml-6 list-disc text-gray-700 dark:text-gray-300" {...props} />
    ),
    ol: (props: any) => (
        <ol className="mb-4 ml-6 list-decimal text-gray-700 dark:text-gray-300" {...props} />
    ),
    li: (props: any) => (
        <li className="mb-1" {...props} />
    ),
    blockquote: (props: any) => (
        <blockquote className="border-l-4 border-blue-500 pl-4 my-4 italic text-gray-600 dark:text-gray-400" {...props} />
    ),
    code: (props: any) => (
        <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm text-red-600 dark:text-red-400" {...props} />
    ),
    pre: (props: any) => (
        <pre className="bg-gray-900 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto my-4" {...props} />
    ),
    a: (props: any) => (
        <a className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline" {...props} />
    ),
    img: (props: any) => (
        <img className="rounded-lg shadow-md my-4 max-w-full h-auto" {...props} />
    ),
    table: (props: any) => (
        <div className="overflow-x-auto my-4">
            <table className="min-w-full border border-gray-200 dark:border-gray-700" {...props} />
        </div>
    ),
    th: (props: any) => (
        <th className="border border-gray-200 dark:border-gray-700 px-4 py-2 bg-gray-50 dark:bg-gray-800 font-semibold text-left" {...props} />
    ),
    td: (props: any) => (
        <td className="border border-gray-200 dark:border-gray-700 px-4 py-2" {...props} />
    ),
}

interface MDXContentProps {
    content: string
}

export function MDXContent({ content }: MDXContentProps) {
    const [mdxSource, setMdxSource] = useState<any>(null)

    useEffect(() => {
        const serializeContent = async () => {
            try {
                const serialized = await serialize(content, {
                    mdxOptions: {
                        rehypePlugins: [
                            rehypeHighlight,
                            [
                                rehypePrettyCode,
                                {
                                    theme: {
                                        dark: 'github-dark',
                                        light: 'github-light',
                                    },
                                },
                            ],
                        ],
                    },
                })
                setMdxSource(serialized)
            } catch (error) {
                console.error('Error serializing MDX content:', error)
            }
        }

        serializeContent()
    }, [content])

    if (!mdxSource) {
        return (
            <div className="animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-4 w-3/4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-4 w-1/2"></div>
            </div>
        )
    }

    return <MDXRemote {...mdxSource} components={components} />
}

