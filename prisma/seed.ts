import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  await prisma.employee.createMany({
    data: [
      { name: 'Alice' },
      { name: 'Bob' },
      { name: 'Charlie' },
    ],
    skipDuplicates: true,
  })
  console.log('Seed data inserted.')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
