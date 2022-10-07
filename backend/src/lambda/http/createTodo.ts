import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import { createTodo, timeInMs, logMetric } from '../../helpers/todos'
import { createLogger } from '../../utils/logger'

const logger = createLogger('TodosAccess')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Processing create event: ', { event })
  const startTime = timeInMs()

  const parsedBody = JSON.parse(event.body)

  const newItem = await createTodo(parsedBody, event)

  const endTime = timeInMs()
  const totalTime = endTime - startTime
  await logMetric(totalTime, "createTodo");

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      item: newItem
    })
  }
}
