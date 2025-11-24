import { ScrollArea } from "@/components/ui/scroll-area"
import React from "react"
const tags = Array.from({ length: 50 }).map(
  (_, i, a) => `v1.2.0-beta.${a.length - i}`
)
export default function OrdersPage() {
 return (
    <ScrollArea className="h-72 w-48 rounded-md border">
      <div className="p-4">
        <h4 className="mb-4 text-sm leading-none font-medium">Tags</h4>
        {tags.map((tag) => (
          <React.Fragment key={tag}>
            <div className="text-sm">{tag}</div>
          </React.Fragment>
        ))}
      </div>
    </ScrollArea>
  )
}