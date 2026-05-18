import { faker } from '@faker-js/faker';

function createRandomBrand() {
  return faker.company.name()
}

const brands = faker.helpers.multiple(createRandomBrand, {
  count: 10,
});

export type Product = {
  productId: string;
  name: string;
  price: number;
  brand: string;
  status: boolean;
}

export function createRandomProduct(): Product {
  return {
    productId: faker.string.uuid(),
    name: faker.commerce.productName(),
    brand: brands[Math.floor(Math.random() * brands.length)],
    status: faker.datatype.boolean(),
    price: +faker.commerce.price({ min: 10000, max: 50000 }),
  };
}

export const products = faker.helpers.multiple(createRandomProduct, {
  count: 1011,
});