import { prisma } from '@/lib/prisma'
import DirectoryClientConfig from './client-page'

export default async function DirectoryDesignPage() {
    const categories = await prisma.category.findMany({
        where: { parentId: null },
        orderBy: { order: 'asc' },
        include: {
            children: { orderBy: { order: 'asc' } },
        },
    })

    return <DirectoryClientConfig categories={categories} />
}
