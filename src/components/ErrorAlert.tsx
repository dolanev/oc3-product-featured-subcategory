import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert.tsx';
import { AlertCircleIcon } from 'lucide-react';

export default function ErrorAlert() {
  return (
    <Alert
      variant="destructive"
      className="fixed right-5 bottom-20 z-50 max-w-md border-red-400 bg-red-50 shadow"
    >
      <AlertCircleIcon />
      <AlertTitle className={'font-bold'}>Сохранение завершилось с ошибкой</AlertTitle>
      <AlertDescription>
        При сохранении изменений возникла ошибка, перезагрузите страницу
      </AlertDescription>
    </Alert>
  );
}
