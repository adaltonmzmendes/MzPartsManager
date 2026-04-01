export interface Inventory {
  quantity: number
  cost_price: string
  sell_price: string
}

export interface Item {
  id: number
  description: string
  inventory?: Inventory
}

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}