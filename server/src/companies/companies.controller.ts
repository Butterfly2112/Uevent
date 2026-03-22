import {
  Controller,
  Param,
  Get,
  Headers,
  Post,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

import { CompanyService } from './companies.service';
import { SafeCompanyResponse } from './types/safeCompanyResponse.type';
import { AuthService } from 'src/auth/auth.service';
import { JwtType } from 'src/auth/types/jwtType.type';
import { AuthGuard } from 'src/auth/auth.guard';
import { type RequestWithUser } from 'src/common/interfaces/request-with-user.type';
import { RegisterCompanyDto } from './dto/registerCompany.dto';

@ApiTags('Companies')
@Controller('companies')
export class CompanyController {
  constructor(
    private companyService: CompanyService,
    private authService: AuthService,
  ) {}

  @Post('register')
  @UseGuards(AuthGuard)
  async registerCompany(
    @Req() req: RequestWithUser,
    @Body() registerDto: RegisterCompanyDto,
  ) {
    return await this.companyService.registerCompany(registerDto, req.user.id);
  }

  @ApiOperation({
    summary: 'Get company details',
    description:
      'If user is logged in and is owner of this company - events of all status will be returned alongside company information.' +
      'If user is not logged in or does not own this company, then all events of status draft will be automatically hidden',
  })
  @ApiOkResponse({
    description: 'Successfully retrieved company info',
    type: SafeCompanyResponse,
  })
  @ApiNotFoundResponse({
    description: 'Company is not found',
  })
  @ApiParam({
    name: 'id',
    description: 'Company id',
    type: Number,
    example: 1,
  })
  @Get(':id')
  async getCompany(
    @Param('id') param: number,
    @Headers('authorization') authHeader?: string,
  ) {
    let user: JwtType | null = null;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      user = await this.authService.getUserFromToken(authHeader);
    }
    return await this.companyService.getCompanyById(
      param,
      user ? user.id : null,
    );
  }
}
