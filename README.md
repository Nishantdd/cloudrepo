# cloudrepo

Follow these steps to run the project locally:

```bash
git clone https://github.com/Nishantdd/cloudrepo.git
cd cloudrepo

npm install

# Create a .env file and fill it using .env.example as a reference
cp .env.example .env

npm run build
npm run serve
```

## AWS S3 Setup

You need to configure your S3 bucket properly to allow access from the app.

### CORS Configuration

Set the following CORS on your S3 bucket:
```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["PUT", "GET", "POST", "DELETE"],
    "AllowedOrigins": [
      "http://localhost:3000",
    ],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

### IAM User Policy

Attach the following policy to your IAM user to grant required access:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "ObjectAccess",
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::your-bucket-name/*"
    },
    {
      "Sid": "ListAccess",
      "Effect": "Allow",
      "Action": "s3:ListBucket",
      "Resource": "arn:aws:s3:::your-bucket-name"
    }
  ]
}
```