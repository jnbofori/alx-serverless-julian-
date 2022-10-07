import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import { getAllUserTodos, timeInMs, logMetric } from '../../helpers/todos'
import { createLogger } from '../../utils/logger'

const logger = createLogger('TodosAccess')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Processing get event: ', { event })
  const startTime = timeInMs()

  const items = await getAllUserTodos(event)

  const endTime = timeInMs()
  const totalTime = endTime - startTime
  await logMetric(totalTime, "getTodos");

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      items
    })
  }
}
