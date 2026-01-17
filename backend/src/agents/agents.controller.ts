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
} from '@nestjs/common';
import { ThrottlerGuard, SkipThrottle } from '@nestjs/throttler';
import { AgentsService } from './agents.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateAgentDto } from './dto/create-agent.dto';

@Controller('agents')
export class AgentsController {
  constructor(private readonly agentsService: AgentsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body(ValidationPipe) createAgentDto: CreateAgentDto, @Request() req) {
    return this.agentsService.create(createAgentDto, req.user.sub.toString());
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
  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.agentsService.findOne(id, req.user.sub.toString());
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
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string, @Request() req) {
    return this.agentsService.remove(id, req.user._id.toString());
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/snippet')
  async getSnippet(@Param('id') id: string, @Request() req, @Query('type') type: string = 'js') {
    const agent = await this.agentsService.findOne(id, req.user._id.toString());
    return { snippet: await this.agentsService.generateSnippet(agent, type) };
  }

  @UseGuards()
  @SkipThrottle()
  @Post(':id/chat')
  async chat(@Param('id') id: string, @Body('message') message: string) {
    const agent = await this.agentsService.findOne(id, ''); // No user check for public access
    const response = await this.agentsService.chat(agent, message);
    return { response };
  }
}
