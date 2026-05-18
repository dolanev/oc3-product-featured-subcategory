import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input.tsx"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field.tsx"
import { FilterProductTable } from "./components/FilterProductTable"
import { useEffect, useState } from "react"
import { type Product, products } from "@/data/seed.tsx"
import type { OnChangeFn, PaginationState } from "@tanstack/react-table"

export function App() {
  const [data, setData] = useState<Product[]>([])

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  })

  const [selectedProducts, setSelectedProducts] = useState<Product[]>([])

  useEffect(() => {
    setData(products.slice(0, pagination.pageSize))
  }, [pagination.pageSize])

  const updateRow = (id: Product["productId"], newRowData: Product) => {
    setData((old: Product[]) =>
      old.map((row) => (row.productId === id ? newRowData : row))
    )
  }
  const handlePaginationChange: OnChangeFn<PaginationState> = (updater) => {
    setPagination((old) => {
      const newState = typeof updater === "function" ? updater(old) : updater

      setData(
        products.slice(
          newState.pageIndex * newState.pageSize,
          newState.pageIndex * newState.pageSize + newState.pageSize
        )
      )
      return newState
    })
  }
  const handleRowChange = (oldRow: Product, newRow: Product) => {
    updateRow(oldRow.productId, newRow)
    if (newRow.status) {
      setSelectedProducts((prev) => {
        if (prev.findIndex((el) => el.productId === newRow.productId) !== -1) {
          return [...prev]
        } else {
          return [...prev, newRow]
        }
      })
    } else {
      setSelectedProducts((prev) => prev.filter((el) => el.productId !== newRow.productId))
    }
  }

  return (
    <>
      <div className="my-4 flex justify-center align-middle">
        <div className="max-w-4xl rounded-4xl border-1 p-4">
          <form className={"flex flex-col space-y-4"}>
            <div className={"max-w-fit gap-y-4 rounded-4xl bg-gray-500/10 p-2"}>
              <Button type={"button"}>Add Products</Button>
              <div>
                <FilterProductTable
                  onPaginationChange={handlePaginationChange}
                  data={data}
                  rowCount={products.length}
                  pagination={pagination}
                  onRowChange={handleRowChange}
                ></FilterProductTable>
              </div>
            </div>
          </form>
        </div>
      </div>
      <ul className={"flex flex-col space-y-1 mx-auto m-4 border-2 rounded-4xl max-w-2xl"}>
        {selectedProducts.map((product) => (
          <li key={product.productId} className={"border-b-1 p-2"}>{product.name}</li>
        ))}
      </ul>
    </>
  )
}

export default App
