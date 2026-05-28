interface Window {
  ProductFeaturedSubcategoryConfig: {
    brands: {
      manufacturer_id: string
      name: string
    }[]
    categories: {
      category_id: string
      name: string
    }[]
    subcategoryName: string
    selectedProducts: {
      product_id: number
      selected: boolean
    }[]
    categoryProducts: Record<any, any>[]
    name: string
    status: "0" | "1"
    module_id?: string
    image_desktop?: string
    image_mobile?: string
    thumb_desktop?: string
    thumb_mobile?: string
    placeholder?: string
    custom_sticker_id?: number
    custom_stickers: {
      id: number
      name: string
    }[]
  }
}
