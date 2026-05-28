import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  type OnChangeFn,
  type PaginationState,
  type Row,
  useReactTable,
} from '@tanstack/react-table';

import { Ellipsis, PlusCircleIcon, PlusIcon, RussianRubleIcon, Trash2Icon } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table.tsx';
import { useMemo } from 'react';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination.tsx';
import { cn, emit, paginate } from '@/lib/utils.ts';
import { Badge } from '@/components/ui/badge.tsx';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip.tsx';
import { Button } from '@/components/ui/button.tsx';
import type { Product } from '../types';

function RowActions(props: {
  // selectedProducts: number[]
  row: Row<Product>;
  onAdd: TProps['onAdd'];
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          onClick={() => emit(props.onAdd, props.row.original)}
          variant="outline"
          className="h-10 w-10 rounded-md border-green-400 bg-green-50 text-green-400 transition-all hover:bg-green-400 hover:text-white"
        >
          <PlusCircleIcon />
        </Button>
      </TooltipTrigger>
      <TooltipContent side={'left'} className={'h-fit items-center'}>
        Добавить
      </TooltipContent>
    </Tooltip>
  );
}

const columnHelper = createColumnHelper<Product>();

type TProps = {
  data: Product[];
  selectedProducts: number[];
  rowCount: number;
  pagination: PaginationState;
  onAdd: (row: Product) => void;
  onPaginationChange: (newPaginationState: PaginationState) => void;
};

export function FilterProductTable({
  data,
  selectedProducts,
  onPaginationChange,
  rowCount,
  pagination,
  onAdd,
}: TProps) {
  const defaultColumns = useMemo(
    () => [
      columnHelper.accessor('name', {
        header: 'Товар',
        cell: (props) => <div className={'overflow-hidden text-ellipsis'}>{props.getValue()}</div>,
      }),
      columnHelper.accessor('brand', {
        header: 'Модель',
        cell: (props) => <div className={'text-left'}>{props.getValue()}</div>,
      }),
      columnHelper.accessor('price', {
        header: 'Цена',
        cell: (props) => (
          <div className={'flex w-40 items-end gap-1.5 text-right'}>
            <Badge variant={'outline'}>
              <RussianRubleIcon />
            </Badge>{' '}
            {parseFloat(props.getValue() as unknown as string).toLocaleString('ru-RU', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
        ),
      }),
      columnHelper.accessor('status', {
        header: 'Статус',
        cell: (props) =>
          props.getValue() ? (
            <Badge className="border bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300">
              Активный
            </Badge>
          ) : (
            <Badge className="bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300">
              Выключен
            </Badge>
          ),
      }),
      columnHelper.display({
        id: 'actions',
        cell: (props) => (
          <RowActions
            // selectedProducts={selectedProducts}
            row={props.row}
            onAdd={(rowData) => onAdd(rowData)}
          />
        ),
      }),
    ],
    [selectedProducts]
  );

  const handlePaginationChange: OnChangeFn<PaginationState> = (updater) => {
    const next = typeof updater === 'function' ? updater(pagination) : updater;

    onPaginationChange(next);
  };

  const table = useReactTable({
    data: data,
    columns: defaultColumns,
    getCoreRowModel: getCoreRowModel<Product>(),
    manualPagination: true,
    rowCount: rowCount,
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: handlePaginationChange,
    state: {
      pagination,
    },
  });

  return (
    <>
      <div className={'w-full'}>
        <div className="[&>div]:rounded-sm [&>div]:border">
          <Table
          // className={"pointer-events-none animate-pulse select-none"}
          >
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className={
                        ['actions', 'status', 'price'].includes(header.column.id) ? 'w-0' : ''
                      }
                    >
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
                    <TableCell
                      key={cell.id}
                      className={cell.column.id === 'name' ? 'max-w-1/3' : ''}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {rowCount > pagination.pageSize && data.length && (
        <Pagination className={'mt-3'}>
          <PaginationContent>
            <PaginationItem
              className={cn(!table.getCanPreviousPage() ? ['pointer-events-none opacity-50'] : [])}
            >
              <PaginationPrevious
                href="javascript: void(0)"
                onClick={() => {
                  table.previousPage();
                }}
                text={'Назад'}
              />
            </PaginationItem>
            {paginate(pagination.pageIndex + 1, table.getPageCount(), '-').map((pageIndex) => (
              <>
                {pageIndex === '-' ? (
                  <PaginationItem className={'flex h-full align-bottom'}>
                    <Ellipsis className={'mb-[5px] h-4 self-end align-bottom opacity-50'} />
                  </PaginationItem>
                ) : (
                  <PaginationItem>
                    <PaginationLink
                      href="javascript: void()"
                      isActive={pagination.pageIndex === +pageIndex - 1}
                      onClick={() => table.setPageIndex(+pageIndex - 1)}
                    >
                      {+pageIndex}
                    </PaginationLink>
                  </PaginationItem>
                )}
              </>
            ))}
            <PaginationItem
              className={cn(!table.getCanNextPage() ? ['pointer-events-none opacity-50'] : [])}
            >
              <PaginationNext
                href="javascript: void(0)"
                onClick={() => {
                  table.nextPage();
                }}
                text={'Вперед'}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </>
  );
}
