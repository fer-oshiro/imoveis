import { myApi } from './api'
import { UserTable } from './dynamo'
import { emailBucket } from './storage'

export const parser = new sst.aws.Function('EmailParser', {
  handler: 'packages/functions/s3-email-to-dynamo.main',
  timeout: '60 seconds',
  link: [emailBucket, myApi, UserTable],
  environment: {
    RAW_PREFIX: 'raw/',
    PARSED_PREFIX: 'parsed/',
  },
})

emailBucket.notify({
  notifications: [
    {
      name: 'OnEmail',
      function: parser.arn,
      events: ['s3:ObjectCreated:*'],
      filterPrefix: 'raw/',
    },
  ],
})
