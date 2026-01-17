# Swagger Splitter

A NestJS utility package that adds tag-wise OpenAPI JSON generation and download capabilities to your swagger documentation page.

## Why?
So that your frontend developer can grab the tag specific OpenAPI json and use it with AI to implement the API calls without overflowing AI context.

## Installation

```bash
npm install swagger-splitter
```

```bash
yarn add swagger-splitter
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
SwaggerModule.setup('swagger-path', app, document);
```

### After
```typescript
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { SwaggerSplitter } from 'swagger-splitter';

const config = new DocumentBuilder()
  .setTitle('My API')
  .setDescription('API description')
  .setVersion('1.0')
  .build();

const document = SwaggerModule.createDocument(app, config);
//SwaggerModule.setup('swagger-path', app, document); ❌
SwaggerSplitter.setup(app, document, 'swagger-path');
```

## What You Get

Once integrated, your Swagger UI will include:

1. **Complete OpenAPI JSON Download**: A button to download the entire OpenAPI specification
2. **Tag-Specific Downloads**: Individual download buttons for each tag's OpenAPI JSON
3. **Enhanced UI**: Clean, styled download sections with hover effects

## API Endpoints

The package automatically creates these endpoints:

- `GET /{swaggerPath}/json` - Returns the complete OpenAPI JSON
- `GET /{swaggerPath}/json/:tag` - Returns OpenAPI JSON for a specific tag
- `GET /{swaggerPath}/tags` - Returns a list of available tags

## Example

If your Swagger is set up at `/api`, you'll get:

- `/api/json` - Complete OpenAPI JSON
- `/api/json/users` - Users tag OpenAPI JSON
- `/api/json/products` - Products tag OpenAPI JSON
- `/api/tags` - List of all tags

## Use Cases

- **Frontend Code Generation**: Generate TypeScript types for specific tags

### Programmatic Access

```typescript
// Get list of available tags
const response = await fetch('/api/tags');
const { tags } = await response.json();
console.log(tags); // ['users', 'products', 'orders']

// Get tag-specific OpenAPI JSON
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
