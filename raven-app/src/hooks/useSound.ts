import useSound from 'use-sound';
import deleteSound from '../assets/sounds/delete.mp3';

export const useDeleteSound = () => {
    const [play] = useSound(
        deleteSound,
        { volume: 0.5 }
    );

    return play;
}