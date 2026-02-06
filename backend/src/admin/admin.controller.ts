import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminAuthGuard } from '../auth/admin-auth.guard';
import { CreateUserByAdminDto } from './dto/create-user-by-admin.dto';
import { UpdateUserByAdminDto } from './dto/update-user-by-admin.dto';
import { UserDocument } from '../users/users.schema';
import { AgentDocument } from '../agents/agents.schema';
import { TeamDocument } from '../teams/teams.schema';

@UseGuards(JwtAuthGuard, AdminAuthGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // User Management
  @Get('users')
  async findAllUsers(): Promise<UserDocument[]> {
    return this.adminService.findAllUsers();
  }

  @Get('users/:id')
  async findUserById(@Param('id') id: string): Promise<UserDocument> {
    return this.adminService.findUserById(id);
  }

  @Post('users')
  async createUser(
    @Body(ValidationPipe) createUserByAdminDto: CreateUserByAdminDto,
  ): Promise<UserDocument> {
    return this.adminService.createUser(createUserByAdminDto);
  }

  @Patch('users/:id')
  async updateUser(
    @Param('id') id: string,
    @Body(ValidationPipe) updateUserByAdminDto: UpdateUserByAdminDto,
  ): Promise<UserDocument> {
    return this.adminService.updateUser(id, updateUserByAdminDto);
  }

  @Delete('users/:id')
  async deleteUser(@Param('id') id: string): Promise<void> {
    return this.adminService.deleteUser(id);
  }

  // Agent Management
  @Get('agents')
  async findAllAgents(): Promise<AgentDocument[]> {
    return this.adminService.findAllAgents();
  }

  // Team Management
  @Get('teams')
  async findAllTeams(): Promise<TeamDocument[]> {
    return this.adminService.findAllTeams();
  }

  @Get('teams/:id')
  async findTeamById(@Param('id') id: string): Promise<TeamDocument> {
    return this.adminService.findTeamById(id);
  }

  @Delete('teams/:id')
  async deleteTeam(@Param('id') id: string): Promise<void> {
    return this.adminService.deleteTeam(id);
  }

  @Get('users/:id/teams')
  async findUserTeams(@Param('id') id: string): Promise<TeamDocument[]> {
    return this.adminService.findUserTeams(id);
  }

  // Invoice Management
  @Get('invoices')
  async findAllInvoices(): Promise<any[]> {
    return this.adminService.findAllInvoices();
  }
}
