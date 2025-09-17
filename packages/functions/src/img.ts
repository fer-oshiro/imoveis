import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { Resource } from 'sst'

export const img = async (event: any) => {
  const bucket = Resource.bucket.name
  const { key, expiresIn, ContentType } = JSON.parse(event.body || '{}')
  console.log({ bucket, key, expiresIn, ContentType })
  try {
    const signedUrl = await generatePresignedUrl({
      bucket,
      key,
      expiresIn,
      ContentType,
    })
    return {
      statusCode: 200,
      body: JSON.stringify({ signedUrl }),
    }
  } catch (error) {
    console.error('Error generating presigned URL:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to generate presigned URL' }),
    }
  }
}

const s3 = new S3Client({
  region: 'us-east-1',
})

export async function generatePresignedUrl({
  bucket,
  key,
  expiresIn = 3600,
  ContentType = 'image/jpeg',
}: {
  bucket: string
  key: string
  expiresIn?: number
  ContentType?: string
}) {
  if (!['image/jpeg', 'image/png', 'application/pdf'].includes(ContentType))
    throw new Error('Invalid ContentType')

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType,
  })

  const signedUrl = await getSignedUrl(s3, command, { expiresIn })
  return signedUrl
}
