import { prisma } from '@/lib/prisma'
import AccordionClientConfig from './client-page'

export default async function AccordionDesignPage() {
    const categories = await prisma.category.findMany({
        where: { parentId: null },
        orderBy: { order: 'asc' },
        include: {
            children: { orderBy: { order: 'asc' } },
        },
    })

    return <AccordionClientConfig categories={categories} />
}
