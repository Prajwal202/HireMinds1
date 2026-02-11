// Test script to verify messaging functionality
// Run this with: node testMessaging.js

const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('./backend/models/User');
const Job = require('./backend/models/Job');
const Bid = require('./backend/models/Bid');
const Message = require('./backend/models/Message');

async function testMessaging() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/hireminds');
    console.log('Connected to MongoDB');

    // Test 1: Create test users if they don't exist
    let recruiter = await User.findOne({ email: 'recruiter@test.com' });
    if (!recruiter) {
      recruiter = await User.create({
        name: 'Test Recruiter',
        email: 'recruiter@test.com',
        password: 'password123',
        role: 'employer'
      });
      console.log('Created test recruiter');
    }

    let freelancer = await User.findOne({ email: 'freelancer@test.com' });
    if (!freelancer) {
      freelancer = await User.create({
        name: 'Test Freelancer',
        email: 'freelancer@test.com',
        password: 'password123',
        role: 'freelancer'
      });
      console.log('Created test freelancer');
    }

    // Test 2: Create a test job if it doesn't exist
    let job = await Job.findOne({ title: 'Test Job for Messaging' });
    if (!job) {
      job = await Job.create({
        title: 'Test Job for Messaging',
        company: 'Test Company',
        location: 'Remote',
        description: 'This is a test job for messaging functionality',
        salary: '$1000',
        type: 'Contract',
        postedBy: recruiter._id,
        biddingDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
        status: 'open'
      });
      console.log('Created test job');
    }

    // Test 3: Create and accept a bid to trigger messaging
    let bid = await Bid.findOne({ job: job._id, freelancer: freelancer._id });
    if (!bid) {
      bid = await Bid.create({
        job: job._id,
        freelancer: freelancer._id,
        recruiter: recruiter._id,
        bidAmount: 1000,
        coverLetter: 'I am interested in this job',
        status: 'pending'
      });
      console.log('Created test bid');
    }

    // Accept the bid to allocate the job
    if (job.status !== 'closed') {
      job.allocatedTo = freelancer._id;
      job.allocatedAt = new Date();
      job.acceptedBid = bid._id;
      job.status = 'closed';
      await job.save();

      bid.status = 'accepted';
      await bid.save();
      console.log('Job allocated to freelancer - messaging enabled');
    }

    // Test 4: Create test messages
    const testMessage1 = await Message.create({
      job: job._id,
      sender: recruiter._id,
      receiver: freelancer._id,
      content: 'Hello! I am excited to work with you on this project.',
      messageType: 'text'
    });
    console.log('Created test message from recruiter');

    const testMessage2 = await Message.create({
      job: job._id,
      sender: freelancer._id,
      receiver: recruiter._id,
      content: 'Thank you! I am ready to start working on the project.',
      messageType: 'text'
    });
    console.log('Created test message from freelancer');

    // Test 5: Test Message model methods
    const conversation = await Message.getConversation(
      job._id,
      recruiter._id,
      freelancer._id
    );
    console.log(`Found ${conversation.length} messages in conversation`);

    const unreadCount = await Message.getUnreadCount(freelancer._id);
    console.log(`Unread count for freelancer: ${unreadCount}`);

    // Test 6: Mark messages as read
    await Message.markConversationAsRead(job._id, freelancer._id, recruiter._id);
    console.log('Marked conversation as read');

    console.log('\n✅ All messaging tests passed!');
    console.log('\nTest Data Created:');
    console.log(`- Recruiter: ${recruiter.name} (${recruiter.email})`);
    console.log(`- Freelancer: ${freelancer.name} (${freelancer.email})`);
    console.log(`- Job: ${job.title}`);
    console.log(`- Job ID: ${job._id}`);
    console.log(`- Messages: ${conversation.length} messages exchanged`);

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the test
testMessaging();
