import { prisma } from '@/lib/prisma'
import DrawerClientConfig from './client-page'

export default async function DrawerDesignPage() {
    const categories = await prisma.category.findMany({
        where: { parentId: null },
        orderBy: { order: 'asc' },
        include: {
            children: { orderBy: { order: 'asc' } },
        },
    })

    return <DrawerClientConfig categories={categories} />
}
