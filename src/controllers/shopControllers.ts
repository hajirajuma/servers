import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getShop = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
      const bookList = await prisma.Booklist.findMany({

      })
    }catch (error){
      res.status(500).json({ message: "Error retrieving shop metrics" });  
    }
}