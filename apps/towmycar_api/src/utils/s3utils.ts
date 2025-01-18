import AWS from "aws-sdk";
import { S3_BUCKET_NAME } from "../config";
import { cloudfrontDocExpieryDate, UploadDocumentType } from "@towmycar/common";
import { getSignedUrl } from "@aws-sdk/cloudfront-signer";

export const generateFilePath = (userId: number, type: UploadDocumentType,extention:string) => {
  switch (type) {
    case UploadDocumentType.DRIVER_LICENSE_FRONT:
      return `${userId}/driver_license_front${extention}`;
    case UploadDocumentType.DRIVER_LICENSE_BACK:
      return `${userId}/driver_license_back${extention}`;
    case UploadDocumentType.VEHICLE_REGISTRATION:
      return `${userId}/vehicle_registration${extention}`;
    case UploadDocumentType.VEHICLE_INSURANCE:
      return `${userId}/vehicle_insurance${extention}`;
    case UploadDocumentType.VEHICLE_PHOTO:
      return `${userId}/vehicle_photo.jpg`;
    case UploadDocumentType.PUBLIC_LIABILITY_INSURANCE:
      return `${userId}/public_liability_insurance${extention}`;
  }
};

export async function getPresignedUrls(
  userId: number,
  types: UploadDocumentType[],extention:string
) {
  const s3 = new AWS.S3({
    region: "eu-west-2",
    signatureVersion: "v4",
  });
  const presignedUrls = await Promise.all(
    types.map(async type => {
      const key = generateFilePath(userId, type,extention);
      const url = {
        Bucket: S3_BUCKET_NAME,
        Key: key,
        Expires: 600, // URL expiration in seconds
        // ContentType: ["application/pdf","image/jpeg","image/png"],
      };
      const presignedUrl = await s3.getSignedUrlPromise("putObject", url);
      return { type, presignedUrl };
    }),
  );
  return presignedUrls;
}

export async function getCloudFrontPresignedUrl(
  userId: number,
  documentType: UploadDocumentType,extention:string
) {
  const privateKey = process.env.CLOUDFRONT_PRIVATE_KEY!;
  const keyPairId = process.env.CLOUDFRONT_KEY_PAIR_ID!;
  const dateLessThan = cloudfrontDocExpieryDate().toISOString(); // any Date constructor compatible
  const url = generateCloudFrontFilePath(userId, documentType,extention);
  const signedUrl = getSignedUrl({
    url,
    keyPairId,
    dateLessThan,
    privateKey,
  });
  return signedUrl;
}

export async function generateS3FilePath(
  userId: number,
  documentType: UploadDocumentType,
  extention:string
) {
  const key = generateFilePath(userId, documentType,extention);
  const bucketName = `https://${S3_BUCKET_NAME}.s3.eu-west-2.amazonaws.com`;
  // generate a path for the document based on userId, bucket name and document type
  const path = `${bucketName}/${key}`;
  return path;
}

export function generateCloudFrontFilePath(
  userId: number,
  documentType: UploadDocumentType,extention:string
) {
  const key = generateFilePath(userId, documentType,extention);
  const cloudfrontDistributionDomain = `https://${process.env.CLOUDFRONT_DOMAIN}`;
  const url = `${cloudfrontDistributionDomain}/${key}`;
  return url;
}
