# Swagger Controller-Wise OpenAPI

A NestJS utility package that adds controller-wise OpenAPI JSON generation and download capabilities to your swagger documentation page.

## Why?
So that your frontend developer can grab the controller specific OpenAPI json and use it with AI to implement the API calls without overflowing the API message limit.

## Installation

```bash
npm install swagger-controller-wise-openapi
```

## Usage

Replace your existing `SwaggerModule.setup()` call with `SwaggerControllerWiseOpenAPIJSON.setup()`:

### Before
```typescript
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

const config = new DocumentBuilder()
  .setTitle('My API')
  .setDescription('API description')
  .setVersion('1.0')
  .build();

const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('api', app, document);
```

### After
```typescript
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { SwaggerControllerWiseOpenAPIJSON } from 'swagger-controller-wise-openapi';

const config = new DocumentBuilder()
  .setTitle('My API')
  .setDescription('API description')
  .setVersion('1.0')
  .build();

const document = SwaggerModule.createDocument(app, config);
//SwaggerModule.setup('api', app, document); ❌
SwaggerControllerWiseOpenAPIJSON.setup(app, document, 'api');
```

## What You Get

Once integrated, your Swagger UI will include:

1. **Complete OpenAPI JSON Download**: A button to download the entire OpenAPI specification
2. **Controller-Specific Downloads**: Individual download buttons for each controller's OpenAPI JSON
3. **Enhanced UI**: Clean, styled download sections with hover effects

## API Endpoints

The package automatically creates these endpoints:

- `GET /{swaggerPath}/json` - Returns the complete OpenAPI JSON
- `GET /{swaggerPath}/json/:controller` - Returns OpenAPI JSON for a specific controller
- `GET /{swaggerPath}/controllers` - Returns a list of available controllers

## Example

If your Swagger is set up at `/api`, you'll get:

- `/api/json` - Complete OpenAPI JSON
- `/api/json/users` - Users controller OpenAPI JSON
- `/api/json/products` - Products controller OpenAPI JSON
- `/api/controllers` - List of all controllers

## Use Cases

- **Frontend Code Generation**: Generate TypeScript types for specific controllers

### Programmatic Access

```typescript
// Get list of available controllers
const response = await fetch('/api/controllers');
const { controllers } = await response.json();
console.log(controllers); // ['users', 'products', 'orders']

// Get controller-specific OpenAPI JSON
const usersApiSpec = await fetch('/api/json/users').then(r => r.json());
// Use for code generation, testing, etc.
```


## Requirements

- NestJS v10.0.0 or higher
- @nestjs/swagger v7.0.0 or higher

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
# swagger-controller-wise-openapi
