export type TeamRole = "owner" | "admin" | "editor" | "viewer";

export interface Team {
  _id: string;
  name: string;
  description?: string;
  ownerId: string;
  members: string[];
  sharedAgents: string[];
  createdAt: string;
  updatedAt: string;
}

export interface TeamMember {
  userId: string;
  email: string;
  role: TeamRole;
  joinedAt: string;
}

export interface TeamInvitation {
  id: string;
  email: string;
  role: TeamRole;
  createdAt: string;
}

export interface CreateTeamData {
  name: string;
  description?: string;
}

export interface UpdateTeamData {
  name?: string;
  description?: string;
}

export interface InviteMemberData {
  email: string;
  role?: TeamRole;
}
