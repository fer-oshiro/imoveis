import { PublishCommand, SNSClient } from '@aws-sdk/client-sns'
import { CreateAuthChallengeTriggerEvent } from 'aws-lambda'

import { logger } from './logger'

const sns = new SNSClient({ region: 'us-east-1' })

export const handler = async (event: CreateAuthChallengeTriggerEvent) => {
  const code = Math.floor(100000 + Math.random() * 900000).toString()

  logger.debug({
    message: 'Criando desafio de autenticação',
    data: { phone: event.request.userAttributes.phone_number, code },
  })

  try {
    if (!process.env.SST_DEV)
      await sns.send(
        new PublishCommand({
          PhoneNumber: event.request.userAttributes.phone_number,
          Message: `${code} é seu código de login.\n@imoveis.charmbyte.dev #${code}`,
        }),
      )
  } catch (err) {
    logger.error({ message: 'Erro ao enviar SMS', error: err })
  }

  event.response.publicChallengeParameters = {}
  event.response.privateChallengeParameters = { answer: code }
  event.response.challengeMetadata = 'SMS_CHALLENGE'

  return event
}
