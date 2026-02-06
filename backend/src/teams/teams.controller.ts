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
} from '@nestjs/common';
import { TeamsService } from './teams.service';
import { TeamRole } from './team-members.schema';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('teams')
@UseGuards(JwtAuthGuard)
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  // Team management
  @Post()
  createTeam(
    @Request() req,
    @Body() body: { name: string; description?: string },
  ) {
    return this.teamsService.createTeam(
      req.user._id.toString(),
      body.name,
      body.description,
    );
  }

  @Get()
  getTeams(@Request() req) {
    return this.teamsService.getTeamsByUser(req.user._id.toString());
  }

  @Get(':id')
  getTeamById(@Param('id') id: string) {
    return this.teamsService.getTeamById(id);
  }

  @Patch(':id')
  updateTeam(
    @Param('id') id: string,
    @Request() req,
    @Body() body: { name?: string; description?: string },
  ) {
    return this.teamsService.updateTeam(id, req.user._id.toString(), body);
  }

  @Delete(':id')
  deleteTeam(@Param('id') id: string, @Request() req) {
    return this.teamsService.deleteTeam(id, req.user._id.toString());
  }

  // Team members
  @Post(':id/invite')
  inviteMember(
    @Param('id') teamId: string,
    @Request() req,
    @Body() body: { email: string; role?: string },
  ) {
    return this.teamsService.inviteMember(
      teamId,
      req.user._id.toString(),
      body.email,
      body.role as TeamRole,
    );
  }

  @Post('invite/:token/accept')
  acceptInvitation(@Param('token') token: string, @Request() req) {
    return this.teamsService.acceptInvitation(token, req.user._id.toString());
  }

  @Post('invite/:token/reject')
  rejectInvitation(@Param('token') token: string, @Request() req) {
    return this.teamsService.rejectInvitation(token, req.user._id.toString());
  }

  @Delete(':teamId/members/:memberId')
  removeMember(
    @Param('teamId') teamId: string,
    @Param('memberId') memberId: string,
    @Request() req,
  ) {
    return this.teamsService.removeMember(
      teamId,
      req.user._id.toString(),
      memberId,
    );
  }

  @Patch(':teamId/members/:memberId/role')
  updateMemberRole(
    @Param('teamId') teamId: string,
    @Param('memberId') memberId: string,
    @Request() req,
    @Body() body: { role: string },
  ) {
    return this.teamsService.updateMemberRole(
      teamId,
      req.user._id.toString(),
      memberId,
      body.role as TeamRole,
    );
  }

  // Agent sharing
  @Post(':id/share')
  shareAgent(
    @Param('id') teamId: string,
    @Request() req,
    @Body() body: { agentId: string },
  ) {
    return this.teamsService.shareAgent(
      teamId,
      req.user._id.toString(),
      body.agentId,
    );
  }

  @Delete(':id/share/:agentId')
  unshareAgent(
    @Param('id') teamId: string,
    @Param('agentId') agentId: string,
    @Request() req,
  ) {
    return this.teamsService.unshareAgent(
      teamId,
      req.user._id.toString(),
      agentId,
    );
  }

  @Get(':id/shared-agents')
  getSharedAgents(@Param('id') teamId: string, @Request() req) {
    return this.teamsService.getSharedAgents(teamId, req.user._id.toString());
  }
}
