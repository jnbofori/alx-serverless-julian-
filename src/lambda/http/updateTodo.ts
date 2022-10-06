import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as AWS  from 'aws-sdk'
import { getUserId } from '../utils'

const docClient = new AWS.DynamoDB.DocumentClient()

const todosTable = process.env.TODOS_TABLE
const bucketName = process.env.ATTACHMENT_S3_BUCKET

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Updating item', event)
  const todoId = event.pathParameters.todoId

  const userId = getUserId(event);

  const parsedBody = JSON.parse(event.body)

  const validTodoId = await todoExists(todoId, userId)

  if (!validTodoId) {
    return {
      statusCode: 404,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        error: 'Todo item does not exist'
      })
    }
  }

  const updateItem = {
    todoId,
    userId,
    attachmentUrl: `https://${bucketName}.s3.amazonaws.com/${todoId}`,
    ...parsedBody
  }

  const todo = await updateTodoItem(updateItem)

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      items: todo
    })
  }
}

async function todoExists(todoId: string, userId: string) {
  const result = await docClient
    .get({
      TableName: todosTable,
      Key: {
        todoId,
        userId
      }
    })
    .promise()

  console.log('Todo to update: ', result)
  return !!result.Item
}

async function updateTodoItem(updateItem: { todoId: string, userId: string, name: string, dueDate: string, done: boolean }) {
  const result = await docClient.put({
    TableName: todosTable,
    Item: updateItem
  }).promise()

  console.log('Updated todo: ', result)
  return result
}
