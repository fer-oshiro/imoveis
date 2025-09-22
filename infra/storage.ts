export const bucket = new sst.aws.Bucket('bucket')
export const emailBucket = new sst.aws.Bucket('emails', {
  transform: {
    policy: (args) => {
      args.policy = sst.aws.iamEdit(args.policy, (policy) => {
        policy.Statement.push({
          Effect: 'Allow',
          Principal: { Service: 'ses.amazonaws.com' },
          Action: 's3:PutObject',
          Resource: $interpolate`arn:aws:s3:::${args.bucket}/raw/*`,
        })
      })
    },
  },
})
