import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AnalyticsService } from '../../analytics/analytics.service';
import { ApiResponse } from '../dto/api-response.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@Controller('v1/analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsV1Controller {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('chat-volume')
  async getChatVolumeTrends(
    @Request() req: any,
    @Query('timeRange') timeRange: string = '7d',
  ): Promise<ApiResponse<any[]>> {
    const data = await this.analyticsService.getChatVolumeTrends(
      req.user._id,
      timeRange,
    );
    return {
      data,
      statusCode: 200,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('response-times')
  async getResponseTimeMetrics(@Request() req: any): Promise<ApiResponse<any>> {
    const data = await this.analyticsService.getResponseTimeMetrics(
      req.user._id,
    );
    return {
      data,
      statusCode: 200,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('conversion-rates')
  async getLeadConversionMetrics(
    @Request() req: any,
  ): Promise<ApiResponse<any>> {
    const data = await this.analyticsService.getLeadConversionMetrics(
      req.user._id,
    );
    return {
      data,
      statusCode: 200,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('engagement')
  async getEngagementMetrics(@Request() req: any): Promise<ApiResponse<any>> {
    const data = await this.analyticsService.getEngagementMetrics(req.user._id);
    return {
      data,
      statusCode: 200,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('geographic')
  async getGeographicData(@Request() req: any): Promise<ApiResponse<any[]>> {
    const data = await this.analyticsService.getGeographicData(req.user._id);
    return {
      data,
      statusCode: 200,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('agent-performance')
  async getAgentPerformance(@Request() req: any): Promise<ApiResponse<any[]>> {
    const data = await this.analyticsService.getAgentPerformance(req.user._id);
    return {
      data,
      statusCode: 200,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('reports')
  async generateCustomReport(
    @Request() req: any,
    @Body() reportConfig: any,
  ): Promise<ApiResponse<any>> {
    const data = await this.analyticsService.getCustomReport(
      req.user._id,
      reportConfig,
    );
    return {
      data,
      statusCode: 200,
      timestamp: new Date().toISOString(),
    };
  }
}
