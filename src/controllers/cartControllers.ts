import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Add to cart example
export const addToCart = async (sessionId: string, bookId: number, quantity: number) => {
  return await prisma.cart.upsert({
    where: { sessionId },
    create: {
      sessionId,
      items: {
        create: {
          bookId,
          quantity,
          priceAtAddition: (await prisma.book.findUnique({ where: { id: bookId }))!.price
        }
      },
      total: (await prisma.book.findUnique({ where: { id: bookId }))!.price * quantity
    },
    update: {
      items: {
        upsert: {
          where: { cartId_bookId: { cartId: sessionId, bookId } },
          create: {
            bookId,
            quantity,
            priceAtAddition: (await prisma.book.findUnique({ where: { id: bookId }))!.price
          },
          update: {
            quantity: {
              increment: quantity
            }
          }
        }
      },
      updatedAt: new Date()
    },
    include: { items: { include: { book: true } } }
  });
};