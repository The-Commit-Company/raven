import DocumentPreviewToolConfigurator from '@/components/feature/DocumentPreviewToolConfigurator'
import PageContainer from '@/components/layout/Settings/PageContainer'
import SettingsContentContainer from '@/components/layout/Settings/SettingsContentContainer'
import SettingsPageHeader from '@/components/layout/Settings/SettingsPageHeader'

const DocumentPreviewTool = () => {
  return (
    <PageContainer>
      <SettingsContentContainer>
        <SettingsPageHeader
          title='Xem Trước Tài Liệu'
          description='Tùy chỉnh cách hiển thị liên kết tài liệu trong cuộc trò chuyện. Bạn có thể thêm/bớt các trường hiển thị trong phần xem trước.'
        />
        <DocumentPreviewToolConfigurator />
      </SettingsContentContainer>
    </PageContainer>
  )
}

export const Component = DocumentPreviewTool
