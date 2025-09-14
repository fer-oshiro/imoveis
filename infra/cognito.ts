export const userPool = new sst.aws.CognitoUserPool('ImovelOshiroUserPool', {
  usernames: ['phone'],
  sms: {
    externalId: 'ImovelOshiro',
    snsCallerArn: 'arn:aws:iam::121620439865:role/Cognito-SMS-Role-Oshiro-Imoveis',
    snsRegion: 'us-east-1',
  },
  triggers: {
    defineAuthChallenge: 'packages/auth/define-auth-challenge.handler',
    createAuthChallenge: {
      handler: 'packages/auth/create-auth-challenge.handler',
      permission: [
        {
          actions: ['sns:Publish'],
          resources: ['*'],
        },
      ],
    },
    verifyAuthChallengeResponse: 'packages/auth/verify-auth-challenge.handler',
  },
})

export const poolClient = userPool.addClient('UserPoolClient')
