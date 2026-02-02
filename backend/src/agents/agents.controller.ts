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
import { AgentsService } from './agents.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';
import { CreateAgentDto } from './dto/create-agent.dto';
import { PlanBasedThrottlerGuard } from './plan-based-throttler.guard';
import { User, UserDocument } from '../users/users.schema';

@Controller('agents')
@UseGuards(PlanBasedThrottlerGuard)
export class AgentsController {
  constructor(private readonly agentsService: AgentsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body(ValidationPipe) createAgentDto: CreateAgentDto, @Request() req) {
    return this.agentsService.create(createAgentDto, req.user._id.toString());
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Request() req) {
    console.log('agents findAll called, user:', req.user);
    return this.agentsService.findAll(req.user._id.toString());
  }

  @UseGuards(JwtAuthGuard)
  @SkipThrottle()
  @Get('analytics')
  getAnalytics(@Request() req) {
    return this.agentsService.getAnalytics(req.user._id.toString());
  }

  @UseGuards(JwtAuthGuard)
  @SkipThrottle()
  @Get('analytics/detailed')
  getDetailedAnalytics(@Request() req, @Query('month') month?: string) {
    return this.agentsService.getDetailedAnalytics(
      req.user._id.toString(),
      month,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.agentsService.findOne(id, req.user._id.toString());
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateAgentDto: any,
    @Request() req,
  ) {
    return this.agentsService.update(
      id,
      updateAgentDto,
      req.user._id.toString(),
    );
  }

  @Delete(':id')
  // @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string, @Request() req) {
    return this.agentsService.remove(id, req.user._id.toString());
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/snippet')
  async getSnippet(
    @Param('id') id: string,
    @Request() req,
    @Query('type') type: string = 'js',
    @Query('version') version: string = 'full',
  ) {
    const agent = await this.agentsService.findOne(id, req.user._id.toString());

    const userPlan = await this.agentsService.getUserPlan(req.user._id.toString());

    // Check plan restrictions
    if ((userPlan === 'free' || userPlan === 'regular') && version === 'full') {
      throw new BadRequestException(
        'Full widget snippet is only available for special plan users',
      );
    }

    return {
      snippet: await this.agentsService.generateSnippet(agent, type, version),
    };
  }

  @UseGuards(OptionalJwtAuthGuard)
  @SkipThrottle()
  @Post(':id/chat')
  async chat(
    @Param('id') id: string,
    @Body('message') message: string,
    @Request() req,
  ): Promise<{ jobId: string | number; message: string } | { response: string }> { // Updated return type
    try {
      const userId = req.user?._id?.toString() || '';
      const agent = await this.agentsService.findOne(id, userId);

      // Check domain restriction for public access
      if (!userId) { // Only apply origin check for anonymous users
        const origin =
          req.headers['origin'] ||
          req.headers['referer']?.split('/').slice(0, 3).join('/');
        if (!origin) {
          throw new BadRequestException('Origin header required');
        }
        const requestDomain = new URL(origin).hostname;
        if (agent.domain && agent.domain !== requestDomain && requestDomain !== 'localhost') { // Only check if agent has a domain set
          throw new BadRequestException(
            'Widget can only be used on the specified domain',
          );
        }
      }

      const chatResult = await this.agentsService.chat(id, userId, message);

      if (typeof chatResult === 'string') {
        // This is the direct response for anonymous widget users
        return { response: chatResult };
      } else {
        // This is the jobId for logged-in dashboard users
        return { jobId: chatResult.jobId, message: 'Agent request queued successfully.' };
      }
    } catch (error) {
      console.error('Chat controller error:', error);
      throw error; // Re-throw all errors to ensure proper error handling
    }
  }
}

