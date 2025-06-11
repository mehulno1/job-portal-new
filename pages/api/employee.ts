// pages/api/employees.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const employees = await prisma.employee.findMany({
        select: { id: true, name: true }
      });
      res.status(200).json(employees);
    } catch (error) {
      console.error('Error fetching employees:', error);
      res.status(500).json({ error: 'Error fetching employees' });
    }
  } else {
    res.status(405).end(); // Method Not Allowed
  }
}
