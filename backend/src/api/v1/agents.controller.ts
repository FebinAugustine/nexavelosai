import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  ValidationPipe,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { SkipThrottle } from '@nestjs/throttler';
import { Model } from 'mongoose';
import { AgentsService } from '../../agents/agents.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../../auth/optional-jwt-auth.guard';
import { CreateAgentDto } from '../../agents/dto/create-agent.dto';
import { PlanBasedThrottlerGuard } from '../../agents/plan-based-throttler.guard';
import { User, UserDocument } from '../../users/users.schema';
import { ApiResponse } from '../dto/api-response.dto';
import { PaginationDto } from '../dto/pagination.dto';

@Controller('api/v1/agents')
@UseGuards(PlanBasedThrottlerGuard)
export class AgentsV1Controller {
  constructor(
    private readonly agentsService: AgentsService,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Body(ValidationPipe) createAgentDto: CreateAgentDto,
    @Request() req,
  ): Promise<ApiResponse> {
    const result = await this.agentsService.create(
      createAgentDto,
      req.user._id.toString(),
    );
    return {
      data: result,
      message: 'Agent created successfully',
      statusCode: 201,
      timestamp: new Date().toISOString(),
    };
  }

  @UseGuards(JwtAuthGuard)
  @SkipThrottle()
  @Get()
  async findAll(@Request() req): Promise<ApiResponse> {
    const result = await this.agentsService.findAll(req.user._id.toString());
    return {
      data: result,
      statusCode: 200,
      timestamp: new Date().toISOString(),
    };
  }

  @UseGuards(JwtAuthGuard)
  @SkipThrottle()
  @Get('analytics')
  async getAnalytics(@Request() req): Promise<ApiResponse> {
    const result = await this.agentsService.getAnalytics(
      req.user._id.toString(),
    );
    return {
      data: result,
      statusCode: 200,
      timestamp: new Date().toISOString(),
    };
  }

  @UseGuards(JwtAuthGuard)
  @SkipThrottle()
  @Get('analytics/detailed')
  async getDetailedAnalytics(
    @Request() req,
    @Query('month') month?: string,
  ): Promise<ApiResponse> {
    const result = await this.agentsService.getDetailedAnalytics(
      req.user._id.toString(),
      month,
    );
    return {
      data: result,
      statusCode: 200,
      timestamp: new Date().toISOString(),
    };
  }

  @UseGuards(OptionalJwtAuthGuard)
  @SkipThrottle()
  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req): Promise<ApiResponse> {
    const userId = req.user?._id?.toString() || '';
    const result = await this.agentsService.findOne(id, userId);
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
    @Body(ValidationPipe) updateAgentDto: any,
    @Request() req,
  ): Promise<ApiResponse> {
    const result = await this.agentsService.update(
      id,
      updateAgentDto,
      req.user._id.toString(),
    );
    return {
      data: result,
      message: 'Agent updated successfully',
      statusCode: 200,
      timestamp: new Date().toISOString(),
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string, @Request() req): Promise<ApiResponse> {
    await this.agentsService.remove(id, req.user._id.toString());
    return {
      message: 'Agent deleted successfully',
      statusCode: 200,
      timestamp: new Date().toISOString(),
    };
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/lead-capture')
  async updateLeadCapture(
    @Param('id') id: string,
    @Body() updateData: any,
    @Request() req,
  ): Promise<ApiResponse> {
    const result = await this.agentsService.updateLeadCapture(
      id,
      req.user._id.toString(),
      updateData,
    );
    return {
      data: result,
      message: 'Lead capture settings updated successfully',
      statusCode: 200,
      timestamp: new Date().toISOString(),
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/snippet')
  async getSnippet(
    @Param('id') id: string,
    @Request() req,
    @Query('type') type: string = 'js',
    @Query('version') version: string = 'full',
  ): Promise<ApiResponse> {
    const agent = await this.agentsService.findOne(id, req.user._id.toString());

    const userPlan = await this.agentsService.getUserPlan(
      req.user._id.toString(),
    );

    // Check plan restrictions
    if ((userPlan === 'free' || userPlan === 'regular') && version === 'full') {
      throw new BadRequestException(
        'Full widget snippet is only available for special plan users',
      );
    }

    return {
      data: {
        snippet: await this.agentsService.generateSnippet(agent, type, version),
      },
      statusCode: 200,
      timestamp: new Date().toISOString(),
    };
  }
}
