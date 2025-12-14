'use client'

import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { formatReadableDate } from '@/lib/utils'

import { EditableContent } from './editable-content'
import { Spinner } from './spinner'
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

export interface QuestionActions {
  updateContent: (id: string, content: string) => void
  addReply: (parentId: string) => void
  saveReply: (parentId: string, content: string) => void
  cancelReply: () => void
  delete: (id: string) => void
}

export interface QuestionUIState {
  replyingToId: string | null
  editingId: string | null
  setEditingId: (id: string | null) => void
  isAuthenticated: boolean
}

export interface QuestionMutationState {
  isSavingEditedContent: boolean
  deletingId: string | null
  isReplying: boolean | null
}

// ===== ProductQuestionTree Props =====
interface ProductQuestionTreeProps {
  questions: ProductQuestion[]
  actions: QuestionActions
  ui: QuestionUIState
  mutation: QuestionMutationState
}

export function ProductQuestionTree({
  questions,
  actions,
  ui,
  mutation,
}: ProductQuestionTreeProps) {
  return (
    <div className='space-y-4'>
      {questions.map(q => (
        <QuestionNode key={q.id} node={q} actions={actions} ui={ui} mutation={mutation} />
      ))}
    </div>
  )
}

// ===== QuestionNode Props =====
interface QuestionNodeProps {
  node: ProductQuestion
  actions: QuestionActions
  ui: QuestionUIState
  mutation: QuestionMutationState
}

export function QuestionNode({ node, actions, ui, mutation }: QuestionNodeProps) {
  const [replyContent, setReplyContent] = useState('')
  const isReplyingToThisNode = ui.replyingToId === node.id
  const isDeleting = node.id === mutation.deletingId

  const handleSaveReply = () => {
    if (replyContent.trim()) {
      actions.saveReply(node.id, replyContent)
      setReplyContent('')
    }
  }

  const handleCancelReply = () => {
    setReplyContent('')
    actions.cancelReply()
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
          <UserCard user={node.user} isOwner={node.isOwner} />

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
              onSave={actions.updateContent}
              isNewReply={node.isNew}
              isEditing={ui.editingId === node.id}
              onEditClick={() => ui.setEditingId(node.id)}
              isSavingEditedContent={mutation.isSavingEditedContent}
            />
          )}

          {!node.isDeleted && ui.isAuthenticated && (
            <div className='flex gap-2 pt-2'>
              <Button
                size='sm'
                variant='default'
                onClick={() => actions.addReply(node.id)}>
                {isReplyingToThisNode ? 'Close' : 'Reply'}
              </Button>
              {node.isEditable && (
                <>
                  <Button
                    size='sm'
                    variant='outline'
                    onClick={() => ui.setEditingId(node.id)}>
                    Edit
                  </Button>
                  <Button
                    size='sm'
                    variant='destructive'
                    disabled={isDeleting}
                    onClick={() => actions.delete(node.id)}>
                    {isDeleting && <Spinner />}
                    {isDeleting ? 'Deleting ... ' : 'Delete'}
                  </Button>
                </>
              )}
            </div>
          )}

          {isReplyingToThisNode && ui.isAuthenticated && !node.isDeleted && (
            <div className='mt-4 pt-4 border-t space-y-2 bg-muted/50 p-3 rounded'>
              <textarea
                value={replyContent}
                onChange={e => setReplyContent(e.target.value)}
                placeholder='Type your reply...'
                className='w-full min-h-20 p-2 text-sm border rounded bg-background'
                autoFocus
              />
              <div className='flex gap-2'>
                <Button
                  size='sm'
                  onClick={handleSaveReply}
                  variant='default'
                  disabled={mutation.isReplying || false}>
                  {mutation.isReplying && <Spinner />}
                  {mutation.isReplying ? 'Saving reply' : 'Save Reply'}
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
              actions={actions}
              ui={ui}
              mutation={mutation}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ===== CreateQuestionNode Props =====
interface CreateQuestionNodeProps {
  user: User | null | undefined
  onCreateQuestion: (content: string) => void
  isCreating: boolean
  isSuccessful: boolean
}

export function CreateQuestionNode({
  user,
  onCreateQuestion,
  isCreating,
  isSuccessful,
}: CreateQuestionNodeProps) {
  const [content, setContent] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (isSuccessful) {
      handleCancel()
    }
  }, [isSuccessful])

  const handleCreate = () => {
    if (!content.trim()) return
    onCreateQuestion(content.trim())
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
              <Button
                size='sm'
                variant='default'
                onClick={handleCreate}
                disabled={isCreating}>
                {isCreating && <Spinner />}
                {isCreating ? 'Creating Question ...' : 'Create Question'}
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
