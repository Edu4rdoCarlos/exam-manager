import { Type, applyDecorators } from '@nestjs/common';
import { ApiCreatedResponse, ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';
import { PaginationMetadataDto } from './PaginationMetadataDto';

export const ApiDataResponse = <T>(model: Type<T>, status: 200 | 201 = 200) => {
  const schema = { properties: { data: { $ref: getSchemaPath(model) } } };
  const responseDecorator =
    status === 201 ? ApiCreatedResponse({ schema }) : ApiOkResponse({ schema });
  return applyDecorators(ApiExtraModels(model), responseDecorator);
};

export const ApiPaginatedResponse = <T>(model: Type<T>, status: 200 | 201 = 200) => {
  const schema = {
    properties: {
      data: { type: 'array', items: { $ref: getSchemaPath(model) } },
      metadata: { $ref: getSchemaPath(PaginationMetadataDto) },
    },
  };
  const responseDecorator =
    status === 201 ? ApiCreatedResponse({ schema }) : ApiOkResponse({ schema });
  return applyDecorators(
    ApiExtraModels(PaginationMetadataDto, model),
    responseDecorator,
  );
};
