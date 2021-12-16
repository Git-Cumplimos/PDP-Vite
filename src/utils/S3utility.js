import AWS from "aws-sdk";

AWS.config.update({
  accessKeyId: process.env.REACT_APP_accessKeyId,
  secretAccessKey: process.env.REACT_APP_secretAccessKey,
});

const REGION = process.env.REACT_APP_REGION;

const getFromBucket = async (bucket, file) => {
  const s3Client = new AWS.S3({
    params: { Bucket: bucket },
    region: REGION,
  });
  const params = {
    Bucket: bucket,
    Key: file,
  };
  try {
    const data = await s3Client.getObject(params).promise();
    return URL.createObjectURL(
      new Blob([data?.Body], { type: data?.ContentType })
    );
  } catch (err) {
    throw err;
  }
};

const saveToBucket = async (bucket, file, fileName, onUploading) => {
  const s3Client = new AWS.S3({
    params: { Bucket: bucket },
    region: REGION,
  });
  const params = {
    ACL: "public-read",
    Body: file,
    Bucket: bucket,
    Key: fileName,
  };
  await s3Client
    .putObject(params)
    .on("httpUploadProgress", (evt) => {
      onUploading?.(evt);
    })
    .promise();
};

export { getFromBucket, saveToBucket };
