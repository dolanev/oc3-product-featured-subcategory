import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  type Row,
  useReactTable,
} from '@tanstack/react-table';

import { RussianRubleIcon, Trash2Icon } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table.tsx';
import { useMemo } from 'react';
import { cn, emit } from '@/lib/utils.ts';
import { Badge } from '@/components/ui/badge.tsx';
import { Switch } from '@/components/ui/switch.tsx';
import { Field, FieldLabel } from '@/components/ui/field.tsx';
import { Button } from '@/components/ui/button.tsx';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip.tsx';
import { ScrollArea } from '@/components/ui/scroll-area.tsx';
import type { Product } from '../types';

function RowActions(props: {
  selectedProducts: number[];
  row: Row<Product>;
  onChange: (checked: boolean, productId: Product['productId'], rowData: Product) => void;
}) {
  const id = props.row.original.productId;
  const selected = props.selectedProducts.includes(+id);
  return (
    <>
      <Field orientation="horizontal" className="flex w-fit items-center text-sm">
        <Switch
          color={selected ? '#6EC531' : undefined}
          id={'active-' + id}
          size={'sm'}
          onCheckedChange={(checked) => props.onChange(checked, id, props.row.original)}
          checked={selected}
        />
        <FieldLabel
          htmlFor={'active-' + id}
          className={cn({
            'opacity-60': !selected,
            'm-0 p-0': true,
          })}
        >
          {selected ? 'Добавлен' : 'Отключен'}
        </FieldLabel>
      </Field>
    </>
  );
}

const columnHelper = createColumnHelper<Product>();

type TProps = {
  data: Product[];
  selectedProducts: number[];
  onSelectChange: (payload: { row: Product; isChecked: boolean }) => void;
  onDelete: (row: Product) => void;
};

export function CategoryProductTable1({ data, selectedProducts, onSelectChange }: TProps) {
  return <div>{JSON.stringify(data)}</div>;
}

export function CategoryProductTable({ data, selectedProducts, onSelectChange, onDelete }: TProps) {
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
        id: 'select-action',
        header: 'Показывать в слайдере',
        cell: (props) => (
          <RowActions
            selectedProducts={selectedProducts}
            row={props.row}
            onChange={(checked, id, rowData) =>
              // onSelectChange(rowData, checked)
              emit(onSelectChange, {
                row: rowData,
                isChecked: checked,
              })
            }
          />
        ),
      }),
      columnHelper.display({
        id: 'actions',
        cell: (props) => (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={() => emit(onDelete, props.row.original)}
                variant="outline"
                className="h-10 w-10 rounded-md border-red-400 bg-red-50 text-red-400 transition-all hover:bg-red-400 hover:text-white"
              >
                <Trash2Icon />
              </Button>
            </TooltipTrigger>
            <TooltipContent side={'left'} className={'h-fit items-center'}>
              Удалить
            </TooltipContent>
          </Tooltip>
        ),
      }),
    ],
    [onDelete, onSelectChange, selectedProducts]
  );

  const table = useReactTable({
    data: data ?? [],
    columns: defaultColumns,
    getCoreRowModel: getCoreRowModel<Product>(),
    manualPagination: true,
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <>
      <div className={'mb-4 font-heading text-lg font-bold'}>Выбранные товары:</div>
      <div className={'w-full'}>
        <ScrollArea className="h-[700px] [&>div]:rounded-sm [&>div]:border">
          <Table className={'bg-white'}>
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
        </ScrollArea>
      </div>
    </>
  );
}
