import { Button } from '@/components/ui/button';
import { FilterProductTable } from './components/FilterProductTable';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { PaginationState } from '@tanstack/react-table';
import { type ProductFilters, ProductsFilter } from '@/components/ProductsFilter.tsx';
import SubcategorySelectorPanel from '@/components/SubcategorySelectorPanel.tsx';
import { ocFetch, useOcQuery } from '@/lib/api.ts';
import { useDebounce } from '@/components/ui/multi-select.tsx';
import { cn, decodeHtmlString, mapRawToProduct, update } from '@/lib/utils.ts';
import { PlusIcon, XIcon } from 'lucide-react';
import { CategoryProductTable } from '@/components/CategoryProductTable.tsx';
import { Spinner } from '@/components/ui/spinner.tsx';
import { Input } from '@/components/ui/input.tsx';
import { Switch } from '@/components/ui/switch.tsx';
import { BannerSelector } from '@/components/BannerSelector.tsx';
import StickerSelector from '@/components/StickerSelector.tsx';
import ErrorAlert from '@/components/ErrorAlert.tsx';
import {
  type CategorySelectedProducts,
  type Product, type RawProduct,
  Settings,
  type TProductsResponse,
} from '@/types.ts';

const cfg: Window['ProductFeaturedSubcategoryConfig'] = window.ProductFeaturedSubcategoryConfig;

const BRANDS = cfg?.brands.map((b) => ({
  label: decodeHtmlString(b.name),
  value: decodeHtmlString(b.name),
  manufacturer_id: b.manufacturer_id,
}));

const CATEGORIES = cfg.categories.map((c) => ({
  label: decodeHtmlString(c.name),
  value: decodeHtmlString(c.name),
  category_id: c.category_id,
}));

const CUSTOM_STICKERS = cfg.custom_stickers;
const SEL_INPUT_IMAGE_MOBILE = '#input-image-mobile';
const SEL_INPUT_IMAGE_DESKTOP = '#input-image-desktop';

type State = {
  moduleName: string;
  moduleStatus: boolean;
  subcategoryName: string;
  imageDesktop: string;
  imageMobile: string;
  imagePlaceholder: string;
  pagination: PaginationState;
  stickerId: string;
  addProductsOn: boolean;
  saveState: {
    isLoading: boolean;
    error: any;
  };
  featuredProducts: Product[];
  featuredSelectedProducts: CategorySelectedProducts;
  productsMarkedForDeletion: number[];
};

const initialState: State = {
  moduleName: cfg.name ?? '',
  moduleStatus: cfg.status && cfg.status === '1' ? true : false,
  subcategoryName: cfg.subcategoryName ?? '',
  stickerId: `${cfg.custom_sticker_id}`,
  addProductsOn: false,
  imageDesktop: cfg.image_desktop ?? '',
  imageMobile: cfg.image_mobile ?? '',
  imagePlaceholder: cfg.placeholder ?? '',
  pagination: {
    pageIndex: 0,
    pageSize: Settings.pagingationPageSize,
  },
  saveState: {
    isLoading: false,
    error: false,
  },
  featuredProducts: [],
  featuredSelectedProducts: cfg.selectedProducts ?? [],
  productsMarkedForDeletion: [],
};

export function App() {
  const [state, setState] = useState<State>(initialState);

  const moduleId = useRef(cfg.module_id ?? '');

  const { data: categoryProducts } = useOcQuery<TProductsResponse>(
    ['categoryProducts', state.subcategoryName],
    {
      method: 'POST',
      formData: true,
      route: 'extension/module/product_featured_subcategory/getProductsBySubcategoryName',
      body: { name: state.subcategoryName },
    },
    {
      enabled: !!state.subcategoryName,
    }
  );

  useEffect(() => {
    if (categoryProducts === undefined) return;

    update(setState)({featuredProducts: categoryProducts?.map(mapRawToProduct) ?? []})
  }, [categoryProducts]);

  const [filters, setFilters] = useState<ProductFilters>({
    priceFrom: '',
    priceTo: '',
    brands: [],
    categories: [],
    activeOnly: false,
  });

  const debouncedFilters = useDebounce(filters, 300);

  const productsQuery = useOcQuery(
    ['products', { filters: debouncedFilters, page: state.pagination.pageIndex }],
    {
      method: 'POST',
      route: 'extension/module/product_featured_subcategory/filterProducts',
      body: { ...debouncedFilters, page: state.pagination.pageIndex + 1, limit: state.pagination.pageSize },
    },
    {
      select: (result) => {
        console.log('result', result);
        return {
          pagination: {
            pageIndex: result.pagination.page - 1,
            pageSize: result.pagination.limit,
          },

          paginationTotalRows: result.pagination.total,

          filteredProducts: (result.products as RawProduct[]).map((el: Record<string, any>) => ({
            productId: el.product_id,
            name: el.name,
            brand: el.model,
            status: el.status === '1',
            price: +el.price,
          })),
        };
      },
    }
  );



  const filteredProducts = productsQuery.data?.filteredProducts ?? [];
  const paginationTotalRows = productsQuery.data?.paginationTotalRows ?? 0;

  console.log(`paginationTotalRows ${paginationTotalRows}`);

  const handlePaginationChange = (newPagination: PaginationState) => {
    update(setState)({ pagination: newPagination });
  };

  const handleDelete = (row: Product) => {
    console.log('Delete', row);
    update(setState)({
      featuredProducts: state.featuredProducts.filter(el => el.productId !== row.productId),
      productsMarkedForDeletion: [...state.productsMarkedForDeletion, +row.productId],
      featuredSelectedProducts: state.featuredSelectedProducts.filter(
        (el) => el.product_id !== +row.productId
      ),
    });
  };

  const handleAdd = (row: Product) => {
    const selected = state.featuredSelectedProducts;
    let newSelected;
    if (selected.findIndex((el) => el.product_id === +row.productId) !== -1) {
      newSelected = [...selected];
    } else {
      newSelected = [...selected, { product_id: +row.productId, selected: true }];
    }

    update(setState)({
      featuredProducts: state.featuredProducts.find(el => el.productId === row.productId) ? [...state.featuredProducts] : [...state.featuredProducts, row],
      featuredSelectedProducts: newSelected,
      productsMarkedForDeletion: state.productsMarkedForDeletion.filter(
        (p) => +row.productId !== p
      ),
    });
  };

  const handleSliderProductToggle = (payload: { row: Product; isChecked: boolean }) => {
    console.log('toggle select', payload);
    const prev = state.featuredSelectedProducts;
    if (state.featuredSelectedProducts.some((el) => el.product_id === +payload.row.productId)) {
      update(setState)({
        featuredSelectedProducts: prev.map((p) =>
          p.product_id === +payload.row.productId
            ? {
                product_id: p.product_id,
                selected: payload.isChecked,
              }
            : p
        ),
      });
    } else {
      update(setState)({
        featuredSelectedProducts: [
          ...prev,
          {
            product_id: +payload.row.productId,
            selected: payload.isChecked,
          },
        ],
      });
    }
  };

  const handleSave = async () => {
    try {
      if (!state.subcategoryName.trim()) return;

      update(setState)({ saveState: { isLoading: true, error: false } });

      const response = await ocFetch({
        route: 'extension/module/product_featured_subcategory/save',
        formData: true,
        method: 'POST',
        body: {
          subcategory_name: state.subcategoryName,
          remove_subcategory_from_ids: state.productsMarkedForDeletion,
          product_rows: state.featuredSelectedProducts,
          module_id: moduleId.current,
          name: state.moduleName,
          status: state.moduleStatus ? 1 : 0,
          image_desktop:
            document.querySelector<HTMLInputElement>(SEL_INPUT_IMAGE_DESKTOP)?.value || '',
          image_mobile:
            document.querySelector<HTMLInputElement>(SEL_INPUT_IMAGE_MOBILE)?.value || '',
          custom_sticker_id: state.stickerId === '-1' ? '' : state.stickerId,
        },
      });

      if ('success' in response) {
        if ('module_id' in response) moduleId.current = response.module_id;
      } else {
        console.log(response);
        throw new Error('Save failed');
      }
    } catch (e) {
      console.log(e);
      update(setState)({ saveState: { ...state.saveState, error: e } });
    } finally {
      update(setState)({ saveState: { ...state.saveState, isLoading: false } });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(`${e.target.name}: ${e.target.value}`);
    setState((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div
      className={cn({
        'pointer-events-none animate-pulse': state.saveState.isLoading,
      })}
    >
      {state.saveState.error && <ErrorAlert />}

      <Button
        onClick={handleSave}
        type={'button'}
        variant={'default'}
        size={'lg'}
        disabled={state.saveState.isLoading || state.saveState.error}
        className={
          'border-xl fixed right-5 bottom-5 z-50 flex cursor-pointer gap-1.5 border-transparent bg-green-500 text-white shadow transition-all hover:bg-green-700'
        }
      >
        {state.saveState.isLoading && <Spinner />} Сохранить
      </Button>

      <div className="items-center gap-4 md:grid md:grid-cols-2 md:grid-rows-2">
        <div className="h-full w-full gap-y-4 rounded-4xl bg-white p-3 pt-5 shadow">
          <div className={'flex items-center gap-2.5'}>
            <h5 className={'m-0 w-40 p-0 font-heading text-lg'}>Название модуля</h5>
            <div className={'flex-1'}>
              <Input name="moduleName" value={state.moduleName} onChange={handleChange} />
            </div>
          </div>

          <div className={'mt-6 flex items-center gap-2.5'}>
            <h5 className={'m-0 w-40 p-0 font-heading text-lg'}>Статус модуля</h5>
            <div>
              <Switch
                color={state.moduleStatus ? '#6EC531' : undefined}
                className={'data-checked:border-green-500 data-checked:bg-green-500'}
                checked={state.moduleStatus}
                onCheckedChange={(isChecked) => update(setState)({ moduleStatus: isChecked })}
              />
            </div>
          </div>
        </div>

        <div className={'row-start-2 h-full w-full gap-y-4 rounded-4xl bg-white p-3 pt-5 shadow'}>
          <SubcategorySelectorPanel
            value={state.subcategoryName}
            onChange={(value) => update(setState)({ subcategoryName: value })}
          />
        </div>

        <div
          className={'col-start-2 row-span-2 h-full w-full gap-y-4 rounded-4xl bg-white p-5 shadow'}
        >
          <div>
            <BannerSelector
              // onSetMobile={(s) => update(setState)({ imageMobile: s })}
              // onSetDesktop={(s) => update(setState)({ imageDesktop: s })}
              imageDesktop={state.imageDesktop}
              imageMobile={state.imageMobile}
              placeholder={state.imagePlaceholder}
            />
          </div>
          <StickerSelector
            data={CUSTOM_STICKERS}
            selectedValue={state.stickerId}
            onChange={(v) => update(setState)({ stickerId: v })}
          />
        </div>
      </div>

      <div className="my-4 flex justify-center align-middle">
        <div className="flex w-full flex-col items-stretch">
          <form className={'flex flex-col space-y-4'}>
            <div
              className={cn({
                'max-w-fit gap-y-4 rounded-4xl p-2 transition-all': true,
                'bg-gray-500/10': state.addProductsOn,
              })}
            >
              <Button
                type={'button'}
                onClick={() => update(setState)({ addProductsOn: !state.addProductsOn })}
                variant={state.addProductsOn ? 'outline' : undefined}
                className={cn({
                  'flex gap-1 transition-all': true,
                  '-ml-2': !state.addProductsOn,
                })}
              >
                {!state.addProductsOn ? (
                  <>
                    <div>Выбрать товары</div>
                    <PlusIcon />
                  </>
                ) : (
                  <>
                    <div>Закрыть таблицу</div>
                    <XIcon />
                  </>
                )}
              </Button>
              {state.addProductsOn && (
                <>
                  <div className="anim my-6 space-y-4">
                    <ProductsFilter
                      brands={BRANDS}
                      categories={CATEGORIES}
                      value={filters}
                      onChange={(filters) => {
                        console.log('Filters:', filters);
                        update(setState)({ pagination: initialState.pagination });
                        setFilters(filters);
                      }}
                    />
                  </div>

                  <div
                    className={cn({
                      'pointer-events-none animate-pulse': productsQuery.isPending,
                      'mt-4 rounded-3xl bg-white p-2 shadow': true,
                    })}
                  >
                    <FilterProductTable
                      data={filteredProducts}
                      selectedProducts={state.featuredSelectedProducts.map((el) => el.product_id)}
                      rowCount={paginationTotalRows}
                      pagination={state.pagination}
                      onPaginationChange={handlePaginationChange}
                      onAdd={handleAdd}
                    ></FilterProductTable>
                  </div>
                </>
              )}
            </div>
          </form>
        </div>
      </div>

      <CategoryProductTable
        selectedProducts={state.featuredSelectedProducts
          .filter((el) => el.selected)
          .map((el) => el.product_id)}
        data={state.featuredProducts || []}
        onSelectChange={handleSliderProductToggle}
        onDelete={handleDelete}
      />
    </div>
  );
}

export default App;
