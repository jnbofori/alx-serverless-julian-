import * as AWS from 'aws-sdk'
// import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
// import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';

// const XAWS: any = AWSXRay.captureAWS(AWS)

// const logger = createLogger('TodosAccess')
// TODO: Implement the dataLayer logic
export class TodosAccess {

constructor(
    private readonly docClient: DocumentClient = new AWS.DynamoDB.DocumentClient(),
    private readonly todosTable = process.env.TODOS_TABLE,
    private readonly attachmentsBucket = process.env.ATTACHMENT_S3_BUCKET) {
  }

  async getAllUserTodos(userId: string): Promise<TodoItem[]> {
    // logger.info('Getting all todos')

    const result = await this.docClient.query({
      TableName: this.todosTable,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      },
      ScanIndexForward: false
    }).promise()

    const items = result.Items
    return items as TodoItem[]
  }

  async createTodo(todoItem: TodoItem): Promise<TodoItem> {
    await this.docClient.put({
      TableName: this.todosTable,
      Item: todoItem
    }).promise()

    // logger.log('Created new todo: ', todoItem)
    return todoItem;
  }

  async updateTodoItem(updateItem: TodoUpdate) {
    const result = await this.docClient.put({
      TableName: this.todosTable,
      Item: updateItem
    }).promise()
  
    // logger.log('Updated todo: ', result)
    return result
  }

  async deleteTodoItem(todoId: string, userId: string) {
    const result = await this.docClient.delete({
      TableName: this.todosTable,
      Key: {
        todoId,
        userId
      },
      ReturnValues: "ALL_OLD"
    }).promise()
  
    // logger.log('Deleted todo: ', result)
    return result
  }

  async todoExists(todoId: string, userId: string): Promise<boolean> {
    const result = await this.docClient
      .get({
        TableName: this.todosTable,
        Key: {
          todoId,
          userId
        }
      })
      .promise()
  
    // logger.log('Todo exists: ', result)
    return !!result.Item
  }

  async updateTodoAttachmentUrl(todoId: string, userId: string): Promise<void> {
    await this.docClient.update({
      TableName: this.todosTable,
      Key: {
        todoId,
        userId
      },
      UpdateExpression: 'set attachmentUrl = :a',
      ExpressionAttributeValues: {
        ':a' : `https://${this.attachmentsBucket}.s3.amazonaws.com/${todoId}`
      }
    }).promise()
  }
}