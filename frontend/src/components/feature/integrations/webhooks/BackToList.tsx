import { Button } from "@radix-ui/themes"
import { FiArrowLeft } from "react-icons/fi"
import { useNavigate } from "react-router-dom"

export const BackToList = ({ path, label }: { path: string, label: string }) => {

    const navigate = useNavigate()

    return (
        <Button type="button" variant="ghost" color="gray" onClick={() => navigate(path)}>
            <FiArrowLeft /> {label}
        </Button>
    )
}