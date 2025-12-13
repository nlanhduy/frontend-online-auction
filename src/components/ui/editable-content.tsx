'use client'

import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

import { Spinner } from './spinner'

interface EditableContentProps {
  id: string
  content: string
  onSave: (id: string, newContent: string) => void
  isNewReply?: boolean
  isEditing?: boolean
  onEditClick?: () => void
  onCancelEdit?: () => void
  isSavingEditedContent: boolean
}

export function EditableContent({
  id,
  content,
  onSave,
  isNewReply = false,
  isEditing = false,
  onCancelEdit,
  isSavingEditedContent,
}: EditableContentProps) {
  const [editedContent, setEditedContent] = useState(content)

  // Sync editedContent with content prop when content changes from server
  useEffect(() => {
    setEditedContent(content)
  }, [content])

  const handleSave = () => {
    if (editedContent.trim() && editedContent !== content) {
      onSave(id, editedContent.trim())
    }
  }

  const handleCancel = () => {
    setEditedContent(content)
    onCancelEdit?.()
  }

  if (isEditing) {
    return (
      <div className='space-y-2'>
        <Textarea
          value={editedContent}
          onChange={e => setEditedContent(e.target.value)}
          placeholder='Type your message...'
          className='min-h-20 text-sm'
          autoFocus
        />

        <div className='flex gap-2'>
          <Button
            size='sm'
            onClick={handleSave}
            disabled={isSavingEditedContent}
            variant='default'>
            {isSavingEditedContent && <Spinner />}
            {isSavingEditedContent ? 'Saving ...' : 'Save'}
          </Button>
          <Button size='sm' onClick={handleCancel} variant='outline'>
            Cancel
          </Button>
        </div>
      </div>
    )
  }

  return (
    <p
      className={`text-sm leading-relaxed ${
        isNewReply ? 'font-medium text-foreground' : 'text-foreground'
      }`}>
      {content}
    </p>
  )
}
