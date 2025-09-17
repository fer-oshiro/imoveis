import { SNSClient, PublishCommand } from '@aws-sdk/client-sns'

const sns = new SNSClient({ region: 'us-east-1' })

export const handler = async (event) => {
  const code = Math.floor(100000 + Math.random() * 900000).toString()

  console.log('Código de verificação:', code, 'para: ', event.request.userAttributes.phone_number)

  try {
    if (!process.env.SST_DEV)
      await sns.send(
        new PublishCommand({
          PhoneNumber: event.request.userAttributes.phone_number,
          Message: `${code} é seu código de login.\n@imoveis.charmbyte.dev #${code}`,
        }),
      )
  } catch (err) {
    console.error('Erro ao enviar SMS:', err)
  }

  event.response.publicChallengeParameters = {}
  event.response.privateChallengeParameters = { answer: code }
  event.response.challengeMetadata = 'SMS_CHALLENGE'

  return event
}
