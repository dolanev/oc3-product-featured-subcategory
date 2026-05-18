import {
  type AccessorKeyColumnDef,
  type Cell,
  type Column,
  type ColumnDef,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  type OnChangeFn,
  type PaginationState,
  type Row,
  type RowData,
  type RowModel,
  type Updater,
  useReactTable,
} from "@tanstack/react-table"
import { type Product, products } from "@/data/seed.tsx"
import { Ellipsis } from "lucide-react"
import {
  TableHead,
  TableHeader,
  TableRow,
  Table,
  TableBody,
  TableCell,
} from "@/components/ui/table.tsx"
import { useEffect, useMemo, useState } from "react"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination.tsx"
import { cn, paginate } from "@/lib/utils.ts"
import { Badge } from "@/components/ui/badge.tsx"
import { Switch } from "@/components/ui/switch.tsx"
import { Field, FieldLabel } from "@/components/ui/field.tsx"

function RowActions(props: {
  row: Row<Product>
  onChange: (
    checked: boolean,
    productId: Product["productId"],
    rowData: Product
  ) => void
}) {
  const id = props.row.original.productId
  return (
    <>
      <Field orientation="horizontal" className="w-fit">
        <Switch
          id={"active-" + id}
          size={"sm"}
          onCheckedChange={(checked) =>
            props.onChange(checked, id, props.row.original)
          }
          checked={props.row.original.status}
        />
        <FieldLabel htmlFor={"active-" + id}>
          {props.row.original.status ? "Active" : "Disabled"}
        </FieldLabel>
      </Field>
    </>
  )
}

const columnHelper = createColumnHelper<Product>()

type TProps = {
  data: Product[]
  rowCount: number
  pagination: PaginationState
  onRowChange: (oldRow: Product, newRow: Product) => void
  onPaginationChange: OnChangeFn<PaginationState>
}

export function FilterProductTable({
  data,
  onPaginationChange,
  rowCount,
  pagination,
  onRowChange,
}: TProps) {
  const defaultColumns = useMemo(
    () => [
      columnHelper.accessor("name", {
        header: "Name",
        cell: (props) => props.getValue(),
      }),
      columnHelper.accessor("brand", {
        header: "Brand",
        cell: (props) => props.getValue(),
      }),
      columnHelper.accessor("price", {
        header: "Price",
        cell: (props) => props.getValue().toLocaleString(),
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: (props) =>
          props.getValue() ? (
            <Badge className="bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300">
              Green
            </Badge>
          ) : (
            <Badge className="bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300">
              Red
            </Badge>
          ),
      }),
      columnHelper.display({
        id: "actions",
        cell: (props) => (
          <RowActions
            row={props.row}
            onChange={(checked, id, rowData) =>
              onRowChange(rowData, { ...rowData, status: checked })
            }
          />
        ),
      }),
    ],
    []
  )

  const table = useReactTable({
    data: data,
    columns: defaultColumns,
    getCoreRowModel: getCoreRowModel<Product>(),
    manualPagination: true,
    rowCount: rowCount,
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: onPaginationChange,
    state: {
      pagination,
    },
  })

  return (
    <div>
      <Table
      // className={"pointer-events-none animate-pulse select-none"}
      >
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.column.columnDef.header as React.ReactNode}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getCoreRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Pagination>
        <PaginationContent>
          <PaginationItem
            className={cn(
              !table.getCanPreviousPage()
                ? ["pointer-events-none opacity-50"]
                : []
            )}
          >
            <PaginationPrevious
              href="javascript: void(0)"
              onClick={() => {
                table.previousPage()
              }}
            />
          </PaginationItem>
          {paginate(pagination.pageIndex, table.getPageCount(), "-").map(
            (pageIndex) => (
              <>
                {pageIndex === "-" ? (
                  <PaginationItem className={"flex h-full align-bottom"}>
                    <Ellipsis
                      className={
                        "mb-[5px] h-4 self-end align-bottom opacity-50"
                      }
                    />
                  </PaginationItem>
                ) : (
                  <PaginationItem>
                    <PaginationLink
                      href="javascript: void(0)"
                      isActive={pageIndex === pagination.pageIndex}
                      onClick={() => table.setPageIndex(+pageIndex)}
                    >
                      {+pageIndex + 1}
                    </PaginationLink>
                  </PaginationItem>
                )}
              </>
            )
          )}
          <PaginationItem
            className={cn(
              !table.getCanNextPage() ? ["pointer-events-none opacity-50"] : []
            )}
          >
            <PaginationNext
              href="javascript: void(0)"
              onClick={() => {
                table.nextPage()
              }}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  )
}
