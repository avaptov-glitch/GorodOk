import { prisma } from '@/lib/prisma'
import SidebarClientConfig from './client-page'

export default async function SidebarDesignPage() {
    const categories = await prisma.category.findMany({
        where: { parentId: null },
        orderBy: { order: 'asc' },
        include: {
            children: { orderBy: { order: 'asc' } },
        },
    })

    return <SidebarClientConfig categories={categories} />
}
