export const userPool = new sst.aws.CognitoUserPool('ImovelOshiroUserPool', {
  usernames: ['phone'],
  sms: {
    externalId: 'ImovelOshiro',
    snsCallerArn: 'arn:aws:iam::121620439865:role/Cognito-SMS-Role-Oshiro-Imoveis',
    snsRegion: 'us-east-1',
  },
  triggers: {
    defineAuthChallenge: 'apps/auth/define-auth-challenge.handler',
    createAuthChallenge: {
      handler: 'apps/auth/create-auth-challenge.handler',
      permissions: [
        {
          actions: ['sns:Publish'],
          resources: ['*'],
        },
      ],
    },
    verifyAuthChallengeResponse: 'apps/auth/verify-auth-challenge.handler',
  },
})

export const poolClient = userPool.addClient('UserPoolClient')
