'use client'

import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { formatReadableDate } from '@/lib/utils'

import { EditableContent } from './editable-content'
import { Textarea } from './textarea'
import { UserCard } from './user-card'

import type { User } from '@/types/auth.types'

interface ProductQuestion {
  id: string
  content: string
  createdAt: string
  updatedAt?: string
  user: User
  children: ProductQuestion[]
  isNew?: boolean
  replyingTo?: string | null
  isOwner?: boolean
  isEditable?: boolean
  isDeleted?: boolean
}

interface ProductQuestionTreeProps {
  questions: ProductQuestion[]
  onUpdateContent: (id: string, newContent: string) => void
  onAddReply: (parentId: string) => void
  onSaveReply: (parentId: string, content: string) => void
  onCancelReply: () => void
  replyingToId: string | null
  onDelete: (id: string) => void
  editingId: string | null
  setEditingId: (id: string | null) => void
  isAuthenticated: boolean
}

export function ProductQuestionTree({
  questions,
  onUpdateContent,
  onAddReply,
  onSaveReply,
  onCancelReply,
  replyingToId,
  onDelete,
  editingId,
  setEditingId,
  isAuthenticated,
}: ProductQuestionTreeProps) {
  return (
    <div className='space-y-4'>
      {questions.map(q => (
        <QuestionNode
          key={q.id}
          node={q}
          onUpdateContent={onUpdateContent}
          onReply={onAddReply}
          onSaveReply={onSaveReply}
          onCancelReply={onCancelReply}
          editingId={editingId}
          setEditingId={setEditingId}
          replyingToId={replyingToId}
          onDelete={onDelete}
          isAuthenticated={isAuthenticated}
        />
      ))}
    </div>
  )
}

export function QuestionNode({
  node,
  onUpdateContent,
  onReply,
  onSaveReply,
  onCancelReply,
  editingId,
  setEditingId,
  replyingToId,
  onDelete,
  isAuthenticated,
}: {
  node: ProductQuestion
  onUpdateContent: (id: string, newContent: string) => void
  onReply: (parentId: string) => void
  onSaveReply: (parentId: string, content: string) => void
  onCancelReply: () => void
  editingId: string | null
  setEditingId: (id: string | null) => void
  replyingToId: string | null
  onDelete: (id: string) => void
  isAuthenticated: boolean
}) {
  const [replyContent, setReplyContent] = useState('')
  const isReplyingToThisNode = replyingToId === node.id

  const handleSaveReply = () => {
    if (replyContent.trim()) {
      onSaveReply(node.id, replyContent)
      setReplyContent('')
    }
  }

  const handleCancelReply = () => {
    setReplyContent('')
    onCancelReply()
  }

  return (
    <div className='ml-0'>
      <Card
        className={`border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow ${
          node.isDeleted
            ? 'bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-800 opacity-60'
            : node.isOwner
              ? 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800'
              : ''
        }`}>
        <CardContent className='p-0 space-y-3'>
          <UserCard user={node.user} />

          <div className='flex gap-4 text-xs text-muted-foreground'>
            <span>Created: {formatReadableDate(node.createdAt)}</span>
            {node.updatedAt && node.updatedAt !== node.createdAt && (
              <span>Updated: {formatReadableDate(node.updatedAt)}</span>
            )}
          </div>

          {node.isDeleted ? (
            <div className='text-muted-foreground italic line-through'>
              <p className='text-sm'>This message has been deleted</p>
            </div>
          ) : (
            <EditableContent
              id={node.id}
              content={node.content}
              onSave={onUpdateContent}
              isNewReply={node.isNew}
              isEditing={editingId === node.id}
              onEditClick={() => setEditingId(node.id)}
            />
          )}

          {!node.isDeleted && isAuthenticated && (
            <div className='flex gap-2 pt-2'>
              <Button size='sm' variant='default' onClick={() => onReply(node.id)}>
                {isReplyingToThisNode ? 'Close' : 'Reply'}
              </Button>
              {node.isEditable && (
                <>
                  <Button
                    size='sm'
                    variant='outline'
                    onClick={() => setEditingId(node.id)}>
                    Edit
                  </Button>
                  <Button
                    size='sm'
                    variant='destructive'
                    onClick={() => onDelete(node.id)}>
                    Delete
                  </Button>
                </>
              )}
            </div>
          )}

          {isReplyingToThisNode && isAuthenticated && !node.isDeleted && (
            <div className='mt-4 pt-4 border-t space-y-2 bg-muted/50 p-3 rounded'>
              <textarea
                value={replyContent}
                onChange={e => setReplyContent(e.target.value)}
                placeholder='Type your reply...'
                className='w-full min-h-20 p-2 text-sm border rounded bg-background'
                autoFocus
              />
              <div className='flex gap-2'>
                <Button size='sm' onClick={handleSaveReply} variant='default'>
                  Save Reply
                </Button>
                <Button size='sm' onClick={handleCancelReply} variant='outline'>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {node.children && node.children.length > 0 && (
        <div className='ml-6 mt-4 border-l-2 border-border pl-4 space-y-3'>
          {node.children.map(child => (
            <QuestionNode
              key={child.id}
              node={child}
              onUpdateContent={onUpdateContent}
              onReply={onReply}
              onSaveReply={onSaveReply}
              onCancelReply={onCancelReply}
              editingId={editingId}
              setEditingId={setEditingId}
              replyingToId={replyingToId}
              onDelete={onDelete}
              isAuthenticated={isAuthenticated}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface CreateQuestionNodeProps {
  user: User | null | undefined
  onCreateQuestion: (content: string) => void
}

export function CreateQuestionNode({ user, onCreateQuestion }: CreateQuestionNodeProps) {
  const [content, setContent] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  const handleCreate = () => {
    if (!content.trim()) return
    onCreateQuestion(content.trim())
    setContent('')
    setIsOpen(false)
  }

  const handleCancel = () => {
    setContent('')
    setIsOpen(false)
  }

  return (
    <div className='mb-6'>
      {!isOpen ? (
        <Button onClick={() => setIsOpen(true)} size='sm'>
          Create Question
        </Button>
      ) : (
        <Card className='border rounded-lg p-4 shadow-sm'>
          <CardContent className='p-0 space-y-3'>
            <UserCard user={user} />

            <Textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder='Type your message...'
              className='min-h-20 text-sm'
              autoFocus
            />
            <div className='flex gap-2 pt-2'>
              <Button size='sm' variant='default' onClick={handleCreate}>
                Create Question
              </Button>
              <Button size='sm' variant='outline' onClick={handleCancel}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
