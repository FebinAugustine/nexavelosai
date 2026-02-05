const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const LeadSchema = new mongoose.Schema(
  {
    userId: mongoose.Schema.Types.ObjectId,
    agentId: mongoose.Schema.Types.ObjectId,
    email: String,
    name: String,
    phone: String,
    company: String,
    website: String,
    chatSessions: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'ChatSession' },
    ],
    status: String,
    tags: [String],
  },
  { timestamps: true },
);

const ChatSessionSchema = new mongoose.Schema(
  {
    userId: mongoose.Schema.Types.ObjectId,
    agentId: mongoose.Schema.Types.ObjectId,
    leadId: mongoose.Schema.Types.ObjectId,
    visitorId: String,
    ipAddress: String,
    userAgent: String,
    referringUrl: String,
    pageUrl: String,
    messages: [
      {
        role: { type: String, enum: ['user', 'agent'] },
        content: String,
        timestamp: Date,
      },
    ],
    lastActivityAt: Date,
  },
  { timestamps: true },
);

const Lead = mongoose.model('Lead', LeadSchema);
const ChatSession = mongoose.model('ChatSession', ChatSessionSchema);

async function checkDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check collections
    const collections = await mongoose.connection.db
      .listCollections()
      .toArray();
    console.log(
      'Collections:',
      collections.map((c) => c.name),
    );

    // Check leads
    const leadsCount = await Lead.countDocuments().exec();
    console.log('Leads count:', leadsCount);

    const leads = await Lead.find().sort({ createdAt: -1 }).limit(3).exec();
    console.log('Latest 3 leads:');
    for (let lead of leads) {
      console.log('');
      console.log('  Lead ID:', lead._id);
      console.log('  Email:', lead.email);
      console.log('  Name:', lead.name);
      console.log('  Chat Sessions:', lead.chatSessions);
    }

    // Check chat sessions
    const chatSessionsCount = await ChatSession.countDocuments().exec();
    console.log('\nChat sessions count:', chatSessionsCount);

    const chatSessions = await ChatSession.find()
      .sort({ createdAt: -1 })
      .limit(3)
      .exec();
    console.log('Latest 3 chat sessions:');
    for (let session of chatSessions) {
      console.log('');
      console.log('  Session ID:', session._id);
      console.log('  Lead ID:', session.leadId);
      console.log(
        '  Messages:',
        session.messages?.map((m) => ({
          role: m.role,
          content: m.content.slice(0, 50),
        })),
      );
    }

    await mongoose.connection.close();
    console.log('\nDisconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
  }
}

checkDatabase();
