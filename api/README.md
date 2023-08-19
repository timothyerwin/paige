# api

This is a Node.js Typescript project

## Install

```sh
# npm
npm install

# yarn
yarn install
```

## Setup

1. Prisma

```sh
npx prisma generate
npx prisma migrate dev --name initial
```

2. Import fixtures

```sh
npx ts-node setup
```

## Run

```sh
npx ts-node src/index.ts
```

## Test

```sh
npx jest
```
