import { motion } from "framer-motion";

export const OPACITY_ON_LOAD = {
    as: motion.div,
    initial: { opacity: 0 },
    animate: { opacity: 1 }
}