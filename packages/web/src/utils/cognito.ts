import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
  RespondToAuthChallengeCommand,
} from '@aws-sdk/client-cognito-identity-provider'

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
  console.log('Verificando se o usuário está logado...')
  const token = localStorage.getItem('token')
  console.log('Token encontrado:', token)
  if (!token) return false

  try {
    const [, payloadBase64] = token.split('.')
    const payload = JSON.parse(atob(payloadBase64))
    const exp = payload.exp

    const now = Math.floor(Date.now() / 1000)
    console.log('Token exp:', exp, 'Now:', now)
    return exp && now < exp
  } catch (err) {
    console.warn('Token inválido', err)
    console.error('Erro ao verificar o token:', err)
    return false
  }
}
