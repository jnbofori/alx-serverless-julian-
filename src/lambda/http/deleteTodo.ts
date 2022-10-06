import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as AWS  from 'aws-sdk'
import { getUserId } from '../utils'

const docClient = new AWS.DynamoDB.DocumentClient()

const todosTable = process.env.TODOS_TABLE

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

  console.log('Deleting item', event)
  const todoId = event.pathParameters.todoId

  const userId = getUserId(event);

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

  const todo = await deleteTodoItem(todoId, userId)

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

  console.log('Todo to delete: ', result)
  return !!result.Item
}

async function deleteTodoItem(todoId: string, userId: string) {
  const result = await docClient.delete({
    TableName: todosTable,
    Key: {
      todoId,
      userId
    },
    ReturnValues: "ALL_OLD"
  }).promise()

  console.log('Deleted todo: ', result)
  return result
}
