import * as aws from '@pulumi/aws'

import { emailBucket } from './storage'

const recipientDomain = 'no-reply@charmcodez.com'
export const email = new sst.aws.Email('Email', {
  sender: recipientDomain,
})

const ruleSet = new aws.ses.ReceiptRuleSet('RuleSet', {
  ruleSetName: 'EmailToS3',
  region: 'us-east-1',
})

export const rule = new aws.ses.ReceiptRule(
  'SaveToS3Rule',
  {
    name: 'SaveToS3',
    ruleSetName: ruleSet.ruleSetName,
    enabled: true,
    scanEnabled: true,
    recipients: [recipientDomain],
    s3Actions: [
      {
        bucketName: emailBucket.name,
        objectKeyPrefix: 'raw/',
        position: 1,
      },
    ],
  },
  { dependsOn: [ruleSet] },
)

new aws.ses.ActiveReceiptRuleSet('ActiveRuleSet', {
  ruleSetName: ruleSet.ruleSetName,
  region: 'us-east-1',
})
