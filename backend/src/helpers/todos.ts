import { TodosAccess } from './todosAcess'
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
import { APIGatewayProxyEvent } from "aws-lambda";

const logger = createLogger('TodosAccess')
// TODO: Implement businessLogic

import { getUserId } from '../lambda/utils'

const bucketName = process.env.ATTACHMENT_S3_BUCKET

const todoAccess = new TodosAccess()

export async function getAllUserTodos(event: APIGatewayProxyEvent): Promise<TodoItem[]> {
  const userId = getUserId(event)
  logger.info('Token user: ', { userId })
  return todoAccess.getAllUserTodos(userId)
}

export async function createTodo(
  createTodoRequest: CreateTodoRequest,
  event: APIGatewayProxyEvent
): Promise<TodoItem> {
  const itemId = uuid.v4()
  const userId = getUserId(event)

  return await todoAccess.createTodo({
    todoId: itemId,
    userId: userId,
    createdAt: new Date().toLocaleDateString(),
    name: createTodoRequest.name,
    dueDate: createTodoRequest.dueDate,
    done: false
  })
}

export async function updateTodo(
  updateTodoRequest: UpdateTodoRequest,
  event: APIGatewayProxyEvent,
  todoId: string
): Promise<any> {
  const userId = getUserId(event)

  return await todoAccess.updateTodoItem({
    todoId,
    userId: userId,
    attachmentUrl: `https://${bucketName}.s3.amazonaws.com/${todoId}`,
    name: updateTodoRequest.name,
    dueDate: updateTodoRequest.dueDate,
    done: updateTodoRequest.done
  })
}

export async function deleteTodo(event: APIGatewayProxyEvent, todoId: string): Promise<any> {
  const userId = getUserId(event)
  return todoAccess.deleteTodoItem(todoId, userId)
}


export async function todoExists(todoId: string, userId: string): Promise<boolean> {
  return todoAccess.todoExists(todoId, userId)
}

export async function updateTodoAttachmentUrl(todoId: string, userId: string): Promise<void> {
  return todoAccess.updateTodoAttachmentUrl(todoId, userId)
}

export function logMetric(totalTime: number, service: string): Promise<void> {
  return todoAccess.logMetric(totalTime, service)
}

export function timeInMs() {
  return new Date().getTime()
}