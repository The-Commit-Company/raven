import EventEmitter from 'eventemitter3'

// Define event types for better type safety
export interface EventBusEvents {
  'thread:created': {
    threadId: string
    messageId: string
  }
  'thread:updated': {
    threadId: string
    numberOfReplies: number
    lastMessageTimestamp: string
  }
  'thread:deleted': {
    threadId: string
  }
  'user:interacted': {
    source: 'input' | 'textarea' | 'editor' | 'click'
    timestamp: number
  }
}

class TypedEventBus extends EventEmitter<EventBusEvents> {}

const eventBus = new TypedEventBus()

export default eventBus
