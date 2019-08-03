module.exports = {
    mongoURI: process.env.MONGO_URI,
    secretOrKey: process.env.SECRET,
    botmail: 'trusthousebot@gmail.com',
    botpass: 'trusthouse_2019',
    recieverMail: '',
    awsAccessKeyId: process.env.AWS_ACCESS_KEY,
	awsSecretAccessKey: process.env.AWS_SECRET,
    s3Region: process.env.S3_REGION,
    s3Bucket: process.env.S3_BUCKET
}