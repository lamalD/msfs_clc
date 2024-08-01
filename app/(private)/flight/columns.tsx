"use client"

import { ColumnDef } from "@tanstack/react-table"

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type lddUlds = {
    position: string
    uldNumber: string |  null
    // destination: string
    category: string
    weight: string
    pieces: string | null
}

export const columns: ColumnDef<lddUlds>[] = [
  {
    accessorKey: "position",
    header: () => <div className="text-left">Pos.</div>,
    cell: ({ row }) => <div className="text-xs text-left">{row.getValue("position")}</div>, 
  },
  {
    accessorKey: "uldNumber",
    header: () => <div className="text-left">UldNumber</div>,
    cell: ({ row }) => <div className="text-xs text-left">{row.getValue("uldNumber")}</div>,
  },
  {
    accessorKey: "destination",
    header: "Dest.",
  },
  {
    accessorKey: "category",
    header: () => <div className="text-left">Cat.</div>,
    cell: ({ row }) => <div className="text-xs text-left">{row.getValue("category")}</div>,
  },
  {
    accessorKey: "weight",
    header: () => <div className="text-left">Weight</div>,
    cell: ({ row }) => <div className="text-xs text-right">{row.getValue("weight")}</div>,
  },
  {
    accessorKey: "pieces",
    header: () => <div className="text-left">Pcs.</div>,
    cell: ({ row }) => <div className="text-xs text-right">{row.getValue("pieces")}</div>,
  },
]
