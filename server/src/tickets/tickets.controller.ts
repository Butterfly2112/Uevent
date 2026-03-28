import { Controller, Post, Body, Param, ParseIntPipe } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/createTicketDto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

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
}
