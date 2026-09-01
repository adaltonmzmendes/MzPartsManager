export interface LostSale {
  id: number
  item: number | null
  item_description: string | null
  product_name: string
  reason: string
  reason_display: string
  quantity: number
  observation: string
  created_at: string
}

export interface PaginatedLostSales {
  count: number
  next: string | null
  previous: string | null
  results: LostSale[]
}