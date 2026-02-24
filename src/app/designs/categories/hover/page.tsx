import { prisma } from '@/lib/prisma'
import HoverClientConfig from './client-page'

export default async function HoverDesignPage() {
    const categories = await prisma.category.findMany({
        where: { parentId: null },
        orderBy: { order: 'asc' },
        include: {
            children: { orderBy: { order: 'asc' }, take: 4 }, // Take only top 4 for hover preview
        },
    })

    return <HoverClientConfig categories={categories} />
}
