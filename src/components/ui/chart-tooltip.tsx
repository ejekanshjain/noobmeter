'use client'

import { TooltipProps } from 'recharts'
import {
  NameType,
  ValueType
} from 'recharts/types/component/DefaultTooltipContent'

export function ChartTooltip({
  active,
  payload,
  label,
  formatter,
  labelFormatter
}: TooltipProps<ValueType, NameType>) {
  if (!active || !payload) {
    return null
  }

  return (
    <div className="bg-background rounded-lg border p-2 shadow-sm">
      {label && (
        <div className="text-xs font-medium">
          {labelFormatter ? labelFormatter(label, payload) : label}
        </div>
      )}
      <div className="flex flex-col gap-0.5">
        {payload.map((item, index) => (
          <div key={index} className="flex items-center gap-2 text-xs">
            <div
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="font-medium">{item.name}</span>
            <span>
              {formatter
                ? formatter(
                    item.value as number,
                    item.name ?? '',
                    item,
                    index,
                    payload
                  )
                : item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
