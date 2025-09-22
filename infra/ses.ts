import * as aws from '@pulumi/aws'

import { emailBucket } from './storage'

const stage = $app.stage
const SHARED_STAGE = 'prod'

const RULE_SET_NAME = 'EmailToS3'
const SENDER = 'automation@charmcodez.com'

const sesProvider = new aws.Provider('ses-east1', { region: 'us-east-1' })
export const email =
  stage === SHARED_STAGE
    ? new sst.aws.Email('Email', { sender: SENDER })
    : sst.aws.Email.get('Email', SENDER)

let ruleSet: aws.ses.ReceiptRuleSet | undefined

if (stage === SHARED_STAGE) {
  ruleSet = new aws.ses.ReceiptRuleSet('EmailRuleSet', {
    ruleSetName: RULE_SET_NAME,
    region: 'us-east-1',
  })

  new aws.ses.ActiveReceiptRuleSet(
    'ActiveReceiptRuleSet',
    {
      ruleSetName: RULE_SET_NAME,
    },
    {
      provider: sesProvider,
      dependsOn: ruleSet ? [ruleSet] : undefined,
    },
  )
}

export const saveToS3Rule = new aws.ses.ReceiptRule(
  'SaveToS3Rule',
  {
    name: `SaveToS3-${stage}`,
    ruleSetName: RULE_SET_NAME,
    enabled: true,
    scanEnabled: true,
    recipients: [SENDER],
    s3Actions: [
      {
        bucketName: emailBucket.name,
        objectKeyPrefix: `raw/${stage}/`,
        position: 1,
      },
    ],
  },
  {
    provider: sesProvider,
    dependsOn: ruleSet && stage === SHARED_STAGE ? [ruleSet] : undefined,
  },
)

export const sesRuleSetName = RULE_SET_NAME
export const sesRuleName = saveToS3Rule.name

// const ruleSet = new aws.ses.ReceiptRuleSet('RuleSet', {
//   ruleSetName: RULE_SET_NAME,
//   region: 'us-east-1',
// })

// export const rule = new aws.ses.ReceiptRule(
//   'SaveToS3Rule',
//   {
//     ruleSetName: ruleSet.ruleSetName,
//     enabled: true,
//     scanEnabled: true,
//     recipients: [SENDER],
//     s3Actions: [
//       {
//         bucketName: emailBucket.name,
//         objectKeyPrefix: 'raw/',
//         position: 1,
//       },
//     ],
//   },
//   { dependsOn: [ruleSet] },
// )

// new aws.ses.ActiveReceiptRuleSet('ActiveRuleSet', {
//   ruleSetName: ruleSet.ruleSetName,
//   region: 'us-east-1',
// })
