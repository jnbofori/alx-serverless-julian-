import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify, /*decode*/ } from 'jsonwebtoken'
// import { createLogger } from '../../utils/logger'
// import Axios from 'axios'
// import { Jwt } from '../../auth/Jwt'
import { JwtPayload } from '../../auth/JwtPayload'

// const logger = createLogger('auth')

// TODO: Provide a URL that can be used to download a certificate that can be used
// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set
// const jwksUrl = '...'
const cert = `-----BEGIN CERTIFICATE-----
MIIDDTCCAfWgAwIBAgIJLDNknlNfPLkMMA0GCSqGSIb3DQEBCwUAMCQxIjAgBgNV
BAMTGWRldi10ZW82amFzNy51cy5hdXRoMC5jb20wHhcNMjIxMDA1MTA1NDMwWhcN
MzYwNjEzMTA1NDMwWjAkMSIwIAYDVQQDExlkZXYtdGVvNmphczcudXMuYXV0aDAu
Y29tMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAtayyOnQahe6ZY4h0
P8nlwxe8BiZjWa77YHQxKGfM15i6dnt+yFwWClvaosc3VF4DpewdGNXLAuSh7FRX
Ackm+nkma+jU/2sF3+CfdTY7+cwPCde4WMpFQs/X4Eh6DOfG0VSHv9LFWEzgaOaf
ofZCQT3112wdKiMxTaONyjUvUPbFwwz2MtCLJxFxljTHu9p4BQLQ3e+sph9SPDJh
lmJIWJlHG+kEOi0cASuiD1oY0b5jzuI4HlDmLK/iH1mWRzPHXrHdbMu5F6/rhM4r
FhWkV8y7bf8wENZ/JSQPPbI2iJgiRmndrGwqacEdHF8KmVi1FaDnkuRUpMidwR2y
7+DGXQIDAQABo0IwQDAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBToZgBRfCwK
KhARgbIwwyDcTKQV4zAOBgNVHQ8BAf8EBAMCAoQwDQYJKoZIhvcNAQELBQADggEB
AAAO0UWjA39MnM49Zyqz4esEackHqG0E3oUBdkFhyjEI27ozuvXmDlx5cQSDtSV+
JgNjbNp//BGwEXLmle7RPewSeodNHvTOtg0Lv0fwSCblVjt3xG8gimok9CtmGj+M
RJow1zBURfhtYf8LXowdLmMRZ4pPnlmIBiFrICg9O8s4ttJkVR424loU3PqAQonB
vSBsFHXPD3QbTZHTeobXsZoUdRSwrmmIGZKGM0hoZisZ1qvyEH9A+5F8vO0ZXhyj
4euzlS62A2fSGHjW2AzmX4urazcTyPq+XJS83l2Ys5yPplse3qSoVnHnL9my77O5
S7Dq07p1JEyq7D2N6hich7g=
-----END CERTIFICATE-----`

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  console.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    console.info('User was authorized', jwtToken.sub)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    console.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader)

  return verify(token, cert, { algorithms: ["RS256"] }) as JwtPayload

  // if (token !== "123") {
  //   throw new Error('Invalid token')
  // }
  // const jwt: Jwt = decode(token, { complete: true }) as Jwt

  // TODO: Implement token verification
  // You should implement it similarly to how it was implemented for the exercise for the lesson 5
  // You can read more about how to do this here: https://auth0.com/blog/navigating-rs256-and-jwks/
  // return undefined
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}
