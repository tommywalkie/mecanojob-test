# MecanoJob Test

Appointment scheduling system, intended for a technical test for MecanoJob.

The project is currently hosted on my personal website: https://mecanojob-test.tommywalkie.com.

## Project structure

The project is a monorepo with a client and a server.

The client is a Vite project using React, TailwindCSS and TypeScript.

The server is a NestJS project powered by TypeORM, SQLite and Swagger.

The Swagger UI is available at `/docs`.

## Prerequisites

- Node.js (v18+)
- pnpm (v10+)

### Environment variables

The project uses environment variables for the client and the server, using both a `.env` file for development and a `.env.production` file for production, which are served by the `dotenvx` package.

```php
# Client environment variables
VITE_API_URL="" # URL of the server

# Server environment variables
DB_FILE="" # Path to the SQLite database file (default: my.db)
JWT_SECRET="" # Secret key for the JWT token (default: secret)
```

## Installation

```bash
pnpm install
```

**Note**: The project is designed with PNPM v10+ in mind, which notably allows for the use of the `onlyBuiltDependencies` option in our `package.json`. So if you encounter issues when running the server, typically if binaries are not found for `better-sqlite3` and `bcrypt`, you may need to upgrade your PNPM version, prune the PNPM cache and reinstall the dependencies.

## Development

This command will simultaneously run the client and the server in development mode using environment variables from the `.env` file.

```bash
pnpm dev
```

## Testing

This command will simultaneously run the tests for the client and the server using environment variables from the `.env` file.

```bash
pnpm test
```

## Build

This command will simultaneously build the client and the server in production mode using environment variables from the `.env.production` file.

Frontend build output will be to the `public` folder of the server.

```bash
pnpm build
```

You can run the production build by running the `start` script.

```bash
pnpm start
```

## Formatting

This command will format the client and the server using Prettier.

```bash
pnpm format
```

## License

This project is licensed under the GPL-3.0 license. See the [LICENSE](LICENSE) file for details.
