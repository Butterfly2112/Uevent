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
  Delete,
  UploadedFiles,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiConsumes,
  ApiCreatedResponse,
  ApiForbiddenResponse,
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
import {
  CompanyPictureUploadInterceptor,
  NewsImagesUploadInterceptor,
} from 'src/upload/upload.interceptor';
import { UploadService } from 'src/upload/upload.service';
import { CompanyNewsResponse } from './types/companyNewsResponse.type';
import { createCompanyNewsDto } from './dto/createCompanyNews.dto';

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
  @ApiCreatedResponse({
    description: 'Company created successfully',
  })
  @ApiConflictResponse({
    description: 'This user already own the company',
  })
  @ApiCreatedResponse({
    description: 'Company were created successfully',
    type: SafeCompanyResponse,
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
      'If user is not logged in or does not own this company, then all events that are not available to the public yet will be automatically hidden',
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

  @ApiOperation({
    summary: 'Delete company',
  })
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    description: 'Company id',
    type: Number,
    example: 67,
  })
  @ApiOkResponse({
    description: 'Company deleted successfully',
  })
  @ApiForbiddenResponse({
    description: 'Only admin or owner can delete company',
  })
  @Delete(':id')
  @UseGuards(AuthGuard)
  async deleteCompany(@Param('id') param: number, @Req() req: RequestWithUser) {
    await this.companyService.deleteCompanyById(param, req.user.id);
    return {
      message: 'Company deleted successfully',
    };
  }

  @ApiOperation({
    summary: 'Return all company news',
  })
  @ApiParam({
    name: 'id',
    description: 'Company id',
    type: Number,
    example: '67',
  })
  @ApiNotFoundResponse({
    description: 'Company with this id is not found',
  })
  @ApiOkResponse({
    description: 'Company news retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: '67' },
        news: {
          type: 'CompanyNewsResponse',
          example: [
            {
              id: 1,
              title: 'We are Evil',
              content: 'who could have guessed',
              images_url: null,
              created_at: '2026-03-24T15:46:32.599Z',
            },
          ],
        },
      },
    },
  })
  @Get(':id/news')
  async getCompanyNews(@Param('id') param: number) {
    return await this.companyService.getCompanyNews(param);
  }

  @ApiOperation({
    summary: 'Post company news',
  })
  @Post(':id/news')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', example: 'New Update' },
        content: {
          type: 'string',
          example: 'In the last week in Zhytomyr 7 days have passed',
        },
        images: { type: 'string[]', format: 'binary' },
      },
    },
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Id of the company',
  })
  @UseInterceptors(NewsImagesUploadInterceptor)
  @ApiNotFoundResponse({
    description: 'Company with such id not found',
  })
  @ApiForbiddenResponse({
    description: 'Only owner of the company can create news',
  })
  @ApiCreatedResponse({
    description: 'Company news were posted successfully',
    type: CompanyNewsResponse,
  })
  async createCompanyNews(
    @Param('id') param: number,
    @Req() req: RequestWithUser,
    @Body() dto: createCompanyNewsDto,
    @UploadedFiles() images?: Express.Multer.File[],
  ) {
    const images_url = images
      ? images.map((file) =>
          this.uploadsService.getFileUrl('news-images', file.filename),
        )
      : [];

    return await this.companyService.createCompanyNews(
      param,
      { ...dto, images_url },
      req.user.id,
    );
  }
}
