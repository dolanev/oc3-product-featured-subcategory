// api.ts
// Универсальный адаптер для OpenCart 3 + TanStack Query
// Работает с:
// - route=extension/module/your_module/...
// - user_token
// - FormData / JSON
// - стандартными ответами opencart
// - csrf/user_token автоматом
// - errors/success/json

// // получение настроек
// const settingsQuery = useOcQuery(
//   ['settings'],
//   {
//     route:
//       'extension/module/my_module/getSettings',
//   }
// )
//
// // сохранение настроек
// const saveMutation = useOcMutation({
//   route:
//     'extension/module/my_module/saveSettings',
//   invalidate: [['settings']],
// })
//
// saveMutation.mutate({
//   status: 1,
//   name: 'Test',
// })
//
// // upload файла
// const uploadMutation = useOcMutation({
//   route:
//     'extension/module/my_module/upload',
//   formData: true,
// })
//
// uploadMutation.mutate({
//   file,
// })

import {
  QueryClient,
  type QueryKey,
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
} from "@tanstack/react-query"

export const queryClient = new QueryClient()

type OcRequestMethod = "GET" | "POST" | "PUT" | "DELETE"

interface OcRequestOptions<TBody = any> {
  route: string
  method?: OcRequestMethod
  body?: TBody
  params?: Record<string, any>
  headers?: HeadersInit
  formData?: boolean
}

interface OcResponse<T = any> {
  success?: string
  error?: string | Record<string, string>
  warning?: string
  data?: T
}

const getUserToken = () => {
  const url = new URL(window.location.href)

  return (
    url.searchParams.get("user_token") ||
    // fallback
    (window as any).user_token ||
    ""
  )
}

const buildUrl = (route: string, params?: Record<string, any>) => {
  const url = new URL(
    "index.php",
    window.location.origin + window.location.pathname
  )

  url.searchParams.set("route", route)

  const userToken = getUserToken()

  if (userToken) {
    url.searchParams.set("user_token", userToken)
  }

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value))
      }
    })
  }

  return url.toString()
}

type Primitive = string | number | boolean | null | undefined;
type BodyValue = Primitive | File | Blob | Record<string, any> | Array<any>;

const buildFormData = (fd: FormData, key: string, value: BodyValue): void => {
  if (value === undefined || value === null) {
    return
  }

  // Файлы (File или Blob)
  if (value instanceof File || value instanceof Blob) {
    fd.append(key, value)
    return
  }

  // Массив
  if (Array.isArray(value)) {
    value.forEach((v, i) => {
      // Если элементы массива — примитивы, используем синтаксис key[]
      if (v === null || v === undefined) return
      if (
        typeof v === "object" &&
        !(v instanceof File) &&
        !(v instanceof Blob)
      ) {
        // вложенный объект/массив — индексируем
        buildFormData(fd, `${key}[${i}]`, v)
      } else {
        fd.append(`${key}[]`, v)
      }
    })
    return
  }

  // Объект (не файл)
  if (typeof value === "object") {
    Object.entries(value).forEach(([k, v]) => {
      buildFormData(fd, `${key}[${k}]`, v)
    })
    return
  }

  // Примитив (string/number/boolean)
  fd.append(key, String(value))
}

export async function ocFetch<TResponse = any, TBody = any>({
  route,
  method = "GET",
  body,
  params,
  headers,
  formData = false,
}: OcRequestOptions<TBody>): Promise<TResponse> {
  const url = buildUrl(route, params)

  let payload: BodyInit | undefined

  let requestHeaders: HeadersInit = {
    Accept: "application/json",
    ...headers,
  }

  if (body) {
    if (formData) {
      const fd = new FormData();
      Object.entries(body).forEach(([k, v]) => buildFormData(fd, k, v as BodyValue));
      payload = fd;
    } else {
      requestHeaders = {
        ...requestHeaders,
        "Content-Type": "application/json",
      }

      payload = JSON.stringify(body)
    }
  }

  const response = await fetch(url, {
    method,
    headers: requestHeaders,
    body: payload,
    credentials: "include",
  })

  if (!response.ok) {
    throw new Error(`HTTP Error: ${response.status}`)
  }

  const data: OcResponse<TResponse> = await response.json()

  if (data.error) {
    if (typeof data.error === "string") {
      throw new Error(data.error)
    }

    throw data.error
  }

  return (data.data ?? data) as TResponse
}

/**
 * Универсальный query hook
 */
export function useOcQuery<TData = any>(
  key: QueryKey,
  options: OcRequestOptions,
  queryOptions?: Omit<UseQueryOptions<TData>, "queryKey" | "queryFn">
) {
  return useQuery<TData>({
    queryKey: key,
    queryFn: () => ocFetch<TData>(options),
    ...queryOptions,
  })
}

/**
 * Универсальный mutation hook
 */
export function useOcMutation<TData = any, TVariables = any>(
  options: {
    route: string
    method?: OcRequestMethod
    invalidate?: QueryKey[]
    formData?: boolean
  },
  mutationOptions?: UseMutationOptions<TData, unknown, TVariables>
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (variables: TVariables) =>
      ocFetch<TData>({
        route: options.route,
        method: options.method || "POST",
        body: variables,
        formData: options.formData,
      }),

    onSuccess: async (...args) => {
      if (options.invalidate) {
        await Promise.all(
          options.invalidate.map((key) =>
            queryClient.invalidateQueries({
              queryKey: key,
            })
          )
        )
      }

      mutationOptions?.onSuccess?.(...args)
    },

    ...mutationOptions,
  })
}
