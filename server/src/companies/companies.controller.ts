import { Controller, Param, Get } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { CompanyService } from './companies.service';
import { Company } from './entities/company.entity';

@ApiTags('Companies')
@Controller('companies')
export class CompanyController {
  constructor(private companyService: CompanyService) {}

  @ApiOperation({
    summary: 'Get company registrated on user',
  })
  @ApiOkResponse({
    description: 'Successfully retrieved company info',
    type: Company,
  })
  @ApiNotFoundResponse({
    description:
      'User does not have company registrated or user with such id do not exists',
  })
  @ApiParam({
    name: 'id',
    description: 'User id',
    type: Number,
    example: 1,
  })
  @Get('user/:id')
  async getUserCompany(@Param('id') param: number) {
    return await this.companyService.getUserCompany(param);
  }
}
