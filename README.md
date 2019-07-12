# Icon UI

A front-end for Icon UI image translation and game style transfer models.

## Development

### Installation - Master

Install node.js (>= 10.x) and yarn. Then install the node modules / Python dependencies:

```bash
cd client
yarn install
cd ..
yarn install
pip3 install -r requirements.txt
```

### Installation - Unified

Install node.js (>= 10.x) and yarn. Then install the node modules / Python dependencies:

```bash
cd server
yarn install
cd ..
yarn install
pip3 install -r requirements.txt
```

### Launching the app - Master and Unified

Run the development mode ([OS] = windows for Windows OS and linux for Linux/Ubuntu):

```bash
yarn [OS]
```

example:

```bash
yarn linux
```

By default, the master branch launches the React front-end at `localhost:3000`and the Python REST API at `localhost:3001`.

By default, the unified branch launches the site at `localhost:3000`.

## Common launch errors

If running `yarn linux` raises a Module Not Found error, try running `yarn linux2`.
