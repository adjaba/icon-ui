# OCR UI

A front-end for the OCR models.

![](./ocr-ui.png)

## Development

Install node.js (>= 10.x) and yarn. Then install the node modules:

```bash
cd client
yarn install
cd ..
cd server
yarn install
cd ..
yarn install
```

Run the development mode:

```bash
yarn start
```

## Docker Deployment

Build the container:

```bash
docker build -t imslavko/ocr-ui .
```

Run attaching the mounts:

```bash
docker run -p 5000:3000 -u $(id -u):$(id -g) -d imslavko/ocr-ui
```

Access the site at `localhost:5000`.
