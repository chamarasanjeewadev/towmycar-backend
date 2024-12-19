import AWS from "aws-sdk";
import { S3_BUCKET_NAME } from "../config";
import { UploadDocumentType } from "@towmycar/common";
export const generateKey = (userId: number, type: UploadDocumentType) => {
  switch (type) {
    case UploadDocumentType.DRIVER_LICENSE_FRONT:
      return `${userId}/driver_license_front.jpg`;
    case UploadDocumentType.DRIVER_LICENSE_BACK:
      return `${userId}/driver_license_back.jpg`;
    case UploadDocumentType.VEHICLE_REGISTRATION:
      return `${userId}/vehicle_registration`;
    case UploadDocumentType.VEHICLE_INSURANCE:
      return `${userId}/vehicle_insurance.pdf`;
    case UploadDocumentType.VEHICLE_PHOTO:
      return `${userId}/vehicle_photo.jpg`;
    case UploadDocumentType.PUBLIC_LIABILITY_INSURANCE:
      return `${userId}/public_liability_insurance.pdf`;
  }
};

export async function getPresignedUrls(
  userId: number,
  types: UploadDocumentType[],
) {
  const s3 = new AWS.S3({
    region: "eu-west-2",
    signatureVersion: "v4",
  });
  const presignedUrls = await Promise.all(
    types.map(async type => {
      const key = generateKey(userId, type);
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

export async function generateFilePath(
  userId: number,
  documentType: UploadDocumentType,
) {
  const key = generateKey(userId, documentType);
  const bucketName = `https://${S3_BUCKET_NAME}.s3.eu-west-2.amazonaws.com`;
  // generate a path for the document based on userId, bucket name and document type
  const path = `${bucketName}/${key}`;
  return path;
}
