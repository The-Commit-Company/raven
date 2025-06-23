# Timeline Mention Implementation ($)

This document outlines the implementation of timeline mentions using the `$` character in Raven chat.

## Overview
When users type `$` as the first character in chat (except spaces), they'll see suggestions of timeline documents from the TCR ERP. After selecting a timeline and typing additional text, the message is sent to chat and also appended to the selected timeline's updates with a timestamp.

## Files Modified/Created

### Frontend Changes

#### 1. Main Chat Input Component
**File:** `/frappe-bench/apps/raven/frontend/src/components/feature/chat/ChatInput/Tiptap.tsx`
- Added `TimelineMention` extension using `$` character
- Added timeline document fetching with `useTimelineDocuments` hook
- Added timeline update processing in `handleMessageSendAction`
- Added timeline mention configuration with popup suggestions
- Added timeline update API call integration

#### 2. Timeline Mention List Component  
**File:** `/frappe-bench/apps/raven/frontend/src/components/feature/chat/ChatInput/TimelineMentionList.tsx`
- Already existed, displays timeline documents in suggestion dropdown
- Shows timeline task, experiment ID, dates, and status
- Handles selection and sends timeline data to editor

#### 3. Timeline Documents Hook
**File:** `/frappe-bench/apps/raven/frontend/src/hooks/useTimelineDocuments.ts`
- Already existed, fetches timeline documents from backend API
- Provides `timelineDocuments`, `isLoading`, `error` state

#### 4. Timeline Message Hook
**File:** `/frappe-bench/apps/raven/frontend/src/components/feature/chat/ChatInput/useSendTimelineMessage.ts`
- Cleaned up duplicated code
- Handles extraction of timeline mentions from message JSON
- Processes timeline updates after sending message

#### 5. Chat Message Renderer
**File:** `/frappe-bench/apps/raven/frontend/src/components/feature/chat/ChatMessage/Renderers/TiptapRenderer/TiptapRenderer.tsx`
- Added `TimelineMentionRenderer` import
- Added timeline mention extension for message display

#### 6. Timeline Mention Renderer Component
**File:** `/frappe-bench/apps/raven/frontend/src/components/feature/chat/ChatMessage/Renderers/TiptapRenderer/TimelineMentionRenderer.tsx` *(NEW)*
- Renders timeline mentions as blue badges with calendar icon
- Shows tooltip with timeline details
- Styled with blue color scheme

#### 7. Styling Updates
**Files:** 
- `/frappe-bench/apps/raven/frontend/src/components/feature/chat/ChatInput/tiptap.styles.css`
- `/frappe-bench/apps/raven/frontend/src/components/feature/chat/ChatMessage/Renderers/TiptapRenderer/tiptap-renderer.styles.css`
- Added timeline mention specific styling with blue color scheme

#### 8. Component Files
All necessary components are integrated directly into the main Tiptap editor and renderer components. No additional test files are required.

### Backend Changes

#### 1. Timeline API
**File:** `/frappe-bench/apps/raven/raven/api/timeline_api.py`
- Updated `add_timeline_update` function to include datetime stamps
- Format: `[YYYY-MM-DD HH:MM:SS] update_text`
- Enhanced error handling and return values

#### 2. Timeline DocType Python File
**File:** `/frappe-bench/apps/tcr_erp/tcr_erp/tcr_erp/doctype/timeline/timeline.py` *(NEW)*
- Added validation for required fields
- Added default status setting
- Added helper method `add_update()` for programmatic updates

### Existing Backend Structure
The following files were already in place and work with the new implementation:

#### 1. Timeline DocType
**File:** `/frappe-bench/apps/tcr_erp/tcr_erp/tcr_erp/doctype/timeline/timeline.json`
- Defines timeline document structure
- Fields: experiment_id, timeline_task, owner_name, start_date, end_date, dependency, status, updates

#### 2. Updates Child DocType  
**File:** `/frappe-bench/apps/tcr_erp/tcr_erp/tcr_erp/doctype/updates/updates.json`
- Child table for timeline updates
- Field: updates (Small Text)

## Usage

### For Users
1. Type `$` as the first character in chat
2. Select a timeline document from the dropdown suggestions
3. Type your update message after the timeline mention
4. Send the message
5. The message appears in chat and gets added to the timeline's updates with timestamp

### Timeline Mention Format
- **Input:** `$TaskName additional update text`
- **Display:** Blue badge with calendar icon
- **Timeline Update:** `[2025-01-20 14:30:15] additional update text`

## Features

### Search and Filtering
- Timeline suggestions are filtered by timeline task name and experiment ID
- Case-insensitive search
- Limited to 10 suggestions for performance

### Visual Design
- Timeline mentions appear as blue badges with calendar icons
- Hover tooltip shows full timeline details
- Consistent styling across input and message display

### Data Integration
- Real-time fetching of timeline documents
- Automatic timestamp addition to updates
- Error handling for missing or invalid timelines

## Technical Details

### TipTap Extension Configuration
```typescript
TimelineMention.configure({
    suggestion: {
        char: '$',
        pluginKey: new PluginKey('timelineMention'),
        allowedPrefixes: null,
        allow: (props) => {
            // Prevents mentions after alphanumeric characters
            const precedingCharacter = props.state.doc.textBetween(props.range.from - 1, props.range.from, '')
            return !/[a-zA-Z0-9]/.test(precedingCharacter)
        }
    }
})
```

### API Endpoints
- **GET** `raven.api.timeline_api.get_timeline_documents` - Fetch timeline documents
- **POST** `raven.api.timeline_api.add_timeline_update` - Add update to timeline

### Data Flow
1. User types `$` → Timeline suggestions appear
2. User selects timeline → Timeline mention inserted in editor  
3. User types additional text → Text added after mention
4. User sends message → Message sent to chat + Timeline updated
5. Timeline update format: `[timestamp] text_after_mention`

## Error Handling
- Invalid timeline IDs are caught and logged
- Missing timeline documents show appropriate errors
- Network failures are handled gracefully
- Validation ensures required fields are present

## Performance Considerations
- Timeline documents cached with 5-minute refresh interval
- Limited to 50 most recent timeline documents
- Suggestion list limited to 10 items
- Debounced search to avoid excessive API calls