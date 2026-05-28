import { useEffect, useId, useMemo, useState } from 'react';

import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { emit } from '@/lib/utils.ts';
import { FileQuestionMark, ShieldAlert, ShieldAlertIcon } from 'lucide-react';

type Props = {
  data: Window['ProductFeaturedSubcategoryConfig']['custom_stickers'];
  onChange: (val: string) => void;
  selectedValue: string;
};

const disabledOptionValue = '-1';

const StickerSelector = ({ data, selectedValue, onChange }: Props) => {
  const id = useId();

  console.log('StickerSelector Data:', data);

  const mappedData = [
    { label: '— Без стикера —', value: disabledOptionValue },
    ...data.map((el) => ({ label: el.name, value: el.id })),
  ];

  const handleChange = (value: string) => {
    emit(onChange, value);
  };

  return (
    <div className={'flex flex-wrap gap-4 md:flex-nowrap'}>
      <div className="mt-5 w-full max-w-xs space-y-2 md:flex-1/2">
        <Label htmlFor={id}>Произвольный стикер для всех выбранных товаров</Label>
        <Select
          value={selectedValue === '' ? disabledOptionValue : selectedValue}
          defaultValue={disabledOptionValue}
          onValueChange={handleChange}
        >
          <SelectTrigger
            id={id}
            className="w-full focus-visible:border-indigo-500 focus-visible:ring-indigo-500/20 dark:focus-visible:ring-indigo-500/40"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="p-1">
            {mappedData.map((item) => (
              <SelectItem key={item.value} value={`${item.value}`}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div
        className={
          'mt-5 flex items-center gap-2.5 rounded-2xl border border-amber-400 bg-amber-50 p-4 text-amber-600 md:flex-1/2'
        }
      >
        <ShieldAlertIcon />
        <div>Используйте данный стикер только в этом модуле.</div>
      </div>
    </div>
  );
};

export default StickerSelector;
