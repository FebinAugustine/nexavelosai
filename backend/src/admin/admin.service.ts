import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from '../users/users.schema';
import { Agent, AgentDocument } from '../agents/agents.schema';
import { Team, TeamDocument } from '../teams/teams.schema';
import { CreateUserByAdminDto } from './dto/create-user-by-admin.dto';
import { UpdateUserByAdminDto } from './dto/update-user-by-admin.dto';
import { AgentsService } from '../agents/agents.service'; // To delete associated agents
import { PaymentsService } from '../payments/payments.service'; // For invoices

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Agent.name) private agentModel: Model<AgentDocument>, // For agents statistics
    @InjectModel(Team.name) private teamModel: Model<TeamDocument>, // For teams management
    private agentsService: AgentsService, // For deleting associated agents
    private paymentsService: PaymentsService, // For invoices
  ) {}

  // User Management
  async findAllUsers(): Promise<UserDocument[]> {
    return this.userModel
      .find()
      .select('-password -verificationCode -resetPasswordToken')
      .exec();
  }

  async findUserById(id: string): Promise<UserDocument> {
    const user = await this.userModel
      .findById(id)
      .select('-password -verificationCode -resetPasswordToken')
      .exec();
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found.`);
    }
    return user;
  }

  async createUser(
    createUserByAdminDto: CreateUserByAdminDto,
  ): Promise<UserDocument> {
    const existingUser = await this.userModel
      .findOne({ email: createUserByAdminDto.email })
      .exec();
    if (existingUser) {
      throw new BadRequestException('User with this email already exists.');
    }

    const hashedPassword = await bcrypt.hash(createUserByAdminDto.password, 10);

    const newUser = new this.userModel({
      ...createUserByAdminDto,
      password: hashedPassword,
      isVerified: true, // Admin created users are verified by default
      verificationCode: undefined, // Clear any verification code fields
      verificationCodeExpires: undefined,
      resetPasswordToken: undefined,
      resetPasswordExpires: undefined,
    });

    return newUser.save();
  }

  async updateUser(
    id: string,
    updateUserByAdminDto: UpdateUserByAdminDto,
  ): Promise<UserDocument> {
    const update: any = { ...updateUserByAdminDto };

    // If password is being updated, hash it
    if (updateUserByAdminDto.password) {
      update.password = await bcrypt.hash(updateUserByAdminDto.password, 10);
    }

    const user = await this.userModel
      .findByIdAndUpdate(id, update, { new: true })
      .select('-password -verificationCode -resetPasswordToken')
      .exec();
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found.`);
    }
    return user;
  }

  async deleteUser(id: string): Promise<void> {
    const result = await this.userModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException(`User with ID ${id} not found.`);
    }
    // Also delete all agents associated with this user
    await this.agentsService.removeAllByUserId(id);
  }

  // Agent Management (for viewing statistics)
  async findAllAgents(): Promise<AgentDocument[]> {
    return this.agentModel.find().exec();
  }

  // Team Management
  async findAllTeams(): Promise<TeamDocument[]> {
    return this.teamModel.find().exec();
  }

  async findTeamById(id: string): Promise<TeamDocument> {
    const team = await this.teamModel.findById(id).exec();
    if (!team) {
      throw new NotFoundException(`Team with ID ${id} not found.`);
    }
    return team;
  }

  async deleteTeam(id: string): Promise<void> {
    const result = await this.teamModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Team with ID ${id} not found.`);
    }
  }

  async findUserTeams(userId: string): Promise<TeamDocument[]> {
    return this.teamModel
      .find({
        $or: [{ ownerId: userId }, { members: userId }],
      })
      .exec();
  }

  // Invoices
  async findAllInvoices(): Promise<any[]> {
    // Assuming PaymentsService has a method to find all invoices
    return this.paymentsService.findAllInvoices();
  }
}
