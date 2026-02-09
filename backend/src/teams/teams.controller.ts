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
import { TeamsService } from './teams.service';
import { TeamRole, TeamPermission } from './team-members.schema';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Public } from '../auth/public.decorator';

@Controller('api/teams')
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

  // Specific routes before dynamic :id route to avoid conflicts
  @Get('roles')
  getRolesWithPermissions() {
    return this.teamsService.getRolesWithPermissions();
  }

  @Get(':id')
  getTeamById(@Param('id') id: string) {
    if (!id || id === 'undefined' || id === 'null') {
      throw new BadRequestException('Invalid teamId');
    }
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
  async acceptInvitation(@Param('token') token: string, @Request() req) {
    try {
      await this.teamsService.acceptInvitation(token, req.user._id.toString());
      return { message: 'Invitation accepted successfully' };
    } catch (error) {
      console.error('Error accepting invitation:', error);
      throw error;
    }
  }

  @Post('invite/:token/reject')
  rejectInvitation(@Param('token') token: string, @Request() req) {
    return this.teamsService.rejectInvitation(token, req.user._id.toString());
  }

  @Delete(':teamId/members/:memberId')
  async removeMember(
    @Param('teamId') teamId: string,
    @Param('memberId') memberId: string,
    @Request() req,
  ) {
    console.log('removeMember called with:');
    console.log('  teamId:', teamId);
    console.log('  memberId:', memberId);
    console.log('  adminId:', req.user?._id?.toString());

    return this.teamsService.removeMember(
      teamId,
      req.user._id.toString(),
      memberId,
    );
  }

  @Patch(':teamId/members/:memberId/role')
  async updateMemberRole(
    @Param('teamId') teamId: string,
    @Param('memberId') memberId: string,
    @Request() req,
    @Body() body: { role: string },
  ) {
    console.log('updateMemberRole called with:');
    console.log('  teamId:', teamId);
    console.log('  memberId:', memberId);
    console.log('  adminId:', req.user?._id?.toString());
    console.log('  body:', body);

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

  @Get(':id/members')
  getTeamMembers(@Param('id') teamId: string, @Request() req) {
    return this.teamsService.getTeamMembers(teamId, req.user._id.toString());
  }

  @Get('invitations/pending')
  getPendingInvitations(@Request() req) {
    return this.teamsService.getPendingInvitations(req.user._id.toString());
  }

  @Get('invite/:token')
  @Public()
  getInvitationByToken(@Param('token') token: string) {
    return this.teamsService.getInvitationByToken(token);
  }

  // Invitation management
  @Post('invitations/:id/resend')
  resendInvitation(@Param('id') id: string, @Request() req) {
    return this.teamsService.resendInvitation(id, req.user._id.toString());
  }

  @Post('invitations/:id/cancel')
  cancelInvitation(@Param('id') id: string, @Request() req) {
    return this.teamsService.cancelInvitation(id, req.user._id.toString());
  }

  @Get(':id/invitations')
  getTeamInvitations(@Param('id') id: string, @Request() req) {
    return this.teamsService.getTeamInvitations(id, req.user._id.toString());
  }

  @Get('invitations/history')
  getInvitationHistory(@Request() req) {
    return this.teamsService.getInvitationHistory(req.user._id.toString());
  }

  // Permissions and settings
  @Get(':id/permissions')
  async getUserPermissions(@Param('id') teamId: string, @Request() req) {
    if (!teamId || teamId === 'undefined' || teamId === 'null') {
      throw new BadRequestException('Invalid teamId');
    }
    const permissions = await this.teamsService.getUserPermissions(
      req.user._id.toString(),
      teamId,
    );
    return { permissions };
  }

  @Get(':id/permissions/check')
  async checkPermission(
    @Param('id') teamId: string,
    @Request() req,
    @Query('permission') permission: string,
  ) {
    const hasPermission = await this.teamsService.hasPermission(
      req.user._id.toString(),
      teamId,
      permission as TeamPermission,
    );
    return { hasPermission };
  }

  @Get(':id/roles/:role/permissions')
  async getRolePermissions(@Param('role') role: string) {
    const permissions = await this.teamsService.getRolePermissions(
      role as TeamRole,
    );
    return { permissions };
  }
}
