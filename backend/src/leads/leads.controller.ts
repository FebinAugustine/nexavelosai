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
  Injectable,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';
import { LeadsService } from './leads.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Agent, AgentDocument } from '../agents/agents.schema';
import { Lead, LeadDocument } from './leads.schema';

@Controller('leads')
export class LeadsController {
  constructor(
    private readonly leadsService: LeadsService,
    @InjectModel(Agent.name) private agentModel: Model<AgentDocument>,
    @InjectModel(Lead.name) private leadModel: Model<LeadDocument>,
  ) {}

  @Post()
  @UseGuards(OptionalJwtAuthGuard)
  async create(@Body() body: any, @Request() req) {
    // If user is authenticated, use their userId
    let userId = req.user?._id?.toString();

    // If no user is authenticated, get userId from agentId
    if (!userId && body.agentId) {
      const agent = await this.agentModel.findById(body.agentId).exec();
      if (agent) {
        userId = agent.userId.toString();
      } else {
        throw new Error('Agent not found');
      }
    }

    if (!userId) {
      throw new Error('User not authenticated and no agentId provided');
    }

    const leadData = {
      ...body,
      userId,
    };

    return this.leadsService.createLead(leadData);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(@Request() req, @Query() query: any) {
    console.log(
      'LeadsController.findAll called with user:',
      req.user._id.toString(),
      'query:',
      query,
    );

    // Debug: Check user ID from token vs leads in database
    const allLeads = await this.leadModel.find({}).exec();
    console.log('All leads in database:', allLeads.length);
    console.log('User ID from token:', req.user._id.toString());
    console.log(
      'Leads with matching user ID:',
      allLeads.filter(
        (lead) => lead.userId.toString() === req.user._id.toString(),
      ).length,
    );

    const leads = await this.leadsService.findAll(
      req.user._id.toString(),
      query,
    );
    const count = await this.leadsService.getLeadCount(req.user._id.toString());
    console.log(
      'LeadsController.findAll returning',
      leads.length,
      'leads, count:',
      count,
    );
    return {
      data: leads,
      count,
      page: query.page || 1,
      limit: query.limit || 50,
    };
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  async getStats(@Request() req) {
    return this.leadsService.getLeadStats(req.user._id.toString());
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string, @Request() req) {
    return this.leadsService.findOne(id, req.user._id.toString());
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
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
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string, @Request() req) {
    await this.leadsService.deleteLead(id, req.user._id.toString());
    return { message: 'Lead deleted successfully' };
  }

  @Post('export')
  @UseGuards(JwtAuthGuard)
  async exportLeads(
    @Body() body: { format?: 'csv' | 'json' | 'xlsx' },
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

    if (format === 'xlsx') {
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      res.setHeader('Content-Disposition', 'attachment; filename=leads.xlsx');
      return res.send(data);
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=leads.csv');
    return res.send(data);
  }

  @Post('fix-sessions')
  @UseGuards(JwtAuthGuard)
  async fixChatSessions(@Request() req) {
    try {
      const fixedCount = await this.leadsService.fixChatSessions(
        req.user._id.toString(),
      );
      return {
        statusCode: 200,
        message: `Fixed ${fixedCount} chat sessions`,
        data: null,
      };
    } catch (error) {
      console.error('Error fixing chat sessions:', error);
      return {
        statusCode: 500,
        message: 'Error fixing chat sessions',
        data: null,
      };
    }
  }

  @Get(':id/sessions')
  @UseGuards(JwtAuthGuard)
  async getChatSessions(@Param('id') id: string, @Request() req) {
    return this.leadsService.findChatSessionsByLead(
      id,
      req.user._id.toString(),
    );
  }
}
