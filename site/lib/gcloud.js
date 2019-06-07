//gcp
var { Storage } = require('@google-cloud/storage');
var path = require('path');

module.exports = (credentials) => {
    //gcs initialization
    var storage = new Storage({
        projectId: credentials.gcs.project_id,
        keyFilename: credentials.gcs.key
    });

    return {
        file_upload : (lpath, bucket_name) => {
            var bucket = storage.bucket(bucket_name);
            var file_name = path.basename(lpath);
            var dest = Date.now() + '/' + file_name;
            var file = bucket.file(dest);

            bucket.upload(lpath, { destination : dest })
                .then(() => {
                    file.makePublic();
                    // eslint-disable-next-line no-console
                    console.log('file uploaded to GCS');
                });   
        }
    };
}