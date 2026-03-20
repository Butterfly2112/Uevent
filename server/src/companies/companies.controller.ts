import { Controller, Param, Get, Headers } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

import { CompanyService } from './companies.service';
import { SafeCompanyResponseDto } from './dto/safeCompanyResponse.dto';
import { AuthService } from 'src/auth/auth.service';
import { JwtType } from 'src/auth/types/jwtType.type';

@ApiTags('Companies')
@Controller('companies')
export class CompanyController {
  constructor(
    private companyService: CompanyService,
    private authService: AuthService,
  ) {}

  @ApiOperation({
    summary: 'Get company registrated on user',
    description:
      'If user is logged in and is owner of this company - events of all status will be returned alongside company information.' +
      'If user is not logged in or does not own this company, then all events of status draft will be automatically hidden',
  })
  @ApiOkResponse({
    description: 'Successfully retrieved company info',
    type: SafeCompanyResponseDto,
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
  async getUserCompany(
    @Param('id') param: number,
    @Headers('authorization') authHeader?: string,
  ) {
    let user: JwtType | null = null;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      user = await this.authService.getUserFromToken(authHeader);
    }
    return await this.companyService.getUserCompany(
      param,
      user ? user.id : null,
    );
  }
}
