import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID
const R2_ACCESS_KEY = process.env.R2_ACCESS_KEY
const R2_SECRET_KEY = process.env.R2_SECRET_KEY
const R2_BUCKET = process.env.R2_BUCKET || 'bridgecall-audio'

let s3 = null

function getS3() {
  if (s3) return s3
  if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY || !R2_SECRET_KEY) {
    throw new Error('R2 credentials not configured')
  }

  s3 = new S3Client({
    region: 'auto',
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: R2_ACCESS_KEY,
      secretAccessKey: R2_SECRET_KEY
    },
    forcePathStyle: true
  })

  return s3
}

export async function uploadAudio(messageId, base64Data) {
  const client = getS3()
  const buffer = Buffer.from(base64Data, 'base64')
  const key = `audio/${messageId}.webm`

  await client.send(new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
    Body: buffer,
    ContentType: 'audio/webm',
    Metadata: {
      'x-bridgecall-region': 'weur'
    }
  }))

  return key
}

export function getAudioUrl(key) {
  if (!R2_ACCOUNT_ID) return null
  return `https://${R2_BUCKET}.${R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${key}`
}
