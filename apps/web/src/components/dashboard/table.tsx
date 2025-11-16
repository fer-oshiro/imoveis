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

import { Button } from '@imovel/web/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@imovel/web/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@imovel/web/components/ui/table'
import { useMediaQuery } from '@imovel/web/hook/useMediaQuery'
import { Apartment, APARTMENT_STATUS } from '@imovel/core/domain/apartment'
import { Contract } from '@imovel/core/domain/contract'
import { User } from '@imovel/core/domain/user'
import { DataFormatada } from './DataFormatada'
import { parsePhoneNumber } from 'libphonenumber-js/min'

export const columns: ColumnDef<{
  apartment: Apartment
  contract: Contract | null
  user: User | null
}>[] = [
  {
    id: 'code',
    header: 'Código',
    accessorKey: 'unitCode',
    cell: ({ row }) => <div>{row.original.apartment.id}</div>,
  },
  {
    id: 'unit',
    header: 'Unidade',
    cell: ({ row }) => {
      return <div>{row.original.apartment.label}</div>
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => (
      <div className="capitalize">
        {row.original.apartment.status === APARTMENT_STATUS.OCCUPIED && (
          <div className="mx-auto h-3 w-3 rounded-full bg-red-300" />
        )}
        {row.original.apartment.status === APARTMENT_STATUS.MAINTENANCE && (
          <div className="mx-auto h-3 w-3 rounded-full bg-yellow-300" />
        )}
        {row.original.apartment.status === APARTMENT_STATUS.AVAILABLE && (
          <div className="mx-auto h-3 w-3 rounded-full bg-green-300" />
        )}
      </div>
    ),
  },
  {
    id: 'contactName',
    accessorKey: 'contactInfo.contactName',
    header: 'Nome',
    cell: ({ row }) => <div>{row.original.user?.name}</div>,
  },
  {
    accessorKey: 'document',
    header: 'CPF/CNPJ',
    cell: ({ row }) => <div>{row.original.user?.document}</div>,
  },
  {
    accessorKey: 'phone',
    header: 'Telefone',
    cell: ({ row }) => (
      <div>
        {row.original.user?.phone
          ? parsePhoneNumber(row.original.user?.phone || '')?.formatNational()
          : ''}
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
        <DataFormatada date={row.original.contract?.lastPaymentDate} />
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
              onClick={() => navigator.clipboard.writeText(payment.contract?.lastPaymentId || '')}
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

export function ApartmentTable({
  data = [],
  status,
}: {
  data?: { apartment: Apartment; contract: Contract | null; user: User | null }[]
  status: string
}) {
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
              table.getRowModel().rows?.length > 0 &&
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
