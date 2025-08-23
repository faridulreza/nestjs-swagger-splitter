import { INestApplication } from '@nestjs/common';
import { OpenAPIObject, SwaggerModule } from '@nestjs/swagger';

export class SwaggerControllerWiseOpenAPIJSON {
  static setup(app: INestApplication, document: OpenAPIObject, swaggerPath: string): void {
    SwaggerModule.setup(swaggerPath, app, document, {
      customCss: `
        .swagger-ui .info .title {
          margin-bottom: 20px;
        }
        .controller-links {
          background: #f7f7f7;
          border: 1px solid #d4edda;
          border-radius: 5px;
          padding: 15px;
          margin: 20px 0;
        }
        .controller-links h4 {
          color: #155724;
          margin-bottom: 10px;
          font-size: 16px;
        }
        .controller-link {
          display: inline-block;
          margin: 5px 10px 5px 0;
          padding: 8px 12px;
          background: #609ddeff;
          color: white;
          text-decoration: none;
          border-radius: 4px;
          font-size: 14px;
          transition: background-color 0.2s;
        }
        .controller-link:hover {
          background: #598dc5ff;
          color: white!important;
          text-decoration: none;
        }
      `,
      customJsStr: `
        setTimeout(function() {
          // Fetch available controllers and add links
          fetch('${swaggerPath}/controllers')
            .then(response => response.json())
            .then(data => {
              const controllers = data.controllers || [];
              if (controllers.length > 0) {
                const infoSection = document.querySelector('.swagger-ui .info');
                if (infoSection) {
                  const linksDiv = document.createElement('div');
                  linksDiv.className = 'controller-links';
                  linksDiv.innerHTML = 
                    '<h4>📋 Download Complete OpenAPI JSON:</h4>' +
                    '<a href="${swaggerPath}/json" class="controller-link" target="_blank" title="Download Complete OpenAPI JSON">Complete OpenAPI JSON</a>' +
                    '<h4>📋 Download Controller-Specific OpenAPI JSON:</h4>' +
                    controllers.map(controller => 
                      '<a href="${swaggerPath}/json/' + controller + '" ' +
                      'class="controller-link" target="_blank" ' +
                      'title="Download OpenAPI JSON for ' + controller + ' controller">' +
                      controller + ' JSON</a>'
                    ).join('');
                  
                  infoSection.appendChild(linksDiv);
                }
              }
            })
            .catch(console.error);
        }, 1000);
      `
    });
    
    // Function to extract all unique tags from the document paths
    const getAllTags = () => {
      const tags = new Set<string>();
      
      // First, try to get tags from the document.tags array
      if (document.tags && document.tags.length > 0) {
        document.tags.forEach(tag => tags.add(tag.name));
      }
      
      // Also extract tags from path operations
      Object.values(document.paths).forEach(pathItem => {
        Object.values(pathItem).forEach((operation: any) => {
          if (operation && operation.tags) {
            operation.tags.forEach((tag: string) => tags.add(tag));
          }
        });
      });
      
      return Array.from(tags);
    };
    
    // Expose complete OpenAPI JSON endpoint
    app.getHttpAdapter().get(`/${swaggerPath}/json`, (req, res) => {
      res.json(document);
    });

    // Function to filter document by tag (controller)
    const getDocumentByTag = (tag: string) => {
      const usedSchemas = new Set<string>();
      
      // Filter paths and collect used schemas
      const filteredPaths = Object.keys(document.paths).reduce((acc: any, path) => {
        const pathItem = document.paths[path];
        const filteredPathItem: any = {};
        
        Object.keys(pathItem).forEach(method => {
          const operation = (pathItem as any)[method];
          if (operation && operation.tags && operation.tags.includes(tag)) {
            filteredPathItem[method] = operation;
            
            // Collect schema references from this operation
            const collectSchemaRefs = (obj: any) => {
              if (typeof obj === 'object' && obj !== null) {
                if (obj.$ref && typeof obj.$ref === 'string') {
                  const schemaName = obj.$ref.replace('#/components/schemas/', '');
                  usedSchemas.add(schemaName);
                }
                Object.values(obj).forEach(value => collectSchemaRefs(value));
              }
            };
            
            collectSchemaRefs(operation);
          }
        });
        
        if (Object.keys(filteredPathItem).length > 0) {
          acc[path] = filteredPathItem;
        }
        
        return acc;
      }, {});

      // Filter components/schemas to only include used ones
      const filteredComponents = document.components ? {
        ...document.components,
        schemas: document.components.schemas ? Object.keys(document.components.schemas).reduce((acc: any, schemaName) => {
          if (usedSchemas.has(schemaName)) {
            acc[schemaName] = document.components!.schemas![schemaName];
            
            // Recursively collect referenced schemas
            const collectNestedRefs = (schema: any) => {
              if (typeof schema === 'object' && schema !== null) {
                if (schema.$ref && typeof schema.$ref === 'string') {
                  const nestedSchemaName = schema.$ref.replace('#/components/schemas/', '');
                  if (!usedSchemas.has(nestedSchemaName) && 
                      document.components?.schemas?.[nestedSchemaName]) {
                    usedSchemas.add(nestedSchemaName);
                    acc[nestedSchemaName] = document.components.schemas[nestedSchemaName];
                    collectNestedRefs(document.components.schemas[nestedSchemaName]);
                  }
                }
                Object.values(schema).forEach(value => collectNestedRefs(value));
              }
            };
            
            collectNestedRefs(document.components!.schemas![schemaName]);
          }
          return acc;
        }, {}) : {}
      } : undefined;

      const filteredDocument = {
        ...document,
        paths: filteredPaths,
        components: filteredComponents,
        tags: document.tags ? document.tags.filter((t: any) => t.name === tag) : []
      };
      
      return filteredDocument;
    };

    // Expose individual controller JSON endpoints
    app.getHttpAdapter().get(`/${swaggerPath}/json/:controller`, (req, res) => {
      const controllerName = req.params.controller;
      const filteredDocument = getDocumentByTag(controllerName);
      res.json(filteredDocument);
    });

    // Expose endpoint to list all available controllers
    app.getHttpAdapter().get(`/${swaggerPath}/controllers`, (req, res) => {
      const controllers = getAllTags();
      res.json({ controllers });
    });
  }
}
