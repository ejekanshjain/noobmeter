'use client'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { cn } from '@/lib/cn'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import type * as React from 'react'

interface DatePickerProps {
  date: Date | undefined
  setDate: (date: Date | undefined) => void
  placeholder?: string
  icon?: React.ReactNode
}

export function DatePicker({
  date,
  setDate,
  placeholder = 'Pick a date',
  icon
}: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={'outline'}
          className={cn(
            'w-full justify-start border-gray-200 bg-white text-left font-normal dark:border-gray-800 dark:bg-gray-900',
            !date && 'text-gray-500 dark:text-gray-400'
          )}
        >
          {icon || <CalendarIcon className="mr-2 h-4 w-4" />}
          {date ? format(date, 'PPP') : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto border-gray-200 bg-white p-0 dark:border-gray-800 dark:bg-gray-900"
        align="start"
      >
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          initialFocus
          className="bg-white dark:bg-gray-900"
        />
      </PopoverContent>
    </Popover>
  )
}
