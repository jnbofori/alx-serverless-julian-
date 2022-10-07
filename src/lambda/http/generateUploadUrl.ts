import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import { getUserId } from '../utils'
import { todoExists, updateTodoAttachmentUrl, timeInMs, logMetric } from '../../helpers/todos'
import { getUploadUrl } from '../../helpers/attachmentUtils'
import { createLogger } from '../../utils/logger'

const logger = createLogger('TodosAccess')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Upload event', { event })
  const startTime = timeInMs()

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

  const url = getUploadUrl(todoId)

  // update item
  await updateTodoAttachmentUrl(todoId, userId);

  const endTime = timeInMs()
  const totalTime = endTime - startTime
  await logMetric(totalTime, "generateUploadUrl");
  
  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      uploadUrl: url
    })
  }
}
