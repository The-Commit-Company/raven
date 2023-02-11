import Lottie, { LottieProps } from 'react-lottie'

export const EmptyState = ({ ...props }: LottieProps) => {

    const defaultOptions = {
        loop: false,
        autoplay: true,
        rendererSettings: {
            preserveAspectRatio: "xMidYMid slice"
        }
    };

    return (
        <Lottie
            options={{ ...defaultOptions, ...props.options }}
            height={props.height ?? 200}
            width={props.height ?? 200}
        />
    )
}