import { MoreVertical } from 'lucide-react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './dropdown-menu'

import type { ReactElement } from 'react'

export interface Action {
  label: string
  action: () => void
  icon: ReactElement
}

export function ActionMenu({ actions = [] }: { actions?: Action[] }) {
  if (!actions.length) return null

  return (
    <div className='cursor-pointer absolute top-2 right-2 z-20'>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            onClick={e => e.preventDefault()}
            className='p-1 rounded-full hover:bg-gray-100'>
            <MoreVertical className='w-4 h-4' />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          {actions.map((item, index) => (
            <DropdownMenuItem
              key={index}
              onClick={e => {
                e.preventDefault()
                item.action()
              }}
              className='cursor-pointer'>
              {item.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
