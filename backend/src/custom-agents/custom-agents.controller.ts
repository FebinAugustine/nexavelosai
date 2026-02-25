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
import { CustomAgentsService } from './custom-agents.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';
import { CreateCustomAgentDto } from './dto/create-custom-agent.dto';
import { User, UserDocument } from '../users/users.schema';

@Controller('custom-agents')
export class CustomAgentsController {
  constructor(
    private readonly customAgentsService: CustomAgentsService,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Body(ValidationPipe) createCustomAgentDto: CreateCustomAgentDto,
    @Request() req,
  ) {
    return this.customAgentsService.create(
      createCustomAgentDto,
      req.user._id.toString(),
    );
  }

  @UseGuards(JwtAuthGuard)
  @SkipThrottle()
  @Get()
  findAll(@Request() req) {
    return this.customAgentsService.findAll(req.user._id.toString());
  }

  @UseGuards(JwtAuthGuard)
  @SkipThrottle()
  @Get('analytics')
  getAnalytics(@Request() req) {
    return this.customAgentsService.findAll(req.user._id.toString());
  }

  @UseGuards(JwtAuthGuard)
  @SkipThrottle()
  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.customAgentsService.findOne(id, req.user._id.toString());
  }

  @UseGuards(JwtAuthGuard)
  @SkipThrottle()
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateData: Partial<CreateCustomAgentDto>,
    @Request() req,
  ) {
    return this.customAgentsService.update(
      id,
      updateData,
      req.user._id.toString(),
    );
  }

  @UseGuards(JwtAuthGuard)
  @SkipThrottle()
  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.customAgentsService.remove(id, req.user._id.toString());
  }

  @UseGuards(OptionalJwtAuthGuard)
  @SkipThrottle()
  @Post(':id/chat')
  async chat(
    @Param('id') id: string,
    @Body('message') message: string,
    @Body('chatSessionId') chatSessionId: string,
    @Request() req,
  ): Promise<
    { jobId: string | number; message: string } | { response: string }
  > {
    try {
      const userId = req.user?._id?.toString() || '';
      const agent = await this.customAgentsService.findOne(id, userId);

      // Check domain restriction for public access
      if (!userId) {
        const origin =
          req.headers['origin'] ||
          req.headers['referer']?.split('/').slice(0, 3).join('/');

        if (!origin || origin.startsWith('file://')) {
          // Allow access for local file testing
        } else {
          const requestDomain = new URL(origin).hostname;

          const user = await this.userModel.findOne({ _id: agent.userId });
          if (user && user.domains.length > 0) {
            const isAllowed = user.domains.some((domain) => {
              const normalizedDomain = domain.replace('www.', '').toLowerCase();
              const normalizedRequestDomain = requestDomain
                .replace('www.', '')
                .toLowerCase();

              return (
                normalizedRequestDomain === normalizedDomain ||
                normalizedRequestDomain.endsWith(`.${normalizedDomain}`) ||
                normalizedRequestDomain.startsWith('localhost')
              );
            });

            if (!isAllowed) {
              throw new BadRequestException(
                'Widget can only be used on the specified domain',
              );
            }
          }
        }
      }

      const chatResult = await this.customAgentsService.chat(
        id,
        userId,
        message,
        chatSessionId,
      );

      if (typeof chatResult === 'string') {
        return { response: chatResult };
      } else {
        return {
          jobId: chatResult.jobId,
          message: 'Custom agent request queued successfully.',
        };
      }
    } catch (error) {
      console.error('Custom agent chat controller error:', error);
      throw error;
    }
  }
}
