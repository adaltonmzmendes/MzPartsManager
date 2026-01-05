import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import api from '@/services/api'
import { ItemData } from '@/components/ItemRow'

interface PaginatedResponse {
  count: number
  next: string | null
  previous: string | null
  results: ItemData[]
}

export function useCatalogItems(searchTerm: string) {
  const queryClient = useQueryClient()

  const query = useInfiniteQuery<PaginatedResponse>({
    queryKey: ['items', searchTerm],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await api.get<PaginatedResponse>('api/catalog/items/', {
        params: {
          page: pageParam,
          search: searchTerm || undefined,
        },
      })
      return res.data
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage.next) return undefined
      const url = new URL(lastPage.next)
      return url.searchParams.get('page')
    },
    initialPageParam: 1,
  })

  // Lógica de "achatar" os dados movida para o hook
  const allItems = query.data?.pages.flatMap((page) => page.results) ?? []
  const totalCount = query.data?.pages[0]?.count ?? 0

  const invalidateCatalog = () => {
    queryClient.invalidateQueries({ queryKey: ['items'] })
  }

  return {
    ...query,
    allItems,
    totalCount,
    invalidateCatalog
  }
}