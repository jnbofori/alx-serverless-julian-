export interface TodoUpdate {
  name: string
  dueDate: string
  done: boolean
  todoId?: string
  userId?: string
  attachmentUrl?: string
}