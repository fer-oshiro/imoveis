import { VerifyAuthChallengeResponseTriggerEvent } from 'aws-lambda'

export const handler = async (event: VerifyAuthChallengeResponseTriggerEvent) => {
  const expectedAnswer = event.request.privateChallengeParameters.answer
  const userAnswer = event.request.challengeAnswer

  event.response.answerCorrect = userAnswer === expectedAnswer
  return event
}
