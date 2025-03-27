import { Elysia } from 'elysia';
import { getCurveById } from '../utils/client';

export const parametersRoute = new Elysia()
  .get("/parameters/:id",
    async ({ params }) => {
      try {
        const { id } = params;
        const curveId = parseInt(id);

        const curve = getCurveById(curveId);

        return {
          name: curve.name,
          address: curve.address,
          constructorArgs: curve.constructorArgs,
          id: curve.id
        };
      } catch (error) {
        console.error('Error in parameters endpoint:', error);
        return { error: error instanceof Error ? error.message : 'Failed to get curve parameters' };
      }
    },
    {
      detail: {
        tags: ['Curves'],
        summary: 'Get curve parameters',
        description: 'Retrieves all parameters and configuration for a specific curve',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: {
              type: 'integer',
              description: 'The ID of the curve'
            }
          }
        ],
        responses: {
          '200': {
            description: 'Successfully retrieved curve parameters',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    name: {
                      type: 'string',
                      description: 'The name of the curve'
                    },
                    address: {
                      type: 'string',
                      description: 'The contract address of the curve'
                    },
                    constructorArgs: {
                      type: 'array',
                      description: 'The constructor arguments used to deploy the curve',
                      items: {
                        type: 'object',
                        properties: {
                          type: {
                            type: 'string',
                            description: 'The type of the argument'
                          },
                          value: {
                            type: 'string',
                            description: 'The value of the argument'
                          }
                        }
                      }
                    },
                    id: {
                      type: 'integer',
                      description: 'The ID of the curve'
                    }
                  }
                }
              }
            }
          },
          '400': {
            description: 'Bad request',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    error: {
                      type: 'string',
                      description: 'Error message'
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  ); 