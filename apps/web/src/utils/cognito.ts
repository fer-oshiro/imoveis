import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
  RespondToAuthChallengeCommand,
} from '@aws-sdk/client-cognito-identity-provider'

import { logger } from '@imovel/web/infra/logger'

const client = new CognitoIdentityProviderClient({ region: 'us-east-1' })

export async function sendSMS(phone: string) {
  const command = new InitiateAuthCommand({
    AuthFlow: 'CUSTOM_AUTH',
    ClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID || '',
    AuthParameters: {
      USERNAME: phone,
    },
  })

  const response = await client.send(command)
  return response.Session // você usará isso ao confirmar
}

export async function confirmCode(phone: string, code: string, session: string) {
  const command = new RespondToAuthChallengeCommand({
    ChallengeName: 'CUSTOM_CHALLENGE',
    ClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID || '',
    ChallengeResponses: {
      USERNAME: phone,
      ANSWER: code,
    },
    Session: session,
  })

  const response = await client.send(command)
  return response.AuthenticationResult?.IdToken
}

export function isLoggedIn(): boolean {
  const token = localStorage.getItem('token')
  if (!token) return false

  try {
    const [, payloadBase64] = token.split('.')
    const payload = JSON.parse(atob(payloadBase64))
    const exp = payload.exp

    const now = Math.floor(Date.now() / 1000)
    return exp && now < exp
  } catch (err) {
    logger.error('Erro ao verificar o token:', err)
    return false
  }
}
