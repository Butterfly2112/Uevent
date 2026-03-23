import {
  Controller,
  Param,
  Get,
  Headers,
  Post,
  Body,
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
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
import { AuthGuard } from 'src/common/auth.guard';
import { type RequestWithUser } from 'src/common/interfaces/request-with-user.type';
import { RegisterCompanyDto } from './dto/registerCompany.dto';
import { CompanyPictureUploadInterceptor } from 'src/upload/upload.interceptor';
import { UploadService } from 'src/upload/upload.service';

@ApiTags('Companies')
@Controller('companies')
export class CompanyController {
  constructor(
    private companyService: CompanyService,
    private authService: AuthService,
    private uploadsService: UploadService,
  ) {}

  @Post('register')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Doofenshmirtz Evil Incorporated' },
        email_for_info: { type: 'string', example: 'corp@example.com' },
        location: { type: 'string', example: '13, Willow Street' },
        description: { type: 'string', example: 'Evil corporation' },
        picture: { type: 'string', format: 'binary' },
      },
      required: ['name', 'email_for_info', 'description'],
    },
  })
  @UseInterceptors(CompanyPictureUploadInterceptor)
  async registerCompany(
    @Req() req: RequestWithUser,
    @Body() registerDto: RegisterCompanyDto,
    @UploadedFile() picture?: Express.Multer.File,
  ) {
    const picture_url = picture
      ? this.uploadsService.getFileUrl('company-pictures', picture.filename)
      : undefined;

    return await this.companyService.registerCompany(
      { ...registerDto, picture_url },
      req.user.id,
    );
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
