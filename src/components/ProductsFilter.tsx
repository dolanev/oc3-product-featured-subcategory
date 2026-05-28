'use client';

import * as React from 'react';
import { Check, ChevronsUpDown, Settings2Icon } from 'lucide-react';

import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

import MultipleSelector from '@/components/ui/multi-select.tsx';

type Option = {
  label: string;
  value: string;
};

export type ProductFilters = {
  priceFrom: string;
  priceTo: string;
  brands: string[];
  categories: string[];
  activeOnly: boolean;
};

type ProductsFilterProps = {
  brands: Option[];
  categories: Option[];
  value: ProductFilters;
  onChange: (value: ProductFilters) => void;
};

export function ProductsFilter({ brands, categories, value, onChange }: ProductsFilterProps) {
  const updateFilter = <K extends keyof ProductFilters>(key: K, newValue: ProductFilters[K]) => {
    onChange({
      ...value,
      [key]: newValue,
    });
  };

  const resetFilters = () => {
    onChange({
      priceFrom: '',
      priceTo: '',
      brands: [],
      categories: [],
      activeOnly: false,
    });
  };

  return (
    <div className="space-y-4 rounded-xl border bg-card p-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {/* Цена от */}
        <div className="space-y-3 px-1">
          <Label htmlFor="price-from">Цена </Label>
          <div className="flex gap-0 space-x-0">
            <div className={'flex-1'}>
              <Input
                className={
                  'h-[38px] [appearance:textfield] rounded-md rounded-r-none border-input bg-secondary/20 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none'
                }
                id="price-from"
                type="number"
                placeholder="От"
                value={value.priceFrom}
                onChange={(e) => updateFilter('priceFrom', e.target.value)}
              />
            </div>
            <div className={'flex-1'}>
              <Input
                className={
                  'h-[38px] [appearance:textfield] rounded-md rounded-l-none border-input bg-secondary/20 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none'
                }
                id="price-to"
                type="number"
                placeholder="До"
                value={value.priceTo}
                onChange={(e) => updateFilter('priceTo', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Бренды */}
        <div className="">
          <div className={'mb-2 px-1 pb-0 text-sm leading-none font-medium'}>Бренды</div>
          <MultipleSelector
            commandProps={{
              label: 'Выберите бренды',
            }}
            value={brands.filter((el) =>
              value.brands.includes((el as Record<string, any>).manufacturer_id)
            )}
            defaultOptions={brands}
            placeholder="Выберите бренды"
            emptyIndicator={<p className="text-center text-sm">Не найдено</p>}
            className="w-full"
            onChange={(newValue) => {
              console.log(newValue);
              updateFilter(
                'brands',
                newValue.map((el) =>
                  'manufacturer_id' in el ? (el.manufacturer_id as string) : el.value
                )
              );
            }}
          />
        </div>

        {/* Категории */}
        <div className="">
          <div className={'mb-2 px-1 pb-0 text-sm leading-none font-medium'}>Категории</div>
          <MultipleSelector
            commandProps={{
              label: 'Выберите категории',
            }}
            defaultOptions={categories}
            placeholder="Выберите категории"
            emptyIndicator={<p className="text-center text-sm">Не найдено</p>}
            className="w-full"
            value={categories.filter((el) =>
              value.categories.includes((el as Record<string, any>).category_id)
            )}
            onChange={(newValue) =>
              updateFilter(
                'categories',
                newValue.map((el) => ('category_id' in el ? (el.category_id as string) : el.value))
              )
            }
          />
        </div>

        {/* Статус */}
        <div className="space-y-2">
          <Label className={'mb-2 px-1 pb-0 text-sm leading-none font-medium'}>
            Только активные
          </Label>
          <div className="flex h-10 items-center rounded-md px-3">
            <Switch
              checked={value.activeOnly}
              onCheckedChange={(checked) => updateFilter('activeOnly', checked)}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-start">
        <Button type="button" variant="outline" onClick={resetFilters}>
          <Settings2Icon /> Сбросить фильтры
        </Button>
      </div>
    </div>
  );
}
