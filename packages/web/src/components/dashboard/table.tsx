'use client'

import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from '@tanstack/react-table'
import { ChevronDown, MoreHorizontal } from 'lucide-react'
import * as React from 'react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useMediaQuery } from '@/hook/useMediaQuery'
import { parsePhoneNumber } from 'libphonenumber-js'
import { DataFormatada } from './DataFormatada'

export type Apartment = {
  unitLabel: string
  unitCode: string
  lastDepositedAt: string
  status: string
  contactInfo: {
    contactName: string
    contactDocument: string
    phoneNumber: string
  }
}

export const columns: ColumnDef<Apartment>[] = [
  {
    id: 'code',
    header: 'Código',
    accessorKey: 'unitCode',
    cell: ({ row }) => <div>{row.original.unitCode}</div>,
  },
  {
    id: 'unit',
    header: 'Unidade',
    cell: ({ row }) => {
      return <div>{row.original.unitLabel}</div>
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => (
      <div className="capitalize">
        {row.getValue('status') === 'OCUPADO' && (
          <div className="mx-auto h-3 w-3 rounded-full bg-red-300" />
        )}
        {row.getValue('status') === 'DESOCUPADO' && (
          <div className="mx-auto h-3 w-3 rounded-full bg-green-300" />
        )}
      </div>
    ),
  },
  {
    id: 'contactName',
    accessorKey: 'contactInfo.contactName',
    header: 'Nome',
    cell: ({ row }) => (
      <div>{row.original.contactInfo?.contactName?.split(' ')?.slice(0, 2).join(' ')}</div>
    ),
  },
  {
    accessorKey: 'document',
    header: 'CPF/CNPJ',
    cell: ({ row }) => <div>{row.original.contactInfo?.contactDocument}</div>,
  },
  {
    accessorKey: 'phone',
    header: 'Telefone',
    cell: ({ row }) => (
      <div>
        {row.original.contactInfo?.phoneNumber &&
          parsePhoneNumber(row.original.contactInfo?.phoneNumber).formatNational()}
      </div>
    ),
  },
  {
    accessorKey: 'depatureAt',
    header: 'Saída',
    cell: ({ row }) => <div>{row.getValue('depatureAt')}</div>,
  },
  {
    accessorKey: 'lastDepositedAt',
    header: 'Último pagamento',
    cell: ({ row }) => (
      <div>
        <DataFormatada dataISO={row.getValue('lastDepositedAt')} />
      </div>
    ),
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => {
      const payment = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menu</span>
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Ações</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(payment.contactInfo.phoneNumber)}
            >
              Copiar número de telefone
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Ver Detalhes</DropdownMenuItem>
            <DropdownMenuItem>Tirar Inquelino</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

export function ApartmentTable({ data = [], status }: { data?: Apartment[]; status: string }) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

  console.log(columnVisibility)

  const mdUp = useMediaQuery(`(min-width: 768px)`)
  const smUp = useMediaQuery(`(min-width: 640px)`)

  React.useEffect(() => {
    if (mdUp) setColumnVisibility({ code: false })
    else if (smUp) setColumnVisibility({ unit: false, document: false, depatureAt: false })
    else
      setColumnVisibility({
        unit: false,
        document: false,
        status: false,
        depatureAt: false,
        phone: false,
      })
  }, [mdUp, smUp])

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  return (
    <div className="w-full max-w-[90vw]">
      <div className="flex items-center py-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                )
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {status === 'idle' &&
              table.getRowModel().rows?.length &&
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            {status === 'idle' && !table.getRowModel().rows?.length && (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
            {status === 'loading' && (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Loading...
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
