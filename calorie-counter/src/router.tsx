import { QueryClient } from '@tanstack/react-query'
import { createRouter } from '@tanstack/react-router'
import { setupRouterSsrQueryIntegration } from '@tanstack/react-router-ssr-query'
import { routeTree } from './routeTree.gen'

export function getRouter() {
  const queryClient = new QueryClient()
  const router = createRouter({
    routeTree,
    // optionally expose the QueryClient via router context
    context: { queryClient },
    scrollRestoration: true,
    defaultPreload: 'intent',
  })

setupRouterSsrQueryIntegration({
  router,
  queryClient,
  dehydrateOptions: {
    shouldDehydrateQuery: (query) => query.meta?.ssr !== false,
  },
  hydrateOptions: {
    defaultOptions: {
      queries: {
        gcTime: 60_000,
      },
    },
  },
})

  return router
}