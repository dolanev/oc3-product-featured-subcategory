import { Input } from '@/components/ui/input.tsx';

type Props = {
  imageDesktop: string;
  imageMobile: string;
  placeholder: string;
  // onSetDesktop: (value: string) => void;
  // onSetMobile: (value: any) => void;
};

export function BannerSelector({
  // onSetDesktop,
  // onSetMobile,
  imageMobile,
  imageDesktop,
  placeholder,
}: Props) {
  return (
    <div className={'flex h-full items-center'}>
      <div className={'inline-flex flex-wrap items-start justify-start gap-7 md:flex-nowrap'}>
        <div className={'flex flex-col overflow-hidden rounded-3xl p-0 shadow'}>
          <div className="flex h-15 items-center justify-center bg-gray-500 p-1 text-center text-card">
            Баннер (Desktop)
          </div>
          <div className="h-60 w-60 rounded-3xl bg-white">
            <a
              href=""
              id="thumb-desktop"
              data-toggle="image"
              className="img-thumbnail h-full w-full border-transparent"
            >
              <img
                src={imageDesktop ? '/image/' + imageDesktop : placeholder}
                alt=""
                title=""
                data-placeholder={placeholder}
                className={'h-full w-full border-transparent object-contain'}
              />
            </a>
            <Input
              type="hidden"
              name="image_desktop"
              value={imageDesktop}
              id="input-image-desktop"
            />
          </div>
        </div>

        <div className={'flex flex-col overflow-hidden rounded-3xl p-0 shadow'}>
          <div className="flex h-15 items-center justify-center bg-gray-500 p-1 text-center text-card">
            Баннер (Mobile)
          </div>
          <div className="h-60 w-60 rounded-3xl bg-white">
            <a
              href=""
              id="thumb-mobile"
              data-toggle="image"
              className="img-thumbnail h-full w-full border-transparent"
            >
              <img
                src={imageMobile ? '/image/' + imageMobile : placeholder}
                alt=""
                title=""
                data-placeholder={placeholder}
                className={'h-full w-full border-transparent object-contain'}
              />
            </a>
            <Input type="hidden" name="image_mobile" value={imageMobile} id="input-image-mobile" />
          </div>
        </div>
      </div>
    </div>
  );
}
