import DOMPurify from 'dompurify'
import parse, { domToReact, Element } from 'html-react-parser'
import React from 'react'

import type { DOMNode } from 'html-react-parser'
const ALLOWED_TAGS = [
  'p',
  'span',
  'strong',
  'em',
  'u',
  's',
  'a',
  'ul',
  'ol',
  'li',
  'blockquote',
  'h1',
  'h2',
  'h3',
]
export function renderRichText(html?: string | null) {
  if (!html || typeof html !== 'string') return null

  const cleanHTML = DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
  })

  return parse(cleanHTML, {
    replace(domNode: DOMNode) {
      if (!(domNode instanceof Element)) return

      const { name, attribs, children } = domNode

      if (!ALLOWED_TAGS.includes(name)) {
        return <></>
      }

      if (name === 'a') {
        return (
          <a
            href={attribs.href}
            target='_blank'
            rel='noopener noreferrer'
            className='text-blue-600 underline'>
            {domToReact(children as DOMNode[])}
          </a>
        )
      }

      if (name === 'span' && attribs?.style) {
        return (
          <span style={parseStyle(attribs.style)}>
            {domToReact(children as DOMNode[])}
          </span>
        )
      }

      if (name === 'blockquote') {
        return (
          <blockquote className='border-l-4 pl-4 italic text-gray-600 my-4'>
            {domToReact(children as DOMNode[])}
          </blockquote>
        )
      }

      return React.createElement(name, {}, domToReact(children as DOMNode[]))
    },
  })
}

function parseStyle(style: string): React.CSSProperties {
  const result: Partial<Record<keyof React.CSSProperties, string>> = {}

  style
    .split(';')
    .map(rule => rule.trim())
    .filter(Boolean)
    .forEach(rule => {
      const [rawKey, rawValue] = rule.split(':')
      if (!rawKey || !rawValue) return

      const camelKey = rawKey
        .trim()
        .replace(/-([a-z])/g, (_, c) => c.toUpperCase()) as keyof React.CSSProperties

      result[camelKey] = rawValue.trim()
    })

  return result as React.CSSProperties
}
