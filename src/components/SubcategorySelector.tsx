import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Pencil, RefreshCcw, Search } from 'lucide-react';
import { useEffect } from 'react';

export type ExistingSubcategory = {
  id: number;
  name: string;
  category_id: number;
  category_name: string;
};

export type RenamePreviewItem = {
  category_name: string;
  old_name: string;
  new_name: string;
};

export type SubcategoryValue = {
  mode: 'existing' | 'new';
  subcategoryId?: number;
  name: string;
};

type Props = {
  value?: string;
  onChange?: (value: SubcategoryValue) => void;

  api: {
    searchByName: (name: string) => Promise<ExistingSubcategory[]>;

    getRenamePreview: (params: { name: string; newName: string }) => Promise<RenamePreviewItem[]>;

    renameSubcategory: (params: { name: string; newName: string }) => Promise<void>;
  };
};

export function SubcategorySelector({ value, onChange, api }: Props) {
  const [name, setName] = React.useState('');
  const [locked, setLocked] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  console.log('SubcategorySelector value', value);
  const [current, setCurrent] = React.useState<Omit<
    ExistingSubcategory,
    'category_id' | 'category_name' | 'id'
  > | null>(
    value
      ? {
          name: value,
        }
      : null
  );

  useEffect(() => {
    if (value) {
      setLocked(true);
      setName(value);
    }
  }, [value]);

  const [duplicates, setDuplicates] = React.useState<ExistingSubcategory[]>([]);
  const [duplicateOpen, setDuplicateOpen] = React.useState(false);

  const [renameMode, setRenameMode] = React.useState(false);
  const [renameValue, setRenameValue] = React.useState('');
  const [renamePreview, setRenamePreview] = React.useState<RenamePreviewItem[]>([]);
  const [renameDialogOpen, setRenameDialogOpen] = React.useState(false);

  const emit = (payload: SubcategoryValue) => {
    onChange?.(payload);
  };

  const handleConfirm = async () => {
    if (!name.trim()) return;

    setLoading(true);

    try {
      const results = await api.searchByName(name.trim());

      if (results.length > 0) {
        setDuplicates(results);
        setDuplicateOpen(true);
        return;
      }

      setLocked(true);
      emit({
        mode: 'new',
        name: name.trim(),
      });
    } finally {
      setLoading(false);
    }
  };

  const modeUseExisting = (item: ExistingSubcategory) => {
    setCurrent(item);
    setName(item.name);
    setLocked(true);
    setDuplicateOpen(false);

    emit({
      mode: 'existing',
      subcategoryId: item.id,
      name: item.name,
    });
  };

  const startRename = () => {
    if (!current) return;

    setRenameMode(true);
    setRenameValue(name);
    setLocked(false);
  };

  const previewRename = async () => {
    if (!current) return;

    const preview = await api.getRenamePreview({
      name: name,
      newName: renameValue.trim(),
    });

    console.log(preview);

    setRenamePreview(preview);
    setRenameDialogOpen(true);
  };

  const applyRename = async () => {
    if (!current) return;

    await api.renameSubcategory({
      name: name,
      newName: renameValue.trim(),
    });

    setName(renameValue.trim());
    setLocked(true);
    setRenameMode(false);
    setRenameDialogOpen(false);

    emit({
      mode: 'existing',
      // subcategoryId: current.id,
      name: renameValue.trim(),
    });
  };

  const switchToNew = () => {
    setCurrent(null);
    setLocked(false);
    setName('');

    emit({
      mode: 'new',
      name: '',
    });
  };

  const inputValue = renameMode ? renameValue : name;

  console.log('inputValue', inputValue);
  return (
    <>
      <div className="space-y-3">
        <Label className={'font-heading text-lg'}>Название подкатегории</Label>

        <div className="flex gap-2">
          <Input
            value={inputValue}
            disabled={locked && !renameMode}
            onChange={(e) =>
              renameMode ? setRenameValue(e.target.value) : setName(e.target.value)
            }
          />

          {!locked && !renameMode && (
            <Button onClick={handleConfirm} disabled={loading || !name.trim()}>
              <Search className="mr-2 h-4 w-4" />
              ОК
            </Button>
          )}

          {renameMode && (
            <>
              <Button onClick={previewRename}>Подтвердить</Button>
              <Button
                variant="outline"
                onClick={() => {
                  setRenameMode(false);
                  setLocked(true);
                }}
              >
                Отмена
              </Button>
            </>
          )}
        </div>

        {locked && !renameMode && (
          <div className="flex flex-wrap gap-2">
            {current && (
              <Button variant="outline" onClick={startRename}>
                <Pencil className="mr-2 h-4 w-4" />
                Изменить название подкатегории
              </Button>
            )}

            <Button variant="outline" onClick={switchToNew}>
              <RefreshCcw className="mr-2 h-4 w-4" />
              Поменять подкатегорию на новую
            </Button>
          </div>
        )}

        {locked && !renameMode && (
          <p className="text-sm text-muted-foreground">
            Удалить старые подкатегории можно в соответствующем разделе админки.
          </p>
        )}
      </div>

      <AlertDialog open={duplicateOpen} onOpenChange={setDuplicateOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Подкатегория уже существует</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div>
                <ul className="list-disc space-y-1 pl-5">
                  {duplicates.map((item) => (
                    <li key={item.id}>
                      {item.category_name} → {item.name}
                    </li>
                  ))}
                </ul>
                <p className="mt-3">Использовать существующую подкатегорию?</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={() => modeUseExisting(duplicates[0])}>
              Использовать
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Подтверждение переименования</DialogTitle>
            <DialogDescription>Будут изменены следующие подкатегории:</DialogDescription>
          </DialogHeader>

          <ul className="space-y-1 text-sm">
            {renamePreview.map((item, index) => (
              <li key={index}>
                {item.category_name}: {item.old_name} → {item.new_name}
              </li>
            ))}
          </ul>

          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={applyRename}>Подтвердить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
