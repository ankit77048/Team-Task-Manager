/**
 * Seed Script — populates the database with demo data
 * Run: npm run seed
 */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./src/models/User');
const Project = require('./src/models/Project');
const Task = require('./src/models/Task');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected to MongoDB');
};

const seed = async () => {
  await connectDB();

  // Clear existing data
  await Promise.all([User.deleteMany(), Project.deleteMany(), Task.deleteMany()]);
  console.log('🗑️  Cleared existing data');

  // ── Create Users ─────────────────────────────────────────────
  const admin = await User.create({
    name: 'Alex Admin',
    email: 'admin@taskmanager.com',
    password: 'Admin@123',
    role: 'admin',
  });

  const alice = await User.create({
    name: 'Alice Johnson',
    email: 'alice@taskmanager.com',
    password: 'Member@123',
    role: 'member',
  });

  const bob = await User.create({
    name: 'Bob Smith',
    email: 'bob@taskmanager.com',
    password: 'Member@123',
    role: 'member',
  });

  const carol = await User.create({
    name: 'Carol White',
    email: 'carol@taskmanager.com',
    password: 'Member@123',
    role: 'member',
  });

  console.log('👥 Created 4 users');

  // ── Create Projects ───────────────────────────────────────────
  const project1 = await Project.create({
    title: 'E-Commerce Platform',
    description: 'Build a full-featured online shopping platform with payment integration.',
    status: 'active',
    priority: 'high',
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    color: '#6366f1',
    owner: admin._id,
    members: [alice._id, bob._id],
  });

  const project2 = await Project.create({
    title: 'Mobile App Redesign',
    description: 'Redesign the mobile application UI/UX for better user engagement.',
    status: 'active',
    priority: 'medium',
    deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days
    color: '#8b5cf6',
    owner: admin._id,
    members: [alice._id, carol._id],
  });

  const project3 = await Project.create({
    title: 'API Documentation',
    description: 'Write comprehensive documentation for all public APIs.',
    status: 'planning',
    priority: 'low',
    deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days
    color: '#22d3ee',
    owner: admin._id,
    members: [bob._id, carol._id],
  });

  console.log('📁 Created 3 projects');

  // ── Create Tasks ──────────────────────────────────────────────
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  await Task.insertMany([
    // Project 1 tasks
    {
      title: 'Set up project structure',
      description: 'Initialize the React + Node.js boilerplate and configure CI/CD.',
      status: 'done',
      priority: 'high',
      dueDate: yesterday,
      project: project1._id,
      assignee: alice._id,
      createdBy: admin._id,
    },
    {
      title: 'Design database schema',
      description: 'Create ERD and Mongoose schemas for users, products, orders.',
      status: 'done',
      priority: 'high',
      dueDate: yesterday,
      project: project1._id,
      assignee: bob._id,
      createdBy: admin._id,
    },
    {
      title: 'Implement product listing API',
      description: 'Build RESTful endpoints for CRUD operations on products.',
      status: 'inprogress',
      priority: 'high',
      dueDate: nextWeek,
      project: project1._id,
      assignee: alice._id,
      createdBy: admin._id,
      tags: ['backend', 'api'],
    },
    {
      title: 'Shopping cart functionality',
      description: 'Implement add to cart, remove, and quantity update features.',
      status: 'inprogress',
      priority: 'medium',
      dueDate: nextWeek,
      project: project1._id,
      assignee: bob._id,
      createdBy: admin._id,
      tags: ['frontend'],
    },
    {
      title: 'Payment gateway integration',
      description: 'Integrate Stripe payment gateway for checkout flow.',
      status: 'todo',
      priority: 'high',
      dueDate: nextMonth,
      project: project1._id,
      assignee: alice._id,
      createdBy: admin._id,
      tags: ['payment', 'backend'],
    },
    {
      title: 'Write unit tests',
      description: 'Write Jest tests for all API endpoints with 80% coverage.',
      status: 'todo',
      priority: 'medium',
      dueDate: nextMonth,
      project: project1._id,
      assignee: bob._id,
      createdBy: admin._id,
    },
    // Project 2 tasks
    {
      title: 'User research & wireframes',
      description: 'Conduct user interviews and create low-fidelity wireframes.',
      status: 'done',
      priority: 'high',
      dueDate: yesterday,
      project: project2._id,
      assignee: carol._id,
      createdBy: admin._id,
    },
    {
      title: 'High-fidelity UI designs',
      description: 'Create pixel-perfect designs in Figma for all key screens.',
      status: 'inprogress',
      priority: 'high',
      dueDate: nextWeek,
      project: project2._id,
      assignee: alice._id,
      createdBy: admin._id,
    },
    {
      title: 'Implement design system',
      description: 'Build reusable component library in React Native.',
      status: 'todo',
      priority: 'medium',
      dueDate: nextMonth,
      project: project2._id,
      assignee: carol._id,
      createdBy: admin._id,
    },
    // Overdue task (for demo)
    {
      title: 'Fix critical login bug',
      description: 'Users cannot login on iOS 16 — investigate and patch.',
      status: 'inprogress',
      priority: 'high',
      dueDate: yesterday,
      project: project2._id,
      assignee: alice._id,
      createdBy: admin._id,
      tags: ['bug', 'urgent'],
    },
    // Project 3 tasks
    {
      title: 'Audit existing APIs',
      description: 'Review all current endpoints and list undocumented ones.',
      status: 'done',
      priority: 'medium',
      dueDate: yesterday,
      project: project3._id,
      assignee: bob._id,
      createdBy: admin._id,
    },
    {
      title: 'Write authentication docs',
      description: 'Document JWT auth flow, token refresh, and error codes.',
      status: 'inprogress',
      priority: 'medium',
      dueDate: nextWeek,
      project: project3._id,
      assignee: carol._id,
      createdBy: admin._id,
    },
    {
      title: 'Set up Swagger UI',
      description: 'Configure Swagger/OpenAPI 3.0 and auto-generate docs.',
      status: 'todo',
      priority: 'low',
      dueDate: nextMonth,
      project: project3._id,
      assignee: bob._id,
      createdBy: admin._id,
    },
  ]);

  console.log('✅ Created 13 tasks');

  console.log('\n🎉 Seed complete! Test credentials:');
  console.log('   Admin:  admin@taskmanager.com  /  Admin@123');
  console.log('   Member: alice@taskmanager.com  /  Member@123');
  console.log('   Member: bob@taskmanager.com    /  Member@123');
  console.log('   Member: carol@taskmanager.com  /  Member@123\n');

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  mongoose.disconnect();
  process.exit(1);
});
