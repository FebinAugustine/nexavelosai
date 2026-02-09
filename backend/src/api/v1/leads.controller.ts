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
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../../auth/optional-jwt-auth.guard';
import { LeadsService } from '../../leads/leads.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Agent, AgentDocument } from '../../agents/agents.schema';
import { Lead, LeadDocument } from '../../leads/leads.schema';
import { ApiResponse } from '../dto/api-response.dto';

@Controller('api/v1/leads')
export class LeadsV1Controller {
  constructor(
    private readonly leadsService: LeadsService,
    @InjectModel(Agent.name) private agentModel: Model<AgentDocument>,
    @InjectModel(Lead.name) private leadModel: Model<LeadDocument>,
  ) {}

  @Post()
  @UseGuards(OptionalJwtAuthGuard)
  async create(@Body() body: any, @Request() req): Promise<ApiResponse> {
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

    const result = await this.leadsService.createLead(leadData);
    return {
      data: result,
      message: 'Lead created successfully',
      statusCode: 201,
      timestamp: new Date().toISOString(),
    };
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(@Request() req, @Query() query: any): Promise<ApiResponse> {
    const leads = await this.leadsService.findAll(
      req.user._id.toString(),
      query,
    );
    const count = await this.leadsService.getLeadCount(req.user._id.toString());

    return {
      data: {
        items: leads,
        page: parseInt(query.page) || 1,
        limit: parseInt(query.limit) || 50,
        total: count,
        totalPages: Math.ceil(count / (parseInt(query.limit) || 50)),
      },
      statusCode: 200,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  async getStats(@Request() req): Promise<ApiResponse> {
    const result = await this.leadsService.getLeadStats(
      req.user._id.toString(),
    );
    return {
      data: result,
      statusCode: 200,
      timestamp: new Date().toISOString(),
    };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string, @Request() req): Promise<ApiResponse> {
    const result = await this.leadsService.findOne(id, req.user._id.toString());
    return {
      data: result,
      statusCode: 200,
      timestamp: new Date().toISOString(),
    };
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() updateData: any,
    @Request() req,
  ): Promise<ApiResponse> {
    const result = await this.leadsService.updateLead(
      id,
      req.user._id.toString(),
      updateData,
    );
    return {
      data: result,
      message: 'Lead updated successfully',
      statusCode: 200,
      timestamp: new Date().toISOString(),
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string, @Request() req): Promise<ApiResponse> {
    await this.leadsService.deleteLead(id, req.user._id.toString());
    return {
      message: 'Lead deleted successfully',
      statusCode: 200,
      timestamp: new Date().toISOString(),
    };
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

  @Get(':id/sessions')
  @UseGuards(JwtAuthGuard)
  async getChatSessions(
    @Param('id') id: string,
    @Request() req,
  ): Promise<ApiResponse> {
    const result = await this.leadsService.findChatSessionsByLead(
      id,
      req.user._id.toString(),
    );
    return {
      data: result,
      statusCode: 200,
      timestamp: new Date().toISOString(),
    };
  }
}
