import {
  Controller,
  Post,
  Body,
  Param,
  ParseIntPipe,
  Get,
  Res,
  Req,
} from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/createTicketDto';
import { CreatePaymentDto } from './dto/createPaymentDto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@ApiTags('Tickets')
@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post()
  @ApiOperation({ summary: 'Create ticket' })
  @ApiResponse({ status: 201, description: 'Ticket created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'User or Event not found' })
  create(@Body() dto: CreateTicketDto) {
    return this.ticketsService.createTicket(dto);
  }

  @Post('create-payment')
  @ApiOperation({ summary: 'Create Stripe payment intent' })
  @ApiBody({ type: CreatePaymentDto })
  createPayment(@Body() dto: CreatePaymentDto) {
    return this.ticketsService.createPayment(dto.ticketId);
  }

  @Post(':id/pay')
  @ApiOperation({ summary: 'Pay for ticket' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Ticket ID',
    example: 1,
  })
  @ApiResponse({ status: 200, description: 'Ticket paid successfully' })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
  pay(@Param('id', ParseIntPipe) id: number) {
    return this.ticketsService.payTicket(id);
  }

  @Get('event/:id/participants')
  getParticipants(@Param('id', ParseIntPipe) id: number) {
    return this.ticketsService.getEventParticipants(id);
  }

  @Post(':id/refund')
  @ApiOperation({ summary: 'Refund ticket' })
  @ApiParam({
    name: 'id',
    type: Number,
    example: 1,
  })
  @ApiResponse({ status: 200, description: 'Refund successful' })
  @ApiResponse({ status: 400, description: 'Ticket not refundable' })
  refund(@Param('id', ParseIntPipe) id: number) {
    return this.ticketsService.refundTicket(id);
  }

  @Post('validate-promo')
  @ApiOperation({ summary: 'Validate promo code' })
  validatePromo(@Body() body: { eventId: number; code: string }) {
    return this.ticketsService.validatePromoCode(body.eventId, body.code);
  }

  @Get(':id/pdf')
  @UseGuards(JwtAuthGuard)
  async downloadPdf(
    @Param('id', ParseIntPipe) id: number,
    @Req() req,
    @Res() res: Response,
  ) {
    return this.ticketsService.generatePdf(id, req.user.id, res);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my')
  @ApiOperation({ summary: 'Get my tickets' })
  @ApiResponse({ status: 200, description: 'List of user tickets' })
  getMyTickets(@Req() req) {
    return this.ticketsService.getUserTickets(req.user.id);
  }
}
