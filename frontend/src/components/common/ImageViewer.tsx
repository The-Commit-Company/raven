import { PropsWithChildren } from 'react'
import { TransformWrapper, TransformComponent, ReactZoomPanPinchProps } from "react-zoom-pan-pinch";


interface ImageViewerProps extends ReactZoomPanPinchProps {
    children: React.ReactNode

}
const ImageViewer = ({ children, ...props }: ImageViewerProps) => {
    return (
        <TransformWrapper centerOnInit centerZoomedOut limitToBounds {...props}>
            <TransformComponent>
                {children}
            </TransformComponent>
        </TransformWrapper>
    )
}

export default ImageViewer