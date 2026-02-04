import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  Response,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { LeadsService } from './leads.service';

@Controller('leads')
@UseGuards(JwtAuthGuard)
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Get()
  async findAll(@Request() req, @Query() query: any) {
    const leads = await this.leadsService.findAll(
      req.user._id.toString(),
      query,
    );
    const count = await this.leadsService.getLeadCount(req.user._id.toString());
    return {
      data: leads,
      count,
      page: query.page || 1,
      limit: query.limit || 50,
    };
  }

  @Get('stats')
  async getStats(@Request() req) {
    return this.leadsService.getLeadStats(req.user._id.toString());
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    return this.leadsService.findOne(id, req.user._id.toString());
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateData: any,
    @Request() req,
  ) {
    return this.leadsService.updateLead(
      id,
      req.user._id.toString(),
      updateData,
    );
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    await this.leadsService.deleteLead(id, req.user._id.toString());
    return { message: 'Lead deleted successfully' };
  }

  @Post('export')
  async exportLeads(
    @Body() body: { format?: 'csv' | 'json' },
    @Request() req,
    @Response() res,
  ) {
    const format = body.format || 'csv';
    const data = await this.leadsService.exportLeads(
      req.user._id.toString(),
      format,
    );

    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename=leads.json');
      return res.send(data);
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=leads.csv');
    return res.send(data);
  }

  @Get(':id/sessions')
  async getChatSessions(@Param('id') id: string, @Request() req) {
    return this.leadsService.findChatSessionsByLead(
      id,
      req.user._id.toString(),
    );
  }
}
