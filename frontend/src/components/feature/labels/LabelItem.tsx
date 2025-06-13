// ==== labels/components/LabelItem.tsx ====
import { MdLabelOutline } from 'react-icons/md'
import LabelItemMenu from './LabelItemMenu'

interface LabelItemProps {
  label: string
  onEdit?: () => void
  onDelete?: () => void
}

const LabelItem: React.FC<LabelItemProps> = ({ label, onEdit, onDelete }) => (
  <div className='group cursor-pointer flex items-center justify-between px-3 py-2 rounded-md hover:bg-gray-3 transition-colors'>
    <div className='flex items-center gap-2 text-sm text-gray-12'>
      <MdLabelOutline className='w-4 h-4 text-gray-11 shrink-0' />
      <span>{label}</span>
    </div>
    <LabelItemMenu label={label} onEdit={onEdit} onDelete={onDelete} />
  </div>
)

export default LabelItem
