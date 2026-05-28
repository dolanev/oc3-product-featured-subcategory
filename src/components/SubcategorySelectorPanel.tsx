import * as React from 'react';
import {
  type ExistingSubcategory,
  type RenamePreviewItem,
  SubcategorySelector,
  type SubcategoryValue,
} from './SubcategorySelector';
import { useOcMutation, useOcQuery } from '@/lib/api.ts';
import { useMemo } from 'react';

export default function SubcategorySelectorPanel({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const searchByNameMutation = useOcMutation({
    route: 'extension/module/product_featured_subcategory/searchByName',
    formData: true,
  });

  const getRenamePreviewMutation = useOcMutation({
    route: 'extension/module/product_featured_subcategory/getRenamePreview',
    formData: true,
  });

  const renameSubcategoryMutation = useOcMutation({
    route: 'extension/module/product_featured_subcategory/renameSubcategory',
    formData: true,
  });

  const api = {
    searchByName: async (name: string) => {
      let data;
      try {
        data = await searchByNameMutation.mutateAsync({ name });
      } catch (e) {
        console.error(e);
      }
      console.log(data);
      return data;
    },
    async getRenamePreview(params: { name: string; newName: string }) {
      const { newName, name } = params;
      const categories = await this.searchByName(name);
      const preview = [];
      if (Array.isArray(categories)) {
        for (const c of categories) {
          try {
            const response = await getRenamePreviewMutation.mutateAsync({
              subcategory_id: c.id,
              new_name: newName,
            });
            console.log(response);
            if (Array.isArray(response)) {
              for (const r of response) {
                preview.push(r);
                console.log('push preview', r);
              }
            }
          } catch (error) {
            console.error(error);
          }
        }
      }
      console.log('return preview');
      return preview;
    },
    async renameSubcategory(params: { name: string; newName: string }) {
      const { newName, name } = params;
      const categories = await this.searchByName(name);
      if (Array.isArray(categories)) {
        for (const c of categories) {
          try {
            await renameSubcategoryMutation.mutateAsync({
              subcategory_id: c.id,
              new_name: newName,
            });
          } catch (error) {
            console.error(error);
          }
        }
      }
    },
  };

  return (
    <div className="w-[520px] max-w-3xl space-y-6">
      <SubcategorySelector
        api={api}
        value={value ?? undefined}
        onChange={(newValue) => {
          console.log('Subcategory value:', newValue);
          onChange(newValue.name);
        }}
      />
    </div>
  );
}
