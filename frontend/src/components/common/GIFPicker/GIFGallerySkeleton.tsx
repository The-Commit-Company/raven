import { Skeleton } from "../Skeleton"

export const GIFGallerySkeleton = () => {
    return (
        <div className="grid grid-cols-2 gap-2 sm:min-w-[420px] min-w-full">
            <div className="grid gap-2">
                <Skeleton
                    style={{ height: '170px' }}
                    className="rounded-sm" />
                <Skeleton
                    style={{ height: '220px' }}
                    className="rounded-sm" />
                <Skeleton style={{ height: '120px' }}
                    className="rounded-sm" />
            </div>
            <div className="grid gap-2">
                <Skeleton
                    style={{ height: '220px' }}
                    className="rounded-sm" />
                <Skeleton style={{ height: '120px' }}
                    className="rounded-sm" />
                <Skeleton
                    style={{ height: '170px' }}
                    className="rounded-sm" />
            </div>
            <div className="grid gap-2">
                <Skeleton
                    style={{ height: '170px' }}
                    className="rounded-sm" />
                <Skeleton
                    style={{ height: '220px' }}
                    className="rounded-sm" />
                <Skeleton style={{ height: '120px' }}
                    className="rounded-sm" />
            </div>
            <div className="grid gap-2">
                <Skeleton
                    style={{ height: '220px' }}
                    className="rounded-sm" />
                <Skeleton
                    style={{ height: '170px' }}
                    className="rounded-sm" />
                <Skeleton style={{ height: '120px' }}
                    className="rounded-sm" />
            </div>
        </div>
    )
}