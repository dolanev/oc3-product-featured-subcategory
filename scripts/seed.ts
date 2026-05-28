import { faker } from "@faker-js/faker"
import * as fs from "fs"
import * as path from "path"

function createRandomBrand() {
  return faker.company.name()
}

const brands = faker.helpers.multiple(createRandomBrand, { count: 10 })

function createRandomProduct() {
  return {
    productId: faker.string.uuid(),
    name: faker.commerce.productName(),
    brand: brands[Math.floor(Math.random() * brands.length)],
    status: faker.datatype.boolean(),
    price: +faker.commerce.price({ min: 10000, max: 50000 }),
  }
}

const products = faker.helpers.multiple(createRandomProduct, { count: 1011 })

const outDir = path.resolve(process.cwd(), "public", "data")
fs.mkdirSync(outDir, { recursive: true })
fs.writeFileSync(
  path.join(outDir, "products.json"),
  JSON.stringify(products, null, 2)
)
console.log("seed written:", path.join(outDir, "products.json"))
