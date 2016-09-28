const s3 = require('s3');

console.log('creating s3 client');

const client = s3.createClient({
    s3Options: {
        accessKeyId: process.env.awsAccessKeyId,
        secretAccessKey: process.env.awsSecretAccessKey,
        region: 'us-west-2'
    }
});

console.log('uplading files');

const params = {
  localFile: "./dist/app.bundle.js",
 
  s3Params: {
    Bucket: "sdk.streamrail.com",
    Key: "test/yoni/app.js"
  },
};

const uploader = client.uploadFile(params);

uploader.on('error', function(err) {
  console.error("unable to upload:", err.stack);
});

uploader.on('progress', function() {
  console.log("progress", uploader.progressMd5Amount,
            uploader.progressAmount, uploader.progressTotal);
});

uploader.on('end', function() {
  console.log("done uploading");
});