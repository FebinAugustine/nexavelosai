import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { TeamsService } from '../../teams/teams.service';
import { TeamRole, TeamPermission } from '../../teams/team-members.schema';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { Public } from '../../auth/public.decorator';
import { ApiResponse } from '../dto/api-response.dto';

@Controller('api/v1/teams')
@UseGuards(JwtAuthGuard)
export class TeamsV1Controller {
  constructor(private readonly teamsService: TeamsService) {}

  // Team management
  @Post()
  async createTeam(
    @Request() req,
    @Body() body: { name: string; description?: string },
  ): Promise<ApiResponse> {
    const result = await this.teamsService.createTeam(
      req.user._id.toString(),
      body.name,
      body.description,
    );
    return {
      data: result,
      message: 'Team created successfully',
      statusCode: 201,
      timestamp: new Date().toISOString(),
    };
  }

  @Get()
  async getTeams(@Request() req): Promise<ApiResponse> {
    const result = await this.teamsService.getTeamsByUser(
      req.user._id.toString(),
    );
    return {
      data: result,
      statusCode: 200,
      timestamp: new Date().toISOString(),
    };
  }

  // Specific routes before dynamic :id route to avoid conflicts
  @Get('roles')
  async getRolesWithPermissions(): Promise<ApiResponse> {
    const result = await this.teamsService.getRolesWithPermissions();
    return {
      data: result,
      statusCode: 200,
      timestamp: new Date().toISOString(),
    };
  }

  @Get(':id')
  async getTeamById(@Param('id') id: string): Promise<ApiResponse> {
    if (!id || id === 'undefined' || id === 'null') {
      throw new BadRequestException('Invalid teamId');
    }
    const result = await this.teamsService.getTeamById(id);
    return {
      data: result,
      statusCode: 200,
      timestamp: new Date().toISOString(),
    };
  }

  @Patch(':id')
  async updateTeam(
    @Param('id') id: string,
    @Request() req,
    @Body() body: { name?: string; description?: string },
  ): Promise<ApiResponse> {
    const result = await this.teamsService.updateTeam(
      id,
      req.user._id.toString(),
      body,
    );
    return {
      data: result,
      message: 'Team updated successfully',
      statusCode: 200,
      timestamp: new Date().toISOString(),
    };
  }

  @Delete(':id')
  async deleteTeam(
    @Param('id') id: string,
    @Request() req,
  ): Promise<ApiResponse> {
    await this.teamsService.deleteTeam(id, req.user._id.toString());
    return {
      message: 'Team deleted successfully',
      statusCode: 200,
      timestamp: new Date().toISOString(),
    };
  }

  // Team members
  @Post(':id/invite')
  async inviteMember(
    @Param('id') teamId: string,
    @Request() req,
    @Body() body: { email: string; role?: string },
  ): Promise<ApiResponse> {
    const result = await this.teamsService.inviteMember(
      teamId,
      req.user._id.toString(),
      body.email,
      body.role as TeamRole,
    );
    return {
      data: result,
      message: 'Invitation sent successfully',
      statusCode: 201,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('invite/:token/accept')
  async acceptInvitation(
    @Param('token') token: string,
    @Request() req,
  ): Promise<ApiResponse> {
    try {
      await this.teamsService.acceptInvitation(token, req.user._id.toString());
      return {
        message: 'Invitation accepted successfully',
        statusCode: 200,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error accepting invitation:', error);
      throw error;
    }
  }

  @Post('invite/:token/reject')
  async rejectInvitation(
    @Param('token') token: string,
    @Request() req,
  ): Promise<ApiResponse> {
    await this.teamsService.rejectInvitation(token, req.user._id.toString());
    return {
      message: 'Invitation rejected successfully',
      statusCode: 200,
      timestamp: new Date().toISOString(),
    };
  }

  @Delete(':teamId/members/:memberId')
  async removeMember(
    @Param('teamId') teamId: string,
    @Param('memberId') memberId: string,
    @Request() req,
  ): Promise<ApiResponse> {
    await this.teamsService.removeMember(
      teamId,
      req.user._id.toString(),
      memberId,
    );
    return {
      message: 'Member removed successfully',
      statusCode: 200,
      timestamp: new Date().toISOString(),
    };
  }

  @Patch(':teamId/members/:memberId/role')
  async updateMemberRole(
    @Param('teamId') teamId: string,
    @Param('memberId') memberId: string,
    @Request() req,
    @Body() body: { role: string },
  ): Promise<ApiResponse> {
    const result = await this.teamsService.updateMemberRole(
      teamId,
      req.user._id.toString(),
      memberId,
      body.role as TeamRole,
    );
    return {
      data: result,
      message: 'Member role updated successfully',
      statusCode: 200,
      timestamp: new Date().toISOString(),
    };
  }

  // Agent sharing
  @Post(':id/share')
  async shareAgent(
    @Param('id') teamId: string,
    @Request() req,
    @Body() body: { agentId: string },
  ): Promise<ApiResponse> {
    const result = await this.teamsService.shareAgent(
      teamId,
      req.user._id.toString(),
      body.agentId,
    );
    return {
      data: result,
      message: 'Agent shared successfully',
      statusCode: 200,
      timestamp: new Date().toISOString(),
    };
  }

  @Delete(':id/share/:agentId')
  async unshareAgent(
    @Param('id') teamId: string,
    @Param('agentId') agentId: string,
    @Request() req,
  ): Promise<ApiResponse> {
    await this.teamsService.unshareAgent(
      teamId,
      req.user._id.toString(),
      agentId,
    );
    return {
      message: 'Agent unshared successfully',
      statusCode: 200,
      timestamp: new Date().toISOString(),
    };
  }

  @Get(':id/shared-agents')
  async getSharedAgents(
    @Param('id') teamId: string,
    @Request() req,
  ): Promise<ApiResponse> {
    const result = await this.teamsService.getSharedAgents(
      teamId,
      req.user._id.toString(),
    );
    return {
      data: result,
      statusCode: 200,
      timestamp: new Date().toISOString(),
    };
  }

  @Get(':id/members')
  async getTeamMembers(
    @Param('id') teamId: string,
    @Request() req,
  ): Promise<ApiResponse> {
    const result = await this.teamsService.getTeamMembers(
      teamId,
      req.user._id.toString(),
    );
    return {
      data: result,
      statusCode: 200,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('invitations/pending')
  async getPendingInvitations(@Request() req): Promise<ApiResponse> {
    const result = await this.teamsService.getPendingInvitations(
      req.user._id.toString(),
    );
    return {
      data: result,
      statusCode: 200,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('invite/:token')
  @Public()
  async getInvitationByToken(
    @Param('token') token: string,
  ): Promise<ApiResponse> {
    const result = await this.teamsService.getInvitationByToken(token);
    return {
      data: result,
      statusCode: 200,
      timestamp: new Date().toISOString(),
    };
  }

  // Invitation management
  @Post('invitations/:id/resend')
  async resendInvitation(
    @Param('id') id: string,
    @Request() req,
  ): Promise<ApiResponse> {
    const result = await this.teamsService.resendInvitation(
      id,
      req.user._id.toString(),
    );
    return {
      data: result,
      message: 'Invitation resent successfully',
      statusCode: 200,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('invitations/:id/cancel')
  async cancelInvitation(
    @Param('id') id: string,
    @Request() req,
  ): Promise<ApiResponse> {
    await this.teamsService.cancelInvitation(id, req.user._id.toString());
    return {
      message: 'Invitation cancelled successfully',
      statusCode: 200,
      timestamp: new Date().toISOString(),
    };
  }

  @Get(':id/invitations')
  async getTeamInvitations(
    @Param('id') id: string,
    @Request() req,
  ): Promise<ApiResponse> {
    const result = await this.teamsService.getTeamInvitations(
      id,
      req.user._id.toString(),
    );
    return {
      data: result,
      statusCode: 200,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('invitations/history')
  async getInvitationHistory(@Request() req): Promise<ApiResponse> {
    const result = await this.teamsService.getInvitationHistory(
      req.user._id.toString(),
    );
    return {
      data: result,
      statusCode: 200,
      timestamp: new Date().toISOString(),
    };
  }

  // Permissions and settings
  @Get(':id/permissions')
  async getUserPermissions(
    @Param('id') teamId: string,
    @Request() req,
  ): Promise<ApiResponse> {
    if (!teamId || teamId === 'undefined' || teamId === 'null') {
      throw new BadRequestException('Invalid teamId');
    }
    const permissions = await this.teamsService.getUserPermissions(
      req.user._id.toString(),
      teamId,
    );
    return {
      data: { permissions },
      statusCode: 200,
      timestamp: new Date().toISOString(),
    };
  }

  @Get(':id/permissions/check')
  async checkPermission(
    @Param('id') teamId: string,
    @Request() req,
    @Query('permission') permission: string,
  ): Promise<ApiResponse> {
    const hasPermission = await this.teamsService.hasPermission(
      req.user._id.toString(),
      teamId,
      permission as TeamPermission,
    );
    return {
      data: { hasPermission },
      statusCode: 200,
      timestamp: new Date().toISOString(),
    };
  }

  @Get(':id/roles/:role/permissions')
  async getRolePermissions(@Param('role') role: string): Promise<ApiResponse> {
    const permissions = await this.teamsService.getRolePermissions(
      role as TeamRole,
    );
    return {
      data: { permissions },
      statusCode: 200,
      timestamp: new Date().toISOString(),
    };
  }
}
